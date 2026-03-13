import {Component, computed, inject, OnDestroy, OnInit, signal,} from '@angular/core';
import {Router} from '@angular/router';
import {Geolocation} from '@capacitor/geolocation';
import {IonButton, IonContent} from '@ionic/angular/standalone';
import {PageHeaderComponent} from '../components/page-header/page-header.component';
import {TaskService} from '../services/task.service';
import {AudioService} from '../services/audio.service';
import {HapticService} from '../services/haptic.service';
import {Task} from '../models/task.interface';
import {parseTimeToSeconds} from '../utils/time.utils';

const TARGET_DISTANCE_METERS = 20;
const DEGREES_TO_METERS = 111_000;
const MAX_ACCURACY_METERS = 20;
const STABILIZATION_DELAY_MS = 3000;
const MIN_TIME_ELAPSED_SECONDS = 5;

@Component({
  selector: 'app-geolocation02-task',
  templateUrl: './geolocation02-task.page.html',
  styleUrls: ['./geolocation02-task.page.scss'],
  standalone: true,
  imports: [IonContent, IonButton, PageHeaderComponent],
})
export class Geolocation02TaskPage implements OnInit, OnDestroy {
  private router = inject(Router);
  private taskService = inject(TaskService);
  private audioService = inject(AudioService);
  private hapticService = inject(HapticService);
  private gpsWatchId?: string;
  private timerInterval?: ReturnType<typeof setInterval>;
  private startTime = Date.now();
  private previousElapsed = 0;
  private penaltySeconds = 0;
  private readonly TASK_ID = 6;

  private startLatitude?: number;
  private startLongitude?: number;
  private startPositionTimestamp?: number;
  private bestAccuracy = Infinity;
  private bestAccuracyPosition?: { lat: number; lng: number };
  private safetyTimeoutId?: ReturnType<typeof setTimeout>;

  task!: Task & { index: number; total: number };

  distanceMoved = signal<number>(0);
  currentElapsed = signal(0);
  gpsAccuracy = signal<number | null>(null);
  stabilizationSecondsRemaining = signal<number | null>(null);

  remainingSeconds = computed(() => {
    return Math.max(0, this.penaltySeconds - this.currentElapsed());
  });

  timerDisplay = computed(() => {
    const remaining = this.remainingSeconds();
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  });

  timerColor = computed(() => {
    const percentage = this.remainingSeconds() / this.penaltySeconds;
    if (percentage > 0.5) {
      return '#ff9500';
    } else if (percentage > 0.25) {
      const r = 255;
      const g = Math.floor(149 + (255 - 149) * (percentage - 0.25) / 0.25);
      return `rgb(${r}, ${g}, 0)`;
    } else {
      return '#ff0000';
    }
  });

  locationStatus = computed(() => {
    const moved = this.distanceMoved();
    const accuracy = this.gpsAccuracy();
    const secondsRemaining = this.stabilizationSecondsRemaining();

    if (!this.startLatitude) {
      if (accuracy === null) {
        return 'Warte auf GPS Signal...';
      }
      if (accuracy > MAX_ACCURACY_METERS) {
        return `GPS zu ungenau (±${accuracy.toFixed(0)}m) - gehe nach draussen`;
      }
      if (secondsRemaining !== null) {
        return `Stabilisierung... ${secondsRemaining}s (±${accuracy.toFixed(0)}m)`;
      }
      return `Startpunkt wird gesetzt... (±${accuracy.toFixed(0)}m)`;
    }
    if (moved >= TARGET_DISTANCE_METERS) return 'Ziel erreicht ✅';

    const accuracyText = accuracy !== null ? ` (±${accuracy.toFixed(0)}m)` : '';
    return `${moved.toFixed(1)}m / ${TARGET_DISTANCE_METERS}m${accuracyText}`;
  });

  async ngOnInit(): Promise<void> {
    const taskData = this.taskService.getTaskById(this.TASK_ID);
    if (taskData) {
      this.task = {
        ...taskData,
        index: this.TASK_ID,
        total: this.taskService.tasks().length,
      };
      this.penaltySeconds = parseTimeToSeconds(taskData.timeUntilPenalty);
    }
    this.previousElapsed = taskData?.timeElapsed ?? 0;
    this.startTime = Date.now();
    this.currentElapsed.set(this.previousElapsed);

    this.timerInterval = setInterval(() => {
      const elapsed = this.previousElapsed + Math.floor((Date.now() - this.startTime) / 1000);
      this.currentElapsed.set(elapsed);
    }, 1000);

    this.gpsWatchId = await Geolocation.watchPosition(
      {enableHighAccuracy: true},
      (position, error) => {
        if (error || !position) {
          console.log('[GPS] Error or no position:', error);
          return;
        }

        const currentLatitude = position.coords.latitude;
        const currentLongitude = position.coords.longitude;
        const accuracy = position.coords.accuracy ?? Infinity;

        console.log('[GPS] Reading:', {accuracy, lat: currentLatitude.toFixed(5), lng: currentLongitude.toFixed(5)});

        this.gpsAccuracy.set(accuracy);

        if (!this.startLatitude || !this.startLongitude) {
          if (accuracy > MAX_ACCURACY_METERS) {
            console.log('[GPS] Accuracy too low, skipping');
            return;
          }

          if (!this.startPositionTimestamp) {
            console.log('[GPS] First good reading, starting stabilization');
            this.startPositionTimestamp = Date.now();
            this.bestAccuracy = accuracy;
            this.bestAccuracyPosition = {lat: currentLatitude, lng: currentLongitude};
            this.stabilizationSecondsRemaining.set(Math.ceil(STABILIZATION_DELAY_MS / 1000));

            this.safetyTimeoutId = setTimeout(() => {
              if (!this.startLatitude && this.bestAccuracyPosition) {
                console.log('[GPS] Safety timeout - forcing start position');
                this.startLatitude = this.bestAccuracyPosition.lat;
                this.startLongitude = this.bestAccuracyPosition.lng;
                this.stabilizationSecondsRemaining.set(null);
              }
            }, 5000);

            return;
          }

          const timeSinceFirstGoodReading = Date.now() - this.startPositionTimestamp;
          const secondsRemaining = Math.ceil((STABILIZATION_DELAY_MS - timeSinceFirstGoodReading) / 1000);
          this.stabilizationSecondsRemaining.set(Math.max(0, secondsRemaining));

          if (accuracy < this.bestAccuracy) {
            console.log('[GPS] New best accuracy:', accuracy);
            this.bestAccuracy = accuracy;
            this.bestAccuracyPosition = {lat: currentLatitude, lng: currentLongitude};
          }

          if (timeSinceFirstGoodReading >= STABILIZATION_DELAY_MS && this.bestAccuracyPosition) {
            console.log('[GPS] Stabilization complete, setting start position:', this.bestAccuracyPosition);
            this.startLatitude = this.bestAccuracyPosition.lat;
            this.startLongitude = this.bestAccuracyPosition.lng;
            this.stabilizationSecondsRemaining.set(null);
            if (this.safetyTimeoutId) {
              clearTimeout(this.safetyTimeoutId);
            }
          }
          return;
        }

        console.log('[GPS] Tracking movement');

        const movedMeters = this.calculateDistance(
          this.startLatitude,
          this.startLongitude,
          currentLatitude,
          currentLongitude,
        );

        console.log('[GPS] Distance moved:', movedMeters.toFixed(1), 'm');
        this.distanceMoved.set(movedMeters);

        const timeElapsedSinceStart = this.getTotalElapsedSeconds();
        if (movedMeters >= TARGET_DISTANCE_METERS && timeElapsedSinceStart >= MIN_TIME_ELAPSED_SECONDS) {
          console.log('[GPS] Target reached!');
          this.onTargetReached();
        }
      },
    );
  }

  ngOnDestroy(): void {
    if (this.gpsWatchId) {
      Geolocation.clearWatch({id: this.gpsWatchId});
    }
    clearInterval(this.timerInterval);
    if (this.safetyTimeoutId) {
      clearTimeout(this.safetyTimeoutId);
    }
  }

  private async onTargetReached(): Promise<void> {
    Geolocation.clearWatch({id: this.gpsWatchId!});
    const timeSpent = this.calculateTimeSpent();
    const allCompleted = await this.taskService.completeTask(this.TASK_ID, timeSpent);
    await this.audioService.playTaskDone();
    await this.hapticService.taskSuccess();
    setTimeout(() => {
      if (allCompleted) {
        this.router.navigate(['/tasks/finish']);
      } else {
        this.router.navigate(['/tasks']);
      }
    }, 1500);
  }

  private calculateTimeSpent(): string {
    const currentElapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const totalElapsed = this.previousElapsed + currentElapsed;
    const minutes = Math.floor(totalElapsed / 60);
    const seconds = totalElapsed % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  private getTotalElapsedSeconds(): number {
    const currentElapsed = Math.floor((Date.now() - this.startTime) / 1000);
    return this.previousElapsed + currentElapsed;
  }

  private calculateDistance(
    fromLatitude: number,
    fromLongitude: number,
    toLatitude: number,
    toLongitude: number,
  ): number {
    const deltaLatMeters = (toLatitude - fromLatitude) * DEGREES_TO_METERS;
    const deltaLngMeters =
      (toLongitude - fromLongitude) *
      DEGREES_TO_METERS *
      Math.cos((fromLatitude * Math.PI) / 180);
    return Math.sqrt(deltaLatMeters ** 2 + deltaLngMeters ** 2);
  }

  async skip(): Promise<void> {
    const totalElapsed = this.getTotalElapsedSeconds();
    const allCompleted = await this.taskService.skipTask(this.TASK_ID, totalElapsed);
    if (allCompleted) {
      this.router.navigate(['/tasks/finish']);
    } else {
      this.router.navigate(['/tasks']);
    }
  }

  cancel(): void {
    const totalElapsed = this.getTotalElapsedSeconds();
    this.taskService.pauseTask(this.TASK_ID, totalElapsed);
    this.router.navigate(['/tasks']);
  }
}

import {Component, computed, inject, OnDestroy, OnInit, signal,} from '@angular/core';
import {Router} from '@angular/router';
import {Geolocation} from '@capacitor/geolocation';
import {IonButton, IonContent} from '@ionic/angular/standalone';
import {PageHeaderComponent} from '../components/page-header/page-header.component';
import {TaskService} from '../services/task.service';

const TARGET_DISTANCE_METERS = 20;
const DEGREES_TO_METERS = 111_000;

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
  private gpsWatchId?: string;
  private timerInterval?: ReturnType<typeof setInterval>;
  private startTime = Date.now();
  private previousElapsed = 0;
  private penaltySeconds = 15 * 60;

  private startLatitude?: number;
  private startLongitude?: number;

  task = {
    index: 6,
    total: 6,
    title: 'Geo location 2/2',
    description: 'Begebe dich an einen bestimmten Standort',
    bonusTime: '+5m',
    hint: 'Laufe 20m in irgendeine Richtung',
  };

  distanceMoved = signal<number>(0);
  currentElapsed = signal(0);

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
    if (!this.startLatitude) return 'Startpunkt wird gesetzt...';
    if (moved >= TARGET_DISTANCE_METERS) return 'Ziel erreicht ✅';
    return `${moved.toFixed(1)}m / ${TARGET_DISTANCE_METERS}m`;
  });

  async ngOnInit(): Promise<void> {
    const taskData = this.taskService.getTaskById(6);
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
        if (error || !position) return;

        const currentLatitude = position.coords.latitude;
        const currentLongitude = position.coords.longitude;

        // Startpunkt beim ersten Fix setzen
        if (!this.startLatitude || !this.startLongitude) {
          this.startLatitude = currentLatitude;
          this.startLongitude = currentLongitude;
          return;
        }

        const movedMeters = this.calculateDistance(
          this.startLatitude,
          this.startLongitude,
          currentLatitude,
          currentLongitude,
        );

        this.distanceMoved.set(movedMeters);

        if (movedMeters >= TARGET_DISTANCE_METERS) {
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
  }

  private async onTargetReached(): Promise<void> {
    Geolocation.clearWatch({id: this.gpsWatchId!});
    const timeSpent = this.calculateTimeSpent();
    const allCompleted = await this.taskService.completeTask(6, timeSpent);
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
    const allCompleted = await this.taskService.skipTask(6, totalElapsed);
    if (allCompleted) {
      this.router.navigate(['/tasks/finish']);
    } else {
      this.router.navigate(['/tasks']);
    }
  }

  cancel(): void {
    const totalElapsed = this.getTotalElapsedSeconds();
    this.taskService.pauseTask(6, totalElapsed);
    this.router.navigate(['/tasks']);
  }
}

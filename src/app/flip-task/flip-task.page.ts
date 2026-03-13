import {Component, computed, inject, OnDestroy, OnInit, signal,} from '@angular/core';
import {Router} from '@angular/router';
import {Motion} from '@capacitor/motion';
import {IonButton, IonContent} from '@ionic/angular/standalone';
import {PageHeaderComponent} from '../components/page-header/page-header.component';
import {Capacitor, PluginListenerHandle} from '@capacitor/core';
import {TaskService} from '../services/task.service';
import {AudioService} from '../services/audio.service';
import {HapticService} from '../services/haptic.service';
import {Task} from '../models/task.interface';
import {parseTimeToSeconds} from '../utils/time.utils';

@Component({
  selector: 'app-rotate-task',
  templateUrl: './flip-task.page.html',
  styleUrls: ['./flip-task.page.scss'],
  standalone: true,
  imports: [IonContent, IonButton, PageHeaderComponent],
})
export class FlipTaskPage implements OnInit, OnDestroy {
  private router = inject(Router);
  private taskService = inject(TaskService);
  private audioService = inject(AudioService);
  private hapticService = inject(HapticService);
  private motionListener?: PluginListenerHandle;
  private timerInterval?: ReturnType<typeof setInterval>;
  private alreadyDetected = false;
  private startTime = Date.now();
  private previousElapsed = 0;
  private penaltySeconds = 0;
  private readonly TASK_ID = 4;

  task!: Task & { index: number; total: number };

  isFlipped = signal(false);
  detected = computed(() => (this.isFlipped() ? 1 : 0));
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

    if (Capacitor.isNativePlatform()) {
      this.motionListener = await Motion.addListener('orientation', (event) => {
        const isUpsideDown = Math.abs(event.gamma) > 90 || event.beta < -70;
        if (isUpsideDown && !this.alreadyDetected) {
          this.alreadyDetected = true;
          this.isFlipped.set(true);
          this.onFlipDetected();
        }
      });
    } else {
      window.addEventListener('deviceorientation', (event) => {
        const isUpsideDown =
          Math.abs(event.gamma ?? 0) > 90 || (event.beta ?? 0) < -70;
        if (isUpsideDown && !this.alreadyDetected) {
          this.alreadyDetected = true;
          this.isFlipped.set(true);
          this.onFlipDetected();
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.motionListener?.remove();
    clearInterval(this.timerInterval);
  }

  private async onFlipDetected(): Promise<void> {
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

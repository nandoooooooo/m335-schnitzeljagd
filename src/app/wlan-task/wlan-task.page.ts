import {Component, computed, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import {Network} from '@capacitor/network';
import {IonButton, IonContent} from '@ionic/angular/standalone';
import {PageHeaderComponent} from '../components/page-header/page-header.component';
import {TaskService} from '../services/task.service';
import {AudioService} from '../services/audio.service';
import {HapticService} from '../services/haptic.service';
import {Task} from '../models/task.interface';

@Component({
  selector: 'app-wlan-task',
  templateUrl: './wlan-task.page.html',
  styleUrls: ['./wlan-task.page.scss'],
  standalone: true,
  imports: [IonContent, IonButton, PageHeaderComponent],
})
export class WlanTaskPage implements OnInit, OnDestroy {
  private router = inject(Router);
  private taskService = inject(TaskService);
  private audioService = inject(AudioService);
  private hapticService = inject(HapticService);
  private interval?: ReturnType<typeof setInterval>;
  private timerInterval?: ReturnType<typeof setInterval>;
  private startTime = Date.now();
  private previousElapsed = 0;
  private penaltySeconds = 5 * 60;
  private readonly TASK_ID = 2;

  task!: Task & { index: number; total: number };

  wlanConnected = signal(false);
  wlanDisconnected = signal(false);
  currentElapsed = signal(0);

  private wasConnected = false;

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
    }
    this.previousElapsed = taskData?.timeElapsed ?? 0;
    this.startTime = Date.now();
    this.currentElapsed.set(this.previousElapsed);

    await this.checkNetwork();
    this.interval = setInterval(() => this.checkNetwork(), 2000);
    this.timerInterval = setInterval(() => {
      const elapsed = this.previousElapsed + Math.floor((Date.now() - this.startTime) / 1000);
      this.currentElapsed.set(elapsed);
    }, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
    clearInterval(this.timerInterval);
  }

  async checkNetwork(): Promise<void> {
    try {
      const status = await Network.getStatus();
      const isWifi = status.connected && status.connectionType === 'wifi';

      if (isWifi && !this.wasConnected) {
        this.wasConnected = true;
        this.wlanConnected.set(true);
      }

      if (!isWifi && this.wasConnected && this.wlanConnected()) {
        this.wlanDisconnected.set(true);
        clearInterval(this.interval);
        const timeSpent = this.calculateTimeSpent();
        const allCompleted = await this.taskService.completeTask(this.TASK_ID, timeSpent);
        await this.audioService.playTaskDone();
        await this.hapticService.taskSuccess();
        setTimeout(() => {
          if (allCompleted) {
            this.router.navigate(['/tasks/finish']);
          } else {
            this.nextTask();
          }
        }, 1500);
      }
    } catch (e) {
      console.error('Network check failed:', e);
    }
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

  nextTask(): void {
    this.router.navigate(['/tasks']);
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

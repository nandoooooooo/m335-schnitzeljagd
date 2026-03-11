import {Component, computed, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import {BatteryInfo, Device} from '@capacitor/device';
import {IonButton, IonContent,} from '@ionic/angular/standalone';
import {PageHeaderComponent} from '../components/page-header/page-header.component';
import {TaskService} from '../services/task.service';

@Component({
  selector: 'app-charge-task',
  templateUrl: './charge-task.page.html',
  styleUrls: ['./charge-task.page.scss'],
  standalone: true,
  imports: [IonContent, IonButton, PageHeaderComponent],
})
export class ChargeTaskPage implements OnInit, OnDestroy {
  private router = inject(Router);
  private taskService = inject(TaskService);
  private interval?: ReturnType<typeof setInterval>;
  private timerInterval?: ReturnType<typeof setInterval>;
  private startTime = Date.now();
  private previousElapsed = 0;
  private penaltySeconds = 10 * 60;

  task = {
    index: 1,
    total: 6,
    title: 'Stromversorgung',
    description: 'Versorge das Gerät mit Strom',
    hint: 'Schliesse dein Handy an ein Ladekabel an',
    bonusTime: '±5m',
  };

  isCharging = signal(false);
  detected = signal(0);
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
    const taskData = this.taskService.getTaskById(1);
    this.previousElapsed = taskData?.timeElapsed ?? 0;
    this.startTime = Date.now();
    this.currentElapsed.set(this.previousElapsed);

    await this.checkCharging();
    this.interval = setInterval(() => this.checkCharging(), 2000);
    this.timerInterval = setInterval(() => {
      const elapsed = this.previousElapsed + Math.floor((Date.now() - this.startTime) / 1000);
      this.currentElapsed.set(elapsed);
    }, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
    clearInterval(this.timerInterval);
  }

  async checkCharging(): Promise<void> {
    try {
      const info: BatteryInfo = await Device.getBatteryInfo();
      const charging = info.isCharging ?? false;
      this.isCharging.set(charging);
      this.detected.set(charging ? 1 : 0);

      if (charging) {
        clearInterval(this.interval);
        const timeSpent = this.calculateTimeSpent();
        const allCompleted = await this.taskService.completeTask(1, timeSpent);
        setTimeout(() => {
          if (allCompleted) {
            this.router.navigate(['/tasks/finish']);
          } else {
            this.nextTask();
          }
        }, 1500);
      }
    } catch (e) {
      console.error('Battery check failed:', e);
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
    const allCompleted = await this.taskService.skipTask(1, totalElapsed);
    if (allCompleted) {
      this.router.navigate(['/tasks/finish']);
    } else {
      this.router.navigate(['/tasks']);
    }
  }

  cancel(): void {
    const totalElapsed = this.getTotalElapsedSeconds();
    this.taskService.pauseTask(1, totalElapsed);
    this.router.navigate(['/tasks']);
  }
}

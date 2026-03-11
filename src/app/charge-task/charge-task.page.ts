import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
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
  private startTime = Date.now();

  task = {
    index: 5,
    total: 6,
    title: 'Stromversorgung',
    description: 'Versorge das Gerät mit Strom',
    timer: '03:43 MIN',
    hint: 'Schliesse dein Handy an ein Ladekabel an',
    bonusTime: '±5m',
  };

  isCharging = signal(false);
  detected = signal(0);

  async ngOnInit(): Promise<void> {
    this.startTime = Date.now();
    await this.checkCharging();
    this.interval = setInterval(() => this.checkCharging(), 2000);
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
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
        this.taskService.completeTask(1, timeSpent);
        setTimeout(() => this.nextTask(), 1500);
      }
    } catch (e) {
      console.error('Battery check failed:', e);
    }
  }

  private calculateTimeSpent(): string {
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  nextTask(): void {
    this.router.navigate(['/tasks']);
  }

  skip(): void {
    this.taskService.skipTask(1);
    this.router.navigate(['/tasks']);
  }

  cancel(): void {
    this.router.navigate(['/tasks']);
  }
}

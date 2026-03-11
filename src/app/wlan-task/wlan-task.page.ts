import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Network } from '@capacitor/network';
import { IonContent, IonButton } from '@ionic/angular/standalone';
import { PageHeaderComponent } from '../components/page-header/page-header.component';
import { TaskService } from '../services/task.service';

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
  private interval?: ReturnType<typeof setInterval>;
  private startTime = Date.now();

  task = {
    index: 6,
    total: 6,
    title: 'Das tut WLAN',
    description: 'Verbinde dich mit dem Wlan',
    timer: '03:43 MIN',
    hint: 'Verbinde dich mit dem Wlan aus Kursraum 6 und trenne die Verbindung im anschluss wieder',
    bonusTime: '±5m',
  };

  wlanConnected = signal(false);
  wlanDisconnected = signal(false);

  private wasConnected = false;

  async ngOnInit(): Promise<void> {
    this.startTime = Date.now();
    await this.checkNetwork();
    this.interval = setInterval(() => this.checkNetwork(), 2000);
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
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
        this.taskService.completeTask(2, timeSpent);
        setTimeout(() => this.nextTask(), 1500);
      }
    } catch (e) {
      console.error('Network check failed:', e);
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
    this.taskService.skipTask(2);
    this.router.navigate(['/tasks']);
  }

  cancel(): void {
    this.router.navigate(['/tasks']);
  }
}

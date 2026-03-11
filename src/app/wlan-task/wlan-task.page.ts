import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Network } from '@capacitor/network';
import { IonContent, IonButton } from '@ionic/angular/standalone';
import { PageHeaderComponent } from '../components/page-header/page-header.component';

@Component({
  selector: 'app-wlan-task',
  templateUrl: './wlan-task.page.html',
  styleUrls: ['./wlan-task.page.scss'],
  standalone: true,
  imports: [IonContent, IonButton, PageHeaderComponent],
})
export class WlanTaskPage implements OnInit, OnDestroy {
  private router = inject(Router);
  private interval?: ReturnType<typeof setInterval>;

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
        setTimeout(() => this.nextTask(), 1500);
      }
    } catch (e) {
      console.error('Network check failed:', e);
    }
  }

  nextTask(): void {
    this.router.navigate(['/results']);
  }

  skip(): void {
    this.router.navigate(['/results']);
  }

  cancel(): void {
    this.router.navigate(['/start-page']);
  }
}

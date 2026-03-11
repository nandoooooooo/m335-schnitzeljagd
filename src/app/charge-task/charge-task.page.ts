import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BatteryInfo, Device } from '@capacitor/device';
import {
  IonContent,
  IonHeader,
  IonFooter,
  IonToolbar,
  IonButton,
} from '@ionic/angular/standalone';
import { PageHeaderComponent } from '../components/page-header/page-header.component';

@Component({
  selector: 'app-charge-task',
  templateUrl: './charge-task.page.html',
  styleUrls: ['./charge-task.page.scss'],
  standalone: true,
  imports: [IonContent, IonButton, PageHeaderComponent],
})
export class ChargeTaskPage implements OnInit, OnDestroy {
  private router = inject(Router);
  private interval?: ReturnType<typeof setInterval>;

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
        setTimeout(() => this.nextTask(), 1500);
      }
    } catch (e) {
      console.error('Battery check failed:', e);
    }
  }

  nextTask(): void {
    this.router.navigate(['/task-06']);
  }

  skip(): void {
    this.router.navigate(['/task-06']);
  }

  cancel(): void {
    this.router.navigate(['/tasks']);
  }
}

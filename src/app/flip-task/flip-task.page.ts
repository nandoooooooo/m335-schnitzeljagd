import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Router } from '@angular/router';
import { Motion } from '@capacitor/motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { IonContent, IonButton } from '@ionic/angular/standalone';
import { PageHeaderComponent } from '../components/page-header/page-header.component';
import { Capacitor, PluginListenerHandle } from '@capacitor/core';

@Component({
  selector: 'app-rotate-task',
  templateUrl: './flip-task.page.html',
  styleUrls: ['./flip-task.page.scss'],
  standalone: true,
  imports: [IonContent, IonButton, PageHeaderComponent],
})
export class FlipTaskPage implements OnInit, OnDestroy {
  private router = inject(Router);
  private motionListener?: PluginListenerHandle;
  private alreadyDetected = false;

  task = {
    index: 4,
    total: 6,
    title: 'Handy drehen',
    description: 'Drehe das Handy um',
    timer: '03:43 MIN',
    bonusTime: '±5m',
    hint: 'Kannst du das Lesen?',
  };

  isFlipped = signal(false);
  detected = computed(() => (this.isFlipped() ? 1 : 0));

  async ngOnInit(): Promise<void> {
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
  }

  private async onFlipDetected(): Promise<void> {
    await Haptics.impact({ style: ImpactStyle.Medium });
    setTimeout(() => this.router.navigate(['/task-05']), 1500);
  }

  skip(): void {
    this.router.navigate(['/task-05']);
  }

  cancel(): void {
    this.router.navigate(['/tasks']);
  }
}

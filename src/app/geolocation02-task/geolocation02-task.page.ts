import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Router } from '@angular/router';
import { Geolocation } from '@capacitor/geolocation';
import { IonContent, IonButton } from '@ionic/angular/standalone';
import { PageHeaderComponent } from '../components/page-header/page-header.component';
import { TaskService } from '../services/task.service';

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
  private startTime = Date.now();

  private startLatitude?: number;
  private startLongitude?: number;

  task = {
    index: 2,
    total: 6,
    title: 'Geo location 2/2',
    description: 'Begebe dich an einen bestimmten Standort',
    timer: '03:43 MIN',
    bonusTime: '+5m',
    hint: 'Laufe 20m in irgendeine Richtung',
  };

  distanceMoved = signal<number>(0);

  locationStatus = computed(() => {
    const moved = this.distanceMoved();
    if (!this.startLatitude) return 'Startpunkt wird gesetzt...';
    if (moved >= TARGET_DISTANCE_METERS) return 'Ziel erreicht ✅';
    return `${moved.toFixed(1)}m / ${TARGET_DISTANCE_METERS}m`;
  });

  async ngOnInit(): Promise<void> {
    this.gpsWatchId = await Geolocation.watchPosition(
      { enableHighAccuracy: true },
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
      Geolocation.clearWatch({ id: this.gpsWatchId });
    }
  }

  private onTargetReached(): void {
    Geolocation.clearWatch({ id: this.gpsWatchId! });
    const timeSpent = this.calculateTimeSpent();
    this.taskService.completeTask(5, timeSpent);
    setTimeout(() => this.router.navigate(['/tasks']), 1500);
  }

  private calculateTimeSpent(): string {
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
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

  skip(): void {
    this.taskService.skipTask(5);
    this.router.navigate(['/tasks']);
  }

  cancel(): void {
    this.router.navigate(['/tasks']);
  }
}

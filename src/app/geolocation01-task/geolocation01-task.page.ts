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

const DESTINATION_LATITUDE = 47.02760311889452;
const DESTINATION_LONGITUDE = 8.300860554120902;
const ARRIVAL_RADIUS_METERS = 5;
const DEGREES_TO_METERS = 111_000;

@Component({
  selector: 'app-geolocation01-task',
  templateUrl: './geolocation01-task.page.html',
  styleUrls: ['./geolocation01-task.page.scss'],
  standalone: true,
  imports: [IonContent, IonButton, PageHeaderComponent],
})
export class Geolocation01TaskPage implements OnInit, OnDestroy {
  private router = inject(Router);
  private gpsWatchId?: string;

  task = {
    index: 1,
    total: 6,
    title: 'Geo location 1/2',
    description: 'Begebe dich an einen bestimmten Standort',
    timer: '03:43 MIN',
    bonusTime: '+5m',
    hint: 'Begebe dich vor die Migros',
  };

  userLatitude = signal<number | null>(null);
  userLongitude = signal<number | null>(null);
  metersToTarget = signal<number | null>(null);

  locationStatus = computed(() => {
    const meters = this.metersToTarget();
    if (meters === null) return 'Standort wird gesucht...';
    if (meters <= ARRIVAL_RADIUS_METERS) return 'Ziel erreicht ✅';
    return `${Math.round(meters)}m zum Ziel`;
  });

  formattedCoordinates = computed(() => {
    const latitude = this.userLatitude();
    const longitude = this.userLongitude();
    if (latitude === null || longitude === null) return '—';
    return `${latitude.toFixed(5)}° N, ${longitude.toFixed(5)}° E`;
  });

  async ngOnInit(): Promise<void> {
    this.gpsWatchId = await Geolocation.watchPosition(
      { enableHighAccuracy: true },
      (position, error) => {
        if (error || !position) return;

        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        this.userLatitude.set(userLat);
        this.userLongitude.set(userLng);

        const distance = this.calculateDistance(
          userLat,
          userLng,
          DESTINATION_LATITUDE,
          DESTINATION_LONGITUDE,
        );
        this.metersToTarget.set(distance);

        if (distance <= ARRIVAL_RADIUS_METERS) {
          this.onDestinationReached();
        }
      },
    );
  }

  ngOnDestroy(): void {
    if (this.gpsWatchId) {
      Geolocation.clearWatch({ id: this.gpsWatchId });
    }
  }

  private onDestinationReached(): void {
    Geolocation.clearWatch({ id: this.gpsWatchId! });
    setTimeout(() => this.router.navigate(['/task-02']), 1500);
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
    this.router.navigate(['/task-02']);
  }

  cancel(): void {
    this.router.navigate(['/start-page']);
  }
}

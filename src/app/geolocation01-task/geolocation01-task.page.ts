import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { PageHeaderComponent } from '../components/page-header/page-header.component';

@Component({
  selector: 'app-geolocation01-task',
  templateUrl: './geolocation01-task.page.html',
  styleUrls: ['./geolocation01-task.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonButton,
    CommonModule,
    FormsModule,
    PageHeaderComponent,
  ],
})
export class Geolocation01TaskPage {
  task = {
    index: 1,
    total: 6,
    title: 'Geo location 1/2',
    description: 'Begebe dich an einen bestimmten standort',
    timer: '03:43 MIN',
    locationStatus: 'Standort erkannt',
    detectedLocation: '47.3769° N, 8.5417° E',
    bonusTime: '+5m',
    hint: 'Begebe dich vor die Migros',
  };
}

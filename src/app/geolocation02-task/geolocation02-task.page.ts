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
  selector: 'app-geolocation02-task',
  templateUrl: './geolocation02-task.page.html',
  styleUrls: ['./geolocation02-task.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonTitle,
    IonToolbar,
    IonButton,
    CommonModule,
    FormsModule,
    PageHeaderComponent,
  ],
})
export class Geolocation02TaskPage {
  task = {
    index: 2,
    total: 6,
    title: 'Geo location 2/2',
    description: 'Begebe dich an einen bestimmten standort',
    timer: '03:43 MIN',

    distanceLabel: 'Jetzige Distanz',
    distance: '0.5m',
    targetDistance: '20m',

    bonusTime: '+5m',

    hint: 'Laufe 20m',
  };
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonContent, IonFooter,
  IonHeader, IonImg,
  IonItem,
  IonLabel,
  IonList,
  IonText,
  IonTitle, IonToggle,
  IonToolbar
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-permissions-page',
  templateUrl: './permissions-page.page.html',
  styleUrls: ['./permissions-page.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonText, IonList, IonItem, IonLabel, IonToggle, IonFooter, IonButton, IonImg]
})
export class PermissionsPagePage  {

  constructor() { }



}

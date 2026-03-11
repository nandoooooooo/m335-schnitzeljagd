import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  IonContent,
  IonToolbar,
  IonTitle,
  IonList,
  IonItem,
  IonButton,
} from '@ionic/angular/standalone';
import { PageHeaderComponent } from '../components/page-header/page-header.component';

interface Player {
  name: string;
  schnitzel: number;
  kartoffel: number;
  points: number;
  isMe?: boolean;
}

@Component({
  selector: 'app-leaderboard-page',
  templateUrl: './leaderboard.page.html',
  styleUrls: ['./leaderboard.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonToolbar,
    IonTitle,
    IonList,
    IonItem,
    IonButton,
    CommonModule,
    FormsModule,
    PageHeaderComponent,
  ],
})
export class LeaderboardPage {
  // eslint-disable-next-line @angular-eslint/prefer-inject
  constructor(private router: Router) {}

  players: Player[] = [
    { name: 'Anna K.', schnitzel: 12, kartoffel: 2, points: 480 },
    { name: 'Tom B.', schnitzel: 10, kartoffel: 1, points: 390 },
    { name: 'Lena M.', schnitzel: 9, kartoffel: 0, points: 355 },
    { name: 'Yuki S.', schnitzel: 8, kartoffel: 3, points: 310 },
    { name: 'Max M.', schnitzel: 4, kartoffel: 2, points: 180, isMe: true },
  ];

  goToStart() {
    this.router.navigate(['/start-page']);
  }
}

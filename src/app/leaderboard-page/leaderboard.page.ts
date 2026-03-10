import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // ⬅️ fehlt noch

import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonList,
  IonItem,
  IonButton,
} from '@ionic/angular/standalone';

interface Player {
  name: string;
  schnitzel: number;
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
    IonHeader,
    IonToolbar,
    IonTitle,
    IonList,
    IonItem,
    IonButton,
    CommonModule,
    FormsModule,
  ],
})
export class LeaderboardPage {
  // eslint-disable-next-line @angular-eslint/prefer-inject
  constructor(private router: Router) {}

  players: Player[] = [
    { name: 'Anna K.', schnitzel: 12, points: 480 },
    { name: 'Tom B.', schnitzel: 10, points: 390 },
    { name: 'Lena M.', schnitzel: 9, points: 355 },
    { name: 'Yuki S.', schnitzel: 8, points: 310 },
    { name: 'Max M.', schnitzel: 4, points: 180, isMe: true },
  ];

  goToStart() {
    this.router.navigate(['/start-page']);
  }
}

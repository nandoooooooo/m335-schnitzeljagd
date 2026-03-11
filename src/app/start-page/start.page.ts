import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-start-page',
  standalone: true,
  templateUrl: 'start.page.html',
  styleUrls: ['start.page.scss'],
  imports: [IonContent, IonButton],
})
export class StartPage {
  private router = inject(Router);

  onStart(): void {
    this.router.navigate(['/permissions']);
  }

  navigateToLeaderboard(): void {
    this.router.navigate(['/leaderboard-page']);
  }

  goToLeaderboardPage(): void {
    this.router.navigate(['/leaderboard-page']);
  }
}

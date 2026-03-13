import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  IonContent,
  IonList,
  IonItem,
  IonButton,
} from '@ionic/angular/standalone';

import { PageHeaderComponent } from '../components/page-header/page-header.component';
import { TaskService } from '../services/task.service';

@Component({
  selector: 'app-leaderboard-page',
  templateUrl: './leaderboard.page.html',
  styleUrls: ['./leaderboard.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonList,
    IonItem,
    IonButton,
    CommonModule,
    FormsModule,
    PageHeaderComponent,
  ],
})
export class LeaderboardPage {
  private router = inject(Router);
  private taskService = inject(TaskService);

  players = computed(() => {
    return this.taskService
      .getLeaderboard()
      .filter((entry) => entry.name && entry.name.trim() !== '')
      .map((entry) => ({
        name: entry.name,
        schnitzel: entry.schnitzel,
        kartoffel: entry.kartoffel,
        points: entry.schnitzel * 100 - entry.kartoffel * 50,
        totalTimeSeconds: entry.totalTimeSeconds,
        timestamp: entry.timestamp,
      }))
      .sort((a, b) => {
        if (b.points !== a.points) {
          return b.points - a.points;
        }

        return a.totalTimeSeconds - b.totalTimeSeconds;
      });
  });

  goToStart(): void {
    this.taskService.clearCurrentRun();
    this.router.navigate(['/start-page']);
  }
}

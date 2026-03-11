import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonButton } from '@ionic/angular/standalone';
import { PageHeaderComponent } from '../components/page-header/page-header.component';
import { NameService } from '../../name-service';

interface TaskResult {
  icon: string;
  label: string;
  time: string;
  schnitzel: number;
  kartoffel: number;
}

@Component({
  selector: 'app-finish-page',
  templateUrl: './finish.page.html',
  styleUrls: ['./finish.page.scss'],
  standalone: true,
  imports: [IonContent, IonButton, PageHeaderComponent],
})
export class FinishPage {
  private router = inject(Router);
  private nameService = inject(NameService);
  totalTime = '27:34 min';
  schnitzelCount = 4;
  kartoffelCount = 2;
  totalPoints = 380;

  taskResults: TaskResult[] = [
    {
      icon: '📍',
      label: 'Geolocation 1',
      time: '03:27 MIN',
      schnitzel: 1,
      kartoffel: 0,
    },
    {
      icon: '🚶',
      label: 'Geolocation 2',
      time: '05:59 MIN',
      schnitzel: 1,
      kartoffel: 1,
    },
    {
      icon: '🔍',
      label: 'QR-Code scannen',
      time: '04:48 MIN',
      schnitzel: 1,
      kartoffel: 0,
    },
    {
      icon: '📱',
      label: 'Handy drehen',
      time: '02:15 MIN',
      schnitzel: 1,
      kartoffel: 0,
    },
    {
      icon: '🔋',
      label: 'Stromversorgung',
      time: '01:30 MIN',
      schnitzel: 0,
      kartoffel: 1,
    },
    {
      icon: '📶',
      label: 'WLAN verbinden',
      time: '03:10 MIN',
      schnitzel: 1,
      kartoffel: 0,
    },
  ];

  goToLeaderboard(): void {
    this.router.navigate(['/leaderboard-page']);
  }
  get playerName(): string {
    return this.nameService.playerName();
  }

  newRound(): void {
    this.router.navigate(['/start-page']);
  }
}

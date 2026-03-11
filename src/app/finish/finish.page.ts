import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonButton } from '@ionic/angular/standalone';
import { PageHeaderComponent } from '../components/page-header/page-header.component';
import { NameService } from '../../name-service';
import { TaskService } from '../services/task.service';

interface TaskResult {
  icon: string;
  label: string;
  time: string;
  schnitzel: number;
  kartoffel: number;
}

const TASK_ICONS: Record<number, string> = {
  1: '🔋',
  2: '📶',
  3: '🔍',
  4: '📱',
  5: '📍',
  6: '🚶',
};

function parseTimeToSeconds(timeString: string): number {
  const [minutes, seconds] = timeString.split(':').map(Number);
  return minutes * 60 + seconds;
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
  private taskService = inject(TaskService);

  playerName = 'Player';

  completedTasks = computed(() => {
    return this.taskService.tasks().filter(t => t.status === 'completed');
  });
  private nameService = inject(NameService);
  totalTime = '27:34 min';
  schnitzelCount = 4;
  kartoffelCount = 2;
  totalPoints = 380;

  progressStats = this.taskService.progressStats;

  totalTime = computed(() => {
    let totalSeconds = 0;
    this.completedTasks().forEach(task => {
      if (task.actualTimeSpent) {
        totalSeconds += parseTimeToSeconds(task.actualTimeSpent);
      }
    });

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} min`;
  });

  schnitzelCount = computed(() => this.progressStats().schnitzel);
  kartoffelCount = computed(() => this.progressStats().kartoffel);

  totalPoints = computed(() => {
    return (this.schnitzelCount() * 100) + (this.kartoffelCount() * 50);
  });

  taskResults = computed((): TaskResult[] => {
    return this.completedTasks().map(task => {
      const timeSpentSeconds = task.actualTimeSpent
        ? parseTimeToSeconds(task.actualTimeSpent)
        : 0;
      const penaltyTimeSeconds = parseTimeToSeconds(task.timeUntilPenalty);

      const schnitzel = task.actualTimeSpent ? 1 : 0;
      const kartoffel = timeSpentSeconds > penaltyTimeSeconds ? 1 : 0;

      const formattedTime = task.actualTimeSpent
        ? `${task.actualTimeSpent} MIN`
        : 'übersprungen';

      return {
        icon: TASK_ICONS[task.id] || '📋',
        label: task.title,
        time: formattedTime,
        schnitzel,
        kartoffel,
      };
    });
  });

  goToLeaderboard(): void {
    this.router.navigate(['/leaderboard-page']);
  }
  get playerName(): string {
    return this.nameService.playerName();
  }

  newRound(): void {
    this.taskService.resetTasks();
    this.router.navigate(['/start-page']);
  }
}

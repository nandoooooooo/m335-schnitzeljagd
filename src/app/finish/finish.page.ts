import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonButton } from '@ionic/angular/standalone';
import { PageHeaderComponent } from '../components/page-header/page-header.component';
import { TaskService } from '../services/task.service';
import { NameService } from '../../name-service';

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
  private nameService = inject(NameService);

  get playerName(): string {
    return this.nameService.playerName();
  }

  schnitzelCount = computed(() => this.taskService.progressStats().schnitzel);

  kartoffelCount = computed(() => this.taskService.progressStats().kartoffel);

  completedTasks = computed(() =>
    this.taskService.tasks().filter((t) => t.status === 'completed'),
  );

  progressStats = this.taskService.progressStats;

  totalTime = computed(() => {
    let totalSeconds = 0;
    this.completedTasks().forEach((task) => {
      if (task.actualTimeSpent) {
        totalSeconds += parseTimeToSeconds(task.actualTimeSpent);
      }
    });
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} min`;
  });

  totalPoints = computed(() => {
    return (
      this.taskService.progressStats().schnitzel * 100 +
      this.taskService.progressStats().kartoffel * 50
    );
  });

  taskResults = computed((): TaskResult[] => {
    return this.completedTasks().map((task) => {
      const timeSpentSeconds = task.actualTimeSpent
        ? parseTimeToSeconds(task.actualTimeSpent)
        : 0;
      const penaltySeconds = parseTimeToSeconds(task.timeUntilPenalty);
      const schnitzel = task.actualTimeSpent ? 1 : 0;
      const kartoffel = timeSpentSeconds > penaltySeconds ? 1 : 0;
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

  newRound(): void {
    this.taskService.resetTasks();
    this.router.navigate(['/start-page']);
  }

  constructor() {
    console.log('progressStats:', this.taskService.progressStats());
    console.log('tasks:', this.taskService.tasks());
  }
}

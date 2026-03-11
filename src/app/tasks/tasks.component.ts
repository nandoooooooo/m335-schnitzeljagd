import {Component, computed, inject} from '@angular/core';
import {Router} from '@angular/router';
import {PageHeaderComponent} from '../components/page-header/page-header.component';
import {IonButton, IonContent, IonProgressBar,} from '@ionic/angular/standalone';
import {Task} from '../models/task.interface';
import {TaskCardComponent} from '../components/task-card/task-card.component';
import {TaskService} from '../services/task.service';
import {NameService} from '../../name-service';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],
  imports: [
    PageHeaderComponent,
    IonContent,
    IonButton,
    TaskCardComponent,
    IonProgressBar,
  ],
})
export class TasksComponent {
  private router = inject(Router);
  private taskService = inject(TaskService);
  private nameService = inject(NameService);
  playerName = this.nameService.playerName;

  tasks = this.taskService.tasks;
  progressStats = this.taskService.progressStats;

  completedTasksCount = computed(
    () => this.tasks().filter((t) => t.status === 'completed').length,
  );

  totalTasksCount = computed(() => this.tasks().length);

  completionProgress = computed(
    () => this.completedTasksCount() / this.totalTasksCount(),
  );

  completionPercentage = computed(() =>
    Math.round(this.completionProgress() * 100),
  );

  totalTime = computed(() => {
    const totalElapsedSeconds = this.tasks().reduce((sum, task) => {
      if (task.actualTimeSpent) {
        return sum + this.parseTimeToSeconds(task.actualTimeSpent);
      }

      if (task.timeElapsed) {
        return sum + task.timeElapsed;
      }

      return sum;
    }, 0);

    return this.formatSeconds(totalElapsedSeconds);
  });

  onTaskClick(task: Task): void {
    this.router.navigate([task.relativeUrl]);
  }

  onCancelRun(): void {
    const confirmed = window.confirm(
      'Möchtest du den Lauf wirklich abbrechen? Dein Fortschritt wird zurückgesetzt.',
    );

    if (!confirmed) {
      return;
    }

    this.taskService.clearCurrentRun();
    this.router.navigate(['/start-page']);
  }

  private parseTimeToSeconds(timeString: string): number {
    const [minutes, seconds] = timeString.split(':').map(Number);
    return minutes * 60 + seconds;
  }

  private formatSeconds(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
}

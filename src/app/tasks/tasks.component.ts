import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { PageHeaderComponent } from '../components/page-header/page-header.component';
import {
  IonButton,
  IonContent,
  IonProgressBar,
} from '@ionic/angular/standalone';
import { ProgressStats, Task } from '../models/task.interface';
import { TaskCardComponent } from '../components/task-card/task-card.component';
import { TaskService } from '../services/task.service';
import { NameService } from '../../name-service';

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
    const completedTasks = this.tasks().filter((t) => t.status === 'completed');
    let totalMinutes = 0;
    let totalSeconds = 0;

    completedTasks.forEach((task) => {
      if (task.actualTimeSpent) {
        const [minutes, seconds] = task.actualTimeSpent.split(':').map(Number);
        totalMinutes += minutes;
        totalSeconds += seconds;
      }
    });

    totalMinutes += Math.floor(totalSeconds / 60);
    totalSeconds = totalSeconds % 60;

    return `${String(totalMinutes).padStart(2, '0')}:${String(totalSeconds).padStart(2, '0')}`;
  });

  onTaskClick(task: Task): void {
    this.router.navigate([task.relativeUrl]);
  }
}

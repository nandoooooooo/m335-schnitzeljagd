import { Component } from '@angular/core';
import { PageHeaderComponent } from '../components/page-header/page-header.component';
import { IonButton, IonContent, IonProgressBar } from '@ionic/angular/standalone';
import { ProgressStats, Task} from '../models/task.interface';
import { TaskCardComponent } from '../components/task-card/task-card.component';

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
  progressStats: ProgressStats = {
    schnitzel: 2,
    kartoffel: 2,
    punkte: 380,
  };

  get completedTasksCount(): number {
    return this.tasks.filter(t => t.status === 'completed').length;
  }

  get totalTasksCount(): number {
    return this.tasks.length;
  }

  get completionProgress(): number {
    return this.completedTasksCount / this.totalTasksCount;
  }

  get completionPercentage(): number {
    return Math.round(this.completionProgress * 100);
  }

  tasks: Task[] = [
    {
      id: '1',
      title: 'Foto-Challenge',
      description: 'Finde 3 Objekte und fotografiere sie',
      icon: 'camera',
      status: 'completed',
      time: '08:42',
      points: 2,
      isLocked: false,
    },
    {
      id: '2',
      title: 'Navigation',
      description: 'Finde 3 200m Radius Kreise',
      icon: 'compass',
      status: 'completed',
      time: '03:18',
      points: 1,
      isLocked: false,
    },
    {
      id: '3',
      title: 'QR-Code scannen',
      description: 'Scanne den QR-Code um die Antwort',
      icon: 'qr-code',
      status: 'active',
      time: '03:43',
      isLocked: false,
    },
    {
      id: '4',
      title: 'Sound-Rätsel',
      description: 'Höre dir den Sound an',
      icon: 'mic',
      status: 'locked',
      isLocked: true,
    },
  ];
}

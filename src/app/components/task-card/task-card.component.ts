import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Task} from '../../models/task.interface';
import {IonBadge, IonCard, IonCardContent, IonIcon} from '@ionic/angular/standalone';

@Component({
  selector: 'app-task-card',
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.scss'],
  standalone: true,
  imports: [
    IonCard,
    IonCardContent,
    IonIcon,
    IonBadge
  ]
})
export class TaskCardComponent {
  @Input() task!: Task;
  @Output() taskClick = new EventEmitter<Task>();

  onCardClick(): void {
    if (this.task.status === 'active') {
      this.taskClick.emit(this.task);
    }
  }
}

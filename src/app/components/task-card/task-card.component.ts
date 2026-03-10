import {Component, Input} from '@angular/core';
import {Task} from '../../models/task.interface';
import {IonBadge, IonCard, IonCardContent, IonIcon} from '@ionic/angular/standalone';

@Component({
  selector: 'app-task-card',
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.scss'],
  imports: [
    IonCard,
    IonCardContent,
    IonIcon,
    IonBadge
  ]
})
export class TaskCardComponent {
  @Input() task!: Task;
}

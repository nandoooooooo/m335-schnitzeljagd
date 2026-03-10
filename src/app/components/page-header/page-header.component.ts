import { Component, Input } from '@angular/core';
import { IonHeader } from '@ionic/angular/standalone';

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss'],
  standalone: true,
  imports: [IonHeader],
})
export class PageHeaderComponent {
  @Input() title!: string;
}

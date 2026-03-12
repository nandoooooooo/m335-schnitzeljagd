import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  private taskDoneAudio: HTMLAudioElement;

  constructor() {
    this.taskDoneAudio = new Audio('assets/mp3/task-done.mp3');
    this.taskDoneAudio.load();
  }

  async playTaskDone(): Promise<void> {
    try {
      this.taskDoneAudio.currentTime = 0;
      await this.taskDoneAudio.play();
    } catch (error) {
      console.error('Error playing task-done sound:', error);
    }
  }
}

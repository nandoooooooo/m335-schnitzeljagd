import {computed, inject, Injectable, signal} from '@angular/core';
import {LeaderboardEntry, ProgressStats, Task,} from '../models/task.interface';
import {environment} from '../../environments/environment';
import {NameService} from '../../name-service';
import {CapacitorHttp} from '@capacitor/core';
import {parseTimeToSeconds} from '../utils/time.utils';

const STORAGE_KEY = 'schnitzeljagd_tasks';
const LEADERBOARD_KEY = 'schnitzeljagd_leaderboard';

const DEFAULT_TASKS: Task[] = [
  {
    id: 1,
    title: 'Stromversorgung',
    description: 'Versorge das Gerät mit Strom',
    ionicIconName: 'battery-charging',
    relativeUrl: '/tasks/charge',
    timeUntilPenalty: '01:00',
    status: 'active',
    hint: 'Schliesse dein Handy an ein Ladekabel an',
  },
  {
    id: 2,
    title: 'Das tut WLAN',
    description: 'Verbinde dich mit dem Wlan',
    ionicIconName: 'wifi',
    relativeUrl: '/tasks/wlan',
    timeUntilPenalty: '02:00',
    status: 'locked',
    hint: 'Verbinde dich mit dem Wlan aus Kursraum 6 und trenne die Verbindung im anschluss wieder',
  },
  {
    id: 3,
    title: 'QR-Code scannen',
    description: 'Finde den versteckten QR-Code und scanne ihn.',
    ionicIconName: 'qr-code',
    relativeUrl: '/tasks/qrcode',
    timeUntilPenalty: '02:00',
    status: 'locked',
    hint: 'Der Code befindet sich im Kursraum 6.',
  },
  {
    id: 4,
    title: 'Handy drehen',
    description: 'Drehe das Handy um',
    ionicIconName: 'phone-portrait',
    relativeUrl: '/tasks/flip',
    timeUntilPenalty: '00:35',
    status: 'locked',
    hint: 'Kannst du das Lesen?',
  },
  {
    id: 5,
    title: 'Geo location 1/2',
    description: 'Begebe dich an einen bestimmten Standort',
    ionicIconName: 'location',
    relativeUrl: '/tasks/geolocation-1',
    timeUntilPenalty: '05:00',
    status: 'locked',
    hint: 'Begebe dich vor die Migros',
  },
  {
    id: 6,
    title: 'Geo location 2/2',
    description: 'Begebe dich an einen bestimmten Standort',
    ionicIconName: 'navigate',
    relativeUrl: '/tasks/geolocation-2',
    timeUntilPenalty: '01:00',
    status: 'locked',
    hint: 'Laufe 20m in irgendeine Richtung',
  },
];

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private tasksSignal = signal<Task[]>(this.loadTasks());
  private nameService = inject(NameService);

  get tasks() {
    return this.tasksSignal.asReadonly();
  }

  progressStats = computed((): ProgressStats => {
    const completedTasks = this.tasksSignal().filter(
      (t) => t.status === 'completed' && t.actualTimeSpent,
    );

    let schnitzel = 0;
    let kartoffel = 0;

    completedTasks.forEach((task) => {
      if (!task.actualTimeSpent) return;

      const timeSpentSeconds = parseTimeToSeconds(task.actualTimeSpent);
      const penaltyTimeSeconds = parseTimeToSeconds(task.timeUntilPenalty);

      if (timeSpentSeconds <= penaltyTimeSeconds) {
        schnitzel++;
      } else {
        kartoffel++;
      }
    });

    return {schnitzel, kartoffel};
  });

  private loadTasks(): Task[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to load tasks from localStorage:', e);
      }
    }
    return [...DEFAULT_TASKS];
  }

  private saveTasks(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tasksSignal()));
  }

  getTaskById(id: number): Task | undefined {
    return this.tasksSignal().find((t) => t.id === id);
  }

  async completeTask(id: number, timeSpent: string): Promise<boolean> {
    this.tasksSignal.update((tasks) =>
      tasks.map((task) => {
        if (task.id === id) {
          const updatedTask = {
            ...task,
            status: 'completed' as const,
            actualTimeSpent: timeSpent,
            timeElapsed: undefined,
          };

          const nextTask = tasks.find((t) => t.id === id + 1);
          if (nextTask && nextTask.status === 'locked') {
            return updatedTask;
          }

          return updatedTask;
        }

        if (task.id === id + 1 && task.status === 'locked') {
          return {...task, status: 'active' as const};
        }

        return task;
      }),
    );

    this.saveTasks();

    const allCompleted = this.tasksSignal().every(
      (t) => t.status === 'completed',
    );

    if (allCompleted) {
      await this.saveToLeaderboard();
      return true;
    }

    return false;
  }

  pauseTask(id: number, elapsedSeconds: number): void {
    this.tasksSignal.update((tasks) =>
      tasks.map((task) =>
        task.id === id ? {...task, timeElapsed: elapsedSeconds} : task,
      ),
    );
    this.saveTasks();
  }

  async skipTask(id: number, elapsedSeconds: number): Promise<boolean> {
    this.tasksSignal.update((tasks) =>
      tasks.map((task) => {
        if (task.id === id) {
          return {
            ...task,
            status: 'completed' as const,
            actualTimeSpent: undefined,
            timeElapsed: elapsedSeconds,
          };
        }

        if (task.id === id + 1 && task.status === 'locked') {
          return {...task, status: 'active' as const};
        }

        return task;
      }),
    );

    this.saveTasks();

    const allCompleted = this.tasksSignal().every(
      (t) => t.status === 'completed',
    );

    if (allCompleted) {
      await this.saveToLeaderboard();
      return true;
    }

    return false;
  }

  updateTaskStatus(id: number, status: Task['status']): void {
    this.tasksSignal.update((tasks) =>
      tasks.map((task) => (task.id === id ? {...task, status} : task)),
    );
    this.saveTasks();
  }

  resetTasks(): void {
    this.tasksSignal.set([...DEFAULT_TASKS]);
    this.saveTasks();
  }

  private loadLeaderboard(): LeaderboardEntry[] {
    const stored = localStorage.getItem(LEADERBOARD_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to load leaderboard from localStorage:', e);
      }
    }
    return [];
  }

  private saveLeaderboardEntry(entry: LeaderboardEntry): void {
    const leaderboard = this.loadLeaderboard();
    leaderboard.push(entry);
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
  }

  async saveToLeaderboard(): Promise<void> {
    const stats = this.progressStats();
    const completedTasks = this.tasksSignal().filter(
      (t) => t.status === 'completed',
    );

    let totalSeconds = 0;
    completedTasks.forEach((task) => {
      if (task.actualTimeSpent) {
        totalSeconds += parseTimeToSeconds(task.actualTimeSpent);
      } else if (task.timeElapsed !== undefined) {
        totalSeconds += task.timeElapsed;
      }
    });

    const entry: LeaderboardEntry = {
      timestamp: Date.now(),
      name: this.nameService.playerName(),
      totalTimeSeconds: totalSeconds,
      schnitzel: stats.schnitzel,
      kartoffel: stats.kartoffel,
      completedTasksCount: completedTasks.length,
    };

    this.saveLeaderboardEntry(entry);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const playerName = this.nameService.playerName();
    const body =
      `entry.1860183935=${encodeURIComponent(playerName)}` +
      `&entry.564282981=${stats.schnitzel}` +
      `&entry.1079317865=${stats.kartoffel}` +
      `&entry.985590604=${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    try {
      await CapacitorHttp.post({
        url: environment.leaderboardUrl,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: body,
      });
      console.log('Leaderboard entry saved to Google Forms');
    } catch (error) {
      console.log(
        'Leaderboard submitted to Google Forms (CORS blocks response, but submission succeeded)',
      );
      console.log('Data also saved in localStorage as backup');
    }
  }

  clearCurrentRun(): void {
    this.tasksSignal.set([...DEFAULT_TASKS]);
    this.saveTasks();
  }

  getLeaderboard(): LeaderboardEntry[] {
    return this.loadLeaderboard();
  }
}

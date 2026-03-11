import { Injectable, signal } from '@angular/core';
import { Task } from '../models/task.interface';

const STORAGE_KEY = 'schnitzeljagd_tasks';

const DEFAULT_TASKS: Task[] = [
  {
    id: 1,
    title: 'Akku laden',
    description: 'Lade dein Gerät auf',
    ionicIconName: 'battery-charging',
    relativeUrl: '/tasks/charge',
    timeUntilPenalty: '10:00',
    status: 'active',
    hint: 'Finde eine Steckdose',
  },
  {
    id: 2,
    title: 'WLAN verbinden',
    description: 'Verbinde dich mit dem WLAN',
    ionicIconName: 'wifi',
    relativeUrl: '/tasks/wlan',
    timeUntilPenalty: '05:00',
    status: 'locked',
    hint: 'Suche nach verfügbaren Netzwerken',
  },
  {
    id: 3,
    title: 'QR-Code scannen',
    description: 'Scanne den QR-Code um die Antwort',
    ionicIconName: 'qr-code',
    relativeUrl: '/tasks/qrcode',
    timeUntilPenalty: '05:00',
    status: 'locked',
    hint: 'Schaue an den Wänden',
  },
  {
    id: 4,
    title: 'Standort 1 finden',
    description: 'Finde den ersten Standort',
    ionicIconName: 'location',
    relativeUrl: '/tasks/geolocation-1',
    timeUntilPenalty: '15:00',
    status: 'locked',
    hint: 'Verwende die Karte',
  },
  {
    id: 5,
    title: 'Standort 2 finden',
    description: 'Finde den zweiten Standort',
    ionicIconName: 'navigate',
    relativeUrl: '/tasks/geolocation-2',
    timeUntilPenalty: '15:00',
    status: 'locked',
    hint: 'Folge den Hinweisen',
  },
];

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private tasksSignal = signal<Task[]>(this.loadTasks());

  get tasks() {
    return this.tasksSignal.asReadonly();
  }

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

  completeTask(id: number, timeSpent: string): void {
    this.tasksSignal.update((tasks) =>
      tasks.map((task) => {
        if (task.id === id) {
          const updatedTask = {
            ...task,
            status: 'completed' as const,
            actualTimeSpent: timeSpent,
          };

          const nextTask = tasks.find((t) => t.id === id + 1);
          if (nextTask && nextTask.status === 'locked') {
            return updatedTask;
          }
          return updatedTask;
        }

        if (task.id === id + 1 && task.status === 'locked') {
          return { ...task, status: 'active' as const };
        }

        return task;
      })
    );
    this.saveTasks();
  }

  skipTask(id: number): void {
    this.tasksSignal.update((tasks) =>
      tasks.map((task) => {
        if (task.id === id) {
          return {
            ...task,
            status: 'completed' as const,
            actualTimeSpent: undefined,
          };
        }

        if (task.id === id + 1 && task.status === 'locked') {
          return { ...task, status: 'active' as const };
        }

        return task;
      })
    );
    this.saveTasks();
  }

  updateTaskStatus(id: number, status: Task['status']): void {
    this.tasksSignal.update((tasks) =>
      tasks.map((task) => (task.id === id ? { ...task, status } : task))
    );
    this.saveTasks();
  }

  resetTasks(): void {
    this.tasksSignal.set([...DEFAULT_TASKS]);
    this.saveTasks();
  }
}

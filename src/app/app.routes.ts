import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'start-page',
    loadComponent: () =>
      import('./start-page/start.page').then((m) => m.StartPage),
  },
  {
    path: '',
    redirectTo: 'start-page',
    pathMatch: 'full',
  },
  {
    path: 'permissions',
    loadComponent: () =>
      import('./permissions-page/permissions-page.page').then(
        (m) => m.PermissionsPage,
      ),
  },

  {
    path: 'leaderboard-page',
    loadComponent: () =>
      import('./leaderboard-page/leaderboard.page').then(
        (m) => m.LeaderboardPage,
      ),
  },
  {
    path: 'geolocation01-task',
    loadComponent: () =>
      import('./geolocation01-task/geolocation01-task.page').then(
        (m) => m.Geolocation01TaskPage,
      ),
  },
  {
    path: 'geolocation02-task',
    loadComponent: () =>
      import('./geolocation02-task/geolocation02-task.page').then(
        (m) => m.Geolocation02TaskPage,
      ),
  },
  {
    path: 'qrcode-task',
    loadComponent: () =>
      import('./qrcode-task/qrcode-task.page').then((m) => m.QrTaskPage),
  },
  {
    path: 'tasks',
    loadComponent: () =>
      import('./tasks/tasks.component').then((m) => m.TasksComponent),
  },
  {
    path: 'charge-task',
    loadComponent: () => import('./charge-task/charge-task.page').then( m => m.ChargeTaskPage)
  },
  {
    path: 'wlan-task',
    loadComponent: () => import('./wlan-task/wlan-task.page').then( m => m.WlanTaskPage)
  },
];

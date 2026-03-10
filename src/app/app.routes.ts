import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'start-page',
    loadComponent: () => import('./start-page/start.page').then((m) => m.StartPage),
  },
  {
    path: '',
    redirectTo: 'start-page',
    pathMatch: 'full',
  },
  {
    path: 'permissions-page',
    loadComponent: () => import('./permissions-page/permissions-page.page').then( m => m.PermissionsPagePage)
  },

];

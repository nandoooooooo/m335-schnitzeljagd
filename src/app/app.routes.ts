import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },  {
    path: 'permissions-page',
    loadComponent: () => import('./permissions-page/permissions-page.page').then( m => m.PermissionsPagePage)
  },

];

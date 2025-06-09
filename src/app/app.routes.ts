import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage) },
  { path: 'list/:id', loadComponent: () => import('./pages/list/list.page').then(m => m.ListPage) },
  { path: 'settings', loadComponent: () => import('./pages/settings/settings.page').then(m => m.SettingsPage) },
];
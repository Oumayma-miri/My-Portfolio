import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./components/hero/hero').then(m => m.Hero) },
  { path: 'about', loadComponent: () => import('./components/about/about').then(m => m.About) },
  { path: 'terminal', loadComponent: () => import('./components/terminal/terminal').then(m => m.Terminal) },
  { path: 'projects', loadComponent: () => import('./components/projects/projects').then(m => m.Projects) },
  { path: 'skills', loadComponent: () => import('./components/skills/skills').then(m => m.Skills) },
  { path: 'experience', loadComponent: () => import('./components/experience/experience').then(m => m.Experience) },
  { path: 'code', loadComponent: () => import('./components/code-showcase/code-showcase').then(m => m.CodeShowcase) },
  { path: 'contact', loadComponent: () => import('./components/contact/contact').then(m => m.Contact) },
];

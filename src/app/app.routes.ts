import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: '',
    loadComponent: () =>
      import('./shared/layout/admin-shell/admin-shell').then((m) => m.AdminShell),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'spaces',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/spaces/spaces-list/spaces-list').then((m) => m.SpacesList),
      },
      {
        path: 'members',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/members/members-list/members-list').then((m) => m.MembersList),
      },
      {
        path: 'bookings',
        loadComponent: () =>
          import('./features/bookings/booking-grid/booking-grid').then((m) => m.BookingGrid),
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: '**', redirectTo: 'login' },
];

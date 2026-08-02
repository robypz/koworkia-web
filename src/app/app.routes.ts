import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  /**
   * No shell-level guard here: every remaining child (dashboard/spaces/
   * members) already self-guards via `adminGuard` (which itself checks
   * auth). A blanket guard on this parent would run for *any* `''`-rooted
   * URL — including `/empresas/:id` and `/bookings`, which live in the
   * sibling PublicShell branch below — and block anonymous/`user` access
   * before the router ever gets a chance to fall through to that sibling.
   */
  {
    path: '',
    loadComponent: () =>
      import('./shared/layout/admin-shell/admin-shell').then((m) => m.AdminShell),
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
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  /**
   * Public-facing shell: the company profile is a public page (no login
   * required), and bookings is where `user`-role members live day to day —
   * neither belongs in the internal admin dashboard, so both mount under a
   * plain top-nav layout instead of AdminShell's sidebar. Router falls back
   * to this sibling `''` route whenever a URL doesn't match any AdminShell
   * child (e.g. a non-admin bouncing off `adminGuard` into `/bookings`).
   */
  {
    path: '',
    loadComponent: () =>
      import('./shared/layout/public-shell/public-shell').then((m) => m.PublicShell),
    children: [
      {
        path: 'bookings',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/bookings/booking-grid/booking-grid').then((m) => m.BookingGrid),
      },
      {
        path: 'empresas/:id',
        loadComponent: () =>
          import('./features/companies/company-profile/company-profile').then((m) => m.CompanyProfile),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];

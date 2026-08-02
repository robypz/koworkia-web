import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  /**
   * Public-facing shell: home and the company profile are public pages (no
   * login required), while bookings/mis-reservas/perfil are where `user`-role
   * members live day to day — none of this belongs in the internal admin
   * dashboard, so all of it mounts under a plain top-nav layout instead of
   * AdminShell's sidebar. This branch is listed *before* AdminShell: Angular
   * matches a parent route as soon as its own path matches even if none of
   * its children do (it doesn't require a child to "win" before activating
   * the parent with an empty outlet), so for the bare `''` URL AdminShell
   * would otherwise render itself with a blank body instead of ever falling
   * through to this sibling. Listing this branch first means its own `''`
   * child (Home) claims the root URL outright, and non-matching paths like
   * `/dashboard` still fall through to AdminShell below as expected.
   */
  {
    path: '',
    loadComponent: () =>
      import('./shared/layout/public-shell/public-shell').then((m) => m.PublicShell),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./features/home/home').then((m) => m.Home),
      },
      {
        path: 'bookings',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/bookings/booking-grid/booking-grid').then((m) => m.BookingGrid),
      },
      {
        path: 'mis-reservas',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/bookings/mis-reservas/mis-reservas').then((m) => m.MisReservas),
      },
      {
        path: 'perfil',
        canActivate: [authGuard],
        loadComponent: () => import('./features/profile/profile').then((m) => m.Profile),
      },
      {
        path: 'empresas/:id',
        loadComponent: () =>
          import('./features/companies/company-profile/company-profile').then((m) => m.CompanyProfile),
      },
    ],
  },
  /**
   * No shell-level guard here: every child (dashboard/spaces/members)
   * already self-guards via `adminGuard` (which itself checks auth). A
   * blanket guard on this parent would run for *any* `''`-rooted URL —
   * including `/empresas/:id` and `/bookings`, which live in the sibling
   * PublicShell branch above — and block anonymous/`user` access before the
   * router ever gets a chance to try this branch.
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
    ],
  },
  { path: '**', redirectTo: 'login' },
];

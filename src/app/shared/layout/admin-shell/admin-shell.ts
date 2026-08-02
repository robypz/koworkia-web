import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { RoleName } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmDialog } from '../../ui/confirm-dialog/confirm-dialog';
import { Toast } from '../../ui/toast/toast';

interface NavItem {
  label: string;
  icon: string;
  path: string;
  /** Roles allowed to see this item; omit to show it to any authenticated role. */
  roles?: RoleName[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', path: '/dashboard', roles: ['root', 'admin'] },
  { label: 'Puestos', icon: 'chair_alt', path: '/spaces', roles: ['root', 'admin'] },
  { label: 'Reservas', icon: 'calendar_today', path: '/bookings' },
  { label: 'Miembros', icon: 'group', path: '/members', roles: ['root'] },
];

const TITLES: { prefix: string; title: string }[] = [
  { prefix: '/dashboard', title: 'Dashboard' },
  { prefix: '/spaces', title: 'Gestión de Espacios' },
  { prefix: '/members', title: 'Gestión de Miembros' },
  { prefix: '/bookings', title: 'Reservas' },
  { prefix: '/empresas', title: 'Perfil de la empresa' },
];

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Toast, ConfirmDialog],
  templateUrl: './admin-shell.html',
})
export class AdminShell {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly user = this.auth.user;

  protected readonly navItems = computed(() =>
    NAV_ITEMS.filter((item) => !item.roles || this.auth.hasRole(...item.roles)),
  );

  protected readonly initials = computed(() => {
    const name = this.user()?.name ?? '';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  });

  protected readonly currentTitle = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => this.resolveTitle(event.urlAfterRedirects)),
    ),
    { initialValue: this.resolveTitle(this.router.url) },
  );

  protected logout(): void {
    this.auth.logout().subscribe(() => this.router.navigateByUrl('/login'));
  }

  private resolveTitle(url: string): string {
    return TITLES.find((entry) => url.startsWith(entry.prefix))?.title ?? 'Koworkia';
  }
}

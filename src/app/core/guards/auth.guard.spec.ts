import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RoleName, User } from '../models/user.model';
import { adminGuard } from './admin.guard';
import { authGuard } from './auth.guard';

const storeSession = (role: RoleName): void => {
  localStorage.setItem('koworkia_token', 'tok');
  localStorage.setItem(
    'koworkia_user',
    JSON.stringify({
      id: 1,
      name: 'Usuario',
      email: 'user@koworkia.com',
      roles: [{ id: 1, name: role, guard_name: 'web' }],
      phone: null,
      plan_id: null,
      status: 'active',
      company_id: null,
    } satisfies User),
  );
};

describe('authGuard', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
  });

  it('allows navigation when there is a stored session', () => {
    storeSession('user');
    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
    expect(result).toBe(true);
  });

  it('redirects to /login when there is no session', () => {
    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
    const router = TestBed.inject(Router);
    expect(result).toEqual(router.parseUrl('/login'));
  });
});

describe('adminGuard', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
  });

  it('allows admins through', () => {
    storeSession('admin');
    const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
    expect(result).toBe(true);
  });

  it('allows root through', () => {
    storeSession('root');
    const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
    expect(result).toBe(true);
  });

  it('redirects members to /bookings', () => {
    storeSession('user');
    const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
    const router = TestBed.inject(Router);
    expect(result).toEqual(router.parseUrl('/bookings'));
  });
});

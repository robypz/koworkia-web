import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResource } from '../models/api.model';
import { RoleName, User } from '../models/user.model';

interface LoginResponse {
  token: string;
}

export interface UpdateProfilePayload {
  name: string;
  email: string;
  phone?: string | null;
}

export interface UpdatePasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}

const TOKEN_KEY = 'koworkia_token';
const USER_KEY = 'koworkia_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly _user = signal<User | null>(this.readStoredUser());
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly isAdmin = computed(() => this.hasRole('root', 'admin'));

  hasRole(...names: RoleName[]): boolean {
    const roles = this._user()?.roles ?? [];
    return roles.some((role) => names.includes(role.name));
  }

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  login(email: string, password: string): Observable<User> {
    return this.http
      .post<ApiResource<LoginResponse>>(`${environment.apiUrl}/login`, { email, password })
      .pipe(
        tap(({ data }) => localStorage.setItem(TOKEN_KEY, data.token)),
        switchMap(() => this.fetchProfile()),
      );
  }

  fetchProfile(): Observable<User> {
    return this.http
      .get<ApiResource<User>>(`${environment.apiUrl}/user/profile-information`)
      .pipe(
        map((res) => res.data),
        tap((user) => {
          localStorage.setItem(USER_KEY, JSON.stringify(user));
          this._user.set(user);
        }),
      );
  }

  /** Follows the same `user/profile-information` resource the initial fetch uses (Jetstream-style API convention). */
  updateProfileInformation(payload: UpdateProfilePayload): Observable<User> {
    return this.http
      .put<ApiResource<User>>(`${environment.apiUrl}/user/profile-information`, payload)
      .pipe(
        map((res) => res.data),
        tap((user) => {
          localStorage.setItem(USER_KEY, JSON.stringify(user));
          this._user.set(user);
        }),
      );
  }

  updatePassword(payload: UpdatePasswordPayload): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/user/password`, payload).pipe(map(() => void 0));
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/logout`, {}).pipe(
      catchError(() => of(void 0)),
      tap(() => this.clearSession()),
      map(() => void 0),
    );
  }

  clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._user.set(null);
  }

  private readStoredUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }
}

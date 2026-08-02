import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResource } from '../models/api.model';
import { User } from '../models/user.model';

interface LoginResponse {
  token: string;
  user: User;
}

const TOKEN_KEY = 'koworkia_token';
const USER_KEY = 'koworkia_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly _user = signal<User | null>(this.readStoredUser());
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly isAdmin = computed(() => this._user()?.role === 'admin');

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  login(email: string, password: string): Observable<User> {
    return this.http
      .post<ApiResource<LoginResponse>>(`${environment.apiUrl}/login`, { email, password })
      .pipe(
        map((res) => res.data),
        tap(({ token, user }) => {
          localStorage.setItem(TOKEN_KEY, token);
          localStorage.setItem(USER_KEY, JSON.stringify(user));
          this._user.set(user);
        }),
        map(({ user }) => user),
      );
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

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockUser: User = {
    id: 1,
    name: 'Admin',
    email: 'admin@koworkia.com',
    roles: [{ id: 1, name: 'admin', guard_name: 'web' }],
    phone: null,
    plan_id: null,
    status: 'active',
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('logs in successfully and stores the session', () => {
    let result: User | undefined;
    service.login('admin@koworkia.com', 'secret').subscribe((user) => (result = user));

    const loginReq = httpMock.expectOne(`${environment.apiUrl}/login`);
    expect(loginReq.request.method).toBe('POST');
    loginReq.flush({ data: { token: 'abc123' } });

    const profileReq = httpMock.expectOne(`${environment.apiUrl}/user/profile-information`);
    expect(profileReq.request.method).toBe('GET');
    profileReq.flush({ data: mockUser });

    expect(result?.name).toBe('Admin');
    expect(service.isAuthenticated()).toBe(true);
    expect(service.isAdmin()).toBe(true);
    expect(service.token).toBe('abc123');
  });

  it('propagates an error on invalid credentials and keeps the session cleared', () => {
    let errored = false;
    service.login('admin@koworkia.com', 'wrong').subscribe({ error: () => (errored = true) });

    const req = httpMock.expectOne(`${environment.apiUrl}/login`);
    req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(errored).toBe(true);
    expect(service.isAuthenticated()).toBe(false);
    expect(service.token).toBeNull();
  });
});

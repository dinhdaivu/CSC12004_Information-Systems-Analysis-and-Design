import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '@environments/environment';
import type {
  AppRole,
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  RegisterResult,
  ResetPasswordWithCodeRequest,
  UpdateProfileRequest,
  User,
  VerifyEmailRequest,
} from '@shared/models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly tokenKey = 'auth_token';
  private readonly userKey = 'auth_user';
  private readonly pendingRegistrationEmailKey = 'pending_registration_email';
  private readonly currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());

  readonly currentUser$ = this.currentUserSubject.asObservable();

  login(payload: LoginRequest): Observable<User> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload).pipe(
      map((response) => response.data),
      tap(({ token, user }) => this.setSession(token, user)),
      map(({ user }) => user)
    );
  }

  forgotPassword(payload: ForgotPasswordRequest): Observable<void> {
    return this.http.post(`${this.apiUrl}/forgot-password`, payload).pipe(
      map(() => void 0)
    );
  }

  register(payload: RegisterRequest): Observable<RegisterResult> {
    return this.http.post<{ data: RegisterResult }>(`${this.apiUrl}/register`, payload).pipe(
      map((response) => response.data),
      tap((result) => {
        sessionStorage.setItem(this.pendingRegistrationEmailKey, result.email);
      })
    );
  }

  getPendingRegistrationEmail(): string | null {
    return sessionStorage.getItem(this.pendingRegistrationEmailKey);
  }

  clearPendingRegistrationEmail(): void {
    sessionStorage.removeItem(this.pendingRegistrationEmailKey);
  }

  resendVerificationCode(email: string): Observable<void> {
    const normalizedEmail = email.trim().toLowerCase();

    return this.http.post(`${this.apiUrl}/resend-verification`, { email: normalizedEmail }).pipe(
      map(() => void 0),
      tap(() => {
        sessionStorage.setItem(this.pendingRegistrationEmailKey, normalizedEmail);
      })
    );
  }

  verifyRegistrationCode(payload: VerifyEmailRequest): Observable<void> {
    return this.http.post(`${this.apiUrl}/verify-email`, payload).pipe(
      map(() => void 0),
      tap(() => {
        this.clearPendingRegistrationEmail();
      })
    );
  }

  resetPasswordWithCode(payload: ResetPasswordWithCodeRequest): Observable<void> {
    return this.http.post(`${this.apiUrl}/reset-password/verify`, payload).pipe(
      map(() => void 0)
    );
  }

  logout(): Observable<void> {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      map(() => void 0),
      catchError(() => of(void 0)),
      tap(() => this.clearSession())
    );
  }

  loadCurrentUser(): Observable<User> {
    return this.http.get<{ data: User }>(`${this.apiUrl}/me`).pipe(
      map((response) => response.data),
      tap((user) => this.setStoredUser(user))
    );
  }

  updateCurrentUser(payload: UpdateProfileRequest): Observable<User> {
    return this.http.patch<{ data: User }>(`${this.apiUrl}/me`, payload).pipe(
      map((response) => response.data),
      tap((user) => this.setStoredUser(user))
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasAnyRole(roles: AppRole[]): boolean {
    const user = this.getCurrentUser();
    return !!user && roles.includes(user.role);
  }

  getDefaultRouteForRole(role?: AppRole | null): string {
    if (!role) {
      return '/dashboard';
    }

    return role === 'customer' ? '/bookings' : '/admin';
  }

  navigateAfterLogin(role: AppRole): Promise<boolean> {
    return this.router.navigateByUrl(this.getDefaultRouteForRole(role));
  }

  clearSession(): void {
    this.clearToken();
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
  }

  private setSession(token: string, user: User): void {
    this.setToken(token);
    this.setStoredUser(user);
  }

  private setStoredUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private getStoredUser(): User | null {
    const raw = localStorage.getItem(this.userKey);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as User;
    } catch {
      localStorage.removeItem(this.userKey);
      return null;
    }
  }
}

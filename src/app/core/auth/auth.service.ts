import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest } from './auth.models';
import { decodeJwt } from '../utils/jwt.util';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'access_token';
const USER_KEY  = 'auth_user';
const ROLES_KEY = 'auth_roles';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly isAuth$ = new BehaviorSubject<boolean>(this.hasValidToken());

  constructor(private readonly http: HttpClient) {}

  get isAuthenticated$() {
    return this.isAuth$.asObservable();
  }

  login(body: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/api/auth/login`, body).pipe(
      tap((res) => {
        const token = (res as any).accessToken || (res as any).token || (res as any).jwt;
        if (!token) throw new Error('No token in response');
        this.setToken(token);
      })
    );
  }

  register(data: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/api/auth/register`, data);
  }
  

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ROLES_KEY);
    this.isAuth$.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getUsername(): string | null {
    return localStorage.getItem(USER_KEY);
  }

  getRoles(): string[] {
    try {
      return JSON.parse(localStorage.getItem(ROLES_KEY) ?? '[]');
    } catch { return []; }
  }

  hasRole(role: string): boolean {
    return this.getRoles().map(r => r.toUpperCase()).includes(role.toUpperCase());
  }

  hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) return false;

    const payload = decodeJwt(token);
    if (!payload?.exp) return true; 
    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  }

  private setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
    const payload = decodeJwt(token);
    const username = payload?.sub ?? '';
    const roles = (payload?.roles ?? []) as string[];
    localStorage.setItem(USER_KEY, username);
    localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
    this.isAuth$.next(true);
  }
}

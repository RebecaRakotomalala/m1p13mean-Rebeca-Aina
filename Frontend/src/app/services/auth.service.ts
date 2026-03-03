import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { finalize, shareReplay } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  email: string;
  nom: string;
  prenom?: string;
  role: 'admin' | 'boutique' | 'client';
  telephone?: string;
  avatar_url?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private usersCacheTtlMs = 45000;
  private usersMemoryCache = new Map<string, { ts: number; data: any }>();
  private usersStoragePrefix = 'auth_users_cache::';
  private pendingUsersRequests = new Map<string, Observable<any>>();

  constructor(private http: HttpClient, private router: Router) {
    const stored = localStorage.getItem('user');
    if (stored) {
      this.currentUserSubject.next(JSON.parse(stored));
    }
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get token(): string | null {
    return localStorage.getItem('token');
  }

  get isLoggedIn(): boolean {
    return !!this.token;
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(res => {
        if (res.success) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));
          this.currentUserSubject.next(res.user);
        }
      })
    );
  }

  register(data: { email: string; password: string; nom: string; prenom?: string; role?: string; telephone?: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(res => {
        if (res.success) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));
          this.currentUserSubject.next(res.user);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/']);
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`);
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, data);
  }

  // Admin functions
  private normalizeParams(params?: any): any {
    if (!params) return {};
    if (params instanceof HttpParams) {
      const out: any = {};
      for (const key of params.keys()) out[key] = params.getAll(key);
      return out;
    }
    return params;
  }

  private usersCacheKey(params?: any): string {
    const normalized = this.normalizeParams(params);
    const sorted = Object.keys(normalized || {})
      .sort()
      .reduce((acc: any, key: string) => {
        acc[key] = normalized[key];
        return acc;
      }, {});
    return JSON.stringify(sorted);
  }

  private getCachedUsers(key: string): any | null {
    const now = Date.now();
    const memory = this.usersMemoryCache.get(key);
    if (memory && now - memory.ts < this.usersCacheTtlMs) return memory.data;

    const raw = sessionStorage.getItem(this.usersStoragePrefix + key);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.ts && parsed?.data && now - parsed.ts < this.usersCacheTtlMs) {
        this.usersMemoryCache.set(key, { ts: parsed.ts, data: parsed.data });
        return parsed.data;
      }
    } catch {
      return null;
    }
    return null;
  }

  private setCachedUsers(key: string, data: any): void {
    const payload = { ts: Date.now(), data };
    this.usersMemoryCache.set(key, payload);
    sessionStorage.setItem(this.usersStoragePrefix + key, JSON.stringify(payload));
  }

  private clearUsersCache(): void {
    this.usersMemoryCache.clear();
    const keysToDelete: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(this.usersStoragePrefix)) keysToDelete.push(key);
    }
    keysToDelete.forEach((k) => sessionStorage.removeItem(k));
  }

  getAllUsers(params?: any): Observable<any> {
    const key = this.usersCacheKey(params);
    const cached = this.getCachedUsers(key);
    if (cached) return of(cached);

    const pending = this.pendingUsersRequests.get(key);
    if (pending) return pending;

    const request$ = this.http.get(`${this.apiUrl}/users`, { params }).pipe(
      tap((res) => {
        if ((res as any)?.success) this.setCachedUsers(key, res);
      }),
      finalize(() => this.pendingUsersRequests.delete(key)),
      shareReplay(1)
    );
    this.pendingUsersRequests.set(key, request$);
    return request$;
  }

  toggleUserStatus(userId: string, raison?: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}/toggle-status`, { raison }).pipe(
      tap(() => this.clearUsersCache())
    );
  }

  prefetchAdminUsers(params?: any): void {
    this.getAllUsers(params).subscribe({ error: () => {} });
  }
}

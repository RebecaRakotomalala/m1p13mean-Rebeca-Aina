import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'boutique' | 'client';
  telephone?: string;
  avatar_url?: string;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  error?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  telephone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private currentUser: User | null = null;

  // Inscription avec rôle Admin
  register(data: RegisterData): Observable<AuthResponse> {
    const registerData = {
      ...data,
      role: 'admin' // Force le rôle admin pour cette interface
    };
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, registerData)
      .pipe(
        tap(response => {
          if (response.success && response.user) {
            this.currentUser = response.user;
            localStorage.setItem('currentUser', JSON.stringify(response.user));
          }
        })
      );
  }

  // Connexion
  login(data: LoginData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, data)
      .pipe(
        tap(response => {
          if (response.success && response.user) {
            this.currentUser = response.user;
            localStorage.setItem('currentUser', JSON.stringify(response.user));
          }
        })
      );
  }

  // Déconnexion
  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
  }

  // Obtenir l'utilisateur actuel
  getCurrentUser(): User | null {
    if (!this.currentUser) {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        this.currentUser = JSON.parse(stored);
      }
    }
    return this.currentUser;
  }

  // Vérifier si l'utilisateur est connecté
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
}


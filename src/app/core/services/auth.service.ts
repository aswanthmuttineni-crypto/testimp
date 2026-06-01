import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';

const API_URL = environment.apiUrl;

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'TENANT';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  get token(): string {
    return localStorage.getItem('token') || '';
  }

  get isLoggedIn(): boolean {
    return !!this.token;
  }

  get user(): AuthUser | null {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  }

  get role(): 'ADMIN' | 'TENANT' | null {
    return this.user?.role || null;
  }

  get isAdmin(): boolean {
    return this.role === 'ADMIN';
  }

  get isTenant(): boolean {
    return this.role === 'TENANT';
  }

  login(email: string, password: string) {
    return this.http.post<{ token: string; user: AuthUser }>(`${API_URL}/auth/login`, { email, password }).pipe(
      tap((res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigateByUrl('/login');
  }
}

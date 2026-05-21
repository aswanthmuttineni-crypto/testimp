import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';

const API_URL = environment.apiUrl;

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

  login(email: string, password: string) {
    return this.http.post<{ token: string; user: unknown }>(`${API_URL}/auth/login`, { email, password }).pipe(
      tap((response) => localStorage.setItem('token', response.token))
    );
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigateByUrl('/login');
  }
}

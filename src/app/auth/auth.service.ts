// src/app/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError } from 'rxjs';
import { CartService } from '../features/cart/cart.service';

export interface User {
  email: string | null;
  id: number;
  username: string;
  role: string;
  phoneNumber: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'https://auth-service-rpa2.onrender.com/auth';

  constructor(
    private http: HttpClient,
    private cartService: CartService  // Inject for merge
  ) {}

  signup(data: {
    username: string;
    password: string;
    email: string;
    phoneNumber: string;
    role: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data).pipe(
      catchError(err => {
        console.error('Signup failed:', err);
        throw err;
      })
    );
  }

  login(username: string, password: string): Observable<{ token: string; user: User }> {
    return this.http.post<{ token: string; user: User }>(`${this.baseUrl}/login`, {
      username,
      password
    }).pipe(
      tap(res => {
        if (res?.token && res?.user) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user)); // Optional cache

          // MERGE GUEST CART ON LOGIN
          this.cartService.mergeGuestCartOnLogin();
        }
      }),
      catchError(err => {
        console.error('Login failed:', err);
        throw err;
      })
    );
  }

  getProfile(): Observable<User> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token found');
    }

    return this.http.get<User>(`${this.baseUrl}/profile`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(user => {
        localStorage.setItem('user', JSON.stringify(user)); // Cache
      }),
      catchError(err => {
        console.error('Profile fetch failed:', err);
        this.logout(); // Auto logout on invalid token
        throw err;
      })
    );
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('guestCart'); // Optional: clear guest cart
  }

  // Helper: Get token safely
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Helper: Auth headers
  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
}
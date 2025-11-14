// src/app/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { CartService } from '../features/cart/cart.service';

export interface User {
  email: string | null;
  id: number;
  username: string;
  role: string;
  phoneNumber: string | null;
  userId?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'https://auth-service-rpa2.onrender.com/auth';

  // Reactive user state
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    private cartService: CartService
  ) {
    // Load user from localStorage when app starts
    const savedUser = this.getCurrentUser();
    if (savedUser && this.isLoggedIn()) {
      this.userSubject.next(savedUser);
    }
  }

  /** ─────────────── SIGNUP ─────────────── **/
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
        return throwError(() => err);
      })
    );
  }

  /** ─────────────── LOGIN (username/email) ─────────────── **/
  login(identifier: string, password: string): Observable<any> {
    const payload = { identifier, password };

    return this.http.post<any>(`${this.baseUrl}/login`, payload).pipe(
      tap(res => {
        if (res?.token && res?.user) {
          // Save to localStorage
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));

          // Update reactive state
          this.userSubject.next(res.user);

          // Merge guest cart
          this.cartService.mergeGuestCartOnLogin();
        } else {
          console.warn('⚠️ Unexpected login response format:', res);
        }
      }),
      catchError(err => {
        console.error('Login failed:', err);
        return throwError(() => err);
      })
    );
  }

  /** ─────────────── GET PROFILE ─────────────── **/
  getProfile(): Observable<User> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No token found.'));
    }

    return this.http.get<User>(`${this.baseUrl}/profile`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(user => {
        // Save user & update reactive state
        localStorage.setItem('user', JSON.stringify(user));
        this.userSubject.next(user);
      }),
      catchError(err => {
        console.error('Profile fetch failed:', err);
        this.logout();
        return throwError(() => err);
      })
    );
  }

  /** ─────────────── LOGOUT ─────────────── **/
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('guestCart');
    this.userSubject.next(null);
  }

  /** ─────────────── UTILITIES ─────────────── **/
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
}

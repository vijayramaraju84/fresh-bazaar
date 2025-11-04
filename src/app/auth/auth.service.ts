// src/app/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

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

  constructor(private http: HttpClient) {}

  signup(data: {
    username: string;
    password: string;
    email: string;
    phoneNumber: string;
    role: string;
  }): Observable<any> {
    console.log('Signup payload:', data);
    return this.http.post(`${this.baseUrl}/register`, data);
  }

  login(username: string, password: string): Observable<{ token: string; user: User }> {
    return this.http.post<{ token: string; user: User }>(`${this.baseUrl}/login`, {
      username,
      password
    }).pipe(
      tap(res => {
        if (res?.token) {
          localStorage.setItem('token', res.token);
        }
      })
    );
  }

  getProfile(): Observable<User> {
    const token = localStorage.getItem('token');
    return this.http.get<User>(`${this.baseUrl}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface User {
  id: number;
  username: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'https://auth-service-rpa2.onrender.com/auth';

  constructor(private http: HttpClient) {}

  signup(user: { username: string; password: string; role: string }): Observable<any> {
    console.log('Signup payload:', user);
    return this.http.post(`${this.baseUrl}/register`, user);
  }

  login(username: string, password: string): Observable<{ token: string; user: User }> {
    console.log('Login payload:', { username, password });
    return this.http.post<{ token: string; user: User }>(`${this.baseUrl}/login`, { username, password }).pipe(
      tap((res) => {
        console.log('Login response:', res);
        if (res?.token) {
          localStorage.setItem('token', res.token);
        }
      })
    );
  }

  getProfile(): Observable<User> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.get<User>(`${this.baseUrl}/profile`, { headers });
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
  }
}

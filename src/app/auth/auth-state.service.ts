// src/app/auth/auth-state.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { tap, first } from 'rxjs/operators';
import { AuthService, User } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private user$ = new BehaviorSubject<User | null>(null);
  private isLoggedIn$ = new BehaviorSubject<boolean>(false);
  private authReady$ = new ReplaySubject<void>(1);  // ← NEW

  constructor(private authService: AuthService) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    if (this.authService.isLoggedIn()) {
      this.authService.getProfile().subscribe({
        next: (user) => {
          this.user$.next(user);
          this.isLoggedIn$.next(true);
          this.authReady$.next();  // ← Ready!
        },
        error: () => {
          this.logout();
          this.authReady$.next();  // ← Ready even if failed
        }
      });
    } else {
      this.authReady$.next();  // ← No token → ready
    }
  }

  /** Wait until auth is initialized */
  waitForAuth(): Observable<void> {
    return this.authReady$.pipe(first());
  }

  getUser$(): Observable<User | null> {
    return this.user$.asObservable();
  }

  isLoggedIn(): boolean {
    return this.isLoggedIn$.value;
  }

  login(username: string, password: string): Observable<{ token: string; user: User }> {
    return this.authService.login(username, password).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        this.user$.next(res.user);
        this.isLoggedIn$.next(true);
        this.authReady$.next();
      })
    );
  }

  signup(data: any): Observable<any> {
    return this.authService.signup(data);
  }

  logout(): void {
    this.authService.logout();
    localStorage.removeItem('token');
    this.user$.next(null);
    this.isLoggedIn$.next(false);
    this.authReady$.next();
  }
}
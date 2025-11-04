// src/app/auth/auth-state.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { tap, first } from 'rxjs/operators';
import { AuthService, User } from './auth.service';
import { CartService } from '../features/cart/cart.service'; // ← ADD THIS

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private user$ = new BehaviorSubject<User | null>(null);
  private isLoggedIn$ = new BehaviorSubject<boolean>(false);
  private loading$ = new BehaviorSubject<boolean>(true);
  private authReady$ = new ReplaySubject<void>(1);

  constructor(
    private authService: AuthService,
    private cartService: CartService  // ← INJECT
  ) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    this.loading$.next(true);

    if (this.authService.isLoggedIn()) {
      this.authService.getProfile().subscribe({
        next: (user) => {
          this.user$.next(user);
          this.isLoggedIn$.next(true);
          this.loading$.next(false);
          this.authReady$.next();

          // AUTO-LOAD CART AFTER USER IS SET
          this.cartService.loadCartOnLogin();
        },
        error: () => {
          this.logout();
          this.loading$.next(false);
          this.authReady$.next();
        }
      });
    } else {
      this.loading$.next(false);
      this.authReady$.next();
    }
  }

  getAuthLoading$(): Observable<boolean> {
    return this.loading$.asObservable();
  }

  getUser$(): Observable<User | null> {
    return this.user$.asObservable();
  }

  isLoggedIn(): boolean {
    return this.isLoggedIn$.value;
  }

  waitForAuth(): Observable<void> {
    return this.authReady$.pipe(first());
  }

  login(username: string, password: string): Observable<{ token: string; user: User }> {
    this.loading$.next(true);
    return this.authService.login(username, password).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        this.user$.next(res.user);
        this.isLoggedIn$.next(true);
        this.loading$.next(false);

        // AUTO-LOAD CART ON LOGIN
        this.cartService.loadCartOnLogin();
      })
    );
  }

  signup(data: any): Observable<any> {
    this.loading$.next(true);
    return this.authService.signup(data).pipe(
      tap({
        next: () => this.loading$.next(false),
        error: () => this.loading$.next(false)
      })
    );
  }

  logout(): void {
    this.loading$.next(true);
    this.authService.logout();
    localStorage.removeItem('token');
    this.user$.next(null);
    this.isLoggedIn$.next(false);
    this.cartService.clearCart(); // CLEAR CART
    setTimeout(() => this.loading$.next(false), 300);
  }
}
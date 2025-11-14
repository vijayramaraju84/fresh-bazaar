// src/app/auth/auth-state.service.ts
import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject, Subject, throwError } from 'rxjs';
import { tap, first, catchError } from 'rxjs/operators';
import { AuthService, User } from './auth.service';
import { CartService } from '../features/cart/cart.service';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private userSubject = new BehaviorSubject<User | null>(null);
  private loggedInSubject = new BehaviorSubject<boolean>(false);
  private loadingSubject = new BehaviorSubject<boolean>(true);
  private authReadySubject = new ReplaySubject<void>(1);

  // Public: emit when auth changes (login/logout/profile refresh)
  public authStateChanged$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private ngZone: NgZone
  ) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    this.loadingSubject.next(true);

    if (this.authService.isLoggedIn()) {
      this.authService.getProfile().subscribe({
        next: (user) => {
          this.updateAuthState(user, true);
          this.cartService.loadCartOnLogin();
        },
        error: () => {
          this.logout();
        },
        complete: () => {
          this.loadingSubject.next(false);
          this.authReadySubject.next();
        }
      });
    } else {
      this.loadingSubject.next(false);
      this.authReadySubject.next();
    }
  }

  /** Observables */
  getUser$(): Observable<User | null> {
    return this.userSubject.asObservable();
  }

  getAuthLoading$(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  waitForAuth(): Observable<void> {
    return this.authReadySubject.pipe(first());
  }

  isLoggedIn(): boolean {
    return this.loggedInSubject.value;
  }

  /** Expose current user value safely */
  get currentUser(): User | null {
    return this.userSubject.value;
  }

  /** Login (returns backend observable so caller can handle success/error) */
  login(identifier: string, password: string): Observable<any> {
    this.loadingSubject.next(true);

    return this.authService.login(identifier, password).pipe(
      tap((res) => {
        if (res?.status === 200 && res?.token && res?.user) {
          // persist
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));

          // update reactive state
          this.updateAuthState(res.user, true);

          // load cart
          this.cartService.loadCartOnLogin();
        }
        this.loadingSubject.next(false);
      }),
      catchError((err) => {
        this.loadingSubject.next(false);
        console.error('AuthState login error:', err);
        return throwError(() => err);
      })
    );
  }

  signup(data: any): Observable<any> {
    this.loadingSubject.next(true);
    return this.authService.signup(data).pipe(
      tap({
        next: () => this.loadingSubject.next(false),
        error: () => this.loadingSubject.next(false)
      })
    );
  }

  logout(): void {
    this.loadingSubject.next(true);

    // Clear server / local values
    this.authService.logout();
    this.cartService.clearCart();
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Update reactive state inside Angular zone to ensure UI updates
    this.ngZone.run(() => {
      this.userSubject.next(null);
      this.loggedInSubject.next(false);
      this.authStateChanged$.next();
      this.loadingSubject.next(false);
    });
  }

  refreshUser(): void {
    if (this.authService.isLoggedIn()) {
      this.authService.getProfile().subscribe({
        next: (user) => this.updateAuthState(user, true),
        error: () => this.logout()
      });
    }
  }

  private updateAuthState(user: User | null, isLoggedIn: boolean): void {
    this.ngZone.run(() => {
      this.userSubject.next(user);
      this.loggedInSubject.next(isLoggedIn);
      this.authStateChanged$.next();
    });
  }
}

// src/app/auth/reverse-auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthStateService } from './auth-state.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ReverseAuthGuard implements CanActivate {

  constructor(
    private authState: AuthStateService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    // ✅ Directly observe reactive user stream, not just waitForAuth()
    return this.authState.getUser$().pipe(
      map(user => {
        if (user) {
          // User already logged in → redirect
          this.router.navigate(['/products']);
          return false;
        } else {
          // User logged out → allow access
          return true;
        }
      })
    );
  }
}

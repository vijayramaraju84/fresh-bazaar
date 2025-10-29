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
    return this.authState.waitForAuth().pipe(
      map(() => {
        if (this.authState.isLoggedIn()) {
          this.router.navigate(['/products']);
          return false;
        }
        return true;
      })
    );
  }
}
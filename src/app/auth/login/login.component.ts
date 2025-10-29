// src/app/auth/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthStateService } from '../auth-state.service';
import { HttpErrorResponse } from '@angular/common/http';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  isSignup = false;
  username = '';
  password = '';
  confirmPassword = '';
  error = '';
  loading = false;

  // Skip goes to PUBLIC route (must NOT be protected by AuthGuard)
  private skipUrl = '/products';  // CHANGE IF YOU HAVE /home

  constructor(
    private authState: AuthStateService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Capture return URL (for login redirect)
    const returnUrl = this.route.snapshot.queryParams['returnUrl'];
    const targetUrl = returnUrl || '/products';

    // If already logged in → go to target
    if (this.authState.isLoggedIn()) {
      this.router.navigate([targetUrl]);
      return;
    }
  }

  toggleMode(): void {
    this.isSignup = !this.isSignup;
    this.error = '';
  }

  submit(): void {
    this.error = '';
    this.loading = true;

    if (this.isSignup) {
      if (this.password !== this.confirmPassword) {
        this.error = 'Passwords do not match!';
        this.loading = false;
        return;
      }

      this.authState.signup({
        username: this.username,
        password: this.password,
        role: 'CUSTOMER'
      }).pipe(first()).subscribe({
        next: () => {
          alert('Registration successful! Please login.');
          this.isSignup = false;
          this.password = this.confirmPassword = '';
          this.loading = false;
        },
        error: (err: HttpErrorResponse) => {
          this.error = err.error?.message || 'Registration failed.';
          this.loading = false;
        }
      });
    } else {
      this.authState.login(this.username, this.password)
        .pipe(first())
        .subscribe({
          next: () => {
            const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/products';
            this.router.navigate([returnUrl]);
          },
          error: (err: HttpErrorResponse) => {
            this.error = err.error?.error || 'Invalid credentials.';
            this.loading = false;
          }
        });
    }
  }

  // SKIP → MUST go to PUBLIC route (not protected by AuthGuard)
  skip(): void {
    this.router.navigate([this.skipUrl]);
  }
}
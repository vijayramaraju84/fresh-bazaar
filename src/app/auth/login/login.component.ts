// src/app/auth/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
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
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  isSignup = false;
  username = '';
  email = '';
  phoneNumber = '';
  password = '';
  confirmPassword = '';
  error = '';
  loading = false;

  private skipUrl = '/products';

  constructor(
    private authState: AuthStateService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.authState.logout();
    if (this.authState.isLoggedIn()) {
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/products';
      this.router.navigate([returnUrl]);
    }
  }

  toggleMode(): void {
    this.isSignup = !this.isSignup;
    this.error = '';
    this.resetForm();
  }

  private resetForm(): void {
    this.email = '';
    this.phoneNumber = '';
    this.password = '';
    this.confirmPassword = '';
  }

  submit(): void {
    this.error = '';
    this.loading = true;

    if (this.isSignup) {
      // === SIGNUP ===
      if (this.password !== this.confirmPassword) {
        this.error = '⚠️ Passwords do not match!';
        this.loading = false;
        return;
      }

      const signupData = {
        username: this.username.trim(),
        password: this.password,
        email: this.email.trim(),
        phoneNumber: this.phoneNumber.trim(),
        role: 'CUSTOMER'
      };

      this.authState.signup(signupData).pipe(first()).subscribe({
        next: () => {
          this.toast('🎉 Account created successfully! Please verify and login.');
          this.isSignup = false;
          this.resetForm();
          this.loading = false;
        },
        error: (err: HttpErrorResponse) => {
          console.error('Signup failed:', err);
          this.error =
            err.error?.message ||
            err.error?.error ||
            'Registration failed. Please try again.';
          this.loading = false;
        }
      });
    } else {
      // === LOGIN ===
      this.authState.login(this.username.trim(), this.password).pipe(first()).subscribe({
        next: (res: any) => {
          if (res?.status === 200 && res?.message?.toLowerCase().includes('successful')) {
            const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/products';
            this.router.navigate([returnUrl]);
          } else {
            this.error = res?.message || 'Unexpected login response.';
          }
          this.loading = false;
        },
        error: (err: HttpErrorResponse) => {
          console.error('Login error:', err);
          if (err.status === 401) {
            this.error = '❌ Incorrect username/email or password.';
          } else if (err.status === 404) {
            this.error = err.error?.message || '⚠️ User not found.';
          } else {
            this.error =
              err.error?.message ||
              err.error?.error ||
              '⚠️ Unable to login. Please try again later.';
          }
          this.loading = false;
        }
      });
    }
  }

  skip(): void {
    this.router.navigate([this.skipUrl]);
  }

  private toast(msg: string): void {
    alert(msg); // Replace later with MatSnackBar or custom toast
  }
}

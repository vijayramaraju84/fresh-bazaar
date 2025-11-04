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
        this.error = 'Passwords do not match!';
        this.loading = false;
        return;
      }

      const signupData = {
        username: this.username,
        password: this.password,
        email: this.email,
        phoneNumber: this.phoneNumber,
        role: 'CUSTOMER'
      };

      this.authState.signup(signupData).pipe(first()).subscribe({
        next: () => {
          this.toast('Account created! Please login.');
          this.isSignup = false;
          this.resetForm();
          this.loading = false;
        },
        error: (err: HttpErrorResponse) => {
          this.error = err.error?.message || 'Registration failed. Try again.';
          this.loading = false;
        }
      });
    } else {
      // === LOGIN ===
      this.authState.login(this.username, this.password).pipe(first()).subscribe({
        next: () => {
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/products';
          this.router.navigate([returnUrl]);
        },
        error: (err: HttpErrorResponse) => {
          this.error = err.error?.error || 'Invalid username or password.';
          this.loading = false;
        }
      });
    }
  }

  skip(): void {
    this.router.navigate([this.skipUrl]);
  }

  private toast(msg: string): void {
    alert(msg); // Replace with ToastService later
  }
}
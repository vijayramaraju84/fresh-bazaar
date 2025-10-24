import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  isSignup = false;
  username = '';
  password = '';
  confirmPassword = '';
  error = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  toggleMode() {
    this.isSignup = !this.isSignup;
    this.error = '';
  }

  submit() {
    this.error = '';
    this.loading = true;

    if (this.isSignup) {
      // Validate confirm password
      if (this.password !== this.confirmPassword) {
        this.error = 'Passwords do not match!';
        this.loading = false;
        return;
      }

      // Signup user with default role CUSTOMER
      this.authService.signup({
        username: this.username,
        password: this.password,
        role: 'CUSTOMER'
      }).subscribe({
        next: () => {
          alert('Registration successful! Please login now.');
          this.isSignup = false;
          this.password = '';
          this.confirmPassword = '';
          this.loading = false;
        },
        error: (err: HttpErrorResponse) => {
          console.error('Signup error:', err);
          this.error = err.error?.message || 'Registration failed. Try again.';
          this.loading = false;
        }
      });
    } else {
      // Login existing user
      this.authService.login(this.username, this.password).subscribe({
        next: (res) => {
          console.log('Login success:', res);

          // Fetch profile using token
          this.authService.getProfile().subscribe({
            next: (profile: User) => {
              console.log('User Profile:', profile);
              this.router.navigate(['/home']);
            },
            error: (err) => {
              console.error('Profile fetch failed:', err);
              this.router.navigate(['/home']);
            }
          });

          this.loading = false;
        },
        error: (err: HttpErrorResponse) => {
          console.error('Login error:', err);
          this.error = err.error?.error || 'Invalid username or password.';
          this.loading = false;
        }
      });
    }
  }

  skip() {
    this.router.navigate(['/home']);
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { AuthStateService } from '../../auth/auth-state.service';
import { User } from '../../auth/auth.service';
import { OtpVerificationComponent } from '../../shared/otp-verification/otp-verification.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    OtpVerificationComponent
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit, OnDestroy {
  user: User | null = null;
  formData: any = {};
  editMode = false;
  showOtpModal = false;
  notLoggedIn: any;
  hidePassword = true;
hideConfirmPassword = true;
confirmPassword = '';


  private userSub?: Subscription;
  private readonly BASE_URL = 'https://auth-service-kw9v.onrender.com/auth';

  constructor(
    private authState: AuthStateService,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Subscribe to current user from AuthStateService
    this.userSub = this.authState.getUser$().subscribe(u => {
      this.user = u;
      if (u) {
        this.formData = { ...u, password: '' };
      }
    });
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }

  togglePasswordVisibility(): void {
  this.hidePassword = !this.hidePassword;
}

toggleConfirmPasswordVisibility(): void {
  this.hideConfirmPassword = !this.hideConfirmPassword;
}


  /** Helper: Build Auth Headers */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /** Step 1: Enable Edit Mode */
  enableEdit(): void {
    this.editMode = true;
  }

  /** Step 2: Send Verification Code */
  sendVerificationCode(): void {
    this.http.post(`${this.BASE_URL}/send-verification-code`, {}, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: () => {
        this.showOtpModal = true;
      },
      error: err => {
        console.error('Error sending verification code:', err);
        alert('❌ Failed to send verification code. Try again later.');
      }
    });
  }

  /** Step 3: Handle OTP Verification from Modal */
  onOtpVerified(otp: string): void {
  if (!otp || otp.trim().length === 0) {
    alert('⚠️ Please enter a valid verification code.');
    return;
  }

  const body = { code: otp.trim() };

  this.http.post(`${this.BASE_URL}/verify-code`, body, {
    headers: this.getAuthHeaders()
  }).subscribe({
    next: (res: any) => {
      const msg = res?.message?.toLowerCase() || '';

      if (msg.includes('success')) {
        this.snackBar.open('✅ Verification successful!', 'OK', { duration: 3000 });
        this.showOtpModal = false;

        // Proceed to update user details
        this.updateProfile();
      } else {
        this.snackBar.open('⚠️ Invalid or expired verification code.','', { duration: 3000 });
      }
    },
    error: err => {
      console.error('Verification failed:', err);
      this.snackBar.open('❌ Invalid or expired verification code. Please try again.','', { duration: 3000 });
    }
  });
}


  /** Step 4: Update Profile after Successful Verification */
  private updateProfile(): void {
    const updateBody = {
      username: this.formData.username,
      password: this.formData.password,
      email: this.formData.email,
      phoneNumber: this.formData.phoneNumber
    };

    this.http.put(`${this.BASE_URL}/profile/update`, updateBody, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: () => {
        this.snackBar.open('🎉 Profile updated successfully!','ok', { duration: 3000 });
        this.editMode = false;
        this.formData.password = '';
        // Refresh user profile in auth state
        this.authState['authService'].getProfile().subscribe();
      },
      error: err => {
        console.error('Profile update failed:', err);
        this.snackBar.open('❌ Failed to update profile. Try again later.','', { duration: 3000 });
      }
    });
  }
}

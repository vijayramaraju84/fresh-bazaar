import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-login',
  standalone: true, 
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  isSignup = false;
  email = '';
  password = '';
  name = '';
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  toggleMode() {
    this.isSignup = !this.isSignup;
  }

  submit() {
    if (this.isSignup) {
      const success = this.authService.signup({
        email: this.email,
        password: this.password,
        name: this.name
      });
      if (success) {
        this.router.navigate(['/home']);
      } else {
        this.error = 'User already exists';
      }
    } else {
      const success = this.authService.login(this.email, this.password);
      if (success) {
        this.router.navigate(['/home']);
      } else {
        this.error = 'Invalid credentials';
      }
    }
  }

  skip() {
    this.router.navigate(['/home']);
  }
}

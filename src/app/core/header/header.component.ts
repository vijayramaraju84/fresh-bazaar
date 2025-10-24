import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    FormsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    RouterLink,
    CommonModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  user: any = null;
  searchQuery = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // If token exists, load profile
    if (this.authService.isLoggedIn()) {
      this.authService.getProfile().subscribe({
        next: (data) => (this.user = data),
        error: (err) => {
          console.error('Failed to load user profile:', err);
          this.authService.logout();
        }
      });
    }
  }

  search() {
    console.log('Search:', this.searchQuery);
    this.router.navigate(['/home'], { queryParams: { search: this.searchQuery } });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

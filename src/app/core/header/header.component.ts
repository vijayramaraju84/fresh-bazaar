import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService, User } from '../../auth/auth.service';

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
    MatMenuModule,
    MatDividerModule,
    RouterLink,
    CommonModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  user: User | null = null;
  searchQuery: string = '';
  private userSubscription: Subscription | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.userSubscription = this.authService.getProfile().subscribe({
        next: (user: User) => (this.user = user),
        error: (err: unknown) => {
          console.error('Failed to load user profile:', err);
          this.authService.logout();
          this.user = null;
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  search() {
    if (!this.searchQuery.trim()) {
      console.warn('Search query is empty');
      return;
    }
    console.log('Search:', this.searchQuery);
    this.router.navigate(['/products'], { queryParams: { search: this.searchQuery.trim() } });
  }

  logout() {
    this.authService.logout();
    this.user = null;
    this.router.navigate(['/login']);
  }
}
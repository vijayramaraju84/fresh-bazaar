
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
import { CartService } from '../.././features/cart/cart.service';

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
  cartItemCount: number = 0;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.subscriptions.add(
        this.authService.getProfile().subscribe({
          next: (user: User) => (this.user = user),
          error: (err: unknown) => {
            console.error('Failed to load user profile:', err);
            this.authService.logout();
            this.user = null;
            this.cartService.clearCart();
          }
        })
      );
    }
    this.subscriptions.add(
      this.cartService.getCartCountObservable().subscribe({
        next: (count) => (this.cartItemCount = count),
        error: (err) => console.error('Failed to fetch cart count:', err)
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  goHome(): void {
    this.router.navigate(['/products']);
  }

  search(): void {
    if (!this.searchQuery.trim()) {
      console.warn('Search query is empty');
      return;
    }
    console.log('Search:', this.searchQuery);
    this.router.navigate(['/products'], { queryParams: { search: this.searchQuery.trim() } });
  }

  logout(): void {
    this.authService.logout();
    this.user = null;
    this.cartService.clearCart();
    this.router.navigate(['/login']);
  }
}

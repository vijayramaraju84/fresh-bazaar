// src/app/core/header/header.component.ts
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
import { AuthStateService } from '../../auth/auth-state.service';
import { CartService } from '../../features/cart/cart.service';
import { User } from '../../auth/auth.service';

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
  searchQuery = '';
  cartItemCount = 0;
  private subs = new Subscription();

  constructor(
    private authState: AuthStateService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Reactive user updates
    this.subs.add(
      this.authState.getUser$().subscribe(user => this.user = user)
    );

    // Cart count
    this.subs.add(
      this.cartService.getCartCountObservable().subscribe(count => this.cartItemCount = count)
    );

    // Pulse on add
    this.subs.add(
      this.cartService.itemAdded$.subscribe(() => {
        const cartBtn = document.querySelector('.cart-icon') as HTMLElement;
        if (cartBtn) {
          cartBtn.classList.add('pulse');
          setTimeout(() => cartBtn.classList.remove('pulse'), 600);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  goHome(): void {
    this.router.navigate(['/products']);
  }

  search(): void {
    if (!this.searchQuery.trim()) return;
    this.router.navigate(['/products'], {
      queryParams: { search: this.searchQuery.trim() }
    });
  }

  logout(): void {
    this.authState.logout();
    this.cartService.clearCart();
    this.router.navigate(['/login']);
  }
}
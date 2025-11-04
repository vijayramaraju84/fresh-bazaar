// src/app/features/cart/cart.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService, CartItem } from './cart.service';
import { AuthStateService } from '../../auth/auth-state.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    RouterLink
  ],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  totalPrice = 0;
  loading = false;
  private subs = new Subscription();

  constructor(
    private cartService: CartService,
    private authState: AuthStateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authState.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/cart' } });
      return;
    }
    this.loadCart();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadCart(): void {
    this.loading = true;
    this.subs.add(
      this.cartService.getCartItems().subscribe({
        next: (items) => {
          this.cartItems = items;
          this.calculateTotal();
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      })
    );
  }

  updateQuantity(item: CartItem): void {
    if (item.quantity < 1) item.quantity = 1;
    this.subs.add(
      this.cartService.updateQuantity(item.productId, item.quantity).subscribe({
        next: () => this.loadCart(),
        error: () => this.loadCart()
      })
    );
  }

  removeItem(productId: number): void {
    this.subs.add(
      this.cartService.removeFromCart(productId).subscribe({
        next: () => this.loadCart(),
        error: () => this.loadCart()
      })
    );
  }

  calculateTotal(): void {
    this.totalPrice = this.cartItems.reduce((sum, item) => sum + item.productPrice * item.quantity, 0);
  }

  proceedToCheckout(): void {
    if (this.cartItems.length > 0) {
      this.router.navigate(['/checkout']);
    }
  }
}
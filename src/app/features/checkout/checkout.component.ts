// src/app/features/checkout/checkout.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService, CartItem } from '../cart/cart.service';
import { AuthService, User } from '../../auth/auth.service';

interface ShippingAddress {
  name: string;
  phoneNumber: string;
  email: string;
  address: string;
  isImportant: boolean;
}

interface Order {
  orderId: number;
  items: CartItem[];
  totalPrice: number;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  createdAt: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  totalPrice = 0;
  shippingAddress: ShippingAddress = {
    name: '',
    phoneNumber: '',
    email: '',
    address: '',
    isImportant: false
  };
  paymentMethod = 'COD';
  error = '';
  loading = false;
  private subs = new Subscription();

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }
    this.loadCart();
    this.loadUserProfile();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private loadCart(): void {
    this.loading = true;
    this.subs.add(
      this.cartService.getCartItems().subscribe({
        next: (items: CartItem[]) => {
          this.cartItems = items;
          this.calculateTotal();
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to load cart.';
          this.loading = false;
        }
      })
    );
  }

  private loadUserProfile(): void {
    this.subs.add(
      this.authService.getProfile().subscribe({
        next: (user: User) => {
          this.shippingAddress.name = user.username || '';
          this.shippingAddress.email = user.email || '';
        },
        error: (err) => {
          console.error('Profile load failed:', err);
        }
      })
    );
  }

  calculateTotal(): void {
    this.totalPrice = this.cartItems.reduce((sum: number, item: CartItem) => sum + item.productPrice * item.quantity, 0);
  }

  confirmOrder(): void {
    this.error = '';
    this.loading = true;

    const { name, phoneNumber, email, address } = this.shippingAddress;
    if (!name.trim() || !phoneNumber.trim() || !email.trim() || !address.trim()) {
      this.error = 'All fields are required.';
      this.loading = false;
      return;
    }
    if (!/^\d{10}$/.test(phoneNumber)) {
      this.error = 'Phone must be 10 digits.';
      this.loading = false;
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.error = 'Invalid email.';
      this.loading = false;
      return;
    }

    // Simulate order creation (no backend)
    const order: Order = {
      orderId: Date.now(),
      items: [...this.cartItems],
      totalPrice: this.totalPrice,
      shippingAddress: { ...this.shippingAddress },
      paymentMethod: this.paymentMethod,
      createdAt: new Date().toISOString()
    };

    // Save to localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    this.cartService.clearCart();
    this.loading = false;
    this.router.navigate(['/order-confirmation'], { state: { order } });
  }
}
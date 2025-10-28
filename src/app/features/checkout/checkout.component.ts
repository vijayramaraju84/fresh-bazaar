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
import { CartService, CartItem, ShippingAddress } from '../cart/cart.service';
import { AuthService, User } from '../../auth/auth.service';

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
  totalPrice: number = 0;
  shippingAddress: ShippingAddress = {
    name: '',
    phoneNumber: '',
    email: '',
    address: '',
    isImportant: false
  };
  paymentMethod: string = 'credit_card';
  error: string = '';
  loading: boolean = false;
  private subscriptions: Subscription = new Subscription();

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
    this.subscriptions.unsubscribe();
  }

  private loadCart(): void {
    this.cartItems = this.cartService.getCartItems();
    this.calculateTotal();
  }

  private loadUserProfile(): void {
    this.subscriptions.add(
      this.authService.getProfile().subscribe({
        next: (user: User) => {
          this.shippingAddress.name = user.username;
        },
        error: (err) => {
          console.error('Failed to load user profile:', err);
          this.error = 'Failed to load user profile. Please try again.';
        }
      })
    );
  }

  calculateTotal(): void {
    this.totalPrice = this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  confirmOrder(): void {
    this.error = '';
    this.loading = true;
    const { name, phoneNumber, email, address } = this.shippingAddress;
    if (!name.trim() || !phoneNumber.trim() || !email.trim() || !address.trim()) {
      this.error = 'Please fill in all required fields.';
      this.loading = false;
      return;
    }
    if (!/^\d{10}$/.test(phoneNumber)) {
      this.error = 'Phone number must be 10 digits.';
      this.loading = false;
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.(com|co\.in|org|net|edu|gov)$/.test(email)) {
      this.error = 'Please enter a valid email address (e.g., user@example.com).';
      this.loading = false;
      return;
    }
    this.subscriptions.add(
      this.cartService.createOrder(this.shippingAddress, this.paymentMethod).subscribe({
        next: (order) => {
          this.loading = false;
          this.router.navigate(['/order-confirmation'], { state: { order } });
        },
        error: (err) => {
          console.error('Failed to create order:', err);
          this.error = 'Failed to create order. Please try again.';
          this.loading = false;
        }
      })
    );
  }
}
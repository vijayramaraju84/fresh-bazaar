// src/app/features/checkout/checkout.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { CartService, CartItem } from '../cart/cart.service';
import { AuthService } from '../../auth/auth.service';

interface ShippingAddress {
  name: string;
  phoneNumber: string;
  email: string;
  addressLine: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
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
    addressLine: '',
    city: '',
    state: '',
    pinCode: '',
    country: 'India'
  };
  paymentMethod = 'UPI'; // ← Match backend: "UPI"
  error = '';
  loading = false;
  private subs = new Subscription();

  private apiUrl = 'https://cart-service-tabj.onrender.com/cart';

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private http: HttpClient,
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
        next: (items) => {
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
        next: (user) => {
          this.shippingAddress.name = user.username || '';
          this.shippingAddress.email = user.email || '';
        }
      })
    );
  }

  calculateTotal(): void {
    this.totalPrice = this.cartItems.reduce((sum, item) => sum + item.productPrice * item.quantity, 0);
  }

  isFormValid(): boolean {
    const { name, phoneNumber, email, addressLine, city, state, pinCode } = this.shippingAddress;
    return !!(
      name.trim() &&
      /^\d{10}$/.test(phoneNumber) &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
      addressLine.trim() &&
      city.trim() &&
      state.trim() &&
      /^\d{6}$/.test(pinCode)
    );
  }

  // src/app/features/checkout/checkout.component.ts (only confirmOrder method updated)

confirmOrder(): void {
  this.error = '';
  this.loading = true;

  if (!this.isFormValid()) {
    this.error = 'Please fill all fields correctly.';
    this.loading = false;
    return;
  }

  const payload = {
    name: this.shippingAddress.name,
    phoneNumber: this.shippingAddress.phoneNumber,
    email: this.shippingAddress.email,
    addressLine: this.shippingAddress.addressLine,
    city: this.shippingAddress.city,
    state: this.shippingAddress.state,
    pinCode: this.shippingAddress.pinCode,
    country: this.shippingAddress.country,
    paymentMethod: this.paymentMethod.toUpperCase()
  };

  const headers = this.getAuthHeaders();

  this.http.post<any>(`${this.apiUrl}/orders/place`, payload, { headers })
    .subscribe({
      next: (res) => {
        // PASS FULL RESPONSE TO CONFIRMATION
        this.router.navigate(['/order-confirmation'], {
          state: { orderData: res } // ← Use state, not queryParams
        });
      },
      error: (err) => {
        this.error = err.error?.message || 'Order failed. Try again.';
        this.loading = false;
      }
    });
}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
}
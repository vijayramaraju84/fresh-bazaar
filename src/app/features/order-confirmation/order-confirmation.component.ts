// src/app/features/order-confirmation/order-confirmation.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { CartService } from '../cart/cart.service';

interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

interface OrderResponse {
  message: string;
  status: string;
  order: {
    orderId: string;
    createdAt: string;
    totalAmount: number;
    itemCount: number;
    status: string;
    items: OrderItem[];
    name: string;
    phoneNumber: string;
    emailId: string | null;
    addressLine: string;
    city: string;
    state: string;
    pinCode: string;
    country: string;
    paymentMethod: string;
  };
}

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    DatePipe
  ],
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.css']
})
export class OrderConfirmationComponent implements OnInit {
  order: OrderResponse['order'] | null = null;

  constructor(
    private router: Router,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    const state = history.state;
    if (state?.orderData?.order) {
      this.order = state.orderData.order;
      // Optional: Trigger cart refresh if needed
      // this.cartService.loadCartCount();
    } else {
      this.router.navigate(['/cart']);
    }
  }

  goHome(): void {
    this.router.navigate(['/products']);
  }

  formatPrice(value: number): string {
    return value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
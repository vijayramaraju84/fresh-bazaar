// src/app/features/order-confirmation/order-confirmation.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartItem } from '../cart/cart.service';

interface Order {
  orderId: number;
  items: CartItem[];
  totalPrice: number;
  shippingAddress: any;
  paymentMethod: string;
  createdAt: string;
}

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="confirmation">
      <h1>Order Confirmed!</h1>
      <p>Order ID: #{{ order?.orderId }}</p>
      <p>Total: ₹{{ getTotal() | number:'1.2-2' }}</p>
      <button mat-raised-button color="primary" (click)="goHome()">Continue Shopping</button>
    </div>
  `
})
export class OrderConfirmationComponent implements OnInit {
  order: Order | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.order = history.state.order || null;
  }

  getTotal(): number {
    return this.order?.items.reduce((sum: number, item: CartItem) => sum + item.productPrice * item.quantity, 0) || 0;
  }

  goHome(): void {
    this.router.navigate(['/products']);
  }
}
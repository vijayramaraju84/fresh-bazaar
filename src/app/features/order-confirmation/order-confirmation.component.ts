
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink, Router } from '@angular/router';
import { Order, CartItem } from '../cart/cart.service';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, MatButtonModule, RouterLink],
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.css']
})
export class OrderConfirmationComponent {
  order: Order | null = null;

  constructor(private router: Router) {
    this.order = history.state.order as Order;
  }

  getTotalPrice(): number {
    return this.order?.items.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
  }

  formatPaymentMethod(method: string): string {
    const methodMap: { [key: string]: string } = {
      'credit_card': 'Credit Card',
      'debit_card': 'Debit Card',
      'upi': 'UPI',
      'cash_on_delivery': 'Cash on Delivery'
    };
    return methodMap[method] || method.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
}

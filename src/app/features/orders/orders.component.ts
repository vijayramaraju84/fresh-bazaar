// src/app/features/orders/orders.component.ts
import { Component, OnInit, OnDestroy, TrackByFunction } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth/auth.service';

interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

interface Order {
  orderId: string;
  createdAt: string;
  totalAmount: number;
  itemCount: number;
  status: string;
  items: OrderItem[];
  name: string;
  phoneNumber: string;
  email: string | null;
  addressLine: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  paymentMethod: string;
}

interface RawOrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  totalPrice: number;
  userId: string;
  name: string;
  phoneNumber: string;
  email: string | null;
  addressLine: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  paymentMethod: string;
  orderId: string;
  createdAt: string;
  totalAmount: number;
  status: string;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  loading = true;
  error = '';
  searchQuery = '';
  filteredOrders: Order[] = [];
  private subs = new Subscription();

  private apiUrl = 'https://cart-service-ftx1.onrender.com';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/orders' } });
      return;
    }
    this.loadOrders();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadOrders(): void {
    this.loading = true;
    this.error = '';
    const headers = this.getAuthHeaders();

    this.subs.add(
      this.http.get<RawOrderItem[]>(`${this.apiUrl}/orders/user`, { headers })
        .subscribe({
          next: (rawItems) => {
            this.orders = this.groupByOrderId(rawItems);
            this.filteredOrders = [...this.orders];
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Failed to load orders. Please try again.';
            this.loading = false;
            console.error('Load orders failed:', err);
          }
        })
    );
  }

  // GROUP FLAT ITEMS INTO ORDERS
  private groupByOrderId(items: RawOrderItem[]): Order[] {
    const orderMap = new Map<string, Order>();

    items.forEach(item => {
      const key = item.orderId;
      if (!orderMap.has(key)) {
        orderMap.set(key, {
          orderId: key,
          createdAt: item.createdAt,
          totalAmount: 0,
          itemCount: 0,
          status: item.status,
          items: [],
          name: item.name,
          phoneNumber: item.phoneNumber,
          email: item.email,
          addressLine: item.addressLine,
          city: item.city,
          state: item.state,
          pinCode: item.pinCode,
          country: item.country,
          paymentMethod: item.paymentMethod
        });
      }

      const order = orderMap.get(key)!;
      order.items.push({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.totalPrice
      });

      order.totalAmount += item.totalPrice;
      order.itemCount += 1;
    });

    return Array.from(orderMap.values()).reverse(); // Newest first
  }

  onSearch(): void {
    if (!this.searchQuery.trim()) {
      this.filteredOrders = [...this.orders];
      return;
    }

    const q = this.searchQuery.toLowerCase();
    this.filteredOrders = this.orders.filter(order =>
      order.orderId.toLowerCase().includes(q) ||
      order.items.some(item => item.productName.toLowerCase().includes(q)) ||
      order.name.toLowerCase().includes(q)
    );
  }

  getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'created': return 'var(--accent-color, #ff4081)';
      case 'processing': return 'var(--warning-color, #ffc107)';
      case 'shipped': return 'var(--success-color, #4caf50)';
      case 'delivered': return 'var(--success-color, #4caf50)';
      default: return '#666';
    }
  }

  getStatusText(status: string): string {
    switch (status?.toLowerCase()) {
      case 'created': return 'Order Confirmed';
      case 'processing': return 'Processing';
      case 'shipped': return 'Shipped';
      case 'delivered': return 'Delivered';
      default: return status || 'Unknown';
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatPrice(value: number): string {
    return value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  viewOrderDetails(order: Order): void {
    this.router.navigate(['/order-confirmation'], {
      state: { orderData: { order } }
    });
  }

  trackByOrderId: TrackByFunction<Order> = (index: number, order: Order): string => {
    return order.orderId;
  };

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
}
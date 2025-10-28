import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AuthService, User } from '../../auth/auth.service';

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

export interface ShippingAddress {
  name: string;
  phoneNumber: string;
  email: string;
  address: string;
  isImportant: boolean;
}

export interface Order {
  orderId: number;
  userId: number;
  items: CartItem[];
  totalPrice: number;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartKey = 'cartItems';
  private ordersKey = 'orders';
  private cartCountSubject = new BehaviorSubject<number>(this.getCartCount());
  private itemAddedSource = new BehaviorSubject<CartItem | null>(null);
  itemAdded$ = this.itemAddedSource.asObservable();

  constructor(private authService: AuthService) {}

  addToCart(item: CartItem): void {
  const cartItems = this.getCartItems();
  const existingItem = cartItems.find(i => i.productId === item.productId);
  if (existingItem) {
    existingItem.quantity += item.quantity;
  } else {
    cartItems.push(item);
  }
  localStorage.setItem(this.cartKey, JSON.stringify(cartItems));
  this.cartCountSubject.next(this.getCartCount());

  // Emit item added event
  this.itemAddedSource.next(item);
}

  getCartItems(): CartItem[] {
    const items = localStorage.getItem(this.cartKey);
    return items ? JSON.parse(items) : [];
  }

  updateQuantity(productId: number, quantity: number): void {
    const cartItems = this.getCartItems();
    const item = cartItems.find(i => i.productId === productId);
    if (item && quantity >= 1) {
      item.quantity = quantity;
      localStorage.setItem(this.cartKey, JSON.stringify(cartItems));
      this.cartCountSubject.next(this.getCartCount());
    }
  }

  removeFromCart(productId: number): void {
    const cartItems = this.getCartItems().filter(i => i.productId !== productId);
    localStorage.setItem(this.cartKey, JSON.stringify(cartItems));
    this.cartCountSubject.next(this.getCartCount());
  }

  getCartCount(): number {
    return this.getCartItems().reduce((sum, item) => sum + item.quantity, 0);
  }

  getCartCountObservable(): Observable<number> {
    return this.cartCountSubject.asObservable();
  }

  clearCart(): void {
    localStorage.setItem(this.cartKey, JSON.stringify([]));
    this.cartCountSubject.next(0);
  }

  createOrder(shippingAddress: ShippingAddress, paymentMethod: string): Observable<Order> {
    return this.authService.getProfile().pipe(
      map((user: User) => {
        const cartItems = this.getCartItems();
        if (!cartItems.length) throw new Error('Cart is empty');
        const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const order: Order = {
          orderId: Date.now(),
          userId: user.id,
          items: cartItems,
          totalPrice,
          shippingAddress,
          paymentMethod,
          createdAt: new Date().toISOString()
        };
        const orders = this.getOrders();
        orders.push(order);
        localStorage.setItem(this.ordersKey, JSON.stringify(orders));
        this.clearCart();
        return order;
      })
    );
  }

  private getOrders(): Order[] {
    const orders = localStorage.getItem(this.ordersKey);
    return orders ? JSON.parse(orders) : [];
  }
}

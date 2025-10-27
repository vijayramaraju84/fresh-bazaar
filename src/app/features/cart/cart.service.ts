import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartCountSubject = new BehaviorSubject<number>(0);

  constructor() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.cartItems = JSON.parse(savedCart);
      this.updateCartCount();
    }
  }

  addToCart(item: CartItem): void {
    const existingItem = this.cartItems.find(i => i.productId === item.productId);
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      this.cartItems.push({ ...item });
    }
    this.saveCart();
    this.updateCartCount();
  }

  getCartItems(): CartItem[] {
    return [...this.cartItems];
  }

  updateQuantity(productId: number, quantity: number): void {
    const item = this.cartItems.find(i => i.productId === productId);
    if (item && quantity > 0) {
      item.quantity = quantity;
      this.saveCart();
      this.updateCartCount();
    }
  }

  removeFromCart(productId: number): void {
    this.cartItems = this.cartItems.filter(i => i.productId !== productId);
    this.saveCart();
    this.updateCartCount();
  }

  getCartCount(): Observable<number> {
    return this.cartCountSubject.asObservable();
  }

  private saveCart(): void {
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
  }

  private updateCartCount(): void {
    const count = this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
    this.cartCountSubject.next(count);
  }

  clearCart(): void {
    this.cartItems = [];
    this.saveCart();
    this.updateCartCount();
  }
}
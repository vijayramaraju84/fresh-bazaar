import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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
  private cart = new BehaviorSubject<CartItem[]>([]);
  cart$ = this.cart.asObservable();

  addToCart(item: CartItem) {
    const currentCart = this.cart.value;
    const existingItem = currentCart.find(i => i.productId === item.productId);
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      currentCart.push(item);
    }
    this.cart.next(currentCart);
    localStorage.setItem('cart', JSON.stringify(currentCart));
  }
}
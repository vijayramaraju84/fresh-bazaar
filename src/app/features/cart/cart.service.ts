// src/app/features/cart/cart.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

export interface CartItem {
  productId: number;
  productName: string;
  productPrice: number;
  quantity: number;
}

export interface AddToCartRequest {
  productId: number;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private apiUrl = 'https://cart-service-tabj.onrender.com/cart';

  private cartCountSubject = new BehaviorSubject<number>(0);
  private itemAddedSource = new BehaviorSubject<CartItem | null>(null);
  itemAdded$ = this.itemAddedSource.asObservable();

  constructor(private http: HttpClient) {
    this.loadCartOnLogin();
  }

  loadCartOnLogin(): void {
    if (localStorage.getItem('token')) {
      this.loadCartCount();
    }
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // FIXED: Return CartItem, not string
  addToCart(item: CartItem): Observable<CartItem> {
    const req: AddToCartRequest = {
      productId: item.productId,
      quantity: item.quantity
    };

    return this.http.post<string>(
      `${this.apiUrl}/add`,
      req,
      {
        headers: this.getHeaders(),
        responseType: 'text' as 'json'
      }
    ).pipe(
      map(() => item),  // ← RETURN THE ITEM
      tap(() => {
        this.itemAddedSource.next(item);
        this.loadCartCount();
      }),
      catchError(err => {
        console.error('Add failed:', err);
        throw err;
      })
    );
  }

  getCartItems(): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(
        tap(items => {
          const count = items.reduce((sum, i) => sum + i.quantity, 0);
          this.cartCountSubject.next(count);
        }),
        catchError(err => {
          console.error('Get cart failed:', err);
          this.cartCountSubject.next(0);
          throw err;
        })
      );
  }

  updateQuantity(productId: number, quantity: number): Observable<CartItem> {
    const req = { productId, quantity };

    return this.http.put<string>(
      `${this.apiUrl}/update`,
      req,
      {
        headers: this.getHeaders(),
        responseType: 'text' as 'json'
      }
    ).pipe(
      map(() => ({ productId, quantity } as CartItem)), // return partial
      tap(() => this.loadCartCount()),
      catchError(err => {
        console.error('Update failed:', err);
        throw err;
      })
    );
  }

  removeFromCart(productId: number): Observable<number> {
    return this.http.delete<string>(
      `${this.apiUrl}/remove/${productId}`,
      {
        headers: this.getHeaders(),
        responseType: 'text' as 'json'
      }
    ).pipe(
      map(() => productId),
      tap(() => this.loadCartCount()),
      catchError(err => {
        console.error('Remove failed:', err);
        throw err;
      })
    );
  }

  getCartCountObservable(): Observable<number> {
    return this.cartCountSubject.asObservable();
  }

  clearCart(): void {
    this.cartCountSubject.next(0);
  }

  private loadCartCount(): void {
    this.getCartItems().subscribe();
  }
}
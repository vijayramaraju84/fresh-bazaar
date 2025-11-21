// src/app/features/cart/cart.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
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
  private apiUrl = 'https://cart-service-ftx1.onrender.com';

  private cartCountSubject = new BehaviorSubject<number>(0);
  private itemAddedSource = new BehaviorSubject<CartItem | null>(null);
  public cartItemsSubject = new BehaviorSubject<CartItem[]>([]);

  itemAdded$ = this.itemAddedSource.asObservable();
  cartItems$ = this.cartItemsSubject.asObservable();

  // GUEST CART: Local Storage
  private guestCartKey = 'guestCart';
  private guestCart: CartItem[] = [];

  constructor(private http: HttpClient) {
    this.loadGuestCart();
    this.loadCartOnLogin();
  }

// ADD THESE METHODS

// ADD THESE METHODS

// ADD THESE METHODS (already in your code, but ensure they are EXACTLY like this)

loadGuestCart(): void {
  const saved = localStorage.getItem(this.guestCartKey);
  if (saved) {
    try {
      this.guestCart = JSON.parse(saved);
      this.updateCountFromGuest();
      this.cartItemsSubject.next([...this.guestCart]);
    } catch (e) {
      this.guestCart = [];
      this.cartItemsSubject.next([]);
    }
  } else {
    this.cartItemsSubject.next([]);
  }
}

openCart(): void {
  this.syncPendingUpdates();
  this.itemAddedSource.next(null); 
}

getCartItems(): Observable<CartItem[]> {
  if (!localStorage.getItem('token')) {
    return of([...this.guestCart]);
  }
  return this.cartItems$;
}

  // SAVE GUEST CART TO localStorage
  private saveGuestCart(): void {
    localStorage.setItem(this.guestCartKey, JSON.stringify(this.guestCart));
  }

  // UPDATE COUNT FROM GUEST
  private updateCountFromGuest(): void {
    const count = this.guestCart.reduce((sum, i) => sum + i.quantity, 0);
    this.cartCountSubject.next(count);
  }

  // INITIAL LOAD ON LOGIN
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

 addToCart(item: CartItem): Observable<CartItem> {
  if (!localStorage.getItem('token')) {
    const existing = this.guestCart.find(i => i.productId === item.productId);
    if (existing) {
      existing.quantity = item.quantity;
      if (existing.quantity <= 0) {
        this.guestCart = this.guestCart.filter(i => i.productId !== item.productId);
      }
    } else if (item.quantity > 0) {
      this.guestCart.push({ ...item });
    }
    this.saveGuestCart();
    this.updateCountFromGuest();
    this.cartItemsSubject.next([...this.guestCart]);
    return of(item);
  }

  // === LOGGED IN ===
  if (item.quantity <= 0) {
    // REMOVE FROM BACKEND
    return this.removeFromCart(item.productId).pipe(
      map(() => ({ ...item, quantity: 0 } as CartItem)),
      tap(() => {
        this.itemAddedSource.next(null);
        this.loadCartCount();
        this.fetchCartItemsFromBackend();
      })
    );
  }

  // ADD / UPDATE
  const req: AddToCartRequest = { productId: item.productId, quantity: item.quantity };

  return this.http.post<string>(
    `${this.apiUrl}/add`,
    req,
    { headers: this.getHeaders(), responseType: 'text' as 'json' }
  ).pipe(
    map(() => item),
    tap(() => {
      this.itemAddedSource.next(item);
      this.loadCartCount();
      this.fetchCartItemsFromBackend();
    }),
    catchError(err => { throw err; })
  );
}

  // MERGE GUEST → BACKEND ON LOGIN
  mergeGuestCartOnLogin(): void {
    if (!localStorage.getItem('token') || this.guestCart.length === 0) return;

    const itemsToSync = this.guestCart.map(i => ({
      productId: i.productId,
      quantity: i.quantity
    }));

    this.http.post<string>(
      `${this.apiUrl}/add`,
      itemsToSync,
      {
        headers: this.getHeaders(),
        responseType: 'text' as 'json'
      }
    ).subscribe({
      next: () => {
        localStorage.removeItem(this.guestCartKey);
        this.guestCart = [];
        this.loadCartCount();
        this.fetchCartItemsFromBackend();
      },
      error: (err) => console.error('Merge failed:', err)
    });
  }

  // FETCH CART ITEMS FROM BACKEND
  private fetchCartItemsFromBackend(): void {
    this.http.get<CartItem[]>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(
        tap(items => {
          const count = items.reduce((sum, i) => sum + i.quantity, 0);
          this.cartCountSubject.next(count);
          this.cartItemsSubject.next(items);
        }),
        catchError(err => {
          console.error('Get cart failed:', err);
          this.cartCountSubject.next(0);
          this.cartItemsSubject.next([]);
          return of([]);
        })
      )
      .subscribe();
  }

  updateQuantity(productId: number, quantity: number): Observable<CartItem> {
    if (!localStorage.getItem('token')) {
      const item = this.guestCart.find(i => i.productId === productId);
      if (item) {
        item.quantity = quantity;
        if (quantity <= 0) {
          this.guestCart = this.guestCart.filter(i => i.productId !== productId);
        }
        this.saveGuestCart();
        this.updateCountFromGuest();
        this.cartItemsSubject.next([...this.guestCart]);
      }
      return of({ productId, productName: '', productPrice: 0, quantity } as CartItem);
    }

    const req = { productId, quantity };
    return this.http.put<string>(
      `${this.apiUrl}/update`,
      req,
      {
        headers: this.getHeaders(),
        responseType: 'text' as 'json'
      }
    ).pipe(
      map(() => ({ productId, quantity } as CartItem)),
      tap(() => {
        this.loadCartCount();
        this.fetchCartItemsFromBackend();
      }),
      catchError(err => {
        console.error('Update failed:', err);
        throw err;
      })
    );
  }

  // In CartService
private pendingDeltas = new Map<number, number>(); // productId → delta

markPendingUpdate(productId: number, newQuantity: number): void {
  const current = this.getCurrentQuantity(productId);
  const delta = newQuantity - current;

  if (delta === 0) {
    this.pendingDeltas.delete(productId);
  } else {
    this.pendingDeltas.set(productId, delta);
  }

  // Update local cart for UI
  this.updateLocalCart(productId, newQuantity);
}

private getCurrentQuantity(productId: number): number {
  const item = this.guestCart.find(i => i.productId === productId) ||
               this.cartItemsSubject.value.find(i => i.productId === productId);
  return item?.quantity || 0;
}

private updateLocalCart(productId: number, quantity: number): void {
  if (!localStorage.getItem('token')) {
    const index = this.guestCart.findIndex(i => i.productId === productId);
    if (index > -1) {
      if (quantity <= 0) this.guestCart.splice(index, 1);
      else this.guestCart[index].quantity = quantity;
    } else if (quantity > 0) {
      this.guestCart.push({
        productId,
        productName: '',
        productPrice: 0,
        quantity
      });
    }
    this.saveGuestCart();
    this.cartItemsSubject.next([...this.guestCart]);
  }
}

syncPendingUpdates(): void {
  if (this.pendingDeltas.size === 0) return;

  if (!localStorage.getItem('token')) {
    // Guest: already updated locally
    this.pendingDeltas.clear();
    return;
  }

  // LOGGED IN: send delta updates
  const updates = Array.from(this.pendingDeltas.entries()).map(([id, delta]) => {
    const current = this.getCurrentQuantity(id);
    const newQty = current + delta;
    const item: CartItem = { productId: id, productName: '', productPrice: 0, quantity: newQty };
    return this.addToCart(item).toPromise();
  });

  Promise.all(updates).then(() => {
    this.pendingDeltas.clear();
    this.fetchCartItemsFromBackend();
  });
}

  removeFromCart(productId: number): Observable<number> {
  if (!localStorage.getItem('token')) {
    this.guestCart = this.guestCart.filter(i => i.productId !== productId);
    this.saveGuestCart();
    this.updateCountFromGuest();
    this.cartItemsSubject.next([...this.guestCart]);
    return of(productId);
  }

  return this.http.delete<string>(
    `${this.apiUrl}/remove/${productId}`,
    {
      headers: this.getHeaders(),
      responseType: 'text' as 'json'
    }
  ).pipe(
    map(() => productId),
    tap(() => {
      this.loadCartCount();
      this.fetchCartItemsFromBackend();
    }),
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
    this.guestCart = [];
    localStorage.removeItem(this.guestCartKey);
    this.cartItemsSubject.next([]);

    if (localStorage.getItem('token')) {
      this.http.delete<string>(
        `${this.apiUrl}/clear`,
        { headers: this.getHeaders(), responseType: 'text' as 'json' }
      ).subscribe();
    }
  }

  public loadCartCount(): void {
    if (localStorage.getItem('token')) {
      this.fetchCartItemsFromBackend();
    } else {
      this.updateCountFromGuest();
    }
  }
}
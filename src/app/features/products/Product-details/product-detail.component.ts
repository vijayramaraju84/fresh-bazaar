// src/app/features/products/Product-details/product-detail.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AddToCartButtonComponent } from '../add-to-cart-button/add-to-cart-button.component';
import { Product } from '../product.model';
import { CartService } from '../../cart/cart.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    AddToCartButtonComponent
  ],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  @Input() product!: Product;
  @Output() close = new EventEmitter<void>();
  @Output() added = new EventEmitter<Product>();

  private subs = new Subscription();

  constructor(
    private cartService: CartService,
    private cdr: ChangeDetectorRef  // ADD THIS
  ) {}

  ngOnInit(): void {
    // LIVE SYNC FOR MODAL
    this.subs.add(
      this.cartService.cartItems$.subscribe(cartItems => {
        const item = cartItems.find(i => i.productId === this.product.id);
        this.product.cartQuantity = item?.quantity || 0;
        this.cdr.detectChanges();  // FORCE UPDATE
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  getStars(rating: number): string[] {
    const stars = [];
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    for (let i = 0; i < full; i++) stars.push('star');
    if (half) stars.push('star_half');
    for (let i = 0; i < empty; i++) stars.push('star_border');
    return stars;
  }

  onQuantityChange(product: Product, newQty: number): void {
    product.cartQuantity = newQty;
  }

  getDiscountPercent(product: Product): number {
    if (!product.mrp || product.mrp <= product.price) return 0;
    return Math.round(((product.mrp - product.price) / product.mrp) * 100);
  }

  toggleWishlist(): void {
    this.product.wishlisted = !this.product.wishlisted;
  }

  onAdded(): void {
    this.added.emit(this.product);
  }
}
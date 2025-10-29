
import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, ContentChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CartService, CartItem } from '../../cart/cart.service';
import { ToastService } from '../../toast/toast.service';
import { flyToCart } from '../../../shared/animations/cart-fly.animation';
import { Product } from '../product.model';

@Component({
  selector: 'app-add-to-cart-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <!-- Project the product image here -->
    <ng-content select=".product-image"></ng-content>

    <button
      mat-raised-button
      color="primary"
      (click)="addToCart()"
      [disabled]="adding"
      class="add-to-cart-btn"
      #buttonRef
    >
      <span *ngIf="!adding" class="btn-text">
        <mat-icon>add_shopping_cart</mat-icon>
        {{ buttonText }}
      </span>
      <span *ngIf="adding" class="adding">
        <mat-icon class="spin">autorenew</mat-icon>
        Adding...
      </span>
    </button>
  `,
  styles: [`
    .add-to-cart-btn {
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
      margin-top: 12px;
    }
    .btn-text, .adding {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .spin {
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class AddToCartButtonComponent implements AfterViewInit {
  @Input() product!: Product;
  @Input() quantity = 1;
  @Input() buttonText = 'Add to Cart';
  @Input() disabled = false;
  @Output() added = new EventEmitter<void>();

  @ViewChild('buttonRef') buttonRef!: ElementRef<HTMLElement>;
  @ContentChild('productImage', { static: false }) productImageRef!: ElementRef<HTMLImageElement>;

  add(): void {
    if (!this.disabled) {
      this.added.emit();
    }
  }

  adding = false;

  constructor(
    private cartService: CartService,
    private toastService: ToastService
  ) {}

  ngAfterViewInit(): void {
    this.cartService.itemAdded$?.subscribe(item => {
      if (item?.productId === this.product?.id) {
        const cartIcon = document.querySelector('.cart-icon') as HTMLElement;
        if (cartIcon) {
          cartIcon.classList.add('pulse');
          setTimeout(() => cartIcon.classList.remove('pulse'), 600);
        }
      }
    });
  }

  
addToCart = async (): Promise<void> => {
  if (this.adding || !this.product) return;
  this.adding = true;

  const item: CartItem = {
    productId: this.product.id,
    name: this.product.name,
    price: this.product.price,
    quantity: this.quantity
  };

  // Use image if available, otherwise button
  const sourceElement = this.productImageRef?.nativeElement || this.buttonRef?.nativeElement;

  // Always add to cart (don't wait for animation)
  this.cartService.addToCart(item);
  this.toastService.show(`${item.name} added to cart!`, 'success');
  this.added.emit();

  // Try animation, but NEVER block UI
  if (sourceElement) {
    try {
      await flyToCart(sourceElement);
      // Animation done → optional pulse
    } catch (err) {
      console.warn('Fly animation failed (non-critical):', err);
    }
  }

  // ALWAYS reset spinner after 1 second max
  setTimeout(() => {
    this.adding = false;
  }, 1000);

}

  private fallbackAddToCart(item: CartItem): void {
    this.cartService.addToCart(item);
    this.toastService.show(`${item.name} added to cart!`, 'success');
    this.added.emit();
  }
}

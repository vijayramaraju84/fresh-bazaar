// src/app/features/products/add-to-cart-button/add-to-cart-button.component.ts
import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, ContentChild, OnChanges, SimpleChanges, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CartService, CartItem } from '../../cart/cart.service';
import { ToastService } from '../../toast/toast.service';
import { flyToCart } from '../../../shared/animations/cart-fly.animation';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-to-cart-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <!-- QUANTITY STEPPER: SHOWS IF inCart > 0 -->
    <div class="quantity-stepper" *ngIf="inCart > 0">
      <button mat-icon-button (click)="update(-1)" [disabled]="updating">
        <mat-icon>remove</mat-icon>
      </button>
      <span class="count">{{ inCart }}</span>
      <button 
        mat-icon-button 
        (click)="update(1)" 
        [disabled]="updating || isMaxReached"
        [class.disabled]="isMaxReached">
        <mat-icon>add</mat-icon>
      </button>
    </div>

    <!-- STOCK WARNING -->
    <div class="stock-info" *ngIf="inCart > 0 && stock <= 10 && inCart < stock">
      <small style="color: #ff6b6b; font-size: 0.8rem;">
        Only {{ stock - inCart }} left!
      </small>
    </div>

    <!-- ADD BUTTON: SHOWS IF inCart === 0 -->
    <button
      mat-raised-button color="accent"
      *ngIf="inCart === 0"
      (click)="update(1)"
      [disabled]="adding || disabled || stock <= 0"
      class="add-btn"
      #buttonRef>
      <span *ngIf="!adding">
        <mat-icon>add_shopping_cart</mat-icon> {{ buttonText }}
      </span>
      <span *ngIf="adding">
        <mat-icon class="spin">autorenew</mat-icon> Adding...
      </span>
    </button>

    <!-- OUT OF STOCK -->
    <div *ngIf="stock === 0" class="out-of-stock">
      <small style="color: #ff4444;">Out of Stock</small>
    </div>
  `,
  styles: [`
    .quantity-stepper {
      display: flex; align-items: center; justify-content: center;
      gap: 8px; margin-top: 8px; padding: 4px 8px;
      background: #181818; border-radius: 20px; font-weight: 500; color: #9ad99a;
    }
    .count { min-width: 24px; text-align: center; font-size: 0.95rem; }
    .add-btn { width: 100%; margin-top: 8px; }
    .spin { animation: spin 1s linear infinite; }
    .out-of-stock, .stock-info { text-align: center; margin-top: 4px; }
    button[disabled] { opacity: 0.5; cursor: not-allowed; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  `]
})
export class AddToCartButtonComponent implements OnChanges, OnInit, OnDestroy {
  @Input() product!: any;
  @Input() buttonText = 'Add';
  @Input() disabled = false;
  @Output() quantityChange = new EventEmitter<number>();

  @ViewChild('buttonRef') buttonRef!: ElementRef<HTMLElement>;
  @ContentChild('productImage', { static: false }) productImageRef!: ElementRef<HTMLImageElement>;

  inCart = 0;
  stock = 0;  // ← NOW SET
  adding = false;
  updating = false;

  private subs = new Subscription();

  constructor(
    private cartService: CartService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    // LIVE SYNC FROM CART SERVICE
    this.subs.add(
      this.cartService.cartItems$.subscribe(items => {
        const item = items.find(i => i.productId === this.product?.id);
        const qty = item?.quantity || 0;
        if (qty !== this.inCart) {
          this.inCart = qty;
          this.product.cartQuantity = qty;
        }
      })
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product']) {
      this.inCart = Number(this.product?.cartQuantity) || 0;
      this.stock = Number(this.product?.stock) || 0;  // ← CRITICAL
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  get isMaxReached(): boolean {
    return this.inCart >= this.stock;
  }

  update(change: number): void {
    if (this.updating || this.adding) return;

    const newQty = this.inCart + change;

    if (newQty > this.stock) {
      this.toastService.show(`Only ${this.stock} left in stock!`, 'info');
      return;
    }

    if (newQty < 0) return;

    const isAdding = change > 0;
    if (isAdding) this.adding = true;
    else this.updating = true;

    const item: CartItem = {
      productId: this.product.id,
      productName: this.product.name,
      productPrice: this.product.price,
      quantity: newQty
    };

    this.cartService.addToCart(item).subscribe({
      next: () => {
        this.inCart = newQty;
        this.product.cartQuantity = newQty;
        this.quantityChange.emit(newQty);

        if (isAdding && newQty === 1) {
          this.toastService.show(`${this.product.name} added!`, 'success');
          this.triggerFlyAnimation();
        } else if (newQty === 0) {
          this.toastService.show(`Removed from cart`, 'info');
        }
      },
      error: () => this.toastService.show('Update failed.', 'error'),
      complete: () => {
        this.adding = false;
        this.updating = false;
      }
    });
  }

  private triggerFlyAnimation(): void {
    const img = this.productImageRef?.nativeElement ||
                this.buttonRef?.nativeElement?.closest('.product-card')?.querySelector('img');
    if (img) {
      flyToCart(img).catch(() => {});
    }
  }
}
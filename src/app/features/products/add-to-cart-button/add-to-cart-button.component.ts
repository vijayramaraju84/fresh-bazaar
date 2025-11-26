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
    /* QUANTITY STEPPER – FINAL & FLAWLESS (COUNT COLOR FIXED) */
.quantity-stepper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
  padding: 8px 16px;
  background: var(--surface-2);
  border-radius: 30px;
  font-weight: 600;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  transition: all 0.4s ease;
  backdrop-filter: blur(8px);
  font-size: 1rem;
}

[data-theme="dark"] .quantity-stepper:hover {
  border-color: var(--accent-color);
  box-shadow: 0 0 20px var(--holo-glow);
  transform: translateY(-2px);
}

[data-theme="light"] .quantity-stepper:hover {
  border-color: var(--accent-color);
  box-shadow: 0 6px 20px rgba(0,0,0,0.12);
  transform: translateY(-2px);
}

/* COUNT NUMBER – WHITE IN DARK, BLACK IN LIGHT */
.count {
  min-width: 32px;
  text-align: center;
  font-size: 1.15rem;
  font-weight: 800;
  text-shadow: 0 0 10px #00ff8833;
  transition: color 0.4s ease;
}

/* Light mode → black text */
[data-theme="light"] .count {
  color: #000000;
  text-shadow: none;
}

/* Optional: keep a subtle green glow in both modes if you want */
.count.glow {
  color: #00ff88 !important;
  text-shadow: 0 0 15px currentColor;
}

/* Plus/Minus buttons */
.quantity-stepper button {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--surface-1);
  color: var(--accent-color);
  border: 2px solid var(--border-color);
  font-size: 1.5rem;
  font-weight: bold;
  display: grid;
  place-items: center;
  transition: all 0.3s ease;
}

.quantity-stepper button:hover:not([disabled]) {
  background: var(--accent-color);
  color: #000;
  transform: scale(1.12);
  box-shadow: 0 0 20px var(--holo-glow);
}

.quantity-stepper button[disabled] {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Stock info */
.stock-info { color: #00ff88; font-weight: 600; }
.out-of-stock { color: #ff5252; font-weight: 600; }

.add-btn {
  width: 100%;
  margin-top: 12px;
  height: 56px;
  border-radius: 20px;
  font-size: 1.1rem;
}

.spin { animation: spin 1s linear infinite; }
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
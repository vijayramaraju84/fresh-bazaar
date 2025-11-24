import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Subscription } from 'rxjs';

import { AddToCartButtonComponent } from '../add-to-cart-button/add-to-cart-button.component';
import { Product } from '../product.model';
import { CartService } from '../../cart/cart.service';
import { ProductService } from '../product.service';
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, AddToCartButtonComponent, MatProgressSpinner],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css'],
  animations: [
    trigger('heartBeat', [
      state('inactive', style({ transform: 'scale(1)' })),
      state('active', style({ transform: 'scale(1)' })),
      transition('inactive => active', [
        animate('0.3s ease-in-out', style({ transform: 'scale(1.3)' })),
        animate('0.2s ease-out', style({ transform: 'scale(1)' }))
      ]),
      transition('active => inactive', [
        animate('0.2s ease-in')
      ])
    ])
  ]
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  product: Product | null = null;
  selectedImageIndex = 0;

  // Zoom
  isZoomed = false;
  zoomTransform = 'scale(1)';
  zoomOrigin = '50% 50%';

  // Swipe
  touchStartX = 0;
  touchEndX = 0;
  private subs = new Subscription();

  @ViewChild('imageContainer') imageContainer!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.route.params.subscribe(params => {
        const id = Number(params['id']);
        this.loadProduct(id);
      })
    );

    this.subs.add(
      this.cartService.cartItems$.subscribe(() => {
        this.updateCartQuantity();
      })
    );
  }

  private loadProduct(id: number): void {
  this.productService.getProductById(id).subscribe(apiProduct => {
    // Handle both raw Base64 string and array
    const rawImages = apiProduct.imagesBase64;
    const base64Array: string[] = Array.isArray(rawImages) 
      ? rawImages 
      : (rawImages ? [rawImages] : []);

    // Convert to full data URLs (only if not already)
    const fullImageUrls = base64Array.map(b64 => 
      b64.startsWith('data:') ? b64 : `data:image/jpeg;base64,${b64}`
    );

    const firstImage = fullImageUrls.length > 0 
      ? fullImageUrls[0] 
      : 'assets/default.jpg';

    this.product = {
      ...apiProduct,
      image: firstImage,
      imagesBase64: fullImageUrls,  // ← FULL data URLs
      cartQuantity: 0,
      wishlisted: apiProduct.wishlisted ?? false
    };

    this.selectedImageIndex = 0;
    this.updateCartQuantity();
  });
}

shareProduct(): void {
    const url = window.location.href;
    const title = this.product?.name || 'Check out this product';

    // NATIVE SHARE (Mobile)
    if (navigator.share) {
      navigator.share({
        title: title,
        text: `Check out ${title} on Fresh Bazaar!`,
        url: url
      }).catch(err => {
        console.log('Share failed', err);
        this.copyToClipboard(url);
      });
    } else {
      // FALLBACK: Copy to clipboard (Desktop)
      this.copyToClipboard(url);
    }
  }

  private copyToClipboard(url: string): void {
    navigator.clipboard.writeText(url).then(() => {
      this.snackBar.open('Link copied to clipboard!', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
    }).catch(() => {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      this.snackBar.open('Link copied!', 'Close', { duration: 3000 });
    });
  }

  private updateCartQuantity(): void {
    if (!this.product) return;
    const item = this.cartService.cartItemsSubject.value
      .find(i => i.productId === this.product!.id);
    this.product.cartQuantity = item?.quantity || 0;
  }

  selectImage(index: number): void {
  if (!this.product?.imagesBase64 || this.product.imagesBase64.length === 0) return;
  this.selectedImageIndex = index;
  this.product.image = this.product.imagesBase64[index];
}

  // ZOOM ON HOVER (DESKTOP)
  onMouseMove(e: MouseEvent): void {
    if (!this.imageContainer) return;
    const rect = this.imageContainer.nativeElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    this.zoomOrigin = `${xPercent}% ${yPercent}%`;
    this.zoomTransform = 'scale(2)';
    this.isZoomed = true;
  }

  onMouseEnter(): void {
    this.isZoomed = true;
  }

  onMouseLeave(): void {
    this.isZoomed = false;
    this.zoomTransform = 'scale(1)';
  }

  // SWIPE GESTURES (MOBILE)
  onTouchStart(e: TouchEvent): void {
    this.touchStartX = e.changedTouches[0].screenX;
  }

  onTouchMove(e: TouchEvent): void {
    this.touchEndX = e.changedTouches[0].screenX;
  }

  onTouchEnd(e: TouchEvent): void {  // ← NOW ACCEPTS $event
    if (!this.product?.imagesBase64 || this.product.imagesBase64.length <= 1) return;

    const diff = this.touchStartX - this.touchEndX;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swipe left → next
        this.selectedImageIndex = (this.selectedImageIndex + 1) % this.product.imagesBase64.length;
      } else {
        // Swipe right → prev
        this.selectedImageIndex = (this.selectedImageIndex - 1 + this.product.imagesBase64.length) % this.product.imagesBase64.length;
      }
      this.selectImage(this.selectedImageIndex);
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }

  getStars(rating: number): string[] {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return [
      ...Array(full).fill('star'),
      ...(half ? ['star_half'] : []),
      ...Array(empty).fill('star_border')
    ];
  }

  onQuantityChange(product: Product, qty: number) {
    product.cartQuantity = qty;
  }

  getDiscountPercent(product: Product): number {
    if (!product.mrp || product.mrp <= product.price) return 0;
    return Math.round(((product.mrp - product.price) / product.mrp) * 100);
  }

  toggleWishlist(): void {
    if (this.product) {
      this.product.wishlisted = !this.product.wishlisted;
    }
  }
}
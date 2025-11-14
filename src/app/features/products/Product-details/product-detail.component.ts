import {
  Component,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { AddToCartButtonComponent } from '../add-to-cart-button/add-to-cart-button.component';
import { Product } from '../product.model';
import { CartService } from '../../cart/cart.service';
import { ProductService } from '../product.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, AddToCartButtonComponent],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit, OnDestroy {

  product: Product | null = null;

  @Output() close = new EventEmitter<void>();

  private subs = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Load product from route parameter
    this.subs.add(
      this.route.params.subscribe(params => {
        const id = Number(params['id']);

        this.productService.getProductById(id).subscribe(apiProduct => {

          // Build the product object safely
          this.product = {
            ...apiProduct,
            image: apiProduct.imageBase64
              ? `data:image/jpeg;base64,${apiProduct.imageBase64}`
              : 'assets/default.jpg',
            description: apiProduct.description || 'No description available.',
            features: apiProduct.features || [],
            wishlisted: apiProduct.wishlisted ?? false,
            cartQuantity: 0
          };

          // Sync cart
          const cartItem = this.cartService.cartItemsSubject.value
            .find(i => i.productId === this.product!.id);

          this.product.cartQuantity = cartItem?.quantity || 0;
        });
      })
    );

    // Watch cart updates
    this.subs.add(
      this.cartService.cartItems$.subscribe(items => {
        if (!this.product) return;
        const item = items.find(i => i.productId === this.product!.id);
        this.product.cartQuantity = item?.quantity || 0;
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // Back button
  goBack(): void {
    this.router.navigate(['/products']);
  }

  getStars(rating: number): string[] {
    rating = rating || 0;
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return [
      ...Array(full).fill('star'),
      ...(half ? ['star_half'] : []),
      ...Array(empty).fill('star_border')
    ];
  }

  onQuantityChange(_: Product, qty: number) {
    if (this.product) this.product.cartQuantity = qty;
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

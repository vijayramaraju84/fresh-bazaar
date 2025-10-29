// src/app/features/products/products.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { trigger, style, animate, transition, state } from '@angular/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { CartService } from '../cart/cart.service';
import { ProductService } from '../products/product.service';
import { AddToCartButtonComponent } from '../products/add-to-cart-button/add-to-cart-button.component';
import { ToastComponent } from '../toast/toast.component';
import { Product } from './product.model';
import { ProductDetailComponent } from './Product-details/product-detail.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    CommonModule,
    RouterLink,
    AddToCartButtonComponent,
    ToastComponent,
    ProductDetailComponent
],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
  animations: [
    trigger('slideAnimation', [
      state('active', style({ opacity: 1, transform: 'translateX(0)' })),
      state('inactive', style({ opacity: 0, transform: 'translateX(100%)' })),
      transition('inactive => active', animate('600ms ease-out')),
      transition('active => inactive', animate('600ms ease-in'))
    ]),
    trigger('cardAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class ProductsComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  featuredProducts: Product[] = [];
  categories: string[] = [];
  currentSlideIndex = 0;
  searchQuery = '';

  private querySubscription!: Subscription;
  private autoSlideInterval: any;

  constructor(
    private route: ActivatedRoute,
    private cartService: CartService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadProducts();

    this.querySubscription = this.route.queryParams.subscribe(params => {
      this.searchQuery = (params['search'] || '').trim();
      const category = (params['category'] || '').toLowerCase();
      this.updateFilteredProducts(this.searchQuery.toLowerCase(), category);
    });

    this.autoSlideInterval = setInterval(() => {
      if (!this.searchQuery && this.featuredProducts.length > 0) {
        this.nextSlide();
      }
    }, 5000);
  }

  ngOnDestroy(): void {
    this.querySubscription?.unsubscribe();
    clearInterval(this.autoSlideInterval);
  }

  onItemAdded(): void {
    console.log('Item added to cart');
  }

  trackById(index: number, product: Product): any {
    return product.id;
  }

  selectedProduct: Product | null = null;

openDetail(product: Product): void {
  this.selectedProduct = product;
}

closeDetail(): void {
  this.selectedProduct = null;
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

  getDiscountPercent(product: Product): number {
    if (!product.mrp || product.mrp <= product.price) return 0;
    return Math.round(((product.mrp - product.price) / product.mrp) * 100);
  }

  toggleWishlist(product: Product): void {
    product.wishlisted = !product.wishlisted;
  }

  private loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products = (products || []).map(p => ({
          ...p,
          image: p.imageBase64
            ? `data:image/jpeg;base64,${p.imageBase64}`
            : 'assets/default-product.jpg',
          wishlisted: false,
          stock: p.stock ?? 10,
          rating: p.rating ?? 4.2,
          reviews: p.reviews ?? 128,
          prime: p.prime ?? Math.random() > 0.7,
          mrp: p.mrp ?? (p.price * 1.3)  // fake MRP if missing
        }));

        this.categories = Array.from(
          new Set(
            this.products
              .map(p => p.category)
              .filter((c): c is string => !!c && c.trim().length > 0)
          )
        );

        this.featuredProducts = this.products.filter(p => !!p.offer);
        if (this.featuredProducts.length === 0) {
          this.featuredProducts = this.products.slice(0, 5);
        }

        this.updateFilteredProducts();
      },
      error: (err) => console.error('Failed to fetch products:', err)
    });
  }

  updateFilteredProducts(search: string = '', category: string = ''): void {
    this.filteredProducts = this.products.filter(p =>
      (!search ||
        p.name.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search) ||
        p.category?.toLowerCase().includes(search)
      ) &&
      (!category || p.category?.toLowerCase() === category)
    );
  }

  nextSlide(): void {
    if (this.featuredProducts.length > 0) {
      this.currentSlideIndex = (this.currentSlideIndex + 1) % this.featuredProducts.length;
    }
  }

  prevSlide(): void {
    if (this.featuredProducts.length > 0) {
      this.currentSlideIndex =
        (this.currentSlideIndex - 1 + this.featuredProducts.length) % this.featuredProducts.length;
    }
  }

  addToCart(product: Product): void {
    this.cartService.addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    });
  }
}
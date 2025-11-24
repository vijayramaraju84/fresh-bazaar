import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ViewEncapsulation,
  ChangeDetectorRef
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Subscription, firstValueFrom } from 'rxjs';

import { CartService, CartItem } from '../cart/cart.service';
import { ProductService } from '../products/product.service';
import { AddToCartButtonComponent } from '../products/add-to-cart-button/add-to-cart-button.component';
import { Product } from './product.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    AddToCartButtonComponent
  ],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('slide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(100%)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),
    trigger('cardEnter', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class ProductsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('grid') grid!: ElementRef<HTMLDivElement>;
  @ViewChild('loadMore') loadMore!: ElementRef<HTMLDivElement>;

  products: Product[] = [];
  filteredProducts: Product[] = [];
  featuredProducts: Product[] = [];
  categories: string[] = [];
  searchQuery = '';
  selectedCategory = '';
  sortBy: 'featured' | 'priceLow' | 'priceHigh' | 'rating' | 'newest' = 'featured';

  readonly sortOptions = {
    featured: 'Featured',
    priceLow: 'Price: Low to High',
    priceHigh: 'Price: High to Low',
    rating: 'Highest Rated',
    newest: 'Newest First'
  } as const;

  get sortOptionKeys(): (keyof typeof this.sortOptions)[] {
    return Object.keys(this.sortOptions) as (keyof typeof this.sortOptions)[];
  }

  currentSlide = 0;
  loading = true;
  loadingMore = false;
  hasMore = true;
  pageSize = 12;
  currentPage = 0;
  skeletonItems = Array(8);
  private subs = new Subscription();
  private autoSlide!: any;

  constructor(
    private route: ActivatedRoute,
    private cartService: CartService,
    private productService: ProductService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    // 1. SUBSCRIBE TO CART FIRST
    this.subs.add(
      this.cartService.cartItems$.subscribe(cartItems => {
        const cartMap = new Map(cartItems.map(i => [i.productId, i.quantity]));
        this.products.forEach(p => p.cartQuantity = cartMap.get(p.id) || 0);
        this.featuredProducts.forEach(p => p.cartQuantity = cartMap.get(p.id) || 0);
        this.filteredProducts = [...this.filteredProducts];
        this.cdr.detectChanges(); // FORCE UI UPDATE
      })
    );

    // 2. LOAD CART FIRST — WAIT FOR IT
    if (localStorage.getItem('token')) {
      await firstValueFrom(this.cartService.getCartItems());
    } else {
      this.cartService.loadGuestCart();
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    // 3. NOW LOAD PRODUCTS
    this.loadInitialData();
    this.setupAutoSlide();
    this.watchQueryParams();
  }

  ngAfterViewInit(): void {
    this.setupInfiniteScroll();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    clearInterval(this.autoSlide);
  }

  private loadInitialData(): void {
    this.loading = true;
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products = this.normalizeProducts(data || []);
        this.categories = this.getUniqueCategories();
        this.featuredProducts = this.getFeatured();
        this.applyFilters();
        this.loading = false;

        // FINAL FORCE UPDATE
        this.cdr.detectChanges();
      },
      error: () => this.loading = false
    });
  }

  private normalizeProducts(data: any[]): Product[] {
    return data.map(p => {
      const images = Array.isArray(p.imagesBase64) ? p.imagesBase64 : [];
      const firstImage = images.length > 0 
        ? `data:image/jpeg;base64,${images[0]}`
        : 'assets/default.jpg';

      return {
        id: p.id || Date.now(),
        name: p.name || 'Unknown Product',
        price: p.price || 0,
        image: firstImage,
        imagesBase64: images,
        category: p.category,
        description: p.description,
        stock: p.stock ?? 10,
        rating: p.rating ?? 4.2,
        reviews: p.reviews ?? Math.floor(Math.random() * 200),
        prime: p.prime ?? Math.random() > 0.7,
        mrp: p.mrp ?? Math.round((p.price || 0) * 1.3),
        offer: p.offer,
        wishlisted: p.wishlisted ?? false,
        cartQuantity: 0
      };
    });
  }

  private getUniqueCategories(): string[] {
  return Array.from(
    new Set(
      this.products
        .map(p => p.category)
        .filter((c): c is string => !!c && c.trim().length > 0)
    )
  );
}


  private getFeatured(): Product[] {
    const offerProducts = this.products.filter(p => p.offer);
    return offerProducts.length ? offerProducts.slice(0, 5) : this.products.slice(0, 5);
  }

  applyFilters(): void {
    let list = [...this.products];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(
        p => p.name.toLowerCase().includes(q) ||
             p.description?.toLowerCase().includes(q) ||
             p.category?.toLowerCase().includes(q)
      );
    }

    if (this.selectedCategory)
      list = list.filter(p => p.category === this.selectedCategory);

    list.sort((a, b) => {
      switch (this.sortBy) {
        case 'priceLow': return a.price - b.price;
        case 'priceHigh': return b.price - a.price;
        case 'rating': return (b.rating ?? 0) - (a.rating ?? 0);
        case 'newest': return b.id - a.id;
        default: return 0;
      }
    });

    this.hasMore = list.length > this.pageSize * (this.currentPage + 1);

    this.filteredProducts = list.slice(0, this.pageSize * (this.currentPage + 1));
  }

  filterByCategory(cat: string): void {
    this.selectedCategory = cat;
    this.currentPage = 0;
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.sortBy = 'featured';
    this.currentPage = 0;
    this.applyFilters();
  }

  onQuantityChange(product: Product, newQty: number): void {
    product.cartQuantity = newQty;
  }

  private watchQueryParams(): void {
    this.subs.add(
      this.route.queryParams.subscribe(params => {
        this.searchQuery = params['search'] || '';
        this.selectedCategory = params['category'] || '';
        this.applyFilters();
      })
    );
  }

  private setupAutoSlide(): void {
    this.autoSlide = setInterval(() => {
      if (this.featuredProducts.length > 1) this.next();
    }, 5000);
  }

  next(): void {
    this.currentSlide = (this.currentSlide + 1) % this.featuredProducts.length;
  }

  prev(): void {
    this.currentSlide = (this.currentSlide - 1 + this.featuredProducts.length) %
      this.featuredProducts.length;
  }

  private setupInfiniteScroll(): void {
    if (!this.loadMore?.nativeElement) return;

    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && this.hasMore && !this.loadingMore) {
        this.loadMoreProducts();
      }
    });

    observer.observe(this.loadMore.nativeElement);
  }

  private loadMoreProducts(): void {
    this.loadingMore = true;

    setTimeout(() => {
      this.currentPage++;
      this.applyFilters();
      this.loadingMore = false;
    }, 600);
  }

  toggleWishlist(product: Product, e: Event): void {
    e.stopPropagation();
    product.wishlisted = !product.wishlisted;
  }

  getStars(rating: number = 0): string[] {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    return [
      ...Array(full).fill('star'),
      ...(half ? ['star_half'] : []),
      ...Array(5 - full - (half ? 1 : 0)).fill('star_border')
    ];
  }

  getDiscount(p: Product): number {
    if (!p.mrp || p.mrp <= p.price) return 0;
    return Math.round(((p.mrp - p.price) / p.mrp) * 100);
  }

  trackById(_: number, p: Product): number {
    return p.id;
  }

  openDetail(product: Product): void {
    this.router.navigate(['/product', product.id]);
  }

  onAdd(product: Product): void {
    product.cartQuantity++;

    const item: CartItem = {
      productId: product.id,
      productName: product.name,
      productPrice: product.price,
      quantity: 1
    };

    this.cartService.addToCart(item).subscribe();
  }
}

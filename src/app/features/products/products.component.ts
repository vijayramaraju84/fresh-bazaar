import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { trigger, style, animate, transition, state } from '@angular/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { CartService } from '../cart/cart.service';
import { ProductService, Product } from '../products/product.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, CommonModule, RouterLink],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
  animations: [
    trigger('slideAnimation', [
      state('active', style({ opacity: 1, transform: 'translateX(0)' })),
      state('inactive', style({ opacity: 0, transform: 'translateX(100%)' })),
      transition('inactive => active', [
        animate('600ms ease-out')
      ]),
      transition('active => inactive', [
        animate('600ms ease-in')
      ])
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
  private querySubscription: Subscription | null = null;
  private autoSlideInterval: any;

  constructor(
    private route: ActivatedRoute,
    private cartService: CartService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.querySubscription = this.route.queryParams.subscribe(params => {
      const search = params['search']?.toLowerCase() || '';
      const category = params['category']?.toLowerCase() || '';
      this.updateFilteredProducts(search, category);
    });
    this.autoSlideInterval = setInterval(() => this.nextSlide(), 5000);
  }

  ngOnDestroy(): void {
    this.querySubscription?.unsubscribe();
    clearInterval(this.autoSlideInterval);
  }

  private loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        console.log('Fetched products:', products); // Debug
        this.products = (products || []).map(p => ({
          ...p,
          image: p.imageBase64 ? `data:image/jpeg;base64,${p.imageBase64}` : 'assets/default-product.jpg'
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
        console.log('Featured products:', this.featuredProducts); // Debug
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
    console.log('Filtered products:', this.filteredProducts); // Debug
  }

  nextSlide(): void {
    if (this.featuredProducts.length > 0) {
      this.currentSlideIndex = (this.currentSlideIndex + 1) % this.featuredProducts.length;
      console.log('Current slide index:', this.currentSlideIndex); // Debug
    }
  }

  prevSlide(): void {
    if (this.featuredProducts.length > 0) {
      this.currentSlideIndex = (this.currentSlideIndex - 1 + this.featuredProducts.length) % this.featuredProducts.length;
      console.log('Current slide index:', this.currentSlideIndex); // Debug
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
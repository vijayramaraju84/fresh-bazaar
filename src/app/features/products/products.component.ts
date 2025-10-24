import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { trigger, style, animate, transition } from '@angular/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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
    trigger('cardAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideAnimation', [
      transition(':increment', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('600ms ease-in-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':decrement', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate('600ms ease-in-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ])
    ])
  ]
})
export class ProductsComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  featuredProducts: Product[] = [];
  categories = [
    { name: 'Electronics', image: 'assets/electronics.jpg' },
    { name: 'Fashion', image: 'assets/fashion.jpg' },
    { name: 'Accessories', image: 'assets/accessories.jpg' }
  ];
  currentSlideIndex = 0;
  private querySubscription: Subscription | null = null;
  private autoSlideInterval: any;

  constructor(
    private route: ActivatedRoute,
    private cartService: CartService,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.featuredProducts = products.filter(p => p.offer);
        this.updateFilteredProducts();
      },
      error: (err) => {
        console.error('Failed to fetch products:', err);
      }
    });

    this.querySubscription = this.route.queryParams.subscribe(params => {
      this.updateFilteredProducts(params['search']?.toLowerCase() || '');
    });

    this.autoSlideInterval = setInterval(() => this.nextSlide(), 5000);
  }

  ngOnDestroy() {
    if (this.querySubscription) {
      this.querySubscription.unsubscribe();
    }
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  updateFilteredProducts(search: string = '') {
    this.filteredProducts = this.products.filter(p => 
      p.name.toLowerCase().includes(search) || 
      p.description?.toLowerCase().includes(search) ||
      p.category?.toLowerCase().includes(search)
    );
  }

  nextSlide() {
    this.currentSlideIndex = (this.currentSlideIndex + 1) % this.featuredProducts.length;
  }

  prevSlide() {
    this.currentSlideIndex = (this.currentSlideIndex - 1 + this.featuredProducts.length) % this.featuredProducts.length;
  }

  addToCart(product: Product) {
    this.cartService.addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    });
  }
}
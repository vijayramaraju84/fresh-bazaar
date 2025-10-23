import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { trigger, style, animate, transition } from '@angular/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../cart/cart.service';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  offer?: string;
  category?: string;
}

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
export class ProductsComponent implements OnInit {
  products: Product[] = [
    { id: 1, name: 'Starship Drone', price: 99.99, image: 'assets/drone.jpg', offer: '20% Off', category: 'Electronics' },
    { id: 2, name: 'Galactic Headphones', price: 149.99, image: 'assets/headphones.jpg', offer: 'Buy 1 Get 1 Free', category: 'Electronics' },
    { id: 3, name: 'Nebula Watch', price: 199.99, image: 'assets/watch.jpg', category: 'Accessories' }
  ];
  filteredProducts: Product[] = [];
  featuredProducts: Product[] = this.products.filter(p => p.offer);
  categories = [
    { name: 'Electronics', image: 'assets/electronics.jpg' },
    { name: 'Fashion', image: 'assets/fashion.jpg' },
    { name: 'Accessories', image: 'assets/accessories.jpg' }
  ];
  currentSlideIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const search = params['search']?.toLowerCase() || '';
      this.filteredProducts = this.products.filter(p => p.name.toLowerCase().includes(search));
    });
    setInterval(() => this.nextSlide(), 5000);
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
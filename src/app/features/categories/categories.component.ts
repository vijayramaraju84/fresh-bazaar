import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { CartService } from '../cart/cart.service';
import { MatIconModule } from '@angular/material/icon';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, CommonModule],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  products: Product[] = [
    { id: 1, name: 'Starship Drone', price: 99.99, image: 'assets/drone.jpg', category: 'Electronics' },
    { id: 2, name: 'Galactic Headphones', price: 149.99, image: 'assets/headphones.jpg', category: 'Electronics' },
    { id: 3, name: 'Nebula Watch', price: 199.99, image: 'assets/watch.jpg', category: 'Accessories' }
  ];
  filteredProducts: Product[] = [];
  selectedCategory: string = 'All Categories'; // Ensure this is declared

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const category = params['category'] || 'All Categories';
      this.selectedCategory = category;
      this.filteredProducts = category === 'All Categories'
        ? this.products
        : this.products.filter(p => p.category === category);
    });
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
// src/app/core/header/header.component.ts
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthStateService } from '../../auth/auth-state.service';
import { CartService } from '../../features/cart/cart.service';
import { ProductService } from '../../features/products/product.service';
import { SearchDialogComponent } from './search-dialog.component';
import { User } from '../../auth/auth.service';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  stock: number;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    FormsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatMenuModule,
    MatDividerModule,
    MatDialogModule,
    RouterLink,
    CommonModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  user: User | null = null;
  searchQuery = '';
  cartItemCount = 0;
  isDark = true;

  // Autocomplete
  searchSuggestions: Product[] = [];
  recentSearches: string[] = [];
  showSuggestions = false;
  highlightedIndex = -1;

  private subs = new Subscription();

  @ViewChild('desktopSearch') desktopSearch!: ElementRef;

  constructor(
    private authState: AuthStateService,
    private cartService: CartService,
    private productService: ProductService,
    private router: Router,
    private dialog: MatDialog,
    private renderer: Renderer2
  ) {
    this.isDark = this.getSavedTheme();
    this.applyTheme();
  }

  ngOnInit(): void {
    // Load recent searches
    this.loadRecentSearches();

    // User state
    this.subs.add(
      this.authState.getUser$().subscribe(user => {
        this.user = user;
      })
    );

    // Cart count
    this.subs.add(
      this.cartService.getCartCountObservable().subscribe(count => {
        this.cartItemCount = count;
      })
    );

    // Cart pulse
    this.subs.add(
      this.cartService.itemAdded$.subscribe(item => {
        if (item) {
          const btn = document.querySelector('.cart-icon') as HTMLElement;
          if (btn) {
            btn.classList.add('pulse');
            setTimeout(() => btn.classList.remove('pulse'), 600);
          }
        }
      })
    );
  }

  // THEME
  private getSavedTheme(): boolean {
    return localStorage.getItem('theme') !== 'light';
  }

  toggleTheme(): void {
    this.isDark = !this.isDark;
    this.applyTheme();
    localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
  }

  private applyTheme(): void {
    if (this.isDark) {
      this.renderer.removeAttribute(document.body, 'data-theme');
    } else {
      this.renderer.setAttribute(document.body, 'data-theme', 'light');
    }
  }

  // SEARCH AUTOCOMPLETE
  onSearchInput(): void {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) {
      this.searchSuggestions = [];
      this.showSuggestions = this.recentSearches.length > 0;
      return;
    }

    this.productService.getAllProducts().subscribe(products => {
      this.searchSuggestions = products
        .filter(p => p.name.toLowerCase().includes(query))
        .slice(0, 6); // Limit to 6 suggestions
      this.showSuggestions = true;
    });
  }

  selectProduct(product: Product): void {
    this.searchQuery = product.name;
    this.showSuggestions = false;
    this.addToRecentSearches(product.name);
    this.router.navigate(['/product', product.id]);
  }

  performSearch(): void {
    if (this.searchQuery.trim()) {
      this.addToRecentSearches(this.searchQuery.trim());
      this.router.navigate(['/products'], {
        queryParams: { search: this.searchQuery.trim() }
      });
      this.showSuggestions = false;
    }
  }

  searchFromHistory(term: string): void {
    this.searchQuery = term;
    this.showSuggestions = false;
    this.performSearch();
  }

  removeSearch(term: string): void {
    this.recentSearches = this.recentSearches.filter(t => t !== term);
    localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
  }

  private addToRecentSearches(term: string): void {
    let searches = this.recentSearches.filter(t => t !== term);
    searches.unshift(term);
    this.recentSearches = searches.slice(0, 5);
    localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
  }

  private loadRecentSearches(): void {
    const saved = localStorage.getItem('recentSearches');
    this.recentSearches = saved ? JSON.parse(saved) : [];
  }

  onSearchBlur(): void {
    setTimeout(() => this.showSuggestions = false, 200);
  }

  // NAV
  goHome(): void {
    this.router.navigate(['/products']);
  }

  openSearchDialog(): void {
    this.dialog.open(SearchDialogComponent, {
      width: '90vw',
      maxWidth: '400px',
      data: { query: this.searchQuery }
    });
  }

  logout(): void {
    this.authState.logout();
    this.cartService.clearCart();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
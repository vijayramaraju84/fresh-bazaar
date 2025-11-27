// src/app/features/update-stock/update-stock.component.ts
import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductService } from '../product.service';

interface ProductStock {
  id: number;
  name: string;
  image: string;
  currentStock: number;
  quantity: number;
  pendingAction?: 'INCREMENT' | 'DECREMENT';
}

@Component({
  selector: 'app-update-stock',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule
  ],
  templateUrl: './update-stock.component.html',
  styleUrls: ['./update-stock.component.css']
})
export class UpdateStockComponent implements OnInit {
  products: ProductStock[] = [];
  filteredProducts: ProductStock[] = [];
  searchQuery = '';
  showSuggestions = false;
  highlightedIndex = -1;

  saving = false;
  displayedColumns = ['name', 'currentStock', 'quantity', 'actions'];

  @ViewChild('searchInput') searchInput!: ElementRef;

  constructor(
    private productService: ProductService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.productService.getAllProducts().subscribe(allProducts => {
      this.products = allProducts.map(p => {
        const imageUrl = p.imagesBase64 && p.imagesBase64.length > 0
          ? `data:image/jpeg;base64,${p.imagesBase64[0]}`
          : 'assets/default.jpg';

        return {
          id: p.id,
          name: p.name,
          image: imageUrl,
          currentStock: p.stock,
          quantity: 0,
          pendingAction: undefined
        };
      });
      this.filteredProducts = [...this.products];
    });
  }

  // SEARCH & AUTOCOMPLETE
  onSearchInput(): void {
    const query = this.searchQuery.toLowerCase().trim();
    this.highlightedIndex = -1;

    if (!query) {
      this.filteredProducts = [...this.products];
      this.showSuggestions = false;
      return;
    }

    this.filteredProducts = this.products.filter(p =>
      p.name.toLowerCase().includes(query)
    );

    this.showSuggestions = this.filteredProducts.length > 0;
  }

  highlightMatch(text: string, query: string): string {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
  }

  selectSuggestion(product: ProductStock): void {
    this.searchQuery = product.name;
    this.showSuggestions = false;
    this.focusInput();
  }

  focusInput(): void {
    setTimeout(() => this.searchInput?.nativeElement.focus(), 0);
  }

  onBlur(): void {
    setTimeout(() => this.showSuggestions = false, 200);
  }

  // KEYBOARD NAVIGATION
  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.showSuggestions || this.filteredProducts.length === 0) return;

    if (event.key === 'ArrowDown') {
      this.highlightedIndex = (this.highlightedIndex + 1) % this.filteredProducts.length;
      event.preventDefault();
    } else if (event.key === 'ArrowUp') {
      this.highlightedIndex = this.highlightedIndex <= 0
        ? this.filteredProducts.length - 1
        : this.highlightedIndex - 1;
      event.preventDefault();
    } else if (event.key === 'Enter' && this.highlightedIndex >= 0) {
      this.selectSuggestion(this.filteredProducts[this.highlightedIndex]);
      event.preventDefault();
    } else if (event.key === 'Escape') {
      this.showSuggestions = false;
    }
  }

  // STOCK ACTIONS
  hasPendingUpdates(): boolean {
    return this.products.some(p => p.pendingAction && p.quantity > 0);
  }

  public getPendingUpdates(): any[] {
    return this.products
      .filter(p => p.pendingAction && p.quantity > 0)
      .map(p => ({
        id: p.id,
        quantity: p.quantity,
        action: p.pendingAction!
      }));
  }

  incrementStock(product: ProductStock): void {
    if (!product.quantity || product.quantity <= 0) {
      this.snackBar.open('Enter a valid quantity', 'Close', { duration: 3000 });
      return;
    }
    product.pendingAction = 'INCREMENT';
    this.snackBar.open(`+${product.quantity} queued`, 'Undo', { duration: 4000 })
      .onAction().subscribe(() => product.pendingAction = undefined);
  }

  decrementStock(product: ProductStock): void {
    if (!product.quantity || product.quantity <= 0) {
      this.snackBar.open('Enter a valid quantity', 'Close', { duration: 3000 });
      return;
    }
    if (product.quantity > product.currentStock) {
      this.snackBar.open('Cannot remove more than stock', 'Close', { duration: 4000 });
      return;
    }
    product.pendingAction = 'DECREMENT';
    this.snackBar.open(`-${product.quantity} queued`, 'Undo', { duration: 4000 })
      .onAction().subscribe(() => product.pendingAction = undefined);
  }

  saveAll(): void {
    const updates = this.getPendingUpdates();
    if (updates.length === 0) return;

    this.saving = true;

    this.productService.updateStock(updates).subscribe({
      next: () => {
        updates.forEach(u => {
          const p = this.products.find(x => x.id === u.id);
          if (p) {
            u.action === 'INCREMENT'
              ? p.currentStock += u.quantity
              : p.currentStock -= u.quantity;
            p.quantity = 0;
            p.pendingAction = undefined;
          }
        });
        this.snackBar.open('All stocks updated!', 'Close', { duration: 4000 });
        this.saving = false;
      },
      error: () => {
        this.snackBar.open('Update failed', 'Close', { duration: 5000 });
        this.saving = false;
      }
    });
  }
}
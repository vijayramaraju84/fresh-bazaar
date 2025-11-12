// src/app/core/header/header.component.ts
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
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
import { AuthService, User } from '../../auth/auth.service';
import { CartService } from '../../features/cart/cart.service';
import { SearchDialogComponent } from './search-dialog.component';

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
  private subs = new Subscription();

  @ViewChild('mobileSearchInput', { static: false }) mobileSearchInput?: ElementRef<HTMLInputElement>;

  constructor(
    private authService: AuthService,     // ← Updated
    private cartService: CartService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // USER: From AuthService (cached or fresh)
    this.user = this.authService.getCurrentUser();
    if (this.authService.isLoggedIn() && !this.user) {
      this.authService.getProfile().subscribe({
        next: (u) => this.user = u,
        error: () => this.user = null
      });
    }

    // CART COUNT: Works for Guest & Logged In
    this.subs.add(
      this.cartService.getCartCountObservable().subscribe(count => {
        this.cartItemCount = count;
      })
    );

    // PULSE ANIMATION ON ADD
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

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  goHome(): void {
    this.router.navigate(['/products']);
  }

  search(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/products'], {
        queryParams: { search: this.searchQuery.trim() }
      });
      this.searchQuery = '';
    }
  }

  openSearchDialog(): void {
    const dialogRef = this.dialog.open(SearchDialogComponent, {
      width: '90vw',
      maxWidth: '400px',
      panelClass: 'search-dialog',
      data: { query: this.searchQuery },
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.trim()) {
        this.searchQuery = result;
        this.search();
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.cartService.clearCart();
    this.router.navigate(['/login']);
  }
}
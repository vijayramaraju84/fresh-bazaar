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
import { AuthStateService } from '../../auth/auth-state.service';
import { CartService } from '../../features/cart/cart.service';
import { User } from '../../auth/auth.service';
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
    private authState: AuthStateService,
    private cartService: CartService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.authState.getUser$().subscribe(user => this.user = user)
    );

    this.subs.add(
      this.cartService.getCartCountObservable().subscribe(count => this.cartItemCount = count)
    );

    this.subs.add(
      this.cartService.itemAdded$.subscribe(() => {
        const btn = document.querySelector('.cart-icon') as HTMLElement;
        if (btn) {
          btn.classList.add('pulse');
          setTimeout(() => btn.classList.remove('pulse'), 600);
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
      this.searchQuery = ''; // Clear after search
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
    this.authState.logout();
    this.cartService.clearCart();
    this.router.navigate(['/login']);
  }
}
// src/app/core/header/header.component.ts
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
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
import { filter } from 'rxjs/operators';
import { AuthStateService } from '../../auth/auth-state.service';
import { CartService } from '../../features/cart/cart.service';
import { SearchDialogComponent } from './search-dialog.component';
import { User } from '../../auth/auth.service';
import { ThemeService } from '../../shared/theme/theme.service';
import { MatTooltipModule } from '@angular/material/tooltip';

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
    CommonModule,
    MatTooltipModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  user: User | null = null;
  searchQuery = '';
  cartItemCount = 0;

  isDark = true;

  private subs = new Subscription();

  @ViewChild('mobileSearchInput', { static: false }) mobileSearchInput?: ElementRef<HTMLInputElement>;

  constructor(
    private authState: AuthStateService,
    private cartService: CartService,
    private router: Router,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef,
    private elementRef: ElementRef,
    private themeService: ThemeService
  ) {this.isDark = this.themeService.isDark();}

  toggleTheme() {
    this.themeService.toggle();
    this.isDark = this.themeService.isDark();
  }

  ngOnInit(): void {
    // 🔹 Listen reactively to user state (immediate updates on login/logout)
    this.subs.add(
      this.authState.getUser$().subscribe(user => {
        this.user = user;
        this.cd.detectChanges(); // ensure header re-renders even if router doesn't reload
      })
    );

    // 🔹 Load cart count reactively
    this.subs.add(
      this.cartService.getCartCountObservable().subscribe(count => {
        this.cartItemCount = count;
        this.cd.detectChanges();
      })
    );

    // 🔹 Optional: add pulse animation on item added
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

    // 🔹 React to every route change — ensures state refresh when navigating to same route
    this.subs.add(
      this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
        this.cd.detectChanges();
      })
    );
  }

  ngAfterViewInit(): void {
  const header = (this.elementRef.nativeElement as HTMLElement);
  const height = header.offsetHeight + 'px';
  document.documentElement.style.setProperty('--header-height', height);
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
    this.authState.logout();  // Use the reactive logout
    this.cartService.clearCart();
    this.router.navigate(['/login']).then(() => this.cd.detectChanges());
  }
}

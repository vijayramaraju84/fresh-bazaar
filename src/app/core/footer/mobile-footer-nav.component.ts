import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { CartService } from '../../features/cart/cart.service';
import { AuthStateService } from '../../auth/auth-state.service';
import { User } from '../../auth/auth.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-mobile-footer-nav',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule, MatBadgeModule, RouterModule],
  template: `
    <div class="mobile-nav">
  <button class="nav-item" routerLink="/home" routerLinkActive="active">
    <mat-icon svgIcon="home"></mat-icon>
    <span>Home</span>
  </button>

  <button class="nav-item" routerLink="/categories" routerLinkActive="active">
    <mat-icon svgIcon="grid"></mat-icon>
    <span>Browse</span>
  </button>

  <button
    class="nav-item cart-icon"
    routerLink="/cart"
    [matBadge]="cartCount"
    matBadgeColor="accent"
    [matBadgeHidden]="cartCount === 0"
    matBadgeSize="small">
    <mat-icon svgIcon="cart"></mat-icon>
    <span>Cart</span>
  </button>

  <button class="nav-item" (click)="onAccountClick()">
    <mat-icon svgIcon="profile"></mat-icon>
    <span>{{ user ? 'Account' : 'Login' }}</span>
  </button>
</div>
  `,
  styleUrls: ['./mobile-footer-nav.component.css']
})
export class MobileFooterNavComponent implements OnInit, OnDestroy {
  user: User | null = null;
  cartCount = 0;
  private subs = new Subscription();

  constructor(
    private authState: AuthStateService,
    private cartService: CartService,
    private cd: ChangeDetectorRef,
    private ngZone: NgZone,
    private router: Router,
    private matIconRegistry: MatIconRegistry,
  private domSanitizer: DomSanitizer
  ) {
  this.matIconRegistry.addSvgIconLiteral('home', this.domSanitizer.bypassSecurityTrustHtml(`
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
    </svg>
  `));

  this.matIconRegistry.addSvgIconLiteral('grid', this.domSanitizer.bypassSecurityTrustHtml(`
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/>
    </svg>
  `));

  this.matIconRegistry.addSvgIconLiteral('cart', this.domSanitizer.bypassSecurityTrustHtml(`
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM17 18c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zM7 13h10l3-8H4.5l2.5 8z"/>
    </svg>
  `));

  this.matIconRegistry.addSvgIconLiteral('profile', this.domSanitizer.bypassSecurityTrustHtml(`
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  `));
}

  ngOnInit(): void {
    // 🔹 Update when auth state changes
    this.subs.add(
      this.authState.authStateChanged$.subscribe(() => {
        this.ngZone.run(() => {
          this.user = this.authState.isLoggedIn()
            ? this.authState['userSubject'].value
            : null;
          this.cd.detectChanges();
        });
      })
    );

    // 🔹 Initial reactive subscriptions
    this.subs.add(
      this.authState.getUser$().subscribe(user => {
        this.user = user;
        this.cd.detectChanges();
      })
    );

    this.subs.add(
      this.cartService.getCartCountObservable().subscribe(count => {
        this.cartCount = count;
        this.cd.detectChanges();
      })
    );

    this.subs.add(
      this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
        this.cd.detectChanges();
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  onAccountClick(): void {
    if (this.user) this.router.navigate(['/account']);
    else this.router.navigate(['/login']);
  }
}

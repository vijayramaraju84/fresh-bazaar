import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { CartService } from '../../features/cart/cart.service';
import { AuthStateService } from '../../auth/auth-state.service';
import { User } from '../../auth/auth.service';

@Component({
  selector: 'app-mobile-footer-nav',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule, MatBadgeModule, RouterModule],
  template: `
    <div class="mobile-nav">
      <button class="nav-item" routerLink="/home" routerLinkActive="active">
        <mat-icon>home</mat-icon>
        <span>Home</span>
      </button>

      <button class="nav-item" routerLink="/categories" routerLinkActive="active">
        <mat-icon>category</mat-icon>
        <span>Categories</span>
      </button>

      <button
        class="nav-item cart-icon"
        routerLink="/cart"
        [matBadge]="cartCount"
        matBadgeColor="accent"
        [matBadgeHidden]="cartCount === 0"
        [matBadgePosition]="'above after'"
        matBadgeSize="small">
        <mat-icon>shopping_cart</mat-icon>
        <span>Cart</span>
      </button>

      <button class="nav-item" (click)="onAccountClick()">
        <mat-icon>{{ user ? 'person' : 'login' }}</mat-icon>
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
    private router: Router
  ) {}

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

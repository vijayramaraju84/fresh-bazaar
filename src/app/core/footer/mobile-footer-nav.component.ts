import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';
import { CartService } from '../../features/cart/cart.service';
import { AuthService, User } from '../../auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-mobile-footer-nav',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule,
    RouterModule
  ],
  template: `
    <div class="mobile-nav">
      <!-- Home -->
      <button class="nav-item" routerLink="/home" routerLinkActive="active">
        <mat-icon>home</mat-icon>
        <span>Home</span>
      </button>

      <!-- Categories -->
      <button class="nav-item" routerLink="/categories" routerLinkActive="active">
        <mat-icon>category</mat-icon>
        <span>Categories</span>
      </button>

      <!-- Cart -->
      <button
        class="nav-item"
        routerLink="/cart"
        [matBadge]="cartCount"
        matBadgeColor="accent"
        [matBadgeHidden]="cartCount === 0"
        [matBadgePosition]="'above after'"
        matBadgeSize="small">
        <mat-icon>shopping_cart</mat-icon>
        <span class="cart-badge" *ngIf="cartItemCount > 0">{{ cartItemCount }}</span>
      </button>

      <!-- Profile / Login -->
      <button
        class="nav-item"
        [matMenuTriggerFor]="profileMenu"
        routerLinkActive="active">
        <mat-icon>{{ user ? 'person' : 'login' }}</mat-icon>
        <span>{{ user ? 'Profile' : 'Login' }}</span>
      </button>
    </div>

    <!-- Profile Menu -->
    <mat-menu #profileMenu="matMenu" xPosition="before" panelClass="nebula-menu-panel">
      <ng-container *ngIf="user; else loginTemplate">
        <div class="profile-section" mat-menu-item disabled>
          <div class="profile-info">
            <mat-icon class="profile-icon">person</mat-icon>
            <div>
              <div class="profile-username">{{ user.username }}</div>
              <div class="profile-role">{{ user.role || 'Customer' }}</div>
            </div>
          </div>
        </div>
        <mat-divider class="nebula-divider"></mat-divider>
        <button mat-menu-item routerLink="/orders">
          <mat-icon>shopping_bag</mat-icon> My Orders
        </button>
        <button mat-menu-item routerLink="/settings">
          <mat-icon>settings</mat-icon> Settings
        </button>
        <button *ngIf="user.role === 'ADMIN'" mat-menu-item routerLink="/admin/products/create">
          <mat-icon>add_circle</mat-icon> Create Product
        </button>
        <mat-divider class="nebula-divider"></mat-divider>
        <button mat-menu-item (click)="logout()">
          <mat-icon>logout</mat-icon> Logout
        </button>
      </ng-container>

      <ng-template #loginTemplate>
        <button mat-menu-item routerLink="/login">
          <mat-icon>login</mat-icon> Login
        </button>
      </ng-template>
    </mat-menu>
  `,
  styles: [`
    :host { display: block; }

    /* ───────── MOBILE NAV CONTAINER ───────── */
    .mobile-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #151318, #0c090e);
      border-top: 1px solid rgba(6, 11, 14, 0.3);
      display: flex;
      justify-content: space-around;
      padding: 10px 0;
      z-index: 1000;
      box-shadow: 0 -4px 20px rgba(106, 27, 154, 0.4);
      backdrop-filter: blur(8px);
      display: none;
    }

    @media (max-width: 767px) {
      .mobile-nav { display: flex; }
    }

    /* ───────── NAV ITEMS ───────── */
    .nav-item {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      background: none;
      border: none;
      color: #aaa;
      font-size: 0.7rem;
      border-radius: 14px;
      transition: all 0.3s ease;
      font-family: 'Roboto', sans-serif;
      font-weight: 400;
      width: 70px;
      height: 60px;
      padding: 6px 0;
      box-sizing: border-box;
      overflow: visible !important;
    }

    .nav-item mat-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      width: 32px;
      height: 32px;
      color: #00b0ff;
      transition: all 0.3s ease;
      text-shadow: 0 0 6px rgba(0, 176, 255, 0.5);
      overflow: visible !important;
      position: relative;
    }

    .nav-item span {
      font-size: 0.68rem;
      font-weight: 500;
      color: #ccc;
      letter-spacing: 0.4px;
    }

    .nav-item::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent, rgba(0, 176, 255, 0.25), transparent);
      transform: translateX(-100%);
      transition: transform 0.5s ease;
      pointer-events: none;
      border-radius: 14px;
      z-index: 0;
    }

    .nav-item:hover::before,
    .nav-item.active::before { transform: translateX(100%); }

    .nav-item:hover,
    .nav-item.active {
      color: #00b0ff;
      transform: translateY(-2px);
    }

    .nav-item:hover mat-icon,
    .nav-item.active mat-icon {
      color: #00b0ff;
      text-shadow: 0 0 14px rgba(0, 176, 255, 0.9);
      transform: scale(1.1);
    }

    .nav-item:hover span,
    .nav-item.active span { color: #00b0ff; }

    .cart-icon { position: relative; }
.cart-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #ff5722;
  color: white;
  font-size: 11px;
  font-weight: bold;
  min-width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
  animation: pop 0.3s ease-out;
}
.cart-badge-inline {
  margin-left: 8px;
  font-weight: 600;
  color: #ff9800;
}

    /* ───────── ULTRA-FUTURISTIC CART BADGE ───────── */
    .nav-item[matBadge],
    .mat-mdc-badge {
      overflow: visible !important;
      position: relative !important;
      z-index: 5 !important;
    }

    .mat-mdc-badge-content,
    .mat-mdc-badge-content-inner {
      position: absolute !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      visibility: visible !important;
      opacity: 1 !important;
      min-width: 22px !important;
      height: 22px !important;
      font-size: 12px !important;
      font-weight: 700 !important;
      color: #fff !important;
      border-radius: 50% !important;
      right: -8px !important;
      top: -8px !important;
      transform: translate(50%, -50%) !important;
      z-index: 12 !important;
      box-sizing: border-box;
      letter-spacing: 0.3px;
      text-shadow: 0 0 6px rgba(255, 255, 255, 0.8);

      /* Holographic shifting neon core */
      background: conic-gradient(
        from 180deg at 50% 50%,
        #ff0077,
        #ff66ff,
        #00d9ff,
        #ff0077
      ) !important;
      background-size: 200% 200% !important;
      animation:
        holoShift 3s linear infinite,
        badgePulse 2s ease-in-out infinite !important;

      box-shadow:
        0 0 6px rgba(255, 0, 140, 0.9),
        0 0 14px rgba(255, 0, 200, 0.7),
        0 0 26px rgba(255, 64, 255, 0.6),
        inset 0 0 8px rgba(255, 255, 255, 0.3) !important;
    }

    @keyframes holoShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    @keyframes badgePulse {
      0%, 100% {
        transform: translate(50%, -50%) scale(1);
        box-shadow:
          0 0 6px rgba(255, 0, 140, 0.9),
          0 0 14px rgba(255, 0, 200, 0.7),
          0 0 26px rgba(255, 64, 255, 0.6),
          inset 0 0 8px rgba(255, 255, 255, 0.3);
      }
      50% {
        transform: translate(50%, -50%) scale(1.25);
        box-shadow:
          0 0 10px rgba(255, 0, 200, 1),
          0 0 22px rgba(255, 0, 255, 0.9),
          0 0 40px rgba(255, 64, 255, 0.8),
          inset 0 0 12px rgba(255, 255, 255, 0.5);
      }
    }

    .mat-badge-content {
      all: unset !important;
    }

    @media (max-width: 400px) {
      .nav-item { width: 65px; height: 55px; }
      .nav-item mat-icon { font-size: 1.4rem; }
      .mat-mdc-badge-content { right: -5px !important; top: -5px !important; }
    }

    /* ───────── PROFILE MENU ───────── */
    .profile-section {
      padding: 16px 20px;
      background: rgba(106, 27, 154, 0.15);
      border-bottom: 1px solid rgba(0, 176, 255, 0.2);
    }

    .profile-info { display: flex; align-items: center; gap: 14px; }

    .profile-icon {
      color: #00b0ff;
      font-size: 28px;
      width: 36px;
      height: 36px;
      text-shadow: 0 0 12px rgba(0, 176, 255, 0.7);
    }

    .profile-username {
      font-family: 'Orbitron', sans-serif;
      font-weight: 700;
      font-size: 16px;
      color: #00b0ff;
      text-shadow: 0 0 8px rgba(0, 176, 255, 0.5);
    }

    .profile-role {
      font-size: 12px;
      color: #aaa;
      font-weight: 500;
      letter-spacing: 1px;
    }

    .nebula-divider {
      border-top-color: rgba(0, 176, 255, 0.3) !important;
      margin: 6px 0;
    }

    ::ng-deep .cdk-overlay-backdrop {
      background: rgba(10, 5, 20, 0.85) !important;
    }
  `]
})
export class MobileFooterNavComponent implements OnInit, OnDestroy {
  cartCount = 0;
  user: User | null = null;
  cartItemCount = 0;

  private userSub?: Subscription;
  private cartSub?: Subscription;

  constructor(
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userSub = this.authService.user$.subscribe(user => this.user = user);
    this.cartSub = this.cartService.getCartCountObservable().subscribe(count => this.cartCount = count);
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
    this.cartSub?.unsubscribe();
  }

  logout(): void {
    this.authService.logout();
    this.cartService.clearCart();
  }
}

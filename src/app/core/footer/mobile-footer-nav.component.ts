// src/app/core/mobile-footer-nav/mobile-footer-nav.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';
import { CartService } from '../../features/cart/cart.service';
import { AuthService, User } from '../../auth/auth.service';

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

      <!-- Cart — SAME CLASS, NO EXTRA -->
      <button 
        class="nav-item" 
        routerLink="/cart" 
        [matBadge]="cartCount" 
        matBadgeColor="accent"
        [matBadgeHidden]="cartCount === 0"
        [matBadgePosition]="'above after'"
        matBadgeSize="small">
        <mat-icon>shopping_cart</mat-icon>
        <span>Cart</span>
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

    <!-- NEBULA PROFILE MENU -->
    <mat-menu #profileMenu="matMenu" 
              xPosition="before" 
              class="nebula-menu" 
              backdropClass="nebula-backdrop">
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

    /* MOBILE NAV — NEBULA THEME */
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

    /* ALL NAV ITEMS — UNIFIED STYLE */
    .nav-item {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      background: none;
      border: none;
      color: #aaa;
      font-size: 0.75rem;
      padding: 10px 14px;
      border-radius: 18px;
      transition: all 0.3s ease;
      overflow: visible;
      font-family: 'Roboto', sans-serif;
      font-weight: 400;
      z-index: 1;
    }

    .nav-item mat-icon {
      font-size: 1.6rem;
      width: 28px;
      height: 28px;
      color: #00b0ff;
      transition: all 0.3s ease;
      text-shadow: 0 0 8px rgba(0, 176, 255, 0.5);
      position: relative;
      z-index: 2;
    }

    .nav-item span {
      font-size: 0.7rem;
      font-weight: 500;
      color: #ccc;
      letter-spacing: 0.5px;
      position: relative;
      z-index: 2;
    }

    /* RIPPLE EFFECT */
    .nav-item::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent, rgba(0, 176, 255, 0.25), transparent);
      transform: translateX(-100%);
      transition: transform 0.5s ease;
      pointer-events: none;
      border-radius: 18px;
      z-index: 0;
    }

    .nav-item:hover::before,
    .nav-item.active::before {
      transform: translateX(100%);
    }

    .nav-item:hover,
    .nav-item.active {
      color: #00b0ff;
      transform: translateY(-3px);
    }

    .nav-item:hover mat-icon,
    .nav-item.active mat-icon {
      color: #00b0ff;
      text-shadow: 0 0 16px rgba(0, 176, 255, 0.9);
      transform: scale(1.15);
    }

    .nav-item:hover span,
    .nav-item.active span {
      color: #00b0ff;
    }

    /* BADGE — FLOATS ABOVE */
    .mat-badge-accent {
      --mat-badge-background-color: #ff4081;
      --mat-badge-text-color: white;
      --mat-badge-size: 18px;
      font-size: 10px;
      font-weight: bold;
    }

    /* ENSURE BADGE DOESN'T BLOCK HOVER */
    .mat-badge-medium.mat-badge-above .mat-badge-content {
      top: -6px;
      right: -6px;
    }

    /* NEBULA MENU — UNCHANGED */
    .nebula-menu {
      min-width: 280px !important;
      border: 1px solid rgba(10, 23, 29, 0.4) !important;
      border-radius: 18px !important;
      box-shadow: 
        0 0 30px rgba(12, 6, 15, 0.6),
        0 0 60px rgba(0, 176, 255, 0.3),
        inset 0 0 20px rgba(0, 176, 255, 0.1) !important;
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      overflow: hidden;
      animation: menuFloat 0.35s ease-out;
      margin-top: 8px;
      background: rgba(0, 0, 0, 0.43) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
    }

    .profile-section {
      padding: 16px 20px;
      background: linear-gradient(90deg, rgba(106, 27, 154, 0.2), rgba(0, 176, 255, 0.1));
      border-bottom: 1px solid rgba(0, 176, 255, 0.2);
    }

    .profile-info {
      display: flex;
      align-items: center;
      gap: 14px;
    }

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

    .nebula-menu .mat-mdc-menu-item {
      color: #e0e0e0 !important;
      font-family: 'Roboto', sans-serif !important;
      font-size: 0.95rem !important;
      height: 48px !important;
      line-height: 48px !important;
      padding: 0 24px !important;
      transition: all 0.3s ease !important;
      position: relative;
      overflow: hidden;
    }

    .nebula-menu .mat-mdc-menu-item::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent, rgba(0, 176, 255, 0.2), transparent);
      transform: translateX(-100%);
      transition: transform 0.5s ease;
    }

    .nebula-menu .mat-mdc-menu-item:hover::before {
      transform: translateX(100%);
    }

    .nebula-menu .mat-mdc-menu-item:hover,
    .nebula-menu .mat-mdc-menu-item:focus {
      background: rgba(0, 176, 255, 0.15) !important;
      color: #00b0ff !important;
    }

    .nebula-menu .mat-mdc-menu-item mat-icon {
      color: #00b0ff;
      margin-right: 14px;
      font-size: 20px;
      width: 24px;
      height: 24px;
    }

    .nebula-divider {
      border-top-color: rgba(0, 176, 255, 0.3) !important;
      margin: 6px 0;
    }

    @keyframes menuFloat {
      from { opacity: 0; transform: translateY(-12px) scale(0.94); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
  `]
})
export class MobileFooterNavComponent implements OnInit {
  cartCount = 0;
  user: User | null = null;

  constructor(
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cartService.getCartCountObservable().subscribe(count => {
      this.cartCount = count;
    });

    this.user = this.authService.getCurrentUser();
    if (this.authService.isLoggedIn() && !this.user) {
      this.authService.getProfile().subscribe(u => this.user = u);
    }
  }

  logout(): void {
    this.authService.logout();
    this.cartService.clearCart();
    this.user = null;
  }
}
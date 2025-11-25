// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { ProductsComponent } from './features/products/products.component';
import { CartComponent } from './features/cart/cart.component';
import { CheckoutComponent } from './features/checkout/checkout.component';
import { OrderConfirmationComponent } from './features/order-confirmation/order-confirmation.component';
import { AdminProductCreateComponent } from './features/products/AdminProductCreate/admin-product-create.component';
import { OrdersComponent } from './features/orders/orders.component';
import { AuthGuard } from './auth/auth.guard';
import { ReverseAuthGuard } from './auth/reverse-auth.guard';

export const routes: Routes = [
  // ROOT REDIRECT
  { path: '', redirectTo: '/products', pathMatch: 'full' },

  // PUBLIC ROUTES
  { path: 'login', component: LoginComponent, canActivate: [ReverseAuthGuard] },

  // PRODUCTS LIST — /products or /product
  { path: 'products', component: ProductsComponent },
  { path: 'product', redirectTo: '/products', pathMatch: 'full' }, // ← FIX: /product → products

  // PRODUCT DETAIL — /product/4
  {
    path: 'product/:id',
    loadComponent: () =>
      import('./features/products/Product-details/product-detail.component')
        .then(m => m.ProductDetailComponent)
  },

  // AUTH PROTECTED ROUTES
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { path: 'cart', component: CartComponent },
      { path: 'checkout', component: CheckoutComponent },
      { path: 'order-confirmation', component: OrderConfirmationComponent },
      { path: 'orders', component: OrdersComponent },
      { path: 'settings', loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent) },
      { path: 'account', loadComponent: () => import('./features/account/account.component').then(m => m.AccountComponent) },
      { path: 'admin/products/create', component: AdminProductCreateComponent }
    ]
  },

  // 404 FALLBACK
  { path: '**', redirectTo: '/products' }
];
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

  // ROOT → load products (no redirect!)
  {
    path: '',
    component: ProductsComponent
  },

  // PUBLIC ROUTES
  { path: 'login', component: LoginComponent, canActivate: [ReverseAuthGuard] },

  // PRODUCTS LIST
  { path: 'products', component: ProductsComponent },

  // /product → /products
  { path: 'product', redirectTo: '/products', pathMatch: 'full' },

  // PRODUCT DETAIL — /product/:id
  {
    path: 'product/:id',
    loadComponent: () =>
      import('./features/products/Product-details/product-detail.component')
        .then(m => m.ProductDetailComponent)
  },

  // AUTH-PROTECTED ROUTES
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { path: 'cart', component: CartComponent },
      { path: 'checkout', component: CheckoutComponent },
      { path: 'order-confirmation', component: OrderConfirmationComponent },
      { path: 'orders', component: OrdersComponent },

      { path: 'settings', loadComponent: () =>
          import('./features/settings/settings.component')
            .then(m => m.SettingsComponent)
      },

      { path: 'account', loadComponent: () =>
          import('./features/account/account.component')
            .then(m => m.AccountComponent)
      },

      { path: 'admin/products/create', component: AdminProductCreateComponent }
    ]
  },

  { path: 'about', loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent) },
{ path: 'contact', loadComponent: () => import('./features/contactus/contact.component').then(m => m.ContactComponent) },
{ path: 'privacy', loadComponent: () => import('./features/privacy/privacy.component').then(m => m.PrivacyComponent) },
{ path: 'terms', loadComponent: () => import('./features/terms/terms.component').then(m => m.TermsComponent) },
  // 404 → PRODUCTS
  { path: '**', redirectTo: '/products' }
];

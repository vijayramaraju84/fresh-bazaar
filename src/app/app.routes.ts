// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { ProductsComponent } from './features/products/products.component';
import { CartComponent } from './features/cart/cart.component';
import { CheckoutComponent } from './features/checkout/checkout.component';
import { OrderConfirmationComponent } from './features/order-confirmation/order-confirmation.component';
import { AdminProductCreateComponent } from './features/products/AdminProductCreate/admin-product-create.component';
import { AuthGuard } from './auth/auth.guard';
import { ReverseAuthGuard } from './auth/reverse-auth.guard';

export const routes: Routes = [
  // === PUBLIC ROUTES (no login needed) ===
  {
    path: '',
    children: [
      // Default: go to products
      { path: '', redirectTo: 'products', pathMatch: 'full' },

      // Products page — PUBLIC (guest can browse)
      { path: 'products', component: ProductsComponent },

      // Login page — only show if NOT logged in
      {
        path: 'login',
        component: LoginComponent,
        canActivate: [ReverseAuthGuard]
      }
    ]
  },

  // === PROTECTED ROUTES (require login) ===
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { path: 'cart', component: CartComponent },
      { path: 'checkout', component: CheckoutComponent },
      { path: 'order-confirmation', component: OrderConfirmationComponent },
      { path: 'admin/products/create', component: AdminProductCreateComponent }
    ]
  },

  // === 404 FALLBACK ===
  { path: '**', redirectTo: '' }
];
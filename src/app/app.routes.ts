import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { ProductsComponent } from './features/products/products.component';
import { CartComponent } from './features/cart/cart.component';
import { CheckoutComponent } from './features/checkout/checkout.component';
import { OrderConfirmationComponent } from './features/order-confirmation/order-confirmation.component';
import { AdminProductCreateComponent } from './features/products/AdminProductCreate/admin-product-create.component';
import { AuthGuard } from './auth/auth.guard';
import { ReverseAuthGuard } from './auth/reverse-auth.guard';
import { OrdersComponent } from './features/orders/orders.component';

export const routes: Routes = [

  // =========================
  // 📌 PUBLIC ROUTES
  // =========================
  {
    path: '',
    children: [
      { path: '', redirectTo: 'products', pathMatch: 'full' },

      { path: 'products', component: ProductsComponent },

      {
        path: 'login',
        component: LoginComponent,
        canActivate: [ReverseAuthGuard]
      },

      // 🔥 Product details page (FULL PAGE)
      {
        path: 'product/:id',
        loadComponent: () =>
          import('./features/products/Product-details/product-detail.component')
            .then(m => m.ProductDetailComponent)
      },

      // 📌 Account — requires login
      {
        path: 'account',
        loadComponent: () =>
          import('./features/account/account.component')
            .then(m => m.AccountComponent),
        canActivate: [AuthGuard]
      },

      // 📌 Settings — requires login
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/settings.component')
            .then(m => m.SettingsComponent),
        canActivate: [AuthGuard]
      },

      // 📌 Orders — requires login
      {
        path: 'orders',
        component: OrdersComponent,
        canActivate: [AuthGuard]
      }
    ]
  },

  // =========================
  // 🔒 AUTH REQUIRED ROUTES
  // =========================
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

  // =========================
  // 🚫 404 FALLBACK
  // =========================
  { path: '**', redirectTo: '' }
];

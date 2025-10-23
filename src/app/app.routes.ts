import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { ProductsComponent } from './features/products/products.component';
import { CartComponent } from './features/cart/cart.component';
import { CategoriesComponent } from './features/categories/categories.component';
import { CheckoutComponent } from './features/checkout/checkout.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: ProductsComponent },
  { path: 'cart', component: CartComponent },
  { path: 'categories', component: CategoriesComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: '**', redirectTo: '/login' }
];
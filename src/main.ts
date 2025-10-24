import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { importProvidersFrom } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { provideHttpClient } from '@angular/common/http';
import { LoginComponent } from './app/auth/login/login.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter([
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
      // { path: 'home', component: HomeComponent },
      // { path: 'cart', component: CartComponent },
      { path: '**', redirectTo: 'home' } // catch-all
    ]),
    provideAnimations(),
    provideHttpClient(),
    importProvidersFrom(
      FormsModule,
      MatToolbarModule,
      MatIconModule,
      MatButtonModule,
      MatInputModule,
      MatSnackBarModule
    )
  ]
}).catch(err => console.error(err));
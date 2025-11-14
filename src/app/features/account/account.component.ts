import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule,RouterLink, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { AuthService, User } from '../../auth/auth.service';
import { Subscription } from 'rxjs';
import { AuthStateService } from '../../auth/auth-state.service';
import { CartService } from '../cart/cart.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    RouterLink
  ],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit, OnDestroy {
  user: User | null = null;
  private userSub?: Subscription;

  constructor(private authService: AuthService,
              private cartService: CartService,
              private router: Router,
              private cd: ChangeDetectorRef,
              private authState: AuthStateService
  ) {}

  ngOnInit(): void {
    this.userSub = this.authService.user$.subscribe(u => this.user = u);
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }

  logout(): void {
    this.authState.logout();  // Use the reactive logout
    this.cartService.clearCart();
    this.router.navigate(['/login']).then(() => this.cd.detectChanges());
  }
}

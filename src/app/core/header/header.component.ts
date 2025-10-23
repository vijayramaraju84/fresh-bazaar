import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    FormsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    RouterLink,
    CommonModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  user: User | null = null;
  searchQuery = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.getUser().subscribe(user => this.user = user);
  }

  search() {
    console.log('Search:', this.searchQuery);
    this.router.navigate(['/home'], { queryParams: { search: this.searchQuery } });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
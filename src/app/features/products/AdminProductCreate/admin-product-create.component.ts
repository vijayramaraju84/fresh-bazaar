import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../../auth/auth.service';
import { ProductService } from '../../products/product.service';

@Component({
  selector: 'app-admin-product-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    CommonModule
  ],
  templateUrl: './admin-product-create.component.html',
  styleUrls: ['./admin-product-create.component.css']
})
export class AdminProductCreateComponent implements OnInit {
  productForm: FormGroup;
  user: User | null = null;
  categories = ['Electronics', 'Fashion', 'Accessories'];
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private productService: ProductService,
    private router: Router
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.maxLength(500)],
      price: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      image: [null, Validators.required]
    });
  }

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.authService.getProfile().subscribe({
        next: (user) => {
          this.user = user;
          if (user.role !== 'ADMIN') {
            this.errorMessage = 'Access denied: Admin role required';
            this.router.navigate(['/products']);
          }
        },
        error: (err) => {
          console.error('Failed to load user profile:', err);
          this.authService.logout();
          this.router.navigate(['/login']);
        }
      });
    } else {
      this.router.navigate(['/login']);
    }
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.productForm.patchValue({ image: input.files[0] });
    }
  }

  onSubmit() {
    if (this.productForm.invalid) {
      this.errorMessage = 'Please fill out all required fields correctly';
      return;
    }

    const formData = new FormData();
    formData.append('name', this.productForm.get('name')?.value);
    formData.append('description', this.productForm.get('description')?.value);
    formData.append('price', this.productForm.get('price')?.value);
    formData.append('stock', this.productForm.get('stock')?.value);
    formData.append('category', this.productForm.get('category')?.value);
    formData.append('image', this.productForm.get('image')?.value);

    this.productService.createProduct(formData).subscribe({
      next: () => {
        this.router.navigate(['/products']);
      },
      error: (err) => {
        this.errorMessage = 'Failed to create product: ' + (err.error?.message || 'Unknown error');
      }
    });
  }
}
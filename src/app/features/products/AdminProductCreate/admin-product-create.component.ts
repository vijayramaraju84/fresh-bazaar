// src/app/features/products/AdminProductCreate/admin-product-create.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
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
    MatIconModule,
    CommonModule
  ],
  templateUrl: './admin-product-create.component.html',
  styleUrls: ['./admin-product-create.component.css']
})
export class AdminProductCreateComponent implements OnInit {
  productForm: FormGroup;
  user: User | null = null;
  categories = ['Electronics', 'Fashion', 'Accessories', 'Vegetables', 'LeafyVegetables', 'Fruits'];
  errorMessage: string | null = null;

  // Multiple image handling
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private productService: ProductService,
    public router: Router
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.maxLength(500)],
      price: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      images: [[], Validators.required]  // Array of files
    });
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.authService.getProfile().subscribe({
        next: (user) => {
          this.user = user;
          if (user.role !== 'ADMIN') {
            this.router.navigate(['/products']);
          }
        },
        error: () => {
          this.authService.logout();
          this.router.navigate(['/login']);
        }
      });
    } else {
      this.router.navigate(['/login']);
    }
  }

  // Handle multiple file selection
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const newFiles = Array.from(input.files);
    const total = this.selectedFiles.length + newFiles.length;

    if (total > 5) {
      this.errorMessage = 'Maximum 5 images allowed';
      return;
    }

    // Add new files
    this.selectedFiles = [...this.selectedFiles, ...newFiles];

    // Generate previews
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviews = [...this.imagePreviews, e.target.result];
      };
      reader.readAsDataURL(file);
    });

    // Update form control
    this.productForm.patchValue({ images: this.selectedFiles });
    this.errorMessage = null;
  }

  // Remove image
  removeImage(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
    this.productForm.patchValue({ images: this.selectedFiles });
  }

  // Submit with FormData
  onSubmit(): void {
    if (this.productForm.invalid || this.selectedFiles.length === 0) {
      this.errorMessage = 'Please fill all required fields and upload at least one image';
      return;
    }

    const formData = new FormData();
    formData.append('name', this.productForm.get('name')?.value);
    formData.append('description', this.productForm.get('description')?.value);
    formData.append('price', this.productForm.get('price')?.value);
    formData.append('stock', this.productForm.get('stock')?.value);
    formData.append('category', this.productForm.get('category')?.value);

    // Append multiple images
    this.selectedFiles.forEach((file, i) => {
      formData.append('images', file, file.name);
    });

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
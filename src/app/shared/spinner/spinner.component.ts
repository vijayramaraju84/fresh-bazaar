// src/app/shared/spinner/spinner.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="spinner-container">
      <mat-progress-spinner
        mode="indeterminate"
        diameter="50"
        strokeWidth="5"
        color="accent"
        aria-label="Loading products"
      ></mat-progress-spinner>
      <p>Loading products...</p>
    </div>
  `,
  styles: [`
    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 50px;
      color: #fff;
      background: #1a1a1a;
      min-height: 200px;
    }
    mat-progress-spinner {
      margin-bottom: 15px;
    }
    p {
      font-family: 'Orbitron', sans-serif;
      font-size: 16px;
      color: #ff9800;
    }
  `]
})
export class SpinnerComponent {}
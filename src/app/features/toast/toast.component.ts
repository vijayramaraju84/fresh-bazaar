import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from './toast.service';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="toast-container"
      *ngIf="toast"
      [@slideInOut]
      [ngClass]="'toast-' + toast.type"
      role="alert"
      aria-live="assertive"
    >
      <span class="toast-icon" aria-hidden="true">
        <ng-container [ngSwitch]="toast.type">
          <span *ngSwitchCase="'success'">Checkmark</span>
          <span *ngSwitchCase="'error'">Cross</span>
          <span *ngSwitchCase="'info'">Info</span>
        </ng-container>
      </span>
      <span class="toast-message">{{ toast.message }}</span>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #333;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      gap: 10px;
      z-index: 10000;
      font-size: 14px;
      max-width: 90%;
    }
    .toast-success { border-left: 4px solid #4caf50; }
    .toast-error { border-left: 4px solid #f44336; }
    .toast-info { border-left: 4px solid #2196f3; }

    .toast-icon {
      font-weight: bold;
    }
  `],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateY(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class ToastComponent implements OnInit {
  toast: Toast | null = null;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.toastService.toast$.subscribe(toast => {
      this.toast = toast;
    });
  }
}
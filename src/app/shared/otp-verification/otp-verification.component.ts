import {
  Component,
  EventEmitter,
  Output,
  Input,
  ViewChildren,
  QueryList,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-otp-verification',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatInputModule, MatIconModule],
  templateUrl: './otp-verification.component.html',
  styleUrls: ['./otp-verification.component.css']
})
export class OtpVerificationComponent {
  @Input() email: string | null = null;
  @Output() verified = new EventEmitter<string>();
  @Output() closed = new EventEmitter<void>();

  otp: string[] = ['', '', '', '', '', ''];
  otpInputs = Array(6);
  isSubmitting = false;

  @ViewChildren('otpInput') inputs!: QueryList<ElementRef>;

  /** Handle number input — only allow one digit per box */
  onInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/[^0-9]/g, ''); // only digits
    this.otp[index] = value;

    // Move to next box automatically
    if (value && index < this.otp.length - 1) {
      const nextInput = this.inputs.toArray()[index + 1].nativeElement;
      nextInput.focus();
    }
  }

  /** Handle backspace — move to previous input */
  onBackspace(index: number): void {
    if (!this.otp[index] && index > 0) {
      const prevInput = this.inputs.toArray()[index - 1].nativeElement;
      prevInput.focus();
    }
  }

  /** Handle pasting full OTP */
  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pasted = event.clipboardData?.getData('text')?.replace(/[^0-9]/g, '') || '';
    const digits = pasted.slice(0, this.otp.length).split('');

    digits.forEach((d, i) => {
      this.otp[i] = d;
      const input = this.inputs.toArray()[i]?.nativeElement;
      if (input) input.value = d;
    });
  }

  /** Combine digits and emit */
  verifyOtp(): void {
    const code = this.otp.join('');
    if (code.length === this.otp.length) {
      this.isSubmitting = true;
      this.verified.emit(code);
    }
  }

  /** Close modal */
  closeModal(): void {
    this.closed.emit();
  }
}

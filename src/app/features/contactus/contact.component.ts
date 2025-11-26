// src/app/features/contact/contact.component.ts
import { Component } from '@angular/core';
import { MatIcon } from "@angular/material/icon";
import { MatFormField, MatLabel } from "@angular/material/input";

@Component({
  selector: 'app-contact',
  standalone: true,
  template: `
<div class="contact-page">
  <h1 class="title">Get in Touch</h1>
  <p class="subtitle">We'd love to hear from you!</p>

  <div class="contact-grid">
    <div class="contact-info">
      <div class="info-card">
        <mat-icon>phone</mat-icon>
        <h3>Call Us</h3>
        <p>+91 **********</p>
        <p>Mon-Sun: 7AM - 9PM</p>
      </div>

      <div class="info-card">
        <mat-icon>email</mat-icon>
        <h3>Email Us</h3>
        <p>support.freshbazaar&#64;gmail.com</p>
        <p>We'll reply within 24 hours</p>
      </div>

      <div class="info-card">
        <mat-icon>location_on</mat-icon>
        <h3>Visit Us</h3>
        <p></p>
        <p>Manikonda, Hyderabad 500032</p>
      </div>
    </div>

    <div class="contact-form">
      <h3>Send us a Message</h3>
      <form (ngSubmit)="sendMessage()">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Your Name</mat-label>
          <input matInput required />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email</mat-label>
          <input matInput type="email" required />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Message</mat-label>
          <textarea matInput rows="5" required></textarea>
        </mat-form-field>

        <button mat-raised-button color="primary" type="submit" class="send-btn">
          Send Message
        </button>
      </form>
    </div>
  </div>
</div>
  `,
  styles: [`
    .contact-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      margin: 3rem 0;
    }
    .contact-card {
      background: rgba(255,255,255,0.05);
      padding: 2rem;
      border-radius: 20px;
      text-align: center;
      border: 1px solid rgba(0,176,255,0.2);
      transition: all 0.3s ease;
    }
    .contact-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 0 25px rgba(0,176,255,0.3);
    }
    .contact-card mat-icon {
      font-size: 3.5rem;
      color: #00b0ff;
      margin-bottom: 1rem;
    }
    h3 { color: #00b0ff; margin: 0.5rem 0; }
    p { margin: 0.5rem 0; font-size: 1.1rem; }
    small { color: #aaa; }
    /* Reuse legal-page styles from about */
  `],
  imports: [MatIcon, MatFormField, MatLabel]
})
export class ContactComponent {
sendMessage() {
throw new Error('Method not implemented.');
}
}
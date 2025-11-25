// src/app/features/terms/terms.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-terms',
  standalone: true,
  template: `
    <!-- src/app/features/terms/terms.component.html -->
<div class="policy-page">
  <h1 class="title">Terms of Service</h1>
  <p class="update-date">Last updated: March 2025</p>

  <div class="policy-content">
    <section>
      <h2>1. Acceptance of Terms</h2>
      <p>By using Fresh Bazaar, you agree to these Terms of Service and our Privacy Policy.</p>
    </section>

    <section>
      <h2>2. Orders & Delivery</h2>
      <p>We deliver fresh produce daily. Delivery times may vary based on your location and order volume.</p>
    </section>

    <section>
      <h2>3. Returns & Refunds</h2>
      <p>Fresh produce cannot be returned. In case of damaged or incorrect items, contact us within 2 hours of delivery for a refund or replacement.</p>
    </section>

    <section>
      <h2>4. Pricing</h2>
      <p>Prices may change without notice due to market fluctuations. The price at checkout is final.</p>
    </section>

    <section>
      <h2>5. Account Responsibility</h2>
      <p>You are responsible for maintaining the confidentiality of your account and password.</p>
    </section>

    <section>
      <h2>6. Contact</h2>
      <p>For any questions, email us at support.freshbazaar&#64;gmail.com</p>
    </section>
  </div>
</div>
  `,
  styles: [`
    section { margin: 3rem 0; text-align: left; max-width: 800px; margin-left: auto; margin-right: auto; }
    h2 { text-align: left; }
  `]
})
export class TermsComponent { }
// src/app/features/privacy/privacy.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-privacy',
  standalone: true,
  template: `
<div class="policy-page">
  <h1 class="title">Privacy Policy</h1>
  <p class="update-date">Last updated: March 2025</p>

  <div class="policy-content">
    <section>
      <h2>1. Information We Collect</h2>
      <p>We collect information you provide directly to us, such as when you create an account, place an order, or contact us for support.</p>
    </section>

    <section>
      <h2>2. How We Use Your Information</h2>
      <p>To process and deliver your orders, communicate with you, improve our services, and provide customer support.</p>
    </section>

    <section>
      <h2>3. Information Sharing</h2>
      <p>We do not sell your personal information. We may share information with trusted service providers who assist us in operating our website and delivering orders.</p>
    </section>

    <section>
      <h2>4. Security</h2>
      <p>We use industry-standard encryption and security measures to protect your information.</p>
    </section>

    <section>
      <h2>5. Your Rights</h2>
      <p>You have the right to access, correct, or delete your personal information at any time.</p>
    </section>

    <section>
      <h2>6. Contact Us</h2>
      <p>If you have questions about this Privacy Policy, please contact us at support.freshbazaar&#64;gmail.com</p>
    </section>
  </div>
</div>
  `,
  styles: [`
    section { margin: 3rem 0; text-align: left; max-width: 800px; margin-left: auto; margin-right: auto; }
    h2 { text-align: left; }
  `]
})
export class PrivacyComponent { }
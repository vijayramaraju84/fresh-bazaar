// src/app/features/about/about.component.ts
import { Component } from '@angular/core';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-about',
  standalone: true,
  template: `
    <!-- src/app/features/about/about.component.html -->
<div class="about-page">
  <div class="hero-section">
    <h1 class="title">About Fresh Bazaar</h1>
    <p class="subtitle">Your Trusted Online Vegetable & Fruit Store</p>
  </div>

  <div class="content">
    <div class="section">
      <h2>Our Story</h2>
      <p>Fresh Bazaar was born from a simple idea: to bring farm-fresh vegetables and fruits directly to your doorstep. We started in 2024 with a mission to support local farmers and provide families with the freshest produce — no middlemen, no chemicals, just pure goodness.</p>
    </div>

    <div class="section mission">
      <h2>Our Mission</h2>
      <div class="mission-grid">
        <div class="card">
          <mat-icon>eco</mat-icon>
          <h3>Fresh & Organic</h3>
          <p>100% farm-fresh, chemical-free produce</p>
        </div>
        <div class="card">
          <mat-icon>support</mat-icon>
          <h3>Support Farmers</h3>
          <p>Fair prices directly to local farmers</p>
        </div>
        <div class="card">
          <mat-icon>local_shipping</mat-icon>
          <h3>Fast Delivery</h3>
          <p>Same-day delivery in your city</p>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>Why Choose Us?</h2>
      <ul class="features">
        <li>Handpicked quality produce daily</li>
        <li>No preservatives or wax coating</li>
        <li>Direct from farm to your table</li>
        <li>Affordable prices with no hidden charges</li>
        <li>Eco-friendly packaging</li>
      </ul>
    </div>

    <div class="team">
      <h2>Meet Our Team</h2>
      <p>We are a passionate group of food lovers, farmers, and tech enthusiasts working together to make healthy eating accessible to everyone.</p>
    </div>
  </div>
</div>
  `,
  styles: [`
    .legal-page {
      max-width: 900px;
      margin: 2rem auto;
      padding: 2rem;
      font-family: 'Roboto', sans-serif;
      line-height: 1.8;
      color: #e0e0e0;
      text-align: center;
    }
    h1 {
      font-family: 'Orbitron', sans-serif;
      font-size: 3rem;
      color: #00b0ff;
      text-shadow: 0 0 15px rgba(0,176,255,0.5);
      margin-bottom: 0.5rem;
    }
    .subtitle {
      color: #aaa;
      font-size: 1.3rem;
      margin-bottom: 3rem;
    }
    h2 {
      font-family: 'Orbitron', sans-serif;
      color: #00b0ff;
      font-size: 2rem;
      margin: 3rem 0 1rem;
    }
    ul {
      text-align: left;
      max-width: 600px;
      margin: 1.5rem auto;
      padding-left: 2rem;
    }
    li {
      margin: 0.8rem 0;
      font-size: 1.1rem;
    }
    .back-link a {
      color: #00b0ff;
      text-decoration: none;
      font-size: 1.2rem;
      font-weight: 500;
    }
    .back-link a:hover {
      text-decoration: underline;
    }
  `],
  imports: [MatIcon]
})
export class AboutComponent { }
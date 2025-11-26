// src/app/services/theme.service.ts
import { Injectable, Inject, Renderer2, RendererFactory2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private renderer: Renderer2;
  private overlay!: HTMLElement;

  constructor(
    private rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.overlay = this.document.getElementById('themeOverlay')!;

    // Initial theme
    const saved = localStorage.getItem('freshbazaar-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = (saved === 'light' || saved === 'dark') ? saved : (prefersDark ? 'dark' : 'light');
    this.setTheme(initial as 'light' | 'dark', false);
  }

  toggle() {
    const isDark = this.isDark();
    this.setTheme(isDark ? 'light' : 'dark', true);
  }

  isDark(): boolean {
    return this.document.documentElement.getAttribute('data-theme') === 'dark';
  }

  private setTheme(theme: 'light' | 'dark', animate = true) {
    this.document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('freshbazaar-theme', theme);

    if (!animate || !this.overlay) return;

    // Clean previous classes
    this.renderer.removeClass(this.overlay, 'trigger-light');
    this.renderer.removeClass(this.overlay, 'trigger-dark');

    // Force reflow + trigger animation
    void this.overlay.offsetWidth;
    this.renderer.addClass(this.overlay, theme === 'light' ? 'trigger-light' : 'trigger-dark');

    // Cleanup after animation
    setTimeout(() => {
      this.renderer.removeClass(this.overlay, 'trigger-light');
      this.renderer.removeClass(this.overlay, 'trigger-dark');
    }, 3200);
  }
}
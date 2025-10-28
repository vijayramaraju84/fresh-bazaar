
// src/app/shared/animations/cart-fly.animation.ts
export async function flyToCart(
  button: HTMLElement,
  onComplete?: () => void
): Promise<void> {
  // Poll for .cart-icon (max 2 seconds)
  const waitForCartIcon = (): Promise<HTMLElement | null> => {
    return new Promise<HTMLElement | null>((resolve) => {
      let attempts = 40; // 40 * 50ms = 2s
      const check = () => {
        const el = document.querySelector('.cart-icon') as HTMLElement;
        if (el) {
          resolve(el);
        } else if (attempts-- > 0) {
          setTimeout(check, 50);
        } else {
          resolve(null);
        }
      };
      check();
    });
  };

  const img = button.querySelector('img') || button;
  if (!img) {
    onComplete?.();
    return;
  }

  const clone = img.cloneNode(true) as HTMLElement;
  const rect = img.getBoundingClientRect();
  const cartIcon = await waitForCartIcon();

  if (!cartIcon) {
    onComplete?.();
    return;
  }

  const cartRect = cartIcon.getBoundingClientRect();

  Object.assign(clone.style, {
    position: 'fixed',
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    zIndex: '9999',
    pointerEvents: 'none',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    transition: 'all 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)'
  } as CSSStyleDeclaration);

  document.body.appendChild(clone);

  requestAnimationFrame(() => {
    clone.style.transform = `translate(${cartRect.left - rect.left}px, ${cartRect.top - rect.top}px) scale(0.3)`;
    clone.style.opacity = '0.7';
  });

  setTimeout(() => {
    if (document.body.contains(clone)) {
      document.body.removeChild(clone);
    }
    cartIcon.classList.add('pulse');
    setTimeout(() => cartIcon.classList.remove('pulse'), 600);
    onComplete?.();
  }, 900);
}

import { useEffect } from 'react';

/**
 * Automatically observes all elements with the `.rv` class
 * and adds `.in` when they enter the viewport.
 */
export function useScrollReveal(dependencyKey?: any) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.rv').forEach((el) => {
        el.classList.add('in');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    // Initial check for all .rv elements
    const elements = document.querySelectorAll('.rv:not(.in)');
    elements.forEach((el) => observer.observe(el));

    // A small delayed check to catch any dynamically rendered elements
    const timeout = setTimeout(() => {
      document.querySelectorAll('.rv:not(.in)').forEach((el) => observer.observe(el));
    }, 100);

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, [dependencyKey]);
}

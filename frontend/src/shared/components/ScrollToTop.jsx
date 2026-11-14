import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Global Scroll Restoration Component.
 * Automatically resets window scroll to the top on route pathname transitions.
 * Preserves anchor/hash navigation with asynchronous target rendering support.
 * Avoids scroll resets during re-renders or query parameter updates.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const prevPathnameRef = useRef(pathname);
  const prevHashRef = useRef(hash);

  useEffect(() => {
    const isPathnameChanged = prevPathnameRef.current !== pathname;
    const isHashChanged = prevHashRef.current !== hash;

    prevPathnameRef.current = pathname;
    prevHashRef.current = hash;

    // Only respond to pathname transitions or explicit hash changes
    if (!isPathnameChanged && !isHashChanged) {
      return;
    }

    if (hash) {
      const targetId = decodeURIComponent(hash.slice(1));
      let retries = 0;
      const maxRetries = 20; // 20 * 50ms = 1000ms window for async component mounting
      let timeoutId = null;

      const tryScrollToHashTarget = () => {
        let element = document.getElementById(targetId);
        if (!element && window.CSS && CSS.escape) {
          try {
            element = document.querySelector(`[name="${CSS.escape(targetId)}"]`);
          } catch {
            // Ignore invalid selector syntax
          }
        }

        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (retries < maxRetries) {
          retries++;
          timeoutId = setTimeout(tryScrollToHashTarget, 50);
        }
      };

      tryScrollToHashTarget();

      return () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
    } else if (isPathnameChanged) {
      // Immediate reset of main window scroll position upon route change
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
}

export default ScrollToTop;

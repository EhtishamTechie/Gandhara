// src/components/ScrollToTopButton.jsx
//
// Section 8 — visible "back to top" button.
//
// Spec:
//  - Appears after the user has scrolled > 400px.
//  - Fixed position, bottom-LEFT so it never overlaps the right-side
//    CategorySidebar on desktop.
//  - Gold circular button (#C9A84C) with an up-arrow glyph.
//  - Smooth fade-in / fade-out.
//  - Uses window.scrollTo({ behavior: 'smooth' }) and respects
//    prefers-reduced-motion (theme.css already neutralises smooth
//    scroll for users who opt out).

import React, { useEffect, useState, useCallback } from 'react';
import { ArrowUpIcon } from '@heroicons/react/20/solid';

const THRESHOLD_PX = 400;

const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.pageYOffset || document.documentElement.scrollTop || 0;
      setVisible(y > THRESHOLD_PX);
    };
    // Initial check in case we mount already scrolled.
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleClick = useCallback(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Back to top"
      title="Back to top"
      className="scroll-top-btn"
      data-visible={visible ? 'true' : 'false'}
      // tabIndex toggles so a hidden button can't be tabbed to.
      tabIndex={visible ? 0 : -1}
    >
      <ArrowUpIcon className="w-5 h-5" aria-hidden="true" />
      <style>{`
        .scroll-top-btn {
          position: fixed;
          left: 20px;
          bottom: 24px;
          z-index: 45;                     /* above content, below navbar (50) */
          width: 44px;
          height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 0;
          border-radius: 50%;
          background: var(--color-accent-gold, #C9A84C);
          color: var(--color-bg-primary, #0F0F1A);
          box-shadow:
            0 6px 16px rgba(0, 0, 0, 0.35),
            0 0 0 2px rgba(201, 168, 76, 0.25);
          cursor: pointer;
          opacity: 0;
          transform: translateY(8px);
          pointer-events: none;
          transition:
            opacity 250ms ease,
            transform 250ms ease,
            background 200ms ease,
            box-shadow 200ms ease;
        }

        .scroll-top-btn[data-visible='true'] {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }

        .scroll-top-btn:hover {
          background: var(--color-accent-gold-soft, #D4B96A);
          box-shadow:
            0 10px 22px rgba(0, 0, 0, 0.4),
            0 0 0 3px rgba(201, 168, 76, 0.35);
        }

        .scroll-top-btn:focus-visible {
          outline: 2px solid var(--color-accent-gold, #C9A84C);
          outline-offset: 3px;
        }

        /* Mobile: keep it clear of thumb-zone edges and OS nav bars. */
        @media (max-width: 640px) {
          .scroll-top-btn {
            left: 16px;
            bottom: 80px;                  /* nudged up so it doesn't hide behind iOS bottom bars */
          }
        }
      `}</style>
    </button>
  );
};

export default ScrollToTopButton;

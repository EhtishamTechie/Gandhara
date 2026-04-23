// src/components/PageTransition.jsx
//
// Section 8 — subtle fade between route changes.
//
// How it works:
//   - Wraps <Routes> content.
//   - Uses the current pathname as the React `key` so that the
//     inner wrapper re-mounts on every route change.
//   - CSS keyframe animation `pageFadeIn` then runs for ~220 ms.
//   - prefers-reduced-motion users get 0ms (see theme.css).
//
// No dependency on react-transition-group — pure CSS.

import React from 'react';
import { useLocation } from 'react-router-dom';

const PageTransition = ({ children }) => {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className="page-transition">
      {children}
      <style>{`
        .page-transition {
          animation: pageFadeIn 220ms ease-out both;
        }
        @keyframes pageFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default PageTransition;

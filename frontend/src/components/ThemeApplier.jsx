// src/components/ThemeApplier.jsx
//
// Section 7 — applies admin theme overrides at runtime.
//
// Reads `/api/theme-settings` via React Query, then writes each
// returned key as an inline style on `document.documentElement`.
// Because inline styles win over :root rules in theme.css, any
// key present wins. Any key absent falls back to the compiled
// default.
//
// Only known CSS custom property names are ever written (defensive
// allow-list), so a rogue backend response can't smuggle arbitrary
// CSS into the page.

import { useEffect } from 'react';
import { useThemeSettings } from '../hooks/useApi';

const ALLOWED_KEYS = [
  '--color-bg-primary',
  '--color-bg-secondary',
  '--color-bg-card',
  '--color-bg-sidebar',
  '--color-bg-footer',
  '--color-accent-gold',
  '--color-accent-gold-dark',
  '--color-accent-gold-soft',
  '--color-text-primary',
  '--color-text-secondary',
  '--color-border',
  '--color-border-active'
];

const ThemeApplier = () => {
  const { data } = useThemeSettings();

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const colors = data?.colors || {};

    ALLOWED_KEYS.forEach((key) => {
      const override = colors[key];
      if (override && typeof override === 'string') {
        root.style.setProperty(key, override);
      } else {
        // Make sure we don't leak a previous admin override if they
        // reset the value in this session.
        root.style.removeProperty(key);
      }
    });
  }, [data]);

  return null;
};

export default ThemeApplier;

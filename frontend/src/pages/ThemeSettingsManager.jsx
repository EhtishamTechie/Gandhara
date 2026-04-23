// src/pages/ThemeSettingsManager.jsx
//
// Section 7 — Admin: Theme Settings
// --------------------------------------------------------------
// Color pickers for the most impactful Section-2 tokens. Saving
// writes to /api/admin/theme-settings; ThemeApplier picks it up
// on every page and applies the overrides as inline styles on
// <html>, overriding the compiled defaults in theme.css.
//
// Any token that is blank here falls back to the compiled default.
// A "Reset all" button wipes the entire overrides document.

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import {
  CheckIcon,
  ArrowPathIcon,
  ArrowUturnLeftIcon,
  ExclamationTriangleIcon,
  SwatchIcon
} from '@heroicons/react/20/solid';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const authHeader = () => {
  const t = (typeof window !== 'undefined' && localStorage.getItem('adminToken')) || '';
  return t ? { Authorization: `Bearer ${t}` } : {};
};

// Editable tokens. `default` is only used for the "Use default" button
// label — the live default comes from theme.css at runtime.
const EDITABLE_TOKENS = [
  // ---- Backgrounds ---------------------------------------------
  { key: '--color-bg-primary',      label: 'Page background',    default: '#0F0F1A', group: 'Backgrounds' },
  { key: '--color-bg-secondary',    label: 'Navbar / surface',   default: '#1C1C2E', group: 'Backgrounds' },
  { key: '--color-bg-card',         label: 'Product card',       default: '#1E1E30', group: 'Backgrounds' },
  { key: '--color-bg-sidebar',      label: 'Right sidebar',      default: '#16162A', group: 'Backgrounds' },
  { key: '--color-bg-footer',       label: 'Footer',             default: '#0A0A14', group: 'Backgrounds' },
  // ---- Accents -------------------------------------------------
  { key: '--color-accent-gold',      label: 'Primary accent',    default: '#C9A84C', group: 'Accents' },
  { key: '--color-accent-gold-dark', label: 'Accent (hover)',    default: '#8B6914', group: 'Accents' },
  { key: '--color-accent-gold-soft', label: 'Accent (highlight)',default: '#D4B96A', group: 'Accents' },
  // ---- Text ----------------------------------------------------
  { key: '--color-text-primary',   label: 'Primary text',   default: '#F5F0E8', group: 'Text' },
  { key: '--color-text-secondary', label: 'Secondary text', default: '#A89880', group: 'Text' },
  // ---- Borders -------------------------------------------------
  { key: '--color-border',         label: 'Card border',       default: '#2E2E45', group: 'Borders' },
  { key: '--color-border-active',  label: 'Active/focus border', default: '#C9A84C', group: 'Borders' }
];

// #rrggbb only — <input type="color"> can't produce anything else.
const isHex6 = (s) => /^#[0-9a-fA-F]{6}$/.test(s || '');

const normalizeColor = (v, fallback) => {
  if (!v) return fallback;
  // Accept #rgb -> pad to #rrggbb for the color input
  if (/^#[0-9a-fA-F]{3}$/.test(v)) {
    return '#' + v.slice(1).split('').map((c) => c + c).join('').toLowerCase();
  }
  if (isHex6(v)) return v.toLowerCase();
  return fallback;
};

// Compute the resolved CSS custom property from <html> — used as the
// "live" default when the admin hasn't saved an override yet.
const readRootVar = (key) => {
  if (typeof window === 'undefined') return '';
  const val = getComputedStyle(document.documentElement).getPropertyValue(key).trim();
  return val || '';
};

const ThemeSettingsManager = () => {
  const queryClient = useQueryClient();

  const [overrides, setOverrides] = useState({});       // admin-saved
  const [draft, setDraft] = useState({});               // in-progress edits
  const [rootDefaults, setRootDefaults] = useState({}); // from :root
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [flash, setFlash] = useState(null);

  const flashNow = (msg, isError = false) => {
    setFlash({ msg, isError });
    setTimeout(() => setFlash(null), 2500);
  };

  const loadRootDefaults = () => {
    const map = {};
    EDITABLE_TOKENS.forEach((t) => {
      map[t.key] = normalizeColor(readRootVar(t.key), t.default);
    });
    setRootDefaults(map);
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      // IMPORTANT: we read the admin-editable data from the PUBLIC
      // endpoint (it's the same document — the admin route only adds
      // write capability). This avoids the small delay of a separate
      // admin GET.
      const { data } = await axios.get(`${API_BASE}/api/theme-settings`);
      const saved = data?.colors || {};
      setOverrides(saved);
      setDraft(saved);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRootDefaults();
    load();
  }, []);

  const isDirty = useMemo(() => {
    // Compare draft vs overrides key-by-key (order-insensitive).
    const aKeys = Object.keys(draft);
    const bKeys = Object.keys(overrides);
    const allKeys = new Set([...aKeys, ...bKeys]);
    for (const k of allKeys) {
      if ((draft[k] || '') !== (overrides[k] || '')) return true;
    }
    return false;
  }, [draft, overrides]);

  const effective = (key) => {
    // What the color input should currently display:
    // - draft override if user has set one
    // - saved override otherwise
    // - compiled :root default otherwise
    return normalizeColor(
      draft[key] ?? overrides[key] ?? rootDefaults[key],
      rootDefaults[key] || '#000000'
    );
  };

  const hasOverride = (key) =>
    !!(draft[key] && draft[key].trim()) ||
    (draft[key] === undefined && !!(overrides[key] && overrides[key].trim()));

  const setColor = (key, value) => {
    setDraft((d) => ({ ...d, [key]: (value || '').toLowerCase() }));
  };

  const clearOverride = (key) => {
    setDraft((d) => {
      const copy = { ...d };
      delete copy[key];
      return copy;
    });
  };

  const discard = () => setDraft(overrides);

  const save = async () => {
    setSaving(true);
    try {
      // Only send keys that actually differ from the compiled default —
      // this keeps the saved doc minimal.
      const colors = {};
      Object.entries(draft).forEach(([k, v]) => {
        if (!v) return;
        if (!isHex6(v)) return;
        // If the draft equals the root default, don't persist it.
        if (normalizeColor(v, '') === normalizeColor(rootDefaults[k], '')) return;
        colors[k] = v;
      });

      const { data } = await axios.put(
        `${API_BASE}/api/admin/theme-settings`,
        { colors },
        { headers: { ...authHeader(), 'Content-Type': 'application/json' } }
      );

      const saved = data?.colors || {};
      setOverrides(saved);
      setDraft(saved);
      // Let the live site re-pull the overrides on the next render.
      queryClient.invalidateQueries({ queryKey: ['themeSettings'] });
      flashNow('Theme saved');
    } catch (e) {
      flashNow(e?.response?.data?.message || 'Save failed', true);
    } finally {
      setSaving(false);
    }
  };

  const resetAll = async () => {
    if (!window.confirm('Reset all colors back to the compiled defaults? This removes every override.')) return;
    setSaving(true);
    try {
      const { data } = await axios.post(
        `${API_BASE}/api/admin/theme-settings/reset`,
        {},
        { headers: authHeader() }
      );
      const saved = data?.colors || {};
      setOverrides(saved);
      setDraft(saved);
      queryClient.invalidateQueries({ queryKey: ['themeSettings'] });
      flashNow('Theme reset to defaults');
    } catch (e) {
      flashNow(e?.response?.data?.message || 'Reset failed', true);
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex items-center gap-3 text-stone-600">
        <ArrowPathIcon className="w-5 h-5 animate-spin" />
        Loading theme settings…
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
        <ExclamationTriangleIcon className="w-5 h-5 inline mr-2" />
        {error}
        <button onClick={load} className="ml-3 underline hover:text-red-900">Retry</button>
      </div>
    );
  }

  const grouped = EDITABLE_TOKENS.reduce((acc, t) => {
    (acc[t.group] = acc[t.group] || []).push(t);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header / actions */}
      <div className="rounded-lg border border-stone-200 bg-white p-4 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
            <SwatchIcon className="w-5 h-5 text-teal-600" />
            Theme Settings
          </h3>
          <p className="text-sm text-stone-600 mt-1 max-w-2xl">
            Override the site's color palette. Changes save instantly to the database and
            are applied on every public page via <code>:root</code> CSS custom properties.
            Leave a value empty to fall back to the compiled default.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={resetAll}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded-md border border-red-200"
          >
            <ArrowUturnLeftIcon className="w-4 h-4" />
            Reset all
          </button>
          <button
            type="button"
            onClick={discard}
            disabled={!isDirty || saving}
            className="px-3 py-2 text-sm text-stone-700 hover:bg-stone-100 rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Discard changes
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!isDirty || saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-md hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <><ArrowPathIcon className="w-4 h-4 animate-spin" /> Saving…</>
            ) : (
              <><CheckIcon className="w-4 h-4" /> Save changes</>
            )}
          </button>
        </div>
      </div>

      {flash && (
        <div
          className={`rounded-md border px-3 py-2 text-sm ${
            flash.isError
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-teal-50 border-teal-200 text-teal-800'
          }`}
        >
          {flash.msg}
        </div>
      )}

      {/* Grouped color pickers */}
      {Object.entries(grouped).map(([groupName, tokens]) => (
        <div
          key={groupName}
          className="rounded-lg border border-stone-200 bg-white overflow-hidden"
        >
          <div className="px-4 py-2 bg-stone-50 border-b border-stone-200 text-xs font-semibold text-stone-500 uppercase tracking-wider">
            {groupName}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            {tokens.map((tok) => {
              const value = effective(tok.key);
              const overridden = hasOverride(tok.key);
              return (
                <div
                  key={tok.key}
                  className={`flex items-center gap-3 rounded-md border p-3 ${
                    overridden ? 'border-teal-300 bg-teal-50/40' : 'border-stone-200 bg-white'
                  }`}
                >
                  <label className="relative inline-block">
                    <input
                      type="color"
                      value={value}
                      onChange={(e) => setColor(tok.key, e.target.value)}
                      className="w-12 h-12 rounded-md border border-stone-300 cursor-pointer"
                      aria-label={tok.label}
                    />
                  </label>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-stone-900">{tok.label}</div>
                    <div className="text-[11px] font-mono text-stone-500 truncate" title={tok.key}>
                      {tok.key}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => {
                          const v = e.target.value.trim();
                          if (v === '' || isHex6(v) || /^#[0-9a-fA-F]{3}$/.test(v)) {
                            setColor(tok.key, v === '' ? '' : normalizeColor(v, value));
                          } else {
                            setColor(tok.key, v); // allow typing; will normalize on blur
                          }
                        }}
                        onBlur={(e) => {
                          const v = e.target.value.trim();
                          if (v && !isHex6(v)) {
                            setColor(tok.key, normalizeColor(v, rootDefaults[tok.key] || tok.default));
                          }
                        }}
                        className="flex-1 text-xs font-mono px-2 py-1 border border-stone-300 rounded"
                      />
                      <button
                        type="button"
                        onClick={() => clearOverride(tok.key)}
                        disabled={!overridden}
                        className="text-[11px] text-stone-600 hover:text-teal-700 disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
                        title="Remove override (use compiled default)"
                      >
                        Use default
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Live preview strip */}
      <div className="rounded-lg border border-stone-200 bg-white overflow-hidden">
        <div className="px-4 py-2 bg-stone-50 border-b border-stone-200 text-xs font-semibold text-stone-500 uppercase tracking-wider">
          Live preview
        </div>
        <div
          className="p-6 flex flex-wrap items-center gap-4"
          style={{
            background: draft['--color-bg-primary'] || rootDefaults['--color-bg-primary'],
            color: draft['--color-text-primary'] || rootDefaults['--color-text-primary']
          }}
        >
          <div
            className="rounded-md px-3 py-2 text-sm font-semibold"
            style={{
              background: draft['--color-bg-secondary'] || rootDefaults['--color-bg-secondary'],
              border: `1px solid ${draft['--color-border'] || rootDefaults['--color-border']}`
            }}
          >
            Navbar sample
          </div>
          <div
            className="rounded-md px-3 py-2 text-sm"
            style={{
              background: draft['--color-bg-card'] || rootDefaults['--color-bg-card'],
              border: `1px solid ${draft['--color-border'] || rootDefaults['--color-border']}`
            }}
          >
            Card sample
          </div>
          <button
            type="button"
            className="rounded-md px-3 py-2 text-sm font-bold"
            style={{
              background: draft['--color-accent-gold'] || rootDefaults['--color-accent-gold'],
              color: draft['--color-bg-primary'] || rootDefaults['--color-bg-primary']
            }}
          >
            Gold CTA
          </button>
          <span
            style={{ color: draft['--color-text-secondary'] || rootDefaults['--color-text-secondary'] }}
          >
            Secondary caption text
          </span>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettingsManager;

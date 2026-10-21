// src/pages/SidebarCategoriesManager.jsx
//
// Section 7 — Admin: Sidebar Categories Manager
// --------------------------------------------------------------
// Lets the admin:
//   - Toggle each top-level category on/off in the right-side sidebar
//   - Reorder categories (up/down buttons; accessible + no extra deps)
//   - See parent -> child counts (read-only, children are managed by
//     the Category Order / product system)
//
// Contract:
//   GET  /api/categories/tree           → authoritative list + children
//   GET  /api/sidebar-settings          → current overrides
//   PUT  /api/admin/sidebar-settings    → body { overrides: [...] }
//                                         fully replaces overrides array

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/20/solid';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const authHeader = () => {
  const t = (typeof window !== 'undefined' && localStorage.getItem('adminToken')) || '';
  return t ? { Authorization: `Bearer ${t}` } : {};
};

const SidebarCategoriesManager = () => {
  const queryClient = useQueryClient();
  const [rows, setRows] = useState([]);          // merged [{name, slug, isVisible, sortOrder, childrenCount}]
  const [originalKey, setOriginalKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [flash, setFlash] = useState(null);

  const flashNow = (msg, isError = false) => {
    setFlash({ msg, isError });
    setTimeout(() => setFlash(null), 2500);
  };

  // Build a "shape key" from rows so we can detect dirty state cheaply.
  const shapeKey = (list) =>
    list
      .map((r, i) => `${i}:${r.name}:${r.isVisible ? 1 : 0}`)
      .join('|');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [{ data: orderData }, { data: settingsData }, { data: treeData }] = await Promise.all([
        axios.get(`${API_BASE}/api/category-order`),
        axios.get(`${API_BASE}/api/sidebar-settings`),
        axios.get(`${API_BASE}/api/categories/tree`).catch(() => ({ data: { tree: [] } }))
      ]);

      const rawCategories = Array.isArray(orderData?.categories) ? orderData.categories : [];
      const overrideMap = new Map(
        (settingsData?.overrides || []).map((o) => [o.categoryName, o])
      );
      const treeChildrenMap = new Map(
        (treeData?.tree || []).map((t) => [t.name, t.children?.length || 0])
      );

      const merged = rawCategories.map((c, idx) => {
        const override = overrideMap.get(c.name);
        return {
          name: c.name,
          slug: c.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
          isVisible: override
            ? override.showInSidebar !== false
            : c.isVisible !== false,
          sortOrder: override?.sortOrder ?? idx,
          childrenCount: treeChildrenMap.get(c.name) || 0
        };
      });

      // Sort by sortOrder so user's custom sidebar sequence is respected
      merged.sort((a, b) => a.sortOrder - b.sortOrder);

      setRows(merged);
      setOriginalKey(shapeKey(merged));
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  // 1-click sync with Category Order
  const syncWithCategoryOrder = async () => {
    setLoading(true);
    try {
      const { data: orderData } = await axios.get(`${API_BASE}/api/category-order`);
      const { data: treeData } = await axios.get(`${API_BASE}/api/categories/tree`).catch(() => ({ data: { tree: [] } }));
      const rawCategories = Array.isArray(orderData?.categories) ? orderData.categories : [];
      const treeChildrenMap = new Map(
        (treeData?.tree || []).map((t) => [t.name, t.children?.length || 0])
      );

      const synced = rawCategories.map((c, idx) => ({
        name: c.name,
        slug: c.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        isVisible: c.isVisible !== false,
        sortOrder: idx,
        childrenCount: treeChildrenMap.get(c.name) || 0
      }));

      setRows(synced);
      flashNow(`Reset sequence and visibility to match Category Order (${synced.length} categories)`);
    } catch (e) {
      flashNow('Failed to sync from Category Order', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const isDirty = useMemo(() => shapeKey(rows) !== originalKey, [rows, originalKey]);

  const move = (idx, direction) => {
    const t = idx + direction;
    if (t < 0 || t >= rows.length) return;
    const copy = rows.slice();
    [copy[idx], copy[t]] = [copy[t], copy[idx]];
    setRows(copy);
  };

  const toggle = (idx) => {
    const copy = rows.slice();
    copy[idx] = { ...copy[idx], isVisible: !copy[idx].isVisible };
    setRows(copy);
  };

  const reset = () => load();

  const save = async () => {
    setSaving(true);
    try {
      const overrides = rows.map((r, idx) => ({
        categoryName: r.name,
        showInSidebar: !!r.isVisible,
        sortOrder: idx
      }));
      const { data } = await axios.put(
        `${API_BASE}/api/admin/sidebar-settings`,
        { overrides },
        { headers: { ...authHeader(), 'Content-Type': 'application/json' } }
      );
      queryClient.invalidateQueries({ queryKey: ['categoryTree'] });
      queryClient.invalidateQueries({ queryKey: ['sidebarSettings'] });
      queryClient.invalidateQueries({ queryKey: ['categoryOrder'] });
      setOriginalKey(shapeKey(rows));
      flashNow(`Saved ${data?.overrides?.length ?? overrides.length} categories`);
    } catch (e) {
      flashNow(e?.response?.data?.message || 'Save failed', true);
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex items-center gap-3 text-stone-600">
        <ArrowPathIcon className="w-5 h-5 animate-spin" />
        Loading categories…
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

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="rounded-lg border border-stone-200 bg-white p-4 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-lg font-semibold text-stone-900">Sidebar Categories</h3>
          <p className="text-sm text-stone-600 mt-1 max-w-2xl">
            Control which categories appear in the right-side sidebar on the public site, and their order.
            Toggling a category off hides it from the sidebar only — it is not removed from the catalog.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={syncWithCategoryOrder}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-md border border-teal-200 transition-colors"
            title="Reset sequence and visibility to match the master Category Order tab"
          >
            <ArrowPathIcon className="w-4 h-4" />
            Sync with Category Order
          </button>
          <button
            type="button"
            onClick={reset}
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

      {/* Category list */}
      <div className="rounded-lg border border-stone-200 bg-white overflow-hidden">
        <div className="grid grid-cols-[auto,1fr,auto,auto] gap-3 px-4 py-2 bg-stone-50 border-b border-stone-200 text-xs font-semibold text-stone-500 uppercase tracking-wider">
          <span>#</span>
          <span>Category</span>
          <span className="text-center">Visible</span>
          <span className="text-center">Reorder</span>
        </div>

        {rows.length === 0 ? (
          <div className="p-8 text-center text-stone-500">
            No categories found. Add one from the “Category Order” tab first.
          </div>
        ) : (
          <ul>
            {rows.map((row, idx) => (
              <li
                key={row.name}
                className={`grid grid-cols-[auto,1fr,auto,auto] items-center gap-3 px-4 py-3 border-b border-stone-100 last:border-b-0 ${
                  row.isVisible ? '' : 'opacity-60'
                }`}
              >
                <span className="w-8 text-sm font-mono text-stone-500">{idx + 1}</span>

                <div className="min-w-0">
                  <div className="text-sm font-medium text-stone-900 truncate">{row.name}</div>
                  <div className="text-xs text-stone-500">
                    {row.childrenCount > 0
                      ? `${row.childrenCount} subcategor${row.childrenCount === 1 ? 'y' : 'ies'}`
                      : 'no subcategories'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                    row.isVisible
                      ? 'bg-teal-600 text-white hover:bg-teal-700'
                      : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                  }`}
                  title={row.isVisible ? 'Visible — click to hide' : 'Hidden — click to show'}
                >
                  {row.isVisible ? (
                    <><EyeIcon className="w-3.5 h-3.5" /> Shown</>
                  ) : (
                    <><EyeSlashIcon className="w-3.5 h-3.5" /> Hidden</>
                  )}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(idx, -1)}
                    disabled={idx === 0}
                    className="p-1.5 text-stone-500 hover:bg-stone-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <ArrowUpIcon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(idx, +1)}
                    disabled={idx === rows.length - 1}
                    className="p-1.5 text-stone-500 hover:bg-stone-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    <ArrowDownIcon className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs text-stone-500">
        Tip: changes take effect on the public site on the next request
        (the category tree cache is invalidated automatically when you save).
      </p>
    </div>
  );
};

export default SidebarCategoriesManager;

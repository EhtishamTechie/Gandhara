// src/pages/SiteMediaManager.jsx
//
// Admin UI for the generic SiteMedia "slot" system (Section 4, Phase 3).
//
// Layout:
//   - Top tab bar: one tab per slot (hero.main, tours.hero, etc.)
//   - Active tab body:
//       * slot info (label, description, allowed types, max items)
//       * grid of current items (thumbnail, caption, isActive, up/down, delete)
//       * "Add item" form: file upload + caption + subtitle + alt + type
//
// This component only renders under /admin; it assumes an authenticated
// admin session (token in localStorage['adminToken']).

import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  TrashIcon,
  PlusIcon,
  EyeIcon,
  EyeSlashIcon,
  PhotoIcon,
  FilmIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/20/solid';
import { getMediaUrl } from '../utils/imageHelper';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ---- small helpers ------------------------------------------------
const getToken = () =>
  (typeof window !== 'undefined' && localStorage.getItem('adminToken')) || '';

const authHeader = () => {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
};

const isVideo = (item) => item?.type === 'video';

// Sort items by explicit sortOrder (falls back to array order).
const sortByOrder = (arr = []) =>
  [...arr].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

// ------------------------------------------------------------------
// Main component
// ------------------------------------------------------------------
const SiteMediaManager = () => {
  const [slots, setSlots] = useState([]);
  const [activeKey, setActiveKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMsg, setActionMsg] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${API_BASE}/api/admin/site-media`, {
        headers: authHeader()
      });
      const list = data?.slots || [];
      setSlots(list);
      if (!activeKey && list.length) setActiveKey(list[0].slotKey);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed to load slots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); /* eslint-disable-next-line */ }, []);

  const activeSlot = useMemo(
    () => slots.find((s) => s.slotKey === activeKey) || null,
    [slots, activeKey]
  );

  // Transient status message (2.5s)
  const flash = (msg) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(null), 2500);
  };

  // ---- mutations (always re-pull the authoritative slot) ----
  const updateItem = async (slotKey, itemId, patch) => {
    try {
      const { data } = await axios.put(
        `${API_BASE}/api/admin/site-media/${encodeURIComponent(slotKey)}/items/${itemId}`,
        patch,
        { headers: { ...authHeader(), 'Content-Type': 'application/json' } }
      );
      setSlots((cur) =>
        cur.map((s) => (s.slotKey === slotKey ? data.slot : s))
      );
      flash('Saved');
    } catch (e) {
      flash(e?.response?.data?.message || 'Update failed');
    }
  };

  const deleteItem = async (slotKey, itemId) => {
    if (!window.confirm('Delete this item? This cannot be undone.')) return;
    try {
      const { data } = await axios.delete(
        `${API_BASE}/api/admin/site-media/${encodeURIComponent(slotKey)}/items/${itemId}`,
        { headers: authHeader() }
      );
      setSlots((cur) =>
        cur.map((s) => (s.slotKey === slotKey ? data.slot : s))
      );
      flash('Deleted');
    } catch (e) {
      flash(e?.response?.data?.message || 'Delete failed');
    }
  };

  const reorder = async (slotKey, orderedIds) => {
    try {
      const { data } = await axios.put(
        `${API_BASE}/api/admin/site-media/${encodeURIComponent(slotKey)}/reorder`,
        { orderedIds },
        { headers: { ...authHeader(), 'Content-Type': 'application/json' } }
      );
      setSlots((cur) =>
        cur.map((s) => (s.slotKey === slotKey ? data.slot : s))
      );
    } catch (e) {
      flash(e?.response?.data?.message || 'Reorder failed');
    }
  };

  const moveItem = (slot, itemId, direction) => {
    const ordered = sortByOrder(slot.items);
    const idx = ordered.findIndex((i) => String(i._id) === String(itemId));
    if (idx === -1) return;
    const target = idx + direction;
    if (target < 0 || target >= ordered.length) return;
    const swap = ordered.slice();
    [swap[idx], swap[target]] = [swap[target], swap[idx]];
    reorder(slot.slotKey, swap.map((i) => String(i._id)));
  };

  // ---- render -----------------------------------------------------
  if (loading) {
    return (
      <div className="flex items-center gap-3 text-stone-600">
        <ArrowPathIcon className="w-5 h-5 animate-spin" />
        Loading site media…
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
        {error}
        <button
          onClick={fetchAll}
          className="ml-3 underline hover:text-red-900"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="rounded-lg border border-stone-200 bg-white p-4">
        <h3 className="text-lg font-semibold text-stone-900">Site Media</h3>
        <p className="text-sm text-stone-600 mt-1">
          Manage every page-level image and video on the public site
          (hero slideshow, tours slideshow, about gallery, founder portrait,
          home product videos). Changes take effect immediately.
        </p>
      </div>

      {/* Transient banner */}
      {actionMsg && (
        <div className="rounded-md bg-teal-50 border border-teal-200 text-teal-800 px-3 py-2 text-sm">
          {actionMsg}
        </div>
      )}

      {/* Slot tabs */}
      <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-2">
        {slots.map((s) => {
          const isActive = s.slotKey === activeKey;
          return (
            <button
              key={s.slotKey}
              onClick={() => setActiveKey(s.slotKey)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                isActive
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {s.label}
              <span
                className={`ml-2 text-xs rounded-full px-2 py-0.5 ${
                  isActive ? 'bg-white/20 text-white' : 'bg-stone-300 text-stone-700'
                }`}
              >
                {(s.items || []).length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active slot panel */}
      {activeSlot && (
        <SlotPanel
          slot={activeSlot}
          onRefresh={fetchAll}
          onUpdateItem={updateItem}
          onDeleteItem={deleteItem}
          onMoveItem={moveItem}
          flash={flash}
        />
      )}
    </div>
  );
};

// ------------------------------------------------------------------
// SlotPanel — renders the items of a single slot + the add form
// ------------------------------------------------------------------
const SlotPanel = ({ slot, onRefresh, onUpdateItem, onDeleteItem, onMoveItem, flash }) => {
  const sortedItems = useMemo(() => sortByOrder(slot.items), [slot.items]);
  const canAddImage = slot.allowedTypes?.includes('image');
  const canAddVideo = slot.allowedTypes?.includes('video');
  const isHero = slot.slotKey === 'hero.main';

  return (
    <div className="space-y-6">
      {/* Slot meta */}
      <div className="rounded-lg bg-stone-50 border border-stone-200 p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-sm text-stone-500 font-mono">{slot.slotKey}</div>
            <div className="text-base font-semibold text-stone-900">{slot.label}</div>
            {slot.description && (
              <p className="text-sm text-stone-600 mt-1 max-w-2xl">{slot.description}</p>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-stone-600">
            <span className="px-2 py-1 bg-white rounded border border-stone-200">
              Allowed: {slot.allowedTypes?.join(', ') || 'image, video'}
            </span>
            <span className="px-2 py-1 bg-white rounded border border-stone-200">
              {slot.items?.length || 0} / {slot.maxItems || '∞'} items
            </span>
          </div>
        </div>
      </div>

      {/* Slot settings (hero slideshow timing) */}
      {isHero && (
        <HeroTimingSettings
          slot={slot}
          onSaved={(updatedSlot) => {
            flash('Timing saved');
            // Keep UI in sync; simplest is a refresh
            onRefresh();
          }}
          flash={flash}
        />
      )}

      {/* Add form */}
      <AddItemForm
        slotKey={slot.slotKey}
        canAddImage={canAddImage}
        canAddVideo={canAddVideo}
        onAdded={onRefresh}
        flash={flash}
      />

      {/* Items grid */}
      {sortedItems.length === 0 ? (
        <div className="rounded-lg border border-dashed border-stone-300 p-10 text-center text-stone-500">
          No items yet. Upload one above.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sortedItems.map((item, idx) => (
            <ItemCard
              key={item._id}
              slotKey={slot.slotKey}
              item={item}
              index={idx}
              isFirst={idx === 0}
              isLast={idx === sortedItems.length - 1}
              onUpdate={(patch) => onUpdateItem(slot.slotKey, item._id, patch)}
              onDelete={() => onDeleteItem(slot.slotKey, item._id)}
              onMoveUp={() => onMoveItem(slot, item._id, -1)}
              onMoveDown={() => onMoveItem(slot, item._id, +1)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ------------------------------------------------------------------
// HeroTimingSettings — backend-controlled slideshow timing
// ------------------------------------------------------------------
const HeroTimingSettings = ({ slot, onSaved, flash }) => {
  const [busy, setBusy] = useState(false);
  const [autoplayImageMs, setAutoplayImageMs] = useState(
    String(slot?.settings?.autoplayImageMs ?? 5000)
  );
  const [videoAutoplayCapMs, setVideoAutoplayCapMs] = useState(
    String(slot?.settings?.videoAutoplayCapMs ?? 20000)
  );

  useEffect(() => {
    setAutoplayImageMs(String(slot?.settings?.autoplayImageMs ?? 5000));
    setVideoAutoplayCapMs(String(slot?.settings?.videoAutoplayCapMs ?? 20000));
  }, [slot?.slotKey, slot?.settings?.autoplayImageMs, slot?.settings?.videoAutoplayCapMs]);

  const save = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const payload = {
        autoplayImageMs: Number(autoplayImageMs),
        videoAutoplayCapMs: Number(videoAutoplayCapMs)
      };
      const { data } = await axios.put(
        `${API_BASE}/api/admin/site-media/${encodeURIComponent(slot.slotKey)}/settings`,
        payload,
        { headers: { ...authHeader(), 'Content-Type': 'application/json' } }
      );
      onSaved?.(data?.slot);
    } catch (e) {
      flash(e?.response?.data?.message || 'Failed to save timing');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-sm font-semibold text-stone-900">Hero slideshow timing</div>
          <div className="text-xs text-stone-500 mt-0.5">
            Controls how often hero images advance, and the maximum wait for videos before auto-advancing.
          </div>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 disabled:opacity-60"
        >
          {busy ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <CheckIcon className="w-4 h-4" />}
          Save timing
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Image autoplay (ms)</label>
          <input
            type="number"
            min={1000}
            max={60000}
            step={500}
            value={autoplayImageMs}
            onChange={(e) => setAutoplayImageMs(e.target.value)}
            className="w-full text-sm border border-stone-300 rounded-md px-2 py-1.5"
          />
          <div className="text-[11px] text-stone-500 mt-1">Default: 5000 (5 seconds)</div>
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Video cap before advance (ms)</label>
          <input
            type="number"
            min={1000}
            max={120000}
            step={1000}
            value={videoAutoplayCapMs}
            onChange={(e) => setVideoAutoplayCapMs(e.target.value)}
            className="w-full text-sm border border-stone-300 rounded-md px-2 py-1.5"
          />
          <div className="text-[11px] text-stone-500 mt-1">Default: 20000 (20 seconds)</div>
        </div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// ItemCard — inline-editable single media item
// ------------------------------------------------------------------
const ItemCard = ({
  slotKey,
  item,
  isFirst,
  isLast,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown
}) => {
  const [caption, setCaption] = useState(item.caption || '');
  const [subtitle, setSubtitle] = useState(item.subtitle || '');
  const [alt, setAlt] = useState(item.alt || '');
  const [dirty, setDirty] = useState(false);

  // Keep local form state in sync when the upstream item changes
  // (e.g. after a reorder or sibling save).
  useEffect(() => {
    setCaption(item.caption || '');
    setSubtitle(item.subtitle || '');
    setAlt(item.alt || '');
    setDirty(false);
  }, [item._id, item.caption, item.subtitle, item.alt]);

  const onSave = () => {
    onUpdate({ caption, subtitle, alt });
    setDirty(false);
  };

  const mediaUrl = getMediaUrl(item.url);
  const posterUrl = item.poster ? getMediaUrl(item.poster) : null;

  return (
    <div className="rounded-lg bg-white border border-stone-200 shadow-sm overflow-hidden flex flex-col">
      {/* Preview */}
      <div className="relative aspect-video bg-stone-900 flex items-center justify-center overflow-hidden">
        {isVideo(item) ? (
          <video
            src={mediaUrl}
            poster={posterUrl || undefined}
            className="w-full h-full object-cover"
            controls
            preload="metadata"
          />
        ) : (
          <img
            src={mediaUrl}
            alt={alt || caption || 'Slot item'}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}
        {/* Type badge */}
        <span className="absolute top-2 left-2 text-[10px] font-bold tracking-wider uppercase bg-stone-900/70 text-white px-2 py-1 rounded-full flex items-center gap-1">
          {isVideo(item) ? <FilmIcon className="w-3 h-3" /> : <PhotoIcon className="w-3 h-3" />}
          {item.type}
        </span>
        {/* Active toggle */}
        <button
          type="button"
          onClick={() => onUpdate({ isActive: !item.isActive })}
          title={item.isActive ? 'Visible on site — click to hide' : 'Hidden from site — click to show'}
          className={`absolute top-2 right-2 rounded-full p-1.5 shadow ${
            item.isActive
              ? 'bg-teal-600 text-white hover:bg-teal-700'
              : 'bg-stone-400 text-white hover:bg-stone-500'
          }`}
        >
          {item.isActive ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
        </button>
      </div>

      {/* Fields */}
      <div className="p-3 space-y-2 flex-1">
        <div>
          <label className="block text-[11px] font-medium text-stone-500 uppercase tracking-wide mb-0.5">Caption</label>
          <input
            type="text"
            value={caption}
            onChange={(e) => { setCaption(e.target.value); setDirty(true); }}
            placeholder="Headline text for this slide"
            className="w-full text-sm border border-stone-300 rounded-md px-2 py-1.5 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-stone-500 uppercase tracking-wide mb-0.5">Subtitle</label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => { setSubtitle(e.target.value); setDirty(true); }}
            placeholder="Optional secondary line"
            className="w-full text-sm border border-stone-300 rounded-md px-2 py-1.5 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-stone-500 uppercase tracking-wide mb-0.5">Alt text (images)</label>
          <input
            type="text"
            value={alt}
            onChange={(e) => { setAlt(e.target.value); setDirty(true); }}
            placeholder="Describe the image for screen readers"
            className="w-full text-sm border border-stone-300 rounded-md px-2 py-1.5 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          />
        </div>
        <div className="text-[11px] text-stone-400 font-mono truncate" title={item.url}>
          {item.url}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-1 border-t border-stone-200 px-2 py-2 bg-stone-50">
        <div className="flex items-center gap-1">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="p-1.5 text-stone-500 hover:bg-stone-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move up"
          >
            <ArrowUpIcon className="w-4 h-4" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="p-1.5 text-stone-500 hover:bg-stone-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move down"
          >
            <ArrowDownIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {dirty && (
            <button
              onClick={onSave}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-600 text-white text-xs font-semibold rounded hover:bg-teal-700"
            >
              <CheckIcon className="w-3.5 h-3.5" />
              Save
            </button>
          )}
          <button
            onClick={onDelete}
            className="p-1.5 text-red-500 hover:bg-red-50 rounded"
            title="Delete"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// AddItemForm — upload a new file OR reference a URL
// ------------------------------------------------------------------
const AddItemForm = ({ slotKey, canAddImage, canAddVideo, onAdded, flash }) => {
  const fileInputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState(null);
  const [urlRef, setUrlRef] = useState('');
  const [mode, setMode] = useState('upload'); // upload | url
  const [caption, setCaption] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [alt, setAlt] = useState('');
  const [manualType, setManualType] = useState(
    canAddImage ? 'image' : canAddVideo ? 'video' : 'image'
  );

  const reset = () => {
    setFile(null);
    setUrlRef('');
    setCaption('');
    setSubtitle('');
    setAlt('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const inferTypeFromFile = (f) => {
    if (!f) return manualType;
    if (f.type.startsWith('video/')) return 'video';
    if (f.type.startsWith('image/')) return 'image';
    return manualType;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const headers = { ...authHeader() };

      let payload;
      if (mode === 'upload') {
        if (!file) { flash('Choose a file first'); setBusy(false); return; }
        payload = new FormData();
        payload.append('media', file);
        payload.append('type', inferTypeFromFile(file));
        if (caption) payload.append('caption', caption);
        if (subtitle) payload.append('subtitle', subtitle);
        if (alt) payload.append('alt', alt);
        // Content-Type left to the browser so the boundary is set.
      } else {
        if (!urlRef.trim()) { flash('Enter a URL'); setBusy(false); return; }
        payload = {
          url: urlRef.trim(),
          type: manualType,
          caption, subtitle, alt
        };
        headers['Content-Type'] = 'application/json';
      }

      await axios.post(
        `${API_BASE}/api/admin/site-media/${encodeURIComponent(slotKey)}/items`,
        payload,
        { headers }
      );
      flash('Added');
      reset();
      onAdded();
    } catch (err) {
      flash(err?.response?.data?.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  const acceptAttr = [
    canAddImage ? 'image/*' : null,
    canAddVideo ? 'video/*' : null
  ].filter(Boolean).join(',');

  return (
    <form
      onSubmit={submit}
      className="rounded-lg border border-stone-200 bg-white p-4 space-y-3"
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h4 className="font-semibold text-stone-900 flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> Add a new item
        </h4>
        <div className="inline-flex rounded-md border border-stone-300 overflow-hidden text-sm">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-3 py-1.5 ${
              mode === 'upload'
                ? 'bg-teal-600 text-white'
                : 'bg-white text-stone-700 hover:bg-stone-50'
            }`}
          >
            Upload
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-3 py-1.5 border-l border-stone-300 ${
              mode === 'url'
                ? 'bg-teal-600 text-white'
                : 'bg-white text-stone-700 hover:bg-stone-50'
            }`}
          >
            Reference URL
          </button>
        </div>
      </div>

      {mode === 'upload' ? (
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">
            File ({canAddImage && 'image'}{canAddImage && canAddVideo && ' / '}{canAddVideo && 'video'}, max 100MB)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptAttr}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-stone-700 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
          />
          {file && (
            <div className="text-xs text-stone-500 mt-1">
              {file.name} • {(file.size / 1024 / 1024).toFixed(1)} MB • type inferred as <strong>{inferTypeFromFile(file)}</strong>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">URL (absolute or public-folder path)</label>
            <input
              type="text"
              value={urlRef}
              onChange={(e) => setUrlRef(e.target.value)}
              placeholder="/GandharaImages/example.webp  or  https://..."
              className="w-full text-sm border border-stone-300 rounded-md px-2 py-1.5 focus:outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Type</label>
            <select
              value={manualType}
              onChange={(e) => setManualType(e.target.value)}
              className="text-sm border border-stone-300 rounded-md px-2 py-1.5"
            >
              {canAddImage && <option value="image">image</option>}
              {canAddVideo && <option value="video">video</option>}
            </select>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Caption</label>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full text-sm border border-stone-300 rounded-md px-2 py-1.5"
            placeholder="Optional"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Subtitle</label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="w-full text-sm border border-stone-300 rounded-md px-2 py-1.5"
            placeholder="Optional"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Alt text</label>
          <input
            type="text"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            className="w-full text-sm border border-stone-300 rounded-md px-2 py-1.5"
            placeholder="Optional"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={reset}
          className="px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-100 rounded-md inline-flex items-center gap-1"
        >
          <XMarkIcon className="w-4 h-4" /> Reset
        </button>
        <button
          type="submit"
          disabled={busy}
          className="px-4 py-1.5 text-sm bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-60 inline-flex items-center gap-1"
        >
          {busy
            ? <><ArrowPathIcon className="w-4 h-4 animate-spin" /> Uploading…</>
            : <><PlusIcon className="w-4 h-4" /> Add Item</>}
        </button>
      </div>
    </form>
  );
};

export default SiteMediaManager;

const mongoose = require('mongoose');

/**
 * SiteMedia model (Section 4 + media-admin expansion)
 * ----------------------------------------------------
 * A generic "slot" system for every admin-managed piece of page
 * media on the site (hero slideshow, home product videos, tours
 * hero slideshow, about gallery, founder portrait, etc.).
 *
 * One document per slot. Each slot holds an ordered list of
 * items; each item can be an image OR a video.
 *
 * Non-destructive:
 *  - Existing Product / VisitPlace / Master entity images are
 *    untouched. This model only covers previously hardcoded
 *    "chrome" media that had no home of its own.
 *
 * Public API returns only ACTIVE items sorted by sortOrder.
 */

const siteMediaItemSchema = new mongoose.Schema(
  {
    // Resolvable URL.
    //  - "/uploads/..." -> served by Express static (admin uploads)
    //  - "/GandharaImages/...", "/ProductVideos/...", "/TourImages/..."
    //    -> Vite public folder (original hardcoded assets)
    //  - "http(s)://..." -> external
    url: { type: String, required: true, trim: true },

    // image | video. Influences how the frontend renders it.
    type: {
      type: String,
      enum: ['image', 'video'],
      default: 'image',
      required: true
    },

    // Optional text shown as caption / heading on the slide.
    caption: { type: String, default: '', trim: true },

    // Optional secondary line (used by hero + tour slideshows).
    subtitle: { type: String, default: '', trim: true },

    // For videos: poster image to show before playback.
    poster: { type: String, default: '', trim: true },

    // Alt text for images (a11y + SEO).
    alt: { type: String, default: '', trim: true },

    // Admin can disable a slide without deleting it.
    isActive: { type: Boolean, default: true, index: true },

    // Explicit ordering within the slot.
    sortOrder: { type: Number, default: 0, index: true },

    // Optional dimensions so the frontend can avoid layout shift.
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const siteMediaSchema = new mongoose.Schema(
  {
    // Stable string identifier, e.g. 'hero.main', 'tours.hero'.
    // This is how the frontend looks a slot up.
    slotKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true
    },

    // Human-readable name shown in the admin UI.
    label: { type: String, required: true, trim: true },

    // Optional helper text shown in the admin UI.
    description: { type: String, default: '', trim: true },

    // Which item types this slot accepts.
    allowedTypes: {
      type: [String],
      enum: ['image', 'video'],
      default: ['image', 'video']
    },

    // Soft cap surfaced in the admin UI (not enforced server-side).
    maxItems: { type: Number, default: 50 },

    // Optional per-slot settings (e.g. slideshow timing).
    // Only some slots use these, but keeping them generic allows
    // future extension without schema changes.
    settings: {
      autoplayImageMs: { type: Number, default: 5000 },     // images: slide interval
      videoAutoplayCapMs: { type: Number, default: 20000 }  // videos: max wait before advancing
    },

    items: { type: [siteMediaItemSchema], default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteMedia', siteMediaSchema);

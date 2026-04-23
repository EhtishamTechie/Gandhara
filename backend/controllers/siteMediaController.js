const SiteMedia = require('../models/SiteMedia');
const apiCache = require('../middleware/apiCacheMiddleware');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

/**
 * siteMediaController
 * -------------------
 * Public + admin logic for the generic SiteMedia "slot" model.
 *
 *   GET  /api/site-media                    -> all slots (active items only)
 *   GET  /api/site-media/:slotKey           -> one slot (active items only)
 *   GET  /api/admin/site-media              -> all slots (full data, admin)
 *   GET  /api/admin/site-media/:slotKey     -> one slot (full data, admin)
 *   POST /api/admin/site-media/:slotKey/items       (multer upload or body-url)
 *   PUT  /api/admin/site-media/:slotKey/items/:id   (edit caption / toggles)
 *   DELETE /api/admin/site-media/:slotKey/items/:id
 *   PUT  /api/admin/site-media/:slotKey/reorder     (body: { orderedIds: [] })
 *
 * Seeding: the first public or admin GET triggers an idempotent
 * seed that provisions every expected slot with the assets that
 * were previously hardcoded in the frontend (zero visual regression).
 */

// -------------------------------------------------------------
// Seed data — mirrors the previously hardcoded public-folder
// assets so the site looks identical on first run.
// -------------------------------------------------------------
const SEED_SLOTS = [
  {
    slotKey: 'hero.main',
    label: 'Home Hero',
    description:
      'Main slideshow on the home page. Each slide can be an image or a video. 5s auto-advance, with manual nav.',
    allowedTypes: ['image', 'video'],
    maxItems: 10,
    settings: {
      autoplayImageMs: 5000,
      videoAutoplayCapMs: 20000
    },
    items: [
      {
        url: '/ProductVideos/Gandhara Art Artisans.mp4',
        type: 'video',
        caption: 'Gandhara Arts And Taxila Stone Crafts',
        subtitle: 'Carving Legacies, Crafting Journeys',
        poster: '/GandharaImages/Gandharalogo.webp',
        alt: 'Artisans at work',
        isActive: true,
        sortOrder: 0
      }
    ]
  },
  {
    slotKey: 'home.productVideos',
    label: 'Home Product Video Showcase',
    description: 'Video row on the home page below the hero.',
    allowedTypes: ['video'],
    maxItems: 12,
    items: [
      {
        url: '/ProductVideos/Gandhara Video 2.mp4',
        type: 'video',
        caption: 'Gandhara Heritage Collection',
        subtitle: 'Discover our authentic Gandhara art pieces',
        poster: '/GandharaImages/Gandharalogo.webp',
        isActive: true,
        sortOrder: 0
      },
      {
        url: '/ProductVideos/Stone Art Video.mp4',
        type: 'video',
        caption: 'Stone Art Craftsmanship',
        subtitle: 'Witness the artistry of traditional stone carving',
        poster: '/GandharaImages/Gandharalogo.webp',
        isActive: true,
        sortOrder: 1
      },
      {
        url: '/ProductVideos/Stone Fountains Videos.mp4',
        type: 'video',
        caption: 'Stone Fountains Collection',
        subtitle: 'Elegant fountains for your garden spaces',
        poster: '/GandharaImages/Gandharalogo.webp',
        isActive: true,
        sortOrder: 2
      },
      {
        url: '/ProductVideos/Video 1.mp4',
        type: 'video',
        caption: 'Featured Product Showcase',
        subtitle: 'Our premium collection highlights',
        poster: '/GandharaImages/Gandharalogo.webp',
        isActive: true,
        sortOrder: 3
      }
    ]
  },
  {
    slotKey: 'tours.hero',
    label: 'Visit Taxila — Tours Hero',
    description:
      'Slideshow hero for the Visit Taxila tours page. Plain images (no video) by default.',
    allowedTypes: ['image', 'video'],
    maxItems: 30,
    items: [
      // 13 source filenames from TaxilaToursShowcase.jsx. URLs
      // point at the optimized .webp (matching the previous behaviour).
      { caption: 'Cultural Events at Taxila',     subtitle: 'Traditional Celebrations & Heritage',   file: 'Cultural_Event_Taxila' },
      { caption: 'VIP Delegation Tours',          subtitle: 'Exclusive Heritage Experiences',        file: 'Delegation_Group_Tour' },
      { caption: 'Dharmarajeka Monastery',        subtitle: 'Ancient Buddhist Stupa Complex',        file: 'Dharmarajeka_Group_Tour' },
      { caption: 'Dharmarajeka Monastery',        subtitle: 'Ancient Buddhist Stupa Complex',        file: 'Dharmarajeka_Visit_Group' },
      { caption: 'Group Heritage Events',         subtitle: 'Community Cultural Programs',           file: 'Event_group_picture' },
      { caption: 'VIP Delegation Tours',          subtitle: 'Exclusive Heritage Experiences',        file: 'Group_Delegation_Visit' },
      { caption: 'Jullian Archaeological Site',   subtitle: 'Ancient City Ruins & Excavations',      file: 'Jullian_Group_Tour_2' },
      { caption: 'Jullian Archaeological Site',   subtitle: 'Ancient City Ruins & Excavations',      file: 'Jullian_Group_Tour' },
      { caption: 'Sirkap Ancient City',           subtitle: 'Greco-Bactrian Urban Planning',         file: 'Sirkap_Group_Tour' },
      { caption: 'Sirkap Ancient City',           subtitle: 'Greco-Bactrian Urban Planning',         file: 'Sirkap_Group_Visit' },
      { caption: 'Taxila Museum Experience',      subtitle: 'Gandhara Art & Artifacts Collection',   file: 'Taxila_Museum_Group_Tour' },
      { caption: 'Taxila Museum Experience',      subtitle: 'Gandhara Art & Artifacts Collection',   file: 'Taxila_Museum_Group_Visit' },
      { caption: 'VIP Delegation Tours',          subtitle: 'Exclusive Heritage Experiences',        file: 'Taxila_Museum_Tour_2' }
    ].map((entry, idx) => ({
      url: `/TourImages/${entry.file}.webp`,
      type: 'image',
      caption: entry.caption,
      subtitle: entry.subtitle,
      alt: entry.file.replace(/_/g, ' '),
      isActive: true,
      sortOrder: idx
    }))
  },
  {
    slotKey: 'about.gallery',
    label: 'About Page — Gallery',
    description: 'Image gallery carousel on the About page.',
    allowedTypes: ['image'],
    maxItems: 20,
    items: [
      '/GandharaImages/jaulian.webp',
      '/GandharaImages/museum.webp',
      '/GandharaImages/sarsukh.webp',
      '/GandharaImages/artisanWorkshopImage.webp',
      '/GandharaImages/taxilaPanoramicImage.webp',
      '/GandharaImages/The_Grand_Taxila_Day_Tour.webp',
      '/GandharaImages/Monasteries_&_Hidden_Ruins_Walk.webp'
    ].map((url, idx) => ({
      url,
      type: 'image',
      alt: path.basename(url, path.extname(url)).replace(/_/g, ' '),
      isActive: true,
      sortOrder: idx
    }))
  },
  {
    slotKey: 'about.founder',
    label: 'About Page — Founder Portrait',
    description: 'Single portrait photo of the founder on the About page.',
    allowedTypes: ['image'],
    maxItems: 1,
    items: [
      {
        url: '/GandharaImages/Prof_Rashid_Transparent.webp',
        type: 'image',
        alt: 'Professor Rashid — Founder',
        isActive: true,
        sortOrder: 0
      }
    ]
  }
];

// -------------------------------------------------------------
// Idempotent seeding
// -------------------------------------------------------------
let seededOnce = false;
const seedSiteMediaIfEmpty = async () => {
  if (seededOnce) return;
  try {
    for (const slot of SEED_SLOTS) {
      const existing = await SiteMedia.findOne({ slotKey: slot.slotKey });
      if (existing) continue;
      await SiteMedia.create(slot);
      console.log(`SiteMedia seed: created slot "${slot.slotKey}" (${slot.items.length} item(s))`);
    }
    seededOnce = true;
  } catch (err) {
    console.error('SiteMedia seed failed:', err.message);
    // Do not mark seededOnce so a later call can retry.
  }
};

// -------------------------------------------------------------
// Helpers
// -------------------------------------------------------------
const clearApiCache = () => {
  try { apiCache.cache && apiCache.cache.clear && apiCache.cache.clear(); } catch { /* noop */ }
};

const ensureDir = async (absDir) => {
  await fs.promises.mkdir(absDir, { recursive: true });
};

const isLocalUpload = (url) => typeof url === 'string' && url.startsWith('/uploads/');

/**
 * Process uploaded images:
 * - For hero.main: create a cropped "cover" hero image (1920x1080) in webp.
 * - For other slots: create a max-width webp (no crop) to compress.
 *
 * Returns: { url, width, height }
 */
const processUploadedImage = async ({ slotKey, absInputPath, originalBasename }) => {
  const outDirAbs = path.join(__dirname, '..', 'uploads', 'processed');
  await ensureDir(outDirAbs);

  const base = path.basename(originalBasename, path.extname(originalBasename));
  const stamp = Date.now();

  // Hero: fixed aspect crop; elsewhere: compress + resize to max-width.
  const isHero = slotKey === 'hero.main';
  const outFile = isHero
    ? `hero-${stamp}-${base}-1920x1080.webp`
    : `sm-${stamp}-${base}-max1600.webp`;
  const outAbs = path.join(outDirAbs, outFile);

  let pipeline = sharp(absInputPath, { failOn: 'none' }).rotate();

  if (isHero) {
    pipeline = pipeline.resize(1920, 1080, {
      fit: 'cover',
      position: sharp.strategy.attention
    });
  } else {
    pipeline = pipeline.resize({
      width: 1600,
      withoutEnlargement: true,
      fit: 'inside'
    });
  }

  const info = await pipeline
    .webp({ quality: 78, effort: 4 })
    .toFile(outAbs);

  return {
    url: `/uploads/processed/${outFile}`,
    width: info?.width || 0,
    height: info?.height || 0
  };
};

const projectPublicItems = (slot) => ({
  slotKey: slot.slotKey,
  label: slot.label,
  description: slot.description,
  allowedTypes: slot.allowedTypes,
  settings: {
    autoplayImageMs: slot?.settings?.autoplayImageMs || 5000,
    videoAutoplayCapMs: slot?.settings?.videoAutoplayCapMs || 20000
  },
  items: (slot.items || [])
    .filter(i => i.isActive)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    .map(i => ({
      _id: i._id,
      url: i.url,
      type: i.type,
      caption: i.caption || '',
      subtitle: i.subtitle || '',
      poster: i.poster || '',
      alt: i.alt || '',
      width: i.width || 0,
      height: i.height || 0
    }))
});

// -------------------------------------------------------------
// PUBLIC endpoints
// -------------------------------------------------------------

// GET /api/site-media
exports.listPublicSlots = async (req, res) => {
  try {
    await seedSiteMediaIfEmpty();
    const slots = await SiteMedia.find({}).lean();
    const byKey = Object.fromEntries(
      slots.map(s => [s.slotKey, projectPublicItems(s)])
    );
    res.json({
      success: true,
      slots: byKey,
      meta: {
        totalSlots: slots.length,
        slotKeys: slots.map(s => s.slotKey)
      }
    });
  } catch (err) {
    console.error('listPublicSlots error:', err);
    res.status(500).json({ success: false, message: 'Failed to load site media' });
  }
};

// GET /api/site-media/:slotKey
exports.getPublicSlot = async (req, res) => {
  try {
    await seedSiteMediaIfEmpty();
    const key = (req.params.slotKey || '').toLowerCase();
    const slot = await SiteMedia.findOne({ slotKey: key }).lean();
    if (!slot) {
      return res.status(404).json({ success: false, message: `Unknown slot: ${key}` });
    }
    res.json({ success: true, slot: projectPublicItems(slot) });
  } catch (err) {
    console.error('getPublicSlot error:', err);
    res.status(500).json({ success: false, message: 'Failed to load slot' });
  }
};

// -------------------------------------------------------------
// ADMIN endpoints
// -------------------------------------------------------------

// GET /api/admin/site-media
exports.adminListSlots = async (req, res) => {
  try {
    await seedSiteMediaIfEmpty();
    const slots = await SiteMedia.find({}).sort({ slotKey: 1 }).lean();
    res.json({ success: true, slots });
  } catch (err) {
    console.error('adminListSlots error:', err);
    res.status(500).json({ success: false, message: 'Failed to load slots' });
  }
};

// GET /api/admin/site-media/:slotKey
exports.adminGetSlot = async (req, res) => {
  try {
    await seedSiteMediaIfEmpty();
    const key = (req.params.slotKey || '').toLowerCase();
    const slot = await SiteMedia.findOne({ slotKey: key }).lean();
    if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });
    res.json({ success: true, slot });
  } catch (err) {
    console.error('adminGetSlot error:', err);
    res.status(500).json({ success: false, message: 'Failed to load slot' });
  }
};

// POST /api/admin/site-media/:slotKey/items
//
// Two input modes:
//  1. multipart form-data with file field "media" (admin uploads
//     a new file). Body can still carry caption/subtitle/etc.
//  2. application/json with body.url (reference an existing URL
//     — e.g. a public-folder asset).
exports.adminAddItem = async (req, res) => {
  try {
    await seedSiteMediaIfEmpty();
    const key = (req.params.slotKey || '').toLowerCase();
    const slot = await SiteMedia.findOne({ slotKey: key });
    if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });

    let { url, type, caption, subtitle, poster, alt, isActive, sortOrder } = req.body || {};
    let width = 0;
    let height = 0;

    // If a file was uploaded via multer, use it.
    if (req.file) {
      // multer stores into backend/uploads; expose as /uploads/<filename>
      const filename = path.basename(req.file.path);
      url = `/uploads/${filename}`;
      if (!type) {
        type = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
      }

      // If it's an image upload, auto-compress (and crop for hero) into a processed webp.
      if (type === 'image') {
        try {
          const absInputPath = path.isAbsolute(req.file.path)
            ? req.file.path
            : path.join(__dirname, '..', req.file.path);
          const processed = await processUploadedImage({
            slotKey: key,
            absInputPath,
            originalBasename: filename
          });
          url = processed.url;
          width = processed.width;
          height = processed.height;

          // Best-effort: remove original upload to save space (processed file is used).
          fs.promises.unlink(absInputPath).catch(() => { /* ignore */ });
        } catch (e) {
          // If processing fails, keep original upload URL.
          console.warn('SiteMedia image processing failed:', e.message);
        }
      }
    }

    if (!url) {
      return res.status(400).json({ success: false, message: 'url or uploaded file required' });
    }
    if (!type) type = 'image';
    if (!slot.allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Slot "${key}" does not accept type "${type}"`
      });
    }

    // Hero behavior: new uploads should become the first slide by default,
    // so the public site reflects admin uploads immediately (no manual reorder required).
    const wantsExplicitSort = typeof sortOrder === 'number';
    const heroDefaultFirst = key === 'hero.main' && !wantsExplicitSort;
    const nextSort = wantsExplicitSort
      ? sortOrder
      : heroDefaultFirst
        ? 0
        : (slot.items.reduce((m, i) => Math.max(m, i.sortOrder || 0), -1) + 1);

    if (heroDefaultFirst) {
      slot.items.forEach((i) => {
        i.sortOrder = (i.sortOrder ?? 0) + 1;
      });
    }

    slot.items.push({
      url,
      type,
      caption: caption || '',
      subtitle: subtitle || '',
      poster: poster || '',
      alt: alt || '',
      isActive: isActive === undefined ? true : !!isActive,
      sortOrder: nextSort,
      width,
      height
    });

    await slot.save();
    clearApiCache();
    res.status(201).json({ success: true, slot });
  } catch (err) {
    console.error('adminAddItem error:', err);
    res.status(500).json({ success: false, message: 'Failed to add item' });
  }
};

// PUT /api/admin/site-media/:slotKey/items/:itemId
exports.adminUpdateItem = async (req, res) => {
  try {
    const key = (req.params.slotKey || '').toLowerCase();
    const { itemId } = req.params;
    const slot = await SiteMedia.findOne({ slotKey: key });
    if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });

    const item = slot.items.id(itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    const { url, type, caption, subtitle, poster, alt, isActive, sortOrder } = req.body || {};

    if (url !== undefined) item.url = url;
    if (type !== undefined) {
      if (!slot.allowedTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: `Slot "${key}" does not accept type "${type}"`
        });
      }
      item.type = type;
    }
    if (caption !== undefined) item.caption = caption;
    if (subtitle !== undefined) item.subtitle = subtitle;
    if (poster !== undefined) item.poster = poster;
    if (alt !== undefined) item.alt = alt;
    if (isActive !== undefined) item.isActive = !!isActive;
    if (sortOrder !== undefined) item.sortOrder = sortOrder;

    await slot.save();
    clearApiCache();
    res.json({ success: true, slot });
  } catch (err) {
    console.error('adminUpdateItem error:', err);
    res.status(500).json({ success: false, message: 'Failed to update item' });
  }
};

// DELETE /api/admin/site-media/:slotKey/items/:itemId
// If the item's URL points at /uploads/<...> AND no other slot/item
// references it, best-effort remove the file from disk.
exports.adminDeleteItem = async (req, res) => {
  try {
    const key = (req.params.slotKey || '').toLowerCase();
    const { itemId } = req.params;
    const slot = await SiteMedia.findOne({ slotKey: key });
    if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });

    const item = slot.items.id(itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    const removedUrl = item.url;
    item.deleteOne();
    await slot.save();
    clearApiCache();

    // Best-effort cleanup of orphaned local uploads. Never remove
    // /public-folder assets (they live in the frontend repo).
    if (removedUrl && removedUrl.startsWith('/uploads/')) {
      const otherRef = await SiteMedia.findOne({ 'items.url': removedUrl });
      if (!otherRef) {
        const abs = path.join(__dirname, '..', removedUrl.replace(/^\//, ''));
        fs.promises.unlink(abs).catch(() => { /* already gone / in-use */ });
      }
    }

    res.json({ success: true, slot });
  } catch (err) {
    console.error('adminDeleteItem error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete item' });
  }
};

// PUT /api/admin/site-media/:slotKey/reorder
// Body: { orderedIds: ["id1","id2",...] }
exports.adminReorderItems = async (req, res) => {
  try {
    const key = (req.params.slotKey || '').toLowerCase();
    const { orderedIds } = req.body || {};
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, message: 'orderedIds[] required' });
    }
    const slot = await SiteMedia.findOne({ slotKey: key });
    if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });

    orderedIds.forEach((id, idx) => {
      const item = slot.items.id(id);
      if (item) item.sortOrder = idx;
    });

    await slot.save();
    clearApiCache();
    res.json({ success: true, slot });
  } catch (err) {
    console.error('adminReorderItems error:', err);
    res.status(500).json({ success: false, message: 'Failed to reorder' });
  }
};

// PUT /api/admin/site-media/:slotKey/settings
// Body: { autoplayImageMs?: number, videoAutoplayCapMs?: number }
exports.adminUpdateSlotSettings = async (req, res) => {
  try {
    const key = (req.params.slotKey || '').toLowerCase();
    const slot = await SiteMedia.findOne({ slotKey: key });
    if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });

    const { autoplayImageMs, videoAutoplayCapMs } = req.body || {};

    if (autoplayImageMs !== undefined) {
      const v = Number(autoplayImageMs);
      if (!Number.isFinite(v) || v < 1000 || v > 60000) {
        return res.status(400).json({ success: false, message: 'autoplayImageMs must be between 1000 and 60000' });
      }
      slot.settings = slot.settings || {};
      slot.settings.autoplayImageMs = Math.round(v);
    }

    if (videoAutoplayCapMs !== undefined) {
      const v = Number(videoAutoplayCapMs);
      if (!Number.isFinite(v) || v < 1000 || v > 120000) {
        return res.status(400).json({ success: false, message: 'videoAutoplayCapMs must be between 1000 and 120000' });
      }
      slot.settings = slot.settings || {};
      slot.settings.videoAutoplayCapMs = Math.round(v);
    }

    await slot.save();
    clearApiCache();
    res.json({ success: true, slot });
  } catch (err) {
    console.error('adminUpdateSlotSettings error:', err);
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
};

// Exported for tests / scripts
exports._seed = seedSiteMediaIfEmpty;
exports._SEED_SLOTS = SEED_SLOTS;

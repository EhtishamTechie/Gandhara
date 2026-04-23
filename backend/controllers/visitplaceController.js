const VisitPlace = require('../models/VisitPlace');
const fs = require('fs');
const apiCache = require('../middleware/apiCacheMiddleware');

const slugify = (str) => {
  const s = String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
  return s || 'place';
};

async function ensureUniqueSlug(base) {
  let slug = base;
  let n = 0;
  // eslint-disable-next-line no-await-in-loop
  while (await VisitPlace.findOne({ slug })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

const addVisitPlace = async (req, res) => {
  try {
    const { name, description, tourCategory } = req.body;
    const imageFile = req.files?.image?.[0];
    const videoFile = req.files?.video?.[0];

    if (!name || !description) {
      return res.status(400).json({ message: 'Name and description are required' });
    }
    if (!imageFile && !videoFile) {
      return res.status(400).json({ message: 'An image or video file is required' });
    }

    const imagePath = imageFile ? imageFile.path : undefined;
    const videoPath = videoFile ? videoFile.path : undefined;

    const slug = await ensureUniqueSlug(slugify(name));

    const newPlace = new VisitPlace({
      name,
      description,
      image: imagePath || '',
      video: videoPath || undefined,
      tourCategory: tourCategory || '',
      slug
    });

    const savedPlace = await newPlace.save();
    // Ensure public cached lists update immediately
    apiCache.clear();
    res.status(201).json(savedPlace);
  } catch (error) {
    console.error('addVisitPlace:', error);
    res.status(500).json({ message: error.message });
  }
};

const getVisitPlaces = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await VisitPlace.countDocuments();
    const visitPlaces = await VisitPlace.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      visitPlaces,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/visit-places/:id — single place by Mongo id or slug (public tour page)
const getVisitPlaceById = async (req, res) => {
  try {
    const param = String(req.params.id || '').trim();
    if (!param) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    let place = null;
    // Strict 24-char hex — avoids mongoose isValid() false positives on random strings
    if (/^[a-fA-F0-9]{24}$/.test(param)) {
      place = await VisitPlace.findById(param);
    }
    if (!place) {
      place = await VisitPlace.findOne({ slug: param });
    }
    if (!place) {
      return res.status(404).json({ message: 'Visit place not found' });
    }
    res.json(place);
  } catch (error) {
    console.error('getVisitPlaceById:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update Visit Place
const updateVisitPlace = async (req, res) => {
  try {
    const { name, description, tourCategory } = req.body;
    const imageFile = req.files?.image?.[0];
    const videoFile = req.files?.video?.[0];

    const place = await VisitPlace.findById(req.params.id);

    if (!place) {
      return res.status(404).json({ message: 'Visit place not found' });
    }

    place.name = name || place.name;
    place.description = description || place.description;
    if (tourCategory !== undefined) place.tourCategory = tourCategory;

    if (imageFile) {
      if (place.image && fs.existsSync(place.image)) {
        fs.unlink(place.image, (err) => {
          if (err) console.error('Failed to delete old image:', err);
        });
      }
      place.image = imageFile.path;
    }

    if (videoFile) {
      if (place.video && fs.existsSync(place.video)) {
        fs.unlink(place.video, (err) => {
          if (err) console.error('Failed to delete old video:', err);
        });
      }
      place.video = videoFile.path;
    }

    const updatedPlace = await place.save();
    apiCache.clear();
    res.json(updatedPlace);
  } catch (error) {
    console.error('updateVisitPlace:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete Visit Place
const deleteVisitPlace = async (req, res) => {
  try {
    const place = await VisitPlace.findByIdAndDelete(req.params.id);

    if (!place) {
      return res.status(404).json({ message: 'Visit place not found' });
    }

    if (place.image && fs.existsSync(place.image)) {
      fs.unlink(place.image, (err) => {
        if (err) console.error('Failed to delete image:', err);
      });
    }
    if (place.video && fs.existsSync(place.video)) {
      fs.unlink(place.video, (err) => {
        if (err) console.error('Failed to delete video:', err);
      });
    }

    apiCache.clear();
    res.json({ message: 'Visit place deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addVisitPlace,
  getVisitPlaces,
  getVisitPlaceById,
  updateVisitPlace,
  deleteVisitPlace
};

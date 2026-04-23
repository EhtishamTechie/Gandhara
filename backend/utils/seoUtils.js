/**
 * SEO Field Generation and Scoring Utility
 * Auto-generates SEO fields and calculates SEO scores
 */

const { calculateSlugSEOScore } = require('./slugGenerator');

/**
 * Generate SEO title from product/place title
 * @param {string} title - Original title
 * @param {string} category - Primary category
 * @param {string} brand - Brand name (default: Gandhara Arts)
 * @returns {string} - SEO optimized title (max 60 chars)
 */
function generateSEOTitle(title, category = '', brand = 'Gandhara Arts') {
  if (!title) return '';
  
  let seoTitle = title;
  
  // Add category if provided
  if (category) {
    seoTitle = `${title} - ${category}`;
  }
  
  // Add brand if there's space
  const withBrand = `${seoTitle} | ${brand}`;
  if (withBrand.length <= 60) {
    seoTitle = withBrand;
  }
  
  // Truncate if too long
  if (seoTitle.length > 60) {
    seoTitle = seoTitle.substring(0, 57) + '...';
  }
  
  return seoTitle;
}

/**
 * Generate SEO description from product/place details
 * @param {object} data - Product or place data
 * @returns {string} - SEO optimized description (max 160 chars)
 */
function generateSEODescription(data) {
  const { 
    title, 
    description, 
    categories = [], 
    price, 
    location,
    isProduct = true 
  } = data;
  
  if (!title) return '';
  
  let seoDesc = '';
  
  if (isProduct) {
    // Product SEO description
    const category = categories[0] || 'handcrafted item';
    const priceStr = price ? ` Price: $${price}.` : '';
    
    seoDesc = `Authentic ${title.toLowerCase()} - ${category} handcrafted in Pakistan.${priceStr} Worldwide shipping available. Order now from Gandhara Arts.`;
  } else {
    // Visit place SEO description
    const locationStr = location ? ` Located in ${location}.` : '';
    const shortDesc = description ? description.substring(0, 80) : '';
    
    seoDesc = `Visit ${title} - ${shortDesc}${locationStr} Discover Pakistan's heritage with Gandhara Arts tours.`;
  }
  
  // Truncate if too long
  if (seoDesc.length > 160) {
    seoDesc = seoDesc.substring(0, 157) + '...';
  }
  
  return seoDesc;
}

/**
 * Generate image alt text
 * @param {string} title - Product/place title
 * @param {string} category - Category or type
 * @param {string} context - Additional context
 * @returns {string} - Descriptive alt text
 */
function generateImageAlt(title, category = '', context = '') {
  if (!title) return '';
  
  let altText = title;
  
  // Add category context
  if (category) {
    altText = `${title} - ${category}`;
  }
  
  // Add additional context
  if (context) {
    altText = `${altText} ${context}`;
  } else {
    // Default context for Pakistani crafts
    altText = `${altText} - Authentic Pakistani stone craft from Taxila heritage region`;
  }
  
  // Truncate if too long
  if (altText.length > 125) {
    altText = altText.substring(0, 122) + '...';
  }
  
  return altText;
}

/**
 * Generate meta keywords from title, description, and categories
 * @param {object} data - Product or place data
 * @returns {string[]} - Array of relevant keywords
 */
function generateMetaKeywords(data) {
  const { 
    title, 
    description, 
    categories = [], 
    keywords = [],
    isProduct = true 
  } = data;
  
  const metaKeywords = new Set();
  
  // Add existing keywords
  keywords.forEach(keyword => {
    if (keyword && keyword.trim()) {
      metaKeywords.add(keyword.toLowerCase().trim());
    }
  });
  
  // Add title words (excluding common words)
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'];
  
  if (title) {
    title.toLowerCase().split(/\s+/).forEach(word => {
      const cleanWord = word.replace(/[^a-z0-9]/g, '');
      if (cleanWord.length > 2 && !commonWords.includes(cleanWord)) {
        metaKeywords.add(cleanWord);
      }
    });
  }
  
  // Add categories as keywords
  categories.forEach(category => {
    if (category) {
      metaKeywords.add(category.toLowerCase().replace(/\s+/g, ' ').trim());
    }
  });
  
  // Add context-specific keywords
  if (isProduct) {
    metaKeywords.add('pakistani crafts');
    metaKeywords.add('handmade');
    metaKeywords.add('stone art');
    metaKeywords.add('gandhara');
    metaKeywords.add('taxila');
  } else {
    metaKeywords.add('pakistan tourism');
    metaKeywords.add('heritage site');
    metaKeywords.add('cultural tour');
    metaKeywords.add('taxila');
  }
  
  return Array.from(metaKeywords).slice(0, 10); // Limit to 10 keywords
}

/**
 * Calculate overall SEO score for a product or place
 * @param {object} data - Product or place data with SEO fields
 * @returns {number} - SEO score (0-100)
 */
function calculateSEOScore(data) {
  const {
    title,
    slug,
    seoTitle,
    seoDescription,
    imageAlt,
    metaKeywords = [],
    focusKeyword,
    description,
    categories = []
  } = data;
  
  let score = 0;
  
  // Title and basic content (25 points)
  if (title && title.length >= 10) score += 10;
  if (description && description.length >= 50) score += 10;
  if (categories.length > 0) score += 5;
  
  // Slug quality (20 points)
  if (slug) {
    score += calculateSlugSEOScore(slug, title);
  }
  
  // SEO Title (15 points)
  if (seoTitle) {
    score += 5;
    if (seoTitle.length >= 30 && seoTitle.length <= 60) score += 5;
    if (title && seoTitle.toLowerCase().includes(title.toLowerCase())) score += 5;
  }
  
  // SEO Description (15 points)
  if (seoDescription) {
    score += 5;
    if (seoDescription.length >= 120 && seoDescription.length <= 160) score += 5;
    if (title && seoDescription.toLowerCase().includes(title.toLowerCase())) score += 5;
  }
  
  // Image Alt Text (10 points)
  if (imageAlt) {
    score += 5;
    if (imageAlt.length >= 20 && imageAlt.length <= 125) score += 5;
  }
  
  // Keywords (10 points)
  if (metaKeywords.length >= 3) score += 5;
  if (focusKeyword && focusKeyword.length >= 3) score += 5;
  
  // Content quality bonus (5 points)
  if (description && description.length >= 200) score += 3;
  if (title && title.length >= 20) score += 2;
  
  return Math.min(score, 100);
}

/**
 * Auto-generate all missing SEO fields for a product
 * @param {object} productData - Product data
 * @returns {object} - Complete product data with SEO fields
 */
function autoGenerateProductSEO(productData) {
  const {
    title,
    description,
    categories = [],
    keywords = [],
    price,
    _id
  } = productData;
  
  const isProduct = true;
  const category = categories[0] || '';
  
  // Generate missing SEO fields
  const seoFields = {
    seoTitle: productData.seoTitle || generateSEOTitle(title, category),
    seoDescription: productData.seoDescription || generateSEODescription({
      title, description, categories, price, isProduct
    }),
    imageAlt: productData.imageAlt || generateImageAlt(title, category),
    metaKeywords: productData.metaKeywords?.length > 0 
      ? productData.metaKeywords 
      : generateMetaKeywords({ title, description, categories, keywords, isProduct }),
    focusKeyword: productData.focusKeyword || (keywords[0] || title.split(' ')[0]).toLowerCase(),
    shortDescription: productData.shortDescription || (description ? description.substring(0, 200) : ''),
    lastSEOUpdate: new Date()
  };
  
  // Calculate SEO score
  const completeData = { ...productData, ...seoFields };
  seoFields.seoScore = calculateSEOScore(completeData);
  
  return seoFields;
}

/**
 * Auto-generate all missing SEO fields for a visit place
 * @param {object} placeData - Visit place data
 * @returns {object} - Complete place data with SEO fields
 */
function autoGenerateVisitPlaceSEO(placeData) {
  const {
    name: title,
    description,
    location
  } = placeData;
  
  const isProduct = false;
  const locationStr = location?.address || location?.district || '';
  
  // Generate missing SEO fields
  const seoFields = {
    seoTitle: placeData.seoTitle || generateSEOTitle(title, 'Heritage Site'),
    seoDescription: placeData.seoDescription || generateSEODescription({
      title, description, location: locationStr, isProduct
    }),
    imageAlt: placeData.imageAlt || generateImageAlt(title, 'Heritage Site', `in ${locationStr}`),
    metaKeywords: placeData.metaKeywords?.length > 0 
      ? placeData.metaKeywords 
      : generateMetaKeywords({ title, description, isProduct }),
    lastSEOUpdate: new Date()
  };
  
  // Calculate SEO score
  const completeData = { ...placeData, ...seoFields };
  seoFields.seoScore = calculateSEOScore(completeData);
  
  return seoFields;
}

/**
 * Validate SEO fields before saving
 * @param {object} seoData - SEO field data
 * @returns {object} - Validation result with isValid and errors
 */
function validateSEOFields(seoData) {
  const errors = [];
  const {
    seoTitle,
    seoDescription,
    imageAlt,
    metaKeywords = []
  } = seoData;
  
  // SEO Title validation
  if (seoTitle) {
    if (seoTitle.length > 60) {
      errors.push('SEO title must be 60 characters or less');
    }
    if (seoTitle.length < 10) {
      errors.push('SEO title should be at least 10 characters');
    }
  }
  
  // SEO Description validation
  if (seoDescription) {
    if (seoDescription.length > 160) {
      errors.push('SEO description must be 160 characters or less');
    }
    if (seoDescription.length < 50) {
      errors.push('SEO description should be at least 50 characters');
    }
  }
  
  // Image Alt validation
  if (imageAlt) {
    if (imageAlt.length > 125) {
      errors.push('Image alt text must be 125 characters or less');
    }
    if (imageAlt.length < 5) {
      errors.push('Image alt text should be at least 5 characters');
    }
  }
  
  // Meta keywords validation
  if (metaKeywords.length > 10) {
    errors.push('Meta keywords should not exceed 10 keywords');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  generateSEOTitle,
  generateSEODescription,
  generateImageAlt,
  generateMetaKeywords,
  calculateSEOScore,
  autoGenerateProductSEO,
  autoGenerateVisitPlaceSEO,
  validateSEOFields
};
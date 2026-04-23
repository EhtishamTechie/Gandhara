/**
 * SEO Slug Generation Utility
 * Generates and validates SEO-friendly URL slugs
 */

/**
 * Generate a SEO-friendly slug from text
 * @param {string} text - The text to convert to slug
 * @param {number} maxLength - Maximum length of slug (default: 60)
 * @returns {string} - SEO-friendly slug
 */
function generateSlug(text, maxLength = 60) {
  if (!text || typeof text !== 'string') {
    throw new Error('Text is required and must be a string');
  }

  return text
    .toLowerCase()
    .trim()
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Remove special characters except hyphens
    .replace(/[^a-z0-9-]/g, '')
    // Remove multiple consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Truncate to max length
    .substring(0, maxLength)
    // Remove trailing hyphen if truncation created one
    .replace(/-+$/, '');
}

/**
 * Generate a product slug from title and category
 * @param {string} title - Product title
 * @param {string[]} categories - Product categories
 * @param {string} productId - Product ID for uniqueness
 * @returns {string} - SEO-optimized product slug
 */
function generateProductSlug(title, categories = [], productId = '') {
  if (!title) {
    throw new Error('Product title is required for slug generation');
  }

  // Get primary category (first category)
  const primaryCategory = categories.length > 0 ? categories[0] : '';
  
  // Create base slug from category and title
  let baseSlug = '';
  if (primaryCategory) {
    const categorySlug = generateSlug(primaryCategory, 20);
    const titleSlug = generateSlug(title, 35);
    baseSlug = `${categorySlug}-${titleSlug}`;
  } else {
    baseSlug = generateSlug(title, 50);
  }

  // Don't add product ID to slug - uniqueness is handled by ensureUniqueSlug
  // if (productId) {
  //   const shortId = productId.toString().slice(-6);
  //   baseSlug = `${baseSlug}-${shortId}`;
  // }

  return baseSlug;
}

/**
 * Generate a visit place slug from name and location
 * @param {string} name - Place name
 * @param {string} location - Location/district
 * @returns {string} - SEO-optimized place slug
 */
function generateVisitPlaceSlug(name, location = '') {
  if (!name) {
    throw new Error('Place name is required for slug generation');
  }

  let baseSlug = generateSlug(name, 40);
  
  if (location) {
    const locationSlug = generateSlug(location, 15);
    baseSlug = `${baseSlug}-${locationSlug}`;
  }

  return baseSlug;
}

/**
 * Validate if a slug meets SEO requirements
 * @param {string} slug - Slug to validate
 * @returns {object} - Validation result with isValid and errors
 */
function validateSlug(slug) {
  const errors = [];
  
  if (!slug || typeof slug !== 'string') {
    errors.push('Slug is required and must be a string');
    return { isValid: false, errors };
  }

  // Check format
  if (!/^[a-z0-9-]+$/.test(slug)) {
    errors.push('Slug can only contain lowercase letters, numbers, and hyphens');
  }

  // Check length
  if (slug.length < 3) {
    errors.push('Slug must be at least 3 characters long');
  }
  
  if (slug.length > 100) {
    errors.push('Slug must be less than 100 characters');
  }

  // Check for consecutive hyphens
  if (slug.includes('--')) {
    errors.push('Slug cannot contain consecutive hyphens');
  }

  // Check for leading/trailing hyphens
  if (slug.startsWith('-') || slug.endsWith('-')) {
    errors.push('Slug cannot start or end with hyphens');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Ensure slug is unique in the database
 * @param {string} baseSlug - Base slug to check
 * @param {object} Model - Mongoose model to check against
 * @param {string} currentId - Current document ID (for updates)
 * @returns {Promise<string>} - Unique slug
 */
async function ensureUniqueSlug(baseSlug, Model, currentId = null) {
  const validation = validateSlug(baseSlug);
  if (!validation.isValid) {
    throw new Error(`Invalid slug: ${validation.errors.join(', ')}`);
  }

  let uniqueSlug = baseSlug;
  let counter = 1;
  
  while (true) {
    // Check if slug exists (excluding current document if updating)
    const query = { slug: uniqueSlug };
    if (currentId) {
      query._id = { $ne: currentId };
    }
    
    const existingDoc = await Model.findOne(query);
    
    if (!existingDoc) {
      return uniqueSlug;
    }
    
    // Generate new slug with counter
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
    
    // Prevent infinite loop
    if (counter > 1000) {
      throw new Error('Unable to generate unique slug after 1000 attempts');
    }
  }
}

/**
 * Calculate SEO score based on slug quality
 * @param {string} slug - Slug to analyze
 * @param {string} title - Original title for comparison
 * @returns {number} - SEO score (0-20)
 */
function calculateSlugSEOScore(slug, title = '') {
  let score = 0;
  
  // Base validation (5 points)
  const validation = validateSlug(slug);
  if (validation.isValid) {
    score += 5;
  }
  
  // Length optimization (5 points)
  if (slug.length >= 10 && slug.length <= 60) {
    score += 5;
  } else if (slug.length >= 5 && slug.length <= 80) {
    score += 3;
  }
  
  // Keyword presence (5 points)
  if (title) {
    const titleWords = title.toLowerCase().split(/\s+/);
    const slugWords = slug.split('-');
    const matchingWords = titleWords.filter(word => 
      slugWords.some(slugWord => slugWord.includes(word.toLowerCase()))
    );
    
    if (matchingWords.length >= titleWords.length * 0.7) {
      score += 5;
    } else if (matchingWords.length >= titleWords.length * 0.5) {
      score += 3;
    }
  }
  
  // Readability (5 points)
  const wordCount = slug.split('-').length;
  if (wordCount >= 3 && wordCount <= 6) {
    score += 5;
  } else if (wordCount >= 2 && wordCount <= 8) {
    score += 3;
  }
  
  return Math.min(score, 20);
}

/**
 * Generate slug suggestions based on title and keywords
 * @param {string} title - Product/place title
 * @param {string[]} keywords - Related keywords
 * @param {string[]} categories - Categories
 * @returns {string[]} - Array of slug suggestions
 */
function generateSlugSuggestions(title, keywords = [], categories = []) {
  const suggestions = [];
  
  // Basic title slug
  suggestions.push(generateSlug(title));
  
  // Title with category
  if (categories.length > 0) {
    suggestions.push(generateProductSlug(title, categories));
  }
  
  // Title with primary keyword
  if (keywords.length > 0) {
    const primaryKeyword = keywords[0];
    suggestions.push(generateSlug(`${primaryKeyword} ${title}`));
  }
  
  // Shortened version
  const words = title.split(' ');
  if (words.length > 3) {
    const shortTitle = words.slice(0, 3).join(' ');
    suggestions.push(generateSlug(shortTitle));
  }
  
  // Remove duplicates and return
  return [...new Set(suggestions)];
}

module.exports = {
  generateSlug,
  generateProductSlug,
  generateVisitPlaceSlug,
  validateSlug,
  ensureUniqueSlug,
  calculateSlugSEOScore,
  generateSlugSuggestions
};
// Add this function after formatCategoryName in ProductPage.jsx

const getCategoryMapping = (urlName) => {
  const mappings = {
    'gandhara-art': 'Gandhara Art',
    'antique-products': 'Antique Products', 
    'calligraphy': 'Calligraphy',
    'crockery': 'Crockery',
    'home-decor': 'Home Decor',
    'garden-decor': 'Garden Decor',
    'fireplaces': 'Fireplaces',
    'building-embellishing': 'Building Embellishing',
    'fountains': 'Fountains',
    'mortar-and-pestle': 'Mortar and Pestle',
    'grinding-mills': 'Grinding Mills',
    'ashtray': 'Ashtray',
    'coin': 'Coin',
    'decorative-motive': 'Decorative Motive',
    'stone-sanitary': 'Stone Sanitary',
    'moulded-art': 'Moulded Art',
    'jewellery': 'Jewellery',
    'carved-stone': 'Carved Stone',
    'precious-stone': 'Precious Stone',
    'salt': 'Salt',
    'featured-products': 'Featured Products',
    'luxury-collection': 'Luxury Collection',
    'luxary-collection': 'Luxary Collection', // Handle typo
    'raw-stone': 'Raw Stone',
    'grave-designs': 'Grave Designs'
  };
  
  return mappings[urlName] || formatCategoryName(urlName);
};

// Modified fetch function that gets all products and filters client-side
const fetchProducts = async () => {
  setLoading(true);
  setError(null);
  try {
    // Get ALL products instead of category-specific
    const response = await axios.get(`${API_BASE_URL}/products/all`);
    const allProducts = response.data;
    
    // Get the expected category name
    const expectedCategory = getCategoryMapping(categoryName);
    
    // Filter products that have this category in their categories array
    const categoryProducts = allProducts.filter(product => {
      if (!product.categories || !Array.isArray(product.categories)) return false;
      return product.categories.some(cat => 
        cat.toLowerCase() === expectedCategory.toLowerCase() ||
        cat === expectedCategory
      );
    });
    
    setProducts(categoryProducts);
    console.log(`Found ${categoryProducts.length} products for category: ${expectedCategory}`);
  } catch (err) {
    setError(err.message);
    console.error(`Error fetching products for category ${categoryName}:`, err);
  } finally {
    setLoading(false);
  }
};

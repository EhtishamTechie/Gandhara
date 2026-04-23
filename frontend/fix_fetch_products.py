import re

# Read the file
with open('src/pages/ProductPage.jsx', 'r') as file:
    content = file.read()

# Define the new fetchProducts function
new_fetch_function = '''const fetchProducts = async () => {
  setLoading(true);
  setError(null);
  try {
    console.log('Fetching products for category:', categoryName);
    const response = await axios.get(`${API_BASE_URL}/products/all`);
    const allProducts = response.data;
    
    if (!Array.isArray(allProducts)) {
      throw new Error('Invalid response format');
    }
    
    console.log('Total products fetched:', allProducts.length);
    
    // Get all unique categories for debugging
    const allCategories = new Set();
    allProducts.forEach(product => {
      if (product.categories && Array.isArray(product.categories)) {
        product.categories.forEach(cat => allCategories.add(cat));
      }
    });
    console.log('All available categories:', Array.from(allCategories).sort());
    
    const expectedCategory = getCategoryMapping(categoryName);
    console.log('Expected category after mapping:', expectedCategory);
    
    const categoryProducts = allProducts.filter(product => {
      if (!product.categories || !Array.isArray(product.categories)) return false;
      return product.categories.some(cat => {
        const match = cat.toLowerCase().trim() === expectedCategory.toLowerCase().trim();
        if (match) console.log('Match found:', cat, 'for product:', product.title);
        return match;
      });
    });
    
    console.log(`Found ${categoryProducts.length} products for category: ${expectedCategory}`);
    setProducts(categoryProducts);
    
  } catch (err) {
    console.error(`Error fetching products for category ${categoryName}:`, err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};'''

# Replace the old fetchProducts function
pattern = r'const fetchProducts = async \(\) => \{[^}]*\}\s*catch[^}]*\}\s*finally[^}]*\}\s*\};'
content = re.sub(pattern, new_fetch_function, content, flags=re.DOTALL)

# Write back to file
with open('src/pages/ProductPage.jsx', 'w') as file:
    file.write(content)

print("fetchProducts function has been updated!")

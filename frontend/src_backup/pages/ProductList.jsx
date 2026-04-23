import { useState, useEffect } from "react";
import { PencilIcon, TrashIcon, MagnifyingGlassIcon, XMarkIcon, CheckIcon } from '@heroicons/react/20/solid';
import WatermarkedImage from '../components/WatermarkedImage';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [searchProduct, setSearchProduct] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Edit form states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    keywords: "",
    description: "",
    price: "",
    categories: [],
    image: null,
    imagePreview: null
  });
  const [saveLoading, setSaveLoading] = useState(false);

  const categoriesList = [
    "Gandhara Art", "Antique Products", "Calligraphy", "Crockery", "Home Decor", "Garden Decor",
    "Fireplaces", "Building Embellishing", "Fountains", "Ashtray and Mortar", "Decorative Motive",
    "Stone Sanitary", "Moulded Art", "Jewellery", "Carved Stone", "Precious Stone", "Salt", 
    "featuredProducts", "Luxary Collection", "Raw Stone","Mortar and Pestle","Grinding Mills","Coin",
    "Grave Designs"
  ];

  // Get API URL from environment variables
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      console.log("Fetching products from:", `${API_BASE_URL}/api/products/all`);
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/products/all`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Products data:", data);
      
      setProducts(Array.isArray(data) ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : []);
    } catch (err) {
      console.error("Error loading products:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          alert("Product deleted successfully.");
          fetchProducts();
        } else {
          throw new Error('Failed to delete product');
        }
      } catch (err) {
        console.error("Failed to delete product:", err);
        alert("Failed to delete product. Please check console.");
      }
    }
  };

  const handleEdit = (product) => {
    console.log("Editing product:", product);
    setEditingProduct(product);
    setEditForm({
      title: product.title || "",
      keywords: product.keywords ? product.keywords.join(", ") : "",
      description: product.description || "",
      price: product.price ? product.price.toString() : "",
      categories: product.categories ? [...product.categories] : [],
      image: null,
      imagePreview: product.image ? `${API_BASE_URL}/${product.image}` : null
    });
    setShowEditModal(true);
  };

  const handleEditFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCategoryChange = (category, checked) => {
    setEditForm(prev => ({
      ...prev,
      categories: checked 
        ? [...prev.categories, category]
        : prev.categories.filter(c => c !== category)
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditForm(prev => ({
        ...prev,
        image: file
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm(prev => ({
          ...prev,
          imagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEdit = async () => {
    setSaveLoading(true);
    
    try {
      const formData = new FormData();
      formData.append("title", editForm.title);
      
      const processedKeywords = editForm.keywords.split(',').map(k => k.trim()).filter(k => k !== '');
      formData.append("keywords", processedKeywords.join(','));
      formData.append("description", editForm.description);
      formData.append("price", editForm.price);
      formData.append("categories", JSON.stringify(editForm.categories));
      
      if (editForm.image) {
        formData.append("image", editForm.image);
      }

      console.log("Saving product with ID:", editingProduct._id);
      const response = await fetch(`${API_BASE_URL}/api/products/${editingProduct._id}`, {
        method: 'PUT',
        body: formData
      });
      
      if (response.ok) {
        alert('Product updated successfully!');
        setShowEditModal(false);
        setEditingProduct(null);
        resetEditForm();
        fetchProducts();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update product');
      }
    } catch (err) {
      console.error("Failed to update product:", err);
      alert('Failed to update product. Please check console for details.');
    } finally {
      setSaveLoading(false);
    }
  };

  const resetEditForm = () => {
    setEditForm({
      title: "",
      keywords: "",
      description: "",
      price: "",
      categories: [],
      image: null,
      imagePreview: null
    });
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingProduct(null);
    resetEditForm();
  };

  const filteredProducts = products.filter(p => {
    const title = p.title || "";
    const keywords = p.keywords || [];
    const categories = p.categories || [];
    
    return title.toLowerCase().includes(searchProduct.toLowerCase()) ||
           keywords.join(" ").toLowerCase().includes(searchProduct.toLowerCase()) ||
           categories.join(" ").toLowerCase().includes(searchProduct.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        <span className="ml-4">Loading products...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold">Error Loading Products</h3>
        <p className="text-red-600 mt-2">Error: {error}</p>
        <p className="text-red-600 mt-1">API URL: {API_BASE_URL}/api/products/all</p>
        <button 
          onClick={fetchProducts}
          className="mt-3 bg-red-100 hover:bg-red-200 px-4 py-2 rounded text-red-800 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md border border-stone-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-stone-900">Products Management</h2>
            <p className="text-sm text-stone-600">Edit and delete your products</p>
          </div>
          <div className="text-sm text-stone-500">
            Total: {products.length} products
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-stone-400" />
          </div>
          <input
            type="text"
            placeholder="Search products by title, keywords, or categories..."
            value={searchProduct}
            onChange={(e) => setSearchProduct(e.target.value)}
            className="block w-full rounded-md border-stone-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 sm:text-sm py-2 px-3 pl-10 placeholder-stone-400"
          />
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-stone-200 hover:shadow-lg transition-shadow duration-300">
              <div className="relative">
                <WatermarkedImage
                  src={`${API_BASE_URL}/${product.image}`}
                  alt={product.title || 'Product'}
                  className="w-full h-48 object-cover"
                  watermarkOpacity={0.4}
                  showLogo={true}
                  showWhatsApp={true}
                />
              </div>
              
              <div className="p-4">
                <h4 className="text-base font-semibold text-stone-800 mb-1 line-clamp-2" title={product.title}>
                  {product.title || 'Untitled Product'}
                </h4>
                <p className="text-lg font-bold text-teal-700 mb-2">
                  ${product.price ? product.price.toFixed(2) : '0.00'}
                </p>
                
                {/* Categories */}
                {product.categories && product.categories.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {product.categories.slice(0, 2).map((cat, idx) => (
                        <span key={idx} className="inline-block text-xs bg-stone-100 text-stone-700 px-2 py-1 rounded">
                          {cat}
                        </span>
                      ))}
                      {product.categories.length > 2 && (
                        <span className="inline-block text-xs bg-stone-100 text-stone-700 px-2 py-1 rounded">
                          +{product.categories.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end items-center pt-3 border-t border-stone-100 space-x-2">
                  <button 
                    onClick={() => handleEdit(product)} 
                    className="inline-flex items-center gap-x-1 rounded bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 hover:bg-yellow-200 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 transition-colors duration-150 ease-in-out"
                  >
                    <PencilIcon className="h-3 w-3" /> Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(product._id, product.title)} 
                    className="inline-flex items-center gap-x-1 rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 transition-colors duration-150 ease-in-out"
                  >
                    <TrashIcon className="h-3 w-3" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md border border-stone-200 p-12 text-center">
          <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-stone-400 mb-4" />
          <h3 className="text-lg font-medium text-stone-900 mb-2">No products found</h3>
          <p className="text-stone-500">
            {searchProduct ? `No products match "${searchProduct}"` : "No products available yet"}
          </p>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-stone-900">Edit Product: {editingProduct.title}</h3>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="text-stone-400 hover:text-stone-600 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Product Title</label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => handleEditFormChange('title', e.target.value)}
                      className="block w-full rounded-md border-stone-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 sm:text-sm py-2 px-3"
                      required
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Price (USD)</label>
                    <input
                      type="number"
                      value={editForm.price}
                      onChange={(e) => handleEditFormChange('price', e.target.value)}
                      className="block w-full rounded-md border-stone-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 sm:text-sm py-2 px-3"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  {/* Keywords */}
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Keywords (comma separated)</label>
                    <input
                      type="text"
                      value={editForm.keywords}
                      onChange={(e) => handleEditFormChange('keywords', e.target.value)}
                      className="block w-full rounded-md border-stone-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 sm:text-sm py-2 px-3"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => handleEditFormChange('description', e.target.value)}
                      className="block w-full rounded-md border-stone-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 sm:text-sm py-2 px-3 min-h-[120px] resize-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Product Image</label>
                    <input
                      type="file"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded"
                      accept=".jpg,.jpeg,.png"
                    />
                    {editForm.imagePreview && (
                      <div className="mt-3">
                        <WatermarkedImage
                          src={editForm.imagePreview}
                          alt="Preview"
                          className="h-32 w-auto rounded border border-stone-200 shadow-sm"
                          watermarkOpacity={0.3}
                          showLogo={true}
                          showWhatsApp={true}
                        />
                      </div>
                    )}
                  </div>

                  {/* Categories */}
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Categories</label>
                    <div className="max-h-48 overflow-y-auto p-3 border border-stone-200 rounded-md bg-stone-50">
                      <div className="grid grid-cols-1 gap-2">
                        {categoriesList.map((cat) => (
                          <label key={cat} className="inline-flex items-center text-sm text-stone-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editForm.categories.includes(cat)}
                              onChange={(e) => handleCategoryChange(cat, e.target.checked)}
                              className="mr-2 rounded border-stone-300 text-teal-600 focus:ring-teal-500 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                            />
                            <span>{cat}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    {editForm.categories.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {editForm.categories.map((cat) => (
                          <span key={cat} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                            {cat}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="inline-flex items-center gap-x-1.5 rounded-md bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-200 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 transition-colors duration-150 ease-in-out"
                  disabled={saveLoading}
                >
                  <XMarkIcon className="h-4 w-4" />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="inline-flex items-center gap-x-1.5 rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 transition-colors duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={saveLoading}
                >
                  {saveLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <CheckIcon className="h-4 w-4" />
                  )}
                  {saveLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
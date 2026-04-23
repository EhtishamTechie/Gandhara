import { useState, useEffect } from "react";
import { getImageUrl } from "../utils/imageHelper.js";
import { PencilIcon, TrashIcon, MagnifyingGlassIcon, XMarkIcon, CheckIcon, EyeIcon, FunnelIcon, PlusIcon } from '@heroicons/react/20/solid';
import { motion, AnimatePresence } from "framer-motion";
import WatermarkedImage from '../components/WatermarkedImage';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [searchProduct, setSearchProduct] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");

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
      console.log("Fetching products from:", `${API_BASE_URL}/products/category/${encodeURIComponent(categoryName)}`);
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/products/category/${encodeURIComponent(categoryName)}`);

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
        const response = await fetch(`${API_BASE_URL}/products/category/${encodeURIComponent(categoryName)}/${id}`, {
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
      imagePreview: product.image ? getImageUrl(product.image) : null
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
      const response = await fetch(`${API_BASE_URL}/products/category/${encodeURIComponent(categoryName)}/${editingProduct._id}`, {
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

  // Enhanced filtering and sorting
  const filteredProducts = products
    .filter(p => {
      const title = p.title || "";
      const keywords = p.keywords || [];
      const categories = p.categories || [];
      const matchesSearch = title.toLowerCase().includes(searchProduct.toLowerCase()) ||
                           keywords.join(" ").toLowerCase().includes(searchProduct.toLowerCase()) ||
                           categories.join(" ").toLowerCase().includes(searchProduct.toLowerCase());
      
      const matchesCategory = filterCategory === "all" || categories.includes(filterCategory);
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "price-high":
          return (b.price || 0) - (a.price || 0);
        case "price-low":
          return (a.price || 0) - (b.price || 0);
        case "title":
          return (a.title || "").localeCompare(b.title || "");
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600"></div>
            <span className="text-slate-600 font-medium">Loading products...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 shadow-sm">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XMarkIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-red-800 font-semibold text-lg mb-2">Error Loading Products</h3>
              <p className="text-red-600 mb-2">Error: {error}</p>
              <p className="text-red-600 text-sm mb-6">API URL: {API_BASE_URL}/products/category/${encodeURIComponent(categoryName)}</p>
              <button
                onClick={fetchProducts}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Product Management</h1>
                <p className="text-slate-600">Manage your product catalog with advanced tools</p>
              </div>
              <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                  {products.length} Total Products
                </div>
                <div className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium">
                  {filteredProducts.length} Showing
                </div>
              </div>
            </div>

            {/* Enhanced Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative lg:col-span-2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search products by title, keywords, or categories..."
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 pl-10 placeholder-slate-400 bg-white"
                />
                {searchProduct && (
                  <button
                    onClick={() => setSearchProduct('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="relative">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 bg-white appearance-none pr-8"
                >
                  <option value="all">All Categories</option>
                  {categoriesList.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <FunnelIcon className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 bg-white appearance-none pr-8"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">By Title</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="price-low">Price: Low to High</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200"
              >
                <div className="relative overflow-hidden">
                  <div className="aspect-square">
                    <WatermarkedImage
                      src={getImageUrl(product.image)}
                      alt={product.title || 'Product'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      watermarkOpacity={0.4}
                      showLogo={true}
                      showWhatsApp={true}
                    />
                  </div>
                  
                  {/* Quick Action Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="bg-white/90 hover:bg-white text-slate-700 p-2 rounded-lg shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-200"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product._id, product.title)}
                        className="bg-white/90 hover:bg-white text-red-600 p-2 rounded-lg shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-200"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Price Badge */}
                  {product.price && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                      ${product.price.toFixed(2)}
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {product.title || 'Untitled Product'}
                  </h3>

                  {/* Categories */}
                  {product.categories && product.categories.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {product.categories.slice(0, 2).map((cat, idx) => (
                          <span key={idx} className="inline-block text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full font-medium">
                            {cat}
                          </span>
                        ))}
                        {product.categories.length > 2 && (
                          <span className="inline-block text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-medium">
                            +{product.categories.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 inline-flex items-center justify-center gap-x-1.5 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-100 transition-colors duration-200"
                    >
                      <PencilIcon className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id, product.title)}
                      className="flex-1 inline-flex items-center justify-center gap-x-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors duration-200"
                    >
                      <TrashIcon className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="bg-white rounded-2xl shadow-lg p-12 max-w-lg mx-auto">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MagnifyingGlassIcon className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No products found</h3>
              <p className="text-slate-600 mb-6">
                {searchProduct ? `No products match "${searchProduct}"` : "No products available yet"}
              </p>
              {searchProduct && (
                <button
                  onClick={() => setSearchProduct('')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Clear Search
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Edit Product Modal */}
        <AnimatePresence>
          {showEditModal && editingProduct && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">Edit Product</h3>
                      <p className="text-sm text-slate-600 mt-1">{editingProduct.title}</p>
                    </div>
                    <button
                      onClick={closeEditModal}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                <div className="px-6 py-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Basic Info */}
                    <div className="space-y-6">
                      {/* Title */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Product Title</label>
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={(e) => handleEditFormChange('title', e.target.value)}
                          className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3 px-4"
                          placeholder="Enter product title"
                          required
                        />
                      </div>

                      {/* Price */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Price (USD)</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-slate-500 sm:text-sm">$</span>
                          </div>
                          <input
                            type="number"
                            value={editForm.price}
                            onChange={(e) => handleEditFormChange('price', e.target.value)}
                            className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3 px-4 pl-8"
                            placeholder="0.00"
                            required
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>

                      {/* Keywords */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Keywords</label>
                        <input
                          type="text"
                          value={editForm.keywords}
                          onChange={(e) => handleEditFormChange('keywords', e.target.value)}
                          className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3 px-4"
                          placeholder="Enter keywords separated by commas"
                        />
                        <p className="text-xs text-slate-500 mt-1">Separate multiple keywords with commas</p>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                        <textarea
                          value={editForm.description}
                          onChange={(e) => handleEditFormChange('description', e.target.value)}
                          rows={6}
                          className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3 px-4 resize-none"
                          placeholder="Enter product description"
                          required
                        />
                      </div>
                    </div>

                    {/* Right Column - Image & Categories */}
                    <div className="space-y-6">
                      {/* Image Upload */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Product Image</label>
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
                          <input
                            type="file"
                            onChange={handleImageChange}
                            className="hidden"
                            accept=".jpg,.jpeg,.png"
                            id="image-upload"
                          />
                          <label htmlFor="image-upload" className="cursor-pointer">
                            {editForm.imagePreview ? (
                              <div className="space-y-4">
                                <WatermarkedImage
                                  src={editForm.imagePreview}
                                  alt="Preview"
                                  className="h-48 w-auto mx-auto rounded-lg shadow-md"
                                  watermarkOpacity={0.3}
                                  showLogo={true}
                                  showWhatsApp={true}
                                />
                                <p className="text-sm text-indigo-600 font-medium">Click to change image</p>
                              </div>
                            ) : (
                              <div>
                                <PlusIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                                <p className="text-sm text-slate-600 font-medium">Click to upload image</p>
                                <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 10MB</p>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>

                      {/* Categories */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Categories</label>
                        <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-lg p-4 bg-slate-50">
                          <div className="grid grid-cols-1 gap-3">
                            {categoriesList.map((cat) => (
                              <label key={cat} className="inline-flex items-center text-sm cursor-pointer hover:bg-white rounded-lg p-2 transition-colors">
                                <input
                                  type="checkbox"
                                  checked={editForm.categories.includes(cat)}
                                  onChange={(e) => handleCategoryChange(cat, e.target.checked)}
                                  className="mr-3 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                                />
                                <span className="text-slate-700 font-medium">{cat}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        
                        {editForm.categories.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {editForm.categories.map((cat) => (
                              <span key={cat} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                {cat}
                                <button
                                  onClick={() => handleCategoryChange(cat, false)}
                                  className="ml-2 text-indigo-600 hover:text-indigo-800"
                                >
                                  <XMarkIcon className="h-3 w-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 rounded-b-2xl">
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={closeEditModal}
                      className="inline-flex items-center gap-x-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors duration-200"
                      disabled={saveLoading}
                    >
                      <XMarkIcon className="h-4 w-4" />
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      className="inline-flex items-center gap-x-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={saveLoading}
                    >
                      {saveLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <CheckIcon className="h-4 w-4" />
                      )}
                      {saveLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProductList;











   

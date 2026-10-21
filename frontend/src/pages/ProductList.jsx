import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { getImageUrl } from "../utils/imageHelper.js";
import { PencilIcon, TrashIcon, MagnifyingGlassIcon, XMarkIcon, CheckIcon, EyeIcon, FunnelIcon, PlusIcon, ArrowPathIcon } from '@heroicons/react/20/solid';
import { useCategoryList } from '../hooks/useApi';
import '../styles/animations.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [searchProduct, setSearchProduct] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const ITEMS_PER_PAGE = 50; // Server-side pagination — 50 per page

  // Edit form states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    keywords: "",
    description: "",
    price: "",
    categories: [],
    // Featured spotlight controls
    featuredUntil: "",
    isSoldOut: false,
    image: null,
    imagePreview: null
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [spotlightDays, setSpotlightDays] = useState('');

  // Toast notification state
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showToast = (text, type = 'success') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ text, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Image rotation states for edit modal
  const [imageRotation, setImageRotation] = useState(0);
  const [rotatedImageBlob, setRotatedImageBlob] = useState(null);
  const [isRotating, setIsRotating] = useState(false);

  // Fetch categories from backend (admin-managed)
  const { data: catData } = useCategoryList();
  const categoriesList = catData?.categories
    ? catData.categories.map(c => c.name)
    : [];

  // Get API URL from environment variables
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Debounce + fetch: debounce fires fetchProducts with EXPLICIT current values
  // to avoid stale closure bugs entirely.
  const debounceTimer = useRef(null);
  useEffect(() => {
    clearTimeout(debounceTimer.current);
    const search = searchProduct;        // capture current value now
    const category = filterCategory;     // capture current value now
    debounceTimer.current = setTimeout(() => {
      fetchProducts(1, true, search, category);
    }, searchProduct === '' ? 0 : 400);  // no delay when clearing search
    return () => clearTimeout(debounceTimer.current);
  }, [searchProduct, filterCategory]);

  // Fetch products — search + category passed EXPLICITLY, defaults to current state
  const fetchProducts = async (pageNum = 1, resetProducts = true, search = searchProduct, category = filterCategory) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({ page: pageNum, limit: ITEMS_PER_PAGE });
      if (search)              params.set('search', search);
      if (category !== 'all') params.set('category', category);

      const response = await fetch(`${API_BASE_URL}/api/admin/products?${params}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (resetProducts || pageNum === 1) {
        setProducts(data.products || []);
      } else {
        setProducts(prev => [...prev, ...(data.products || [])]);
      }

      setTotal(data.total || 0);
      setHasMore(data.hasMore || false);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading products:', error);
      setError(error.message);
      if (pageNum === 1) setProducts([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // loadMore function removed since we directly call fetchProducts in the observer

  // Infinite scroll using IntersectionObserver with callback ref pattern
  const observer = useRef(null);
  const sentinelRef = useCallback(node => {
    if (observer.current) observer.current.disconnect();
    
    if (loadingMore || !hasMore || !node) return;

    const rootElement = document.getElementById('admin-main-scroll');
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        fetchProducts(page + 1, false, searchProduct, filterCategory);
      }
    }, { root: rootElement, rootMargin: '400px', threshold: 0.1 });
    
    observer.current.observe(node);
  }, [loadingMore, hasMore, page, searchProduct, filterCategory]);

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_BASE_URL}/api/admin/products/${id}`, {
          method: 'DELETE',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });

        if (response.ok) {
          setProducts(prev => prev.filter(p => p._id !== id));
          setTotal(prev => Math.max(0, prev - 1));
          showToast("Product deleted successfully.");
        } else {
          throw new Error('Failed to delete product');
        }
      } catch (err) {
        console.error("Failed to delete product:", err);
        showToast("Failed to delete product. Please check console.", 'error');
      }
    }
  };

  const handleEdit = (product) => {
    console.log("Editing product:", product);
    setEditingProduct(product);
    // Clean keywords: some old products have JSON-stringified values like [\"word\"]  
    const cleanKeywords = (kw) => {
      if (!kw || !kw.length) return '';
      return kw.map(k => k.replace(/^\\"|\\"$|^"|"$/g, '').trim()).filter(Boolean).join(', ');
    };
    setEditForm({
      title: product.title || "",
      seoTitle: product.seoTitle || "",
      keywords: cleanKeywords(product.keywords),
      description: product.description || "",
      price: product.price ? product.price.toString() : "",
      categories: product.categories ? [...product.categories] : [],
      featuredUntil: product.featuredUntil ? new Date(product.featuredUntil).toISOString().slice(0, 16) : "",
      isSoldOut: Boolean(product.isSoldOut),
      image: null,
      imagePreview: product.image ? getImageUrl(product.image) : null
    });
    setSpotlightDays('');
    // Reset rotation states when opening edit modal
    setImageRotation(0);
    setRotatedImageBlob(null);
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

  // Image rotation function for edit modal
  const rotateImage = async (degrees) => {
    if (!editForm.image) return;

    setIsRotating(true);
    const newRotation = (imageRotation + degrees) % 360;
    setImageRotation(newRotation);

    try {
      // Create a canvas to rotate the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      await new Promise((resolve, reject) => {
        img.onload = () => {
          // Set canvas dimensions based on rotation
          const isRotated90or270 = newRotation === 90 || newRotation === 270;
          canvas.width = isRotated90or270 ? img.height : img.width;
          canvas.height = isRotated90or270 ? img.width : img.height;

          // Clear canvas and set up rotation
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((newRotation * Math.PI) / 180);
          ctx.drawImage(img, -img.width / 2, -img.height / 2);

          // Convert to blob and update preview
          canvas.toBlob((blob) => {
            if (blob) {
              setRotatedImageBlob(blob);
              // Update preview with rotated image
              const reader = new FileReader();
              reader.onloadend = () => {
                setEditForm(prev => ({
                  ...prev,
                  imagePreview: reader.result
                }));
                resolve();
              };
              reader.readAsDataURL(blob);
            } else {
              reject(new Error('Failed to create rotated image blob'));
            }
          }, 'image/jpeg', 0.9);
        };

        img.onerror = reject;
        img.src = URL.createObjectURL(editForm.image);
      });
    } catch (error) {
      console.error('Error rotating image:', error);
      alert('Failed to rotate image. Please try again.');
    } finally {
      setIsRotating(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditForm(prev => ({
        ...prev,
        image: file
      }));
      // Reset rotation when new image is selected
      setImageRotation(0);
      setRotatedImageBlob(null);

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

  // Save function
  const handleSaveEdit = async () => {
    setSaveLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", editForm.title);
      formData.append("seoTitle", editForm.seoTitle || '');

      const processedKeywords = editForm.keywords.split(',').map(k => k.trim()).filter(k => k !== '');
      formData.append("keywords", JSON.stringify(processedKeywords));
      formData.append("description", editForm.description);
      formData.append("price", editForm.price);
      formData.append("categories", JSON.stringify(editForm.categories));
      // Featured spotlight controls
      formData.append("featuredUntil", editForm.featuredUntil ? new Date(editForm.featuredUntil).toISOString() : '');
      formData.append("isSoldOut", String(Boolean(editForm.isSoldOut)));

      // Use rotated image if available, otherwise use original
      const imageToUpload = rotatedImageBlob || editForm.image;
      if (imageToUpload) {
        formData.append("image", imageToUpload);
      }

      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/api/admin/products/${editingProduct._id}`, {
        method: 'PUT',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        const updated = data.product || {
          ...editingProduct,
          title: editForm.title,
          seoTitle: editForm.seoTitle,
          price: editForm.price ? parseFloat(editForm.price) : 0,
          categories: editForm.categories,
          description: editForm.description,
          keywords: processedKeywords,
          isSoldOut: Boolean(editForm.isSoldOut),
          featuredUntil: editForm.featuredUntil || null
        };

        // Update product in-place so no refetching or filter resetting occurs!
        setProducts(prev => prev.map(p => p._id === editingProduct._id ? { ...p, ...updated } : p));
        setShowEditModal(false);
        setEditingProduct(null);
        resetEditForm();
        showToast('Product updated successfully!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update product');
      }
    } catch (err) {
      console.error("Failed to update product:", err);
      showToast(err.message || 'Failed to update product. Please check console.', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  const resetEditForm = () => {
    setEditForm({
      title: "",
      seoTitle: "",
      keywords: "",
      description: "",
      price: "",
      categories: [],
      featuredUntil: "",
      isSoldOut: false,
      image: null,
      imagePreview: null
    });
    setSpotlightDays('');
    // Reset rotation states
    setImageRotation(0);
    setRotatedImageBlob(null);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingProduct(null);
    resetEditForm();
  };

  // Client-side sort only (search + category filtering is now server-side)
  const filteredProducts = products
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div
          className="mb-8 animate-fadeInUp"
        >
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Product Management</h1>
                <p className="text-slate-600">Manage your product catalog with advanced tools</p>
              </div>
              <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                  {total || products.length} Total Products
                </div>
                <div className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium">
                  {filteredProducts.length} of {total || products.length} Loaded
                </div>
              </div>
            </div>

            {/* Enhanced Search and Filters */}
            <div className="space-y-4">
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

                {/* Category Filter Dropdown */}
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

              {/* Category Filter Buttons (All Categories without truncation) */}
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
                <button
                  onClick={() => setFilterCategory("all")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                    filterCategory === "all" 
                      ? "bg-indigo-600 text-white shadow-sm" 
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  All Categories ({total})
                </button>
                {categoriesList.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                      filterCategory === cat 
                        ? "bg-indigo-600 text-white shadow-sm" 
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {cat}{filterCategory === cat ? ` (${total})` : ''}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Error State Banner (Keeps Header & Controls Mounted) */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 text-center animate-fadeInUp">
            <p className="text-red-800 font-semibold text-lg mb-1">Error Loading Products</p>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button
              onClick={() => fetchProducts(1, true, searchProduct, filterCategory)}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Products Grid or Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-pulse">
                <div className="aspect-square bg-slate-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                  <div className="pt-3 border-t border-slate-100 flex gap-2">
                    <div className="h-8 bg-slate-100 rounded flex-1"></div>
                    <div className="h-8 bg-slate-100 rounded flex-1"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredProducts.map((product, index) => (
              <div
                key={product._id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200 animate-fadeInUp"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="relative overflow-hidden">
                  <div className="aspect-square">
                    <img
                      src={getImageUrl(product.image)}
                      alt={product.title || 'Product'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 select-none"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/GandharaImages/Gandharalogo.webp';
                      }}
                      onContextMenu={(e) => e.preventDefault()}
                      onDragStart={(e) => e.preventDefault()}
                      draggable={false}
                      style={{ pointerEvents: 'auto' }}
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
                  <h3 className="text-lg font-semibold text-slate-900 mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {product.seoTitle || product.title || 'Untitled Product'}
                  </h3>
                  {/* Show DB title if different from seoTitle so admin knows both names */}
                  {product.seoTitle && product.title && product.seoTitle !== product.title && (
                    <p className="text-xs text-slate-400 mb-2 line-clamp-1" title={`DB title: ${product.title}`}>
                      DB: {product.title}
                    </p>
                  )}

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
              </div>
            ))}
          </div>

          {/* Sentinel element for IntersectionObserver-based infinite scroll */}
          {hasMore && (
            <div ref={sentinelRef} className="flex justify-center py-8">
              {loadingMore && (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              )}
            </div>
          )}
          </>
        ) : (
          <div
            className="text-center py-16 animate-fadeInUp"
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
          </div>
        )}

        {/* Edit Product Modal - Rendered via React Portal directly into document.body to bypass all CSS containing blocks from animations/transforms */}
        {showEditModal && editingProduct && createPortal(
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn"
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
                        <label className="block text-sm font-medium text-slate-700 mb-2">Internal Title <span className="text-xs text-slate-400">(used for slug/URL)</span></label>
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={(e) => handleEditFormChange('title', e.target.value)}
                          className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3 px-4"
                          placeholder="Enter internal title"
                          required
                        />
                      </div>

                      {/* SEO Title */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Display Title <span className="text-xs text-slate-400">(shown on product page)</span></label>
                        <input
                          type="text"
                          value={editForm.seoTitle}
                          onChange={(e) => handleEditFormChange('seoTitle', e.target.value)}
                          className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3 px-4"
                          placeholder="Leave blank to auto-generate from Internal Title"
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
                      {/* Image Upload with Rotation */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Product Image <span className="text-xs text-slate-500">(.jpg, .jpeg, .png)</span>
                        </label>
                        <input
                          type="file"
                          onChange={handleImageChange}
                          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                          accept=".jpg,.jpeg,.png"
                        />

                        {/* Image Preview with Rotation Controls */}
                        {editForm.imagePreview && (
                          <div className="mt-4 p-4 border border-slate-200 rounded-lg bg-slate-50">
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-sm text-slate-600">Image Preview:</p>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-slate-500">Rotation: {imageRotation}°</span>
                                {(imageRotation !== 0 || rotatedImageBlob) && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Modified
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col items-center space-y-4">
                              {/* Image Preview */}
                              <div className="relative">
                                <img
                                  src={editForm.imagePreview}
                                  alt="Preview"
                                  className="h-48 w-auto rounded border border-slate-200 shadow-sm transition-transform duration-300"
                                />
                              </div>

                              {/* Rotation Controls - Only show if image is uploaded */}
                              {editForm.image && (
                                <div className="flex items-center justify-center space-x-3 p-3 bg-white rounded-lg border border-slate-200">
                                  <button
                                    type="button"
                                    onClick={() => rotateImage(-90)}
                                    disabled={isRotating || saveLoading}
                                    className="inline-flex items-center gap-x-1.5 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {isRotating ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                                    ) : (
                                      <ArrowPathIcon className="h-4 w-4 transform -scale-x-100" />
                                    )}
                                    Rotate Left
                                  </button>

                                  <div className="flex flex-col items-center">
                                    <span className="text-xs text-slate-500 mb-1">Current Angle</span>
                                    <span className="text-sm font-medium text-slate-700 px-2 py-1 bg-slate-100 rounded">
                                      {imageRotation}°
                                    </span>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => rotateImage(90)}
                                    disabled={isRotating || saveLoading}
                                    className="inline-flex items-center gap-x-1.5 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {isRotating ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                                    ) : (
                                      <ArrowPathIcon className="h-4 w-4" />
                                    )}
                                    Rotate Right
                                  </button>
                                </div>
                              )}

                              {/* Reset Rotation Button */}
                              {imageRotation !== 0 && editForm.image && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setImageRotation(0);
                                    setRotatedImageBlob(null);
                                    // Reset to original image preview
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      setEditForm(prev => ({
                                        ...prev,
                                        imagePreview: reader.result
                                      }));
                                    };
                                    reader.readAsDataURL(editForm.image);
                                  }}
                                  disabled={isRotating || saveLoading}
                                  className="text-xs text-slate-500 hover:text-slate-700 underline transition-colors duration-150"
                                >
                                  Reset to Original
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Categories */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Categories</label>
                        <div className="mt-2 p-4 border border-slate-200 rounded-lg max-h-48 overflow-y-auto bg-slate-50">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                            {categoriesList.map((cat) => (
                              <label key={cat} className="inline-flex items-center text-sm text-slate-700 cursor-pointer hover:text-slate-900">
                                <input
                                  type="checkbox"
                                  value={cat}
                                  onChange={(e) => handleCategoryChange(cat, e.target.checked)}
                                  checked={editForm.categories.includes(cat)}
                                  className="mr-2 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                />
                                <span className="truncate">{cat}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        {editForm.categories.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {editForm.categories.map((cat) => (
                              <span key={cat} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                {cat}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Home Featured spotlight controls */}
                      <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700">Home Featured spotlight</label>
                            <p className="text-xs text-slate-500 mt-1">
                              Set a spotlight duration (days) and mark sold out when the item sells.
                            </p>
                          </div>
                          <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={Boolean(editForm.isSoldOut)}
                              onChange={(e) => handleEditFormChange('isSoldOut', e.target.checked)}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            Sold out
                          </label>
                        </div>

                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Spotlight days</label>
                            <input
                              type="number"
                              min="1"
                              placeholder="e.g. 7"
                              value={spotlightDays}
                              onChange={(e) => setSpotlightDays(e.target.value)}
                              className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 bg-white"
                            />
                          </div>
                          <div className="sm:col-span-2 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const days = Number(spotlightDays);
                                if (!Number.isFinite(days) || days <= 0) return;
                                const d = new Date();
                                d.setDate(d.getDate() + days);
                                handleEditFormChange('featuredUntil', d.toISOString().slice(0, 16));
                              }}
                              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                              disabled={!spotlightDays || saveLoading}
                            >
                              Set spotlight
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEditFormChange('featuredUntil', '')}
                              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-white text-slate-700 text-sm font-semibold border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50"
                              disabled={saveLoading}
                            >
                              Clear
                            </button>
                          </div>
                        </div>

                        <div className="mt-3">
                          <label className="block text-xs font-medium text-slate-600 mb-1">Spotlight until</label>
                          <input
                            type="datetime-local"
                            value={editForm.featuredUntil}
                            onChange={(e) => handleEditFormChange('featuredUntil', e.target.value)}
                            className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 bg-white"
                          />
                          <p className="text-xs text-slate-500 mt-1">
                            If this is in the future, the homepage will pick it as the main featured item (unless it’s sold out).
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end space-x-3 pt-6 mt-8 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={closeEditModal}
                      disabled={saveLoading}
                      className="inline-flex items-center gap-x-1.5 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XMarkIcon className="h-4 w-4" />
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      disabled={saveLoading || isRotating}
                      className="inline-flex items-center gap-x-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
          , document.body)}

        {/* Toast Notification */}
        {toast && createPortal(
          <div className={`fixed bottom-6 right-6 z-[10000] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-medium animate-fadeInUp transition-all ${
            toast.type === 'error'
              ? 'bg-red-600 text-white shadow-red-500/30'
              : 'bg-emerald-600 text-white shadow-emerald-500/30'
          }`}>
            {toast.type === 'error' ? (
              <XMarkIcon className="h-5 w-5 text-white" />
            ) : (
              <CheckIcon className="h-5 w-5 text-white" />
            )}
            <span>{toast.text}</span>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
};

export default ProductList;


   

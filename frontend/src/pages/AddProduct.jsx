import { useState, useEffect } from "react";
import { PlusIcon, PencilIcon, XMarkIcon, CheckIcon, ArrowPathIcon } from '@heroicons/react/20/solid';
import AdminLogin from '../components/AdminLogin';
import { useCategoryList } from '../hooks/useApi';

// Get API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL;

const AddProduct = () => {
  const [title, setTitle] = useState("");
  const [keywords, setKeywords] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editingProductId, setEditingProductId] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // SEO Fields
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [slugPreview, setSlugPreview] = useState("");
  
  // Image rotation states
  const [imageRotation, setImageRotation] = useState(0);
  const [rotatedImageBlob, setRotatedImageBlob] = useState(null);
  const [isRotating, setIsRotating] = useState(false);

  // Home Featured spotlight controls
  const [featuredUntil, setFeaturedUntil] = useState("");
  const [isSoldOut, setIsSoldOut] = useState(false);
  const [spotlightDays, setSpotlightDays] = useState("");

  // Fetch categories from backend (admin-managed)
  const { data: catData } = useCategoryList();
  const categoriesList = catData?.categories
    ? catData.categories.map(c => c.name)
    : [];

  // Auto-generate SEO fields when title or categories change
  useEffect(() => {
    if (title && !editingProductId) {
      // Auto-generate slug preview
      const category = categories[0] || '';
      const categorySlug = category.toLowerCase().replace(/\s+/g, '-');
      const titleSlug = title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');
      setSlugPreview(category ? `${categorySlug}-${titleSlug}` : titleSlug);
      
      // Auto-generate SEO title if empty
      if (!seoTitle) {
        const category = categories[0] || '';
        const autoSeoTitle = category ? `${title} - ${category} | Gandhara Arts` : `${title} | Gandhara Arts`;
        if (autoSeoTitle.length <= 60) {
          setSeoTitle(autoSeoTitle);
        }
      }
      
      // Auto-generate image alt if empty
      if (!imageAlt) {
        const category = categories[0] || '';
        setImageAlt(category ? `${title} - ${category} - Authentic Pakistani stone craft` : `${title} - Authentic Pakistani stone craft`);
      }
    }
  }, [title, categories, editingProductId, seoTitle, imageAlt]);

  const resetForm = () => {
    setTitle("");
    setKeywords("");
    setDescription("");
    setPrice("");
    setCategories([]);
    setImage(null);
    setImagePreview(null);
    setEditingProductId(null);
    // Reset SEO fields
    setSeoTitle("");
    setSeoDescription("");
    setImageAlt("");
    setFocusKeyword("");
    setShortDescription("");
    setSlugPreview("");
    setFeaturedUntil("");
    setIsSoldOut(false);
    setSpotlightDays("");
    // Reset rotation states
    setImageRotation(0);
    setRotatedImageBlob(null);
  };

  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    setCategories((prev) => checked ? [...prev, value] : prev.filter((c) => c !== value));
  };

  // Image rotation function
  const rotateImage = async (degrees) => {
    if (!image) return;
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
                setImagePreview(reader.result);
                resolve();
              };
              reader.readAsDataURL(blob);
            } else {
              reject(new Error('Failed to create rotated image blob'));
            }
          }, 'image/jpeg', 0.9);
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(image);
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
      setImage(file);
      // Reset rotation when new image is selected
      setImageRotation(0);
      setRotatedImageBlob(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImage(null);
      setImagePreview(null);
      setImageRotation(0);
      setRotatedImageBlob(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("title", title);

    const processedKeywords = keywords.split(',').map(k => k.trim()).filter(k => k !== '');
    formData.append("keywords", processedKeywords.join(','));  // Send as comma-separated string
    formData.append("description", description);
    formData.append("price", price);
    formData.append("categories", JSON.stringify(categories));

    // SEO Fields
    if (seoTitle) formData.append("seoTitle", seoTitle);
    if (seoDescription) formData.append("seoDescription", seoDescription);
    if (imageAlt) formData.append("imageAlt", imageAlt);
    if (focusKeyword) formData.append("focusKeyword", focusKeyword);
    if (shortDescription) formData.append("shortDescription", shortDescription);

    // Home Featured spotlight controls
    formData.append("featuredUntil", featuredUntil ? new Date(featuredUntil).toISOString() : '');
    formData.append("isSoldOut", String(Boolean(isSoldOut)));

    // Use rotated image if available, otherwise use original
    const imageToUpload = rotatedImageBlob || image;
    if (imageToUpload) {
      formData.append("image", imageToUpload);
    }
    
    // Debug: Log what we're sending
    console.log('Form data being sent:');
    for (let [key, value] of formData.entries()) {
      console.log(key, typeof value === 'object' ? '[File]' : value);
    }

    // ✅ FIXED: Use environment-aware URL
    const isDev = import.meta.env.DEV;
    const baseURL = isDev 
      ? 'http://localhost:5000'
      : import.meta.env.VITE_API_URL || window.location.origin;
    
    const url = editingProductId
      ? `${baseURL}/api/admin/products/${editingProductId}`
      : `${baseURL}/api/admin/products/add`;
    const method = editingProductId ? "PUT" : "POST";

    try {
      // Get auth token for admin routes
      const token = localStorage.getItem('adminToken');
      
      // Check if user is authenticated
      if (!token) {
        alert('Please log in as admin first!');
        return;
      }
      
      console.log('Submitting to:', url);
      console.log('Method:', method);
      console.log('Has token:', !!token);
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      // Check if response has content before trying to parse JSON
      let result = {};
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        const text = await response.text();
        if (text) {
          try {
            result = JSON.parse(text);
          } catch (parseError) {
            console.error('JSON parse error:', parseError, 'Response text:', text);
            throw new Error('Invalid response from server');
          }
        }
      } else {
        // Non-JSON response, get as text for debugging
        const text = await response.text();
        console.error('Non-JSON response:', response.status, text);
        throw new Error(`Server error: ${response.status} - ${text || 'No response'}`);
      }

      if (response.ok) {
        alert(`Product ${editingProductId ? 'updated' : 'added'} successfully! SEO Score: ${result.seoScore || 'N/A'}/100`);
        resetForm();
      } else {
        // Enhanced error handling for SEO validation
        if (result.errors && Array.isArray(result.errors)) {
          const errorDetails = result.details ? 
            `\n\nCurrent values:\n- SEO Title: ${result.details.seoTitle}\n- SEO Description: ${result.details.seoDescription}\n- Image Alt: ${result.details.imageAlt}` : '';
          throw new Error(`${result.message}:\n${result.errors.join('\n')}${errorDetails}`);
        } else {
          throw new Error(result.message || `Server error: ${response.status}`);
        }
      }
    } catch (err) {
      console.error("Failed to save product:", err);
      alert(`Failed to save product: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "block w-full rounded-md border-stone-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm py-2 px-3 placeholder-stone-400";
  const labelClass = "block text-sm font-medium text-stone-700 mb-1";
  const primaryButtonClass = "inline-flex items-center gap-x-1.5 rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 transition-colors duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed";
  const secondaryButtonClass = "inline-flex items-center gap-x-1.5 rounded-md bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-800 shadow-sm hover:bg-stone-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-400 transition-colors duration-150 ease-in-out";
  const fileInputClass = "block w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100";

  return (
    <div className="max-w-4xl mx-auto">
      {/* Admin Login Component */}
      <AdminLogin />
      
      <div className="bg-white rounded-lg shadow-md border border-stone-200">
        <div className="px-6 py-4 border-b border-stone-200">
          <h2 className="text-xl font-semibold text-stone-900">
            {editingProductId ? "Edit Product" : "Add New Product"}
          </h2>
          <p className="text-sm text-stone-600 mt-1">
            Fill in the details below to {editingProductId ? 'update' : 'create'} a product
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6" encType="multipart/form-data">
          {/* Product Title */}
          <div>
            <label htmlFor="title" className={labelClass}>Product Title</label>
            <input
              type="text"
              id="title"
              placeholder="e.g., Hand-Carved Buddha Statue"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
              required
            />
          </div>

          {/* Price and Keywords Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="price" className={labelClass}>Price (USD)</label>
              <input
                type="number"
                id="price"
                placeholder="e.g., 199.99"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={inputClass}
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label htmlFor="keywords" className={labelClass}>
                Keywords <span className="text-xs text-stone-500">(comma separated)</span>
              </label>
              <input
                type="text"
                id="keywords"
                placeholder="e.g., gandhara, buddha, carving, stone"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className={labelClass}>Product Description</label>
            <textarea
              id="description"
              placeholder="Detailed description of the product..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputClass} min-h-[120px] resize-none`}
              required
            />
            <p className="text-xs text-stone-500 mt-1">Main product description for customers</p>
          </div>

          {/* Short Description */}
          <div>
            <label htmlFor="shortDescription" className={labelClass}>
              Short Description <span className="text-xs text-stone-500">(for previews)</span>
            </label>
            <textarea
              id="shortDescription"
              placeholder="Brief summary for product cards and previews..."
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className={`${inputClass} min-h-[80px] resize-none`}
              maxLength={200}
            />
            <p className="text-xs text-stone-500 mt-1">{shortDescription.length}/200 characters</p>
          </div>

          {/* SEO SECTION */}
          <div className="border-t border-stone-200 pt-6">
            <h3 className="text-lg font-medium text-stone-900 mb-4 flex items-center">
              <span className="bg-teal-100 text-teal-800 text-xs font-medium px-2 py-1 rounded-full mr-2">SEO</span>
              Search Engine Optimization
            </h3>
            
            {/* Slug Preview */}
            {slugPreview && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <label className="block text-sm font-medium text-blue-700 mb-1">URL Preview</label>
                <p className="text-sm text-blue-600 font-mono">
                  gandhara-arts.com/product/<span className="font-bold">{slugPreview}</span>
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SEO Title */}
              <div>
                <label htmlFor="seoTitle" className={labelClass}>
                  SEO Title <span className="text-xs text-stone-500">(appears in search results)</span>
                </label>
                <input
                  type="text"
                  id="seoTitle"
                  placeholder="Handmade Buddha Statue - Gandhara Art | Gandhara Arts"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className={inputClass}
                  maxLength={60}
                />
                <p className={`text-xs mt-1 ${
                  seoTitle.length < 10 ? 'text-red-500' : 
                  seoTitle.length > 50 ? 'text-orange-500' : 'text-green-600'
                }`}>
                  {seoTitle.length}/60 characters 
                  {seoTitle.length < 10 && '(minimum 10 characters required)'}
                  {seoTitle.length >= 10 && seoTitle.length <= 50 && '✓'}
                  {seoTitle.length > 50 && '(getting long)'}
                </p>
              </div>

              {/* Focus Keyword */}
              <div>
                <label htmlFor="focusKeyword" className={labelClass}>
                  Focus Keyword <span className="text-xs text-stone-500">(main SEO target)</span>
                </label>
                <input
                  type="text"
                  id="focusKeyword"
                  placeholder="buddha statue"
                  value={focusKeyword}
                  onChange={(e) => setFocusKeyword(e.target.value)}
                  className={inputClass}
                  maxLength={50}
                />
                <p className="text-xs text-stone-500 mt-1">Primary keyword to rank for</p>
              </div>
            </div>

            {/* SEO Description */}
            <div className="mt-6">
              <label htmlFor="seoDescription" className={labelClass}>
                SEO Description <span className="text-xs text-stone-500">(appears in search results)</span>
              </label>
              <textarea
                id="seoDescription"
                placeholder="Authentic handmade Buddha statue from Gandhara tradition. Carved by Pakistani artisans in Taxila. Price: $199. Worldwide shipping available."
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                className={`${inputClass} min-h-[80px] resize-none`}
                maxLength={160}
              />
              <p className={`text-xs mt-1 ${
                seoDescription.length < 50 ? 'text-red-500' : 
                seoDescription.length > 150 ? 'text-orange-500' : 'text-green-600'
              }`}>
                {seoDescription.length}/160 characters 
                {seoDescription.length < 50 && '(minimum 50 characters required)'}
                {seoDescription.length >= 50 && seoDescription.length <= 150 && '✓'}
                {seoDescription.length > 150 && '(getting long)'}
              </p>
            </div>

            {/* Image Alt Text */}
            <div className="mt-6">
              <label htmlFor="imageAlt" className={labelClass}>
                Image Alt Text <span className="text-red-500">*</span> <span className="text-xs text-stone-500">(for accessibility & SEO)</span>
              </label>
              <input
                type="text"
                id="imageAlt"
                placeholder="Handmade Buddha statue - Gandhara Art - Authentic Pakistani stone craft"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                className={inputClass}
                maxLength={125}
                required
              />
              <p className={`text-xs mt-1 ${
                imageAlt.length < 5 ? 'text-red-500' : 
                imageAlt.length > 100 ? 'text-orange-500' : 'text-green-600'
              }`}>
                Describes the image for visually impaired users and search engines 
                ({imageAlt.length}/125 characters)
                {imageAlt.length < 5 && ' - Minimum 5 characters required'}
                {imageAlt.length >= 5 && imageAlt.length <= 100 && ' ✓'}
              </p>
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className={labelClass}>Categories</label>
            <div className="mt-2 p-4 border border-stone-200 rounded-md max-h-48 overflow-y-auto bg-stone-50">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-3">
                {categoriesList.map((cat) => (
                  <label key={cat} className="inline-flex items-center text-sm text-stone-700 cursor-pointer hover:text-stone-900">
                    <input
                      type="checkbox"
                      value={cat}
                      onChange={handleCategoryChange}
                      checked={categories.includes(cat)}
                      className="mr-2 rounded border-stone-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                    />
                    <span className="truncate">{cat}</span>
                  </label>
                ))}
              </div>
            </div>
            {categories.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <span key={cat} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                    {cat}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Home Featured spotlight controls */}
          <div className="border border-stone-200 rounded-md p-4 bg-stone-50">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-stone-800">Home Featured spotlight</h3>
                <p className="text-xs text-stone-500 mt-1">
                  Optional. Set a spotlight duration (days) and mark sold out when the item sells.
                </p>
              </div>
              <label className="inline-flex items-center gap-2 text-sm font-medium text-stone-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={Boolean(isSoldOut)}
                  onChange={(e) => setIsSoldOut(e.target.checked)}
                  className="mr-1 rounded border-stone-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                />
                Sold out
              </label>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Spotlight days</label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 7"
                  value={spotlightDays}
                  onChange={(e) => setSpotlightDays(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="md:col-span-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const days = Number(spotlightDays);
                    if (!Number.isFinite(days) || days <= 0) return;
                    const d = new Date();
                    d.setDate(d.getDate() + days);
                    setFeaturedUntil(d.toISOString().slice(0, 16));
                  }}
                  className={primaryButtonClass}
                  disabled={!spotlightDays || loading}
                >
                  Set spotlight
                </button>
                <button
                  type="button"
                  onClick={() => setFeaturedUntil("")}
                  className={secondaryButtonClass}
                  disabled={loading}
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-medium text-stone-600 mb-1">Spotlight until</label>
              <input
                type="datetime-local"
                value={featuredUntil}
                onChange={(e) => setFeaturedUntil(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Image Upload with Rotation Controls */}
          <div>
            <label htmlFor="image" className={labelClass}>
              Product Image <span className="text-xs text-stone-500">(.jpg, .jpeg, .png)</span>
            </label>
            <input
              type="file"
              id="image"
              onChange={handleImageChange}
              className={fileInputClass}
              accept=".jpg,.jpeg,.png"
            />

            {/* Image Preview with Rotation Controls */}
            {imagePreview && (
              <div className="mt-4 p-4 border border-stone-200 rounded-md bg-stone-50">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-stone-600">Image Preview:</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-stone-500">Rotation: {imageRotation}°</span>
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
                      src={imagePreview}
                      alt="Preview"
                      className="h-48 w-auto rounded border border-stone-200 shadow-sm transition-transform duration-300"
                    />
                  </div>

                  {/* Rotation Controls */}
                  <div className="flex items-center justify-center space-x-3 p-3 bg-white rounded-lg border border-stone-200">
                    <button
                      type="button"
                      onClick={() => rotateImage(-90)}
                      disabled={isRotating || loading}
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
                      <span className="text-xs text-stone-500 mb-1">Current Angle</span>
                      <span className="text-sm font-medium text-stone-700 px-2 py-1 bg-stone-100 rounded">
                        {imageRotation}°
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => rotateImage(90)}
                      disabled={isRotating || loading}
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

                  {/* Reset Rotation Button */}
                  {imageRotation !== 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setImageRotation(0);
                        setRotatedImageBlob(null);
                        // Reset to original image preview
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setImagePreview(reader.result);
                        };
                        reader.readAsDataURL(image);
                      }}
                      disabled={isRotating || loading}
                      className="text-xs text-stone-500 hover:text-stone-700 underline transition-colors duration-150"
                    >
                      Reset to Original
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-stone-200">
            {editingProductId && (
              <button
                type="button"
                onClick={resetForm}
                className={secondaryButtonClass}
                disabled={loading}
              >
                <XMarkIcon className="h-4 w-4" />
                <span>Cancel Edit</span>
              </button>
            )}
            <button
              type="submit"
              className={primaryButtonClass}
              disabled={loading || isRotating}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : editingProductId ? (
                <PencilIcon className="h-4 w-4" />
              ) : (
                <PlusIcon className="h-4 w-4" />
              )}
              <span>
                {loading ? 'Saving...' : editingProductId ? "Update Product" : "Add Product"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;

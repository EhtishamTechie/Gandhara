import { useState, useEffect } from "react";
import { PlusIcon, PencilIcon, XMarkIcon, CheckIcon, ArrowPathIcon } from '@heroicons/react/20/solid';

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
  
  // NEW: Image rotation states
  const [imageRotation, setImageRotation] = useState(0);
  const [rotatedImageBlob, setRotatedImageBlob] = useState(null);
  const [isRotating, setIsRotating] = useState(false);

  const categoriesList = [
    "Gandhara Art", "Antique Products", "Calligraphy", "Crockery", "Home Decor", "Garden Decor",
    "Fireplaces", "Building Embellishing", "Fountains", "Ashtray and Mortar", "Decorative Motive",
    "Stone Sanitary", "Moulded Art", "Jewellery", "Carved Stone", "Precious Stone", "Salt", 
    "featuredProducts", "Luxary Collection", "Raw Stone","Mortar and Pestle","Grinding Mills","Coin",
    "Grave Designs" // ✅ Added Grave Designs category
  ];

  const resetForm = () => {
    setTitle(""); 
    setKeywords(""); 
    setDescription(""); 
    setPrice("");
    setCategories([]); 
    setImage(null); 
    setImagePreview(null); 
    setEditingProductId(null);
    // NEW: Reset rotation states
    setImageRotation(0);
    setRotatedImageBlob(null);
  };

  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    setCategories((prev) => checked ? [...prev, value] : prev.filter((c) => c !== value));
  };

  // NEW: Image rotation function
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
    formData.append("keywords", JSON.stringify(processedKeywords));
    formData.append("description", description);
    formData.append("price", price);
    formData.append("categories", JSON.stringify(categories));
    
    // NEW: Use rotated image if available, otherwise use original
    const imageToUpload = rotatedImageBlob || image;
    if (imageToUpload) {
      formData.append("image", imageToUpload);
    }

    const url = editingProductId
      ? `${API_BASE_URL}/products/category/${encodeURIComponent(categoryName)}/${editingProductId}`
      : `${API_BASE_URL}/products/category/${encodeURIComponent(categoryName)}/add`;
    const method = editingProductId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        body: formData
      });
      
      if (response.ok) {
        alert(`Product ${editingProductId ? 'updated' : 'added'} successfully!`);
        resetForm();
      } else {
        throw new Error('Failed to save product');
      }
    } catch (err) {
      console.error("Failed to save product:", err);
      alert(`Failed to save product. Please check console for details.`);
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
            <label htmlFor="description" className={labelClass}>Description</label>
            <textarea 
              id="description" 
              placeholder="Detailed description of the product..." 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className={`${inputClass} min-h-[120px] resize-none`} 
              required 
            />
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
            
            {/* NEW: Image Preview with Rotation Controls */}
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

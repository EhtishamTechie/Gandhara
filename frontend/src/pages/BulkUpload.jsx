import React, { useState, useCallback, useEffect } from 'react';
import { Upload, FileImage, Package, CheckCircle, XCircle, AlertCircle, Image as ImageIcon, Tag } from 'lucide-react';
import axios from 'axios';
import { useCategoryList } from '../hooks/useApi';
import '../styles/animations.css';

const BulkUpload = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadType, setUploadType] = useState('images'); // 'images' or 'zip'
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  
  // Category selection state
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [customCategory, setCustomCategory] = useState('');
  const [showCategoryInput, setShowCategoryInput] = useState(false);

  // Fetch categories from backend (admin-managed)
  const { data: catData } = useCategoryList();
  const categoriesList = catData?.categories
    ? catData.categories.map(c => c.name)
    : [];

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('adminToken');
    if (!token) {
      console.warn('No authentication token found. Make sure you are logged in as admin.');
    }
  }, []);

  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  // Add custom category
  const addCustomCategory = () => {
    if (customCategory.trim() && !selectedCategories.includes(customCategory.trim())) {
      setSelectedCategories(prev => [...prev, customCategory.trim()]);
      setCustomCategory('');
      setShowCategoryInput(false);
    }
  };

  // Remove category
  const removeCategory = (category) => {
    setSelectedCategories(prev => prev.filter(c => c !== category));
  };

  // Handle file selection
  const handleFileSelect = useCallback((files) => {
    const fileArray = Array.from(files);

    if (uploadType === 'zip') {
      // Only allow ZIP files
      const zipFiles = fileArray.filter(file => file.type === 'application/zip');
      setSelectedFiles(zipFiles.slice(0, 1)); // Only one ZIP file
    } else {
      // Only allow image files
      const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
      setSelectedFiles(imageFiles.slice(0, 50)); // Max 50 images
    }
  }, [uploadType]);

  // Handle drag and drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  // Handle file input change
  const handleFileInputChange = (e) => {
    handleFileSelect(e.target.files);
  };

  // Remove selected file
  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Upload files
  const handleUpload = async () => {
    if (!selectedFiles.length) {
      alert('Please select files to upload');
      return;
    }

    if (selectedCategories.length === 0) {
      alert('Please select at least one category for your products');
      return;
    }

    // Try multiple possible token storage keys
    const token = localStorage.getItem('token') || 
                 localStorage.getItem('authToken') || 
                 localStorage.getItem('adminToken') ||
                 sessionStorage.getItem('token') ||
                 sessionStorage.getItem('authToken');
                 
    if (!token) {
      setResults({
        success: false,
        error: 'Authentication required. Please login as admin first. Make sure you are logged in through the admin panel.',
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setResults(null);

    const formData = new FormData();

    try {
      let endpoint;

      if (uploadType === 'zip') {
        // ZIP upload
        formData.append('zipFile', selectedFiles[0]);
        endpoint = '/api/bulk-upload/bulk-zip';
      } else {
        // Multiple images upload
        selectedFiles.forEach((file) => {
          formData.append('images', file);
        });
        endpoint = '/api/bulk-upload/bulk-images';
      }

      // Add selected categories to form data
      formData.append('categories', JSON.stringify(selectedCategories));

      console.log('Making request to:', endpoint);
      console.log('With categories:', selectedCategories);
      console.log('With token:', token ? 'Present' : 'Missing');

      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      setResults(response.data);
      setSelectedFiles([]); // Clear selected files

    } catch (error) {
      console.error('Upload error:', error);
      
      let errorMessage = 'Upload failed';
      
      if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login as admin again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied. Admin privileges required.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Upload endpoint not found. Make sure the server is running and routes are configured.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setResults({
        success: false,
        error: errorMessage,
        details: error.response?.data || error.message,
      });
    }

    setUploading(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div
          className="bg-white rounded-xl shadow-lg p-8 animate-fadeInUp"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Bulk Product Upload
            </h1>
            <p className="text-gray-600">
              Upload multiple product images at once or upload a ZIP file containing images
            </p>
          </div>

          {/* Category Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Tag size={20} className="mr-2" />
              Select Categories (Required)
            </h3>
            
            {/* Your Website Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {categoriesList.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  className={`p-3 rounded-lg text-sm font-medium transition-all hover-scale-sm text-left ${
                    selectedCategories.includes(category)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Custom Category Input */}
            <div className="mb-4">
              {!showCategoryInput ? (
                <button
                  onClick={() => setShowCategoryInput(true)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  + Add Custom Category
                </button>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Enter custom category"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addCustomCategory();
                      }
                    }}
                  />
                  <button
                    onClick={addCustomCategory}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowCategoryInput(false);
                      setCustomCategory('');
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Selected Categories Display */}
            {selectedCategories.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Selected categories:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedCategories.map((category) => (
                    <span
                      key={category}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {category}
                      <button
                        onClick={() => removeCategory(category)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Upload Type Selection */}
          <div className="mb-8">
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  setUploadType('images');
                  setSelectedFiles([]);
                }}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all hover-scale ${
                  uploadType === 'images'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ImageIcon size={20} />
                <span>Multiple Images</span>
              </button>

              <button
                onClick={() => {
                  setUploadType('zip');
                  setSelectedFiles([]);
                }}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all hover-scale ${
                  uploadType === 'zip'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Package size={20} />
                <span>ZIP File</span>
              </button>
            </div>
          </div>

          {/* File Upload Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
              dragOver
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            whileHover={{ scale: 1.01 }}
          >
            <input
              type="file"
              onChange={handleFileInputChange}
              multiple={uploadType === 'images'}
              accept={uploadType === 'images' ? 'image/*' : '.zip'}
              className="hidden"
              id="file-input"
            />

            <label htmlFor="file-input" className="cursor-pointer">
              <Upload size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {uploadType === 'images'
                  ? 'Drop your images here or click to browse'
                  : 'Drop your ZIP file here or click to browse'
                }
              </h3>
              <p className="text-gray-600">
                {uploadType === 'images'
                  ? 'Supports JPG, PNG, GIF, WebP (Max: 50 files)'
                  : 'Supports ZIP files containing images (Max: 100MB)'
                }
              </p>
            </label>
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div
              className="mt-6 animate-fadeInUp"
            >
                <h3 className="text-lg font-semibold mb-4">
                  Selected Files ({selectedFiles.length})
                </h3>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-lg animate-fadeInUp"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-center space-x-3">
                        <FileImage size={20} className="text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {file.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-800 p-1"
                        disabled={uploading}
                      >
                        <XCircle size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div
              className="mt-6 animate-fadeInUp"
            >
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-900 font-medium">
                    Uploading and processing...
                  </span>
                  <span className="text-blue-900">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Upload Button */}
          <div className="mt-8 text-center">
            <button
              onClick={handleUpload}
              disabled={!selectedFiles.length || selectedCategories.length === 0 || uploading}
              className={`px-8 py-3 rounded-lg font-semibold text-lg transition-all hover-scale ${
                !selectedFiles.length || selectedCategories.length === 0 || uploading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {uploading ? 'Processing...' : `Upload ${selectedFiles.length} Products`}
            </button>
            
            {selectedCategories.length === 0 && (
              <p className="text-red-500 text-sm mt-2">Please select at least one category</p>
            )}
          </div>

          {/* Results */}
          {results && (
            <div
              className="mt-8 animate-fadeInUp"
            >
                <div className={`rounded-lg p-6 ${
                  results.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center space-x-2 mb-4">
                    {results.success ? (
                      <CheckCircle className="text-green-600" size={24} />
                    ) : (
                      <XCircle className="text-red-600" size={24} />
                    )}
                    <h3 className={`text-lg font-semibold ${
                      results.success ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {results.success ? 'Upload Successful!' : 'Upload Failed'}
                    </h3>
                  </div>

                  {results.success ? (
                    <div>
                      <p className="text-green-800 mb-4">{results.message}</p>

                      {/* Statistics */}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {results.successful}
                          </div>
                          <div className="text-sm text-green-800">Successful</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">
                            {results.failed}
                          </div>
                          <div className="text-sm text-red-800">Failed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {results.total}
                          </div>
                          <div className="text-sm text-blue-800">Total</div>
                        </div>
                      </div>

                      {/* Successful Products */}
                      {results.results && results.results.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-green-900 mb-2">
                            Successfully Created Products:
                          </h4>
                          <div className="max-h-40 overflow-y-auto">
                            {results.results.map((product, index) => (
                              <div key={index} className="bg-green-100 p-2 rounded mb-2 text-sm">
                                <strong>{product.title}</strong>
                                <br />
                                <span className="text-green-700">
                                  Categories: {product.categories.join(', ')}
                                </span>
                                <br />
                                <span className="text-green-600">
                                  Keywords: {product.keywords.join(', ')}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Errors */}
                      {results.errors && results.errors.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-red-900 mb-2">
                            Errors:
                          </h4>
                          <div className="max-h-32 overflow-y-auto">
                            {results.errors.map((error, index) => (
                              <div key={index} className="bg-red-100 p-2 rounded mb-2 text-sm">
                                <strong>{error.filename}:</strong> {error.error}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="text-red-800 mb-2">{results.error}</p>
                      {results.details && (
                        <details className="text-sm text-red-700">
                          <summary className="cursor-pointer">Show technical details</summary>
                          <pre className="mt-2 p-2 bg-red-100 rounded text-xs overflow-auto">
                            {JSON.stringify(results.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default BulkUpload;

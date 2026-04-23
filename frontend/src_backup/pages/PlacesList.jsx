import { useState, useEffect } from "react";
import { PencilIcon, TrashIcon, MagnifyingGlassIcon, MapPinIcon, XMarkIcon, CheckIcon } from '@heroicons/react/20/solid';

// Get API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL;

const PlacesList = () => {
  const [visitPlaces, setVisitPlaces] = useState([]);
  const [searchVisitPlace, setSearchVisitPlace] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("");
  
  // Edit form states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlace, setEditingPlace] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    tourCategory: "",
    image: null,
    imagePreview: null
  });
  const [saveLoading, setSaveLoading] = useState(false);

  const tourCategoriesList = ["Featured", "Cultural", "Historical", "Adventure"];

  useEffect(() => {
    fetchVisitPlaces();
  }, []);

  const fetchVisitPlaces = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/visit-places/all`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Places API response:', data);
      
      // Handle different response formats
      let placesArray = [];
      if (Array.isArray(data)) {
        placesArray = data;
      } else if (data && Array.isArray(data.places)) {
        placesArray = data.places;
      } else if (data && data.message) {
        console.log('API message:', data.message);
        placesArray = [];
      } else {
        console.warn('Unexpected API response format:', data);
        placesArray = [];
      }
      
      setVisitPlaces(placesArray.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error("Error loading visit places:", err);
      alert(`Failed to load visit places: ${err.message}`);
      setVisitPlaces([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVisitDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/visit-places/${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          alert("Visit place deleted successfully.");
          fetchVisitPlaces();
        } else {
          throw new Error('Failed to delete visit place');
        }
      } catch (err) {
        console.error("Failed to delete visit place:", err);
        alert(`Failed to delete visit place. Please check console.`);
      }
    }
  };

  const handleVisitEdit = (place) => {
    console.log("Editing place:", place);
    setEditingPlace(place);
    setEditForm({
      name: place.name || "",
      description: place.description || "",
      tourCategory: place.tourCategory || "",
      image: null,
      imagePreview: place.image ? `${API_BASE_URL}/${place.image}` : null
    });
    setShowEditModal(true);
  };

  const handleEditFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
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
      formData.append("name", editForm.name);
      formData.append("description", editForm.description);
      formData.append("tourCategory", editForm.tourCategory);
      
      if (editForm.image) {
        formData.append("image", editForm.image);
      }

      console.log("Saving place with ID:", editingPlace._id);
      const response = await fetch(`${API_BASE_URL}/api/visit-places/${editingPlace._id}`, {
        method: 'PUT',
        body: formData
      });
      
      if (response.ok) {
        alert('Tour place updated successfully!');
        setShowEditModal(false);
        setEditingPlace(null);
        resetEditForm();
        fetchVisitPlaces();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update tour place');
      }
    } catch (err) {
      console.error("Failed to update tour place:", err);
      alert('Failed to update tour place. Please check console for details.');
    } finally {
      setSaveLoading(false);
    }
  };

  const resetEditForm = () => {
    setEditForm({
      name: "",
      description: "",
      tourCategory: "",
      image: null,
      imagePreview: null
    });
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingPlace(null);
    resetEditForm();
  };

  const filteredVisitPlaces = visitPlaces.filter(place => {
    const matchesSearch = (place.name || "").toLowerCase().includes(searchVisitPlace.toLowerCase()) ||
                         (place.description || "").toLowerCase().includes(searchVisitPlace.toLowerCase());
    const matchesCategory = !filterCategory || place.tourCategory === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category) => {
    const colors = {
      'Featured': 'bg-yellow-100 text-yellow-800',
      'Cultural': 'bg-purple-100 text-purple-800',
      'Historical': 'bg-blue-100 text-blue-800',
      'Adventure': 'bg-green-100 text-green-800'
    };
    return colors[category] || 'bg-stone-100 text-stone-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md border border-stone-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <MapPinIcon className="h-6 w-6 text-teal-600 mr-2" />
            <div>
              <h2 className="text-xl font-semibold text-stone-900">Tour Places Management</h2>
              <p className="text-sm text-stone-600">Edit and delete your tour places</p>
            </div>
          </div>
          <div className="text-sm text-stone-500">
            Total: {visitPlaces.length} places
          </div>
        </div>

        {/* Search and Filter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-stone-400" />
            </div>
            <input
              type="text"
              placeholder="Search places by name or description..."
              value={searchVisitPlace}
              onChange={(e) => setSearchVisitPlace(e.target.value)}
              className="block w-full rounded-md border-stone-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 sm:text-sm py-2 px-3 pl-10 placeholder-stone-400"
            />
          </div>
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="block w-full rounded-md border-stone-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 sm:text-sm py-2 px-3"
            >
              <option value="">All Categories</option>
              {tourCategoriesList.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Places Grid */}
      {filteredVisitPlaces.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVisitPlaces.map((place) => (
            <div key={place._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-stone-200 hover:shadow-lg transition-shadow duration-300">
              <div className="relative">
                <img
                  src={`${API_BASE_URL}/${place.image}`}
                  alt={place.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => { 
                    e.target.onerror = null; 
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                  }}
                />
                {place.tourCategory && (
                  <div className="absolute top-2 left-2">
                    <span className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(place.tourCategory)}`}>
                      {place.tourCategory}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h4 className="text-base font-semibold text-stone-800 mb-2 line-clamp-2" title={place.name}>
                  {place.name || 'Unnamed Place'}
                </h4>
                
                <p className="text-sm text-stone-600 leading-relaxed mb-4 line-clamp-3">
                  {place.description || 'No description available'}
                </p>

                {/* Action Buttons */}
                <div className="flex justify-end items-center pt-3 border-t border-stone-100 space-x-2">
                  <button 
                    onClick={() => handleVisitEdit(place)} 
                    className="inline-flex items-center gap-x-1 rounded bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 hover:bg-yellow-200 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 transition-colors duration-150 ease-in-out"
                  >
                    <PencilIcon className="h-3 w-3" /> Edit
                  </button>
                  <button 
                    onClick={() => handleVisitDelete(place._id, place.name)} 
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
          <div className="mx-auto h-12 w-12 text-stone-400 mb-4">
            <MapPinIcon className="h-full w-full" />
          </div>
          <h3 className="text-lg font-medium text-stone-900 mb-2">No tour places found</h3>
          <p className="text-stone-500">
            {searchVisitPlace || filterCategory ? 
              `No places match your search criteria` : 
              "No tour places available yet"
            }
          </p>
        </div>
      )}

      {/* Edit Place Modal */}
      {showEditModal && editingPlace && (
        <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <MapPinIcon className="h-6 w-6 text-teal-600 mr-2" />
                  <h3 className="text-lg font-medium text-stone-900">Edit Tour Place: {editingPlace.name}</h3>
                </div>
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
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Place Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => handleEditFormChange('name', e.target.value)}
                      className="block w-full rounded-md border-stone-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 sm:text-sm py-2 px-3"
                      required
                      placeholder="e.g., Taxila Museum"
                    />
                  </div>

                  {/* Tour Category */}
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Tour Category</label>
                    <select
                      value={editForm.tourCategory}
                      onChange={(e) => handleEditFormChange('tourCategory', e.target.value)}
                      className="block w-full rounded-md border-stone-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 sm:text-sm py-2 px-3"
                      required
                    >
                      <option value="">Select Category</option>
                      {tourCategoriesList.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => handleEditFormChange('description', e.target.value)}
                      className="block w-full rounded-md border-stone-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 sm:text-sm py-2 px-3 min-h-[120px] resize-none"
                      required
                      placeholder="Describe this tour place..."
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Place Image</label>
                    <input
                      type="file"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded"
                      accept=".jpg,.jpeg,.png"
                    />
                    {editForm.imagePreview && (
                      <div className="mt-3">
                        <img
                          src={editForm.imagePreview}
                          alt="Preview"
                          className="h-32 w-full rounded object-cover border border-stone-200 shadow-sm"
                        />
                      </div>
                    )}
                  </div>

                  {/* Category Preview */}
                  {editForm.tourCategory && (
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Category Preview</label>
                      <div className="p-3 border border-stone-200 rounded-md bg-stone-50">
                        <span className={`inline-block text-sm px-3 py-1 rounded-full font-medium ${getCategoryColor(editForm.tourCategory)}`}>
                          {editForm.tourCategory}
                        </span>
                      </div>
                    </div>
                  )}
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

export default PlacesList;
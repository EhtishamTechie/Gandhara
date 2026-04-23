import { useState, useEffect } from "react";
import { PencilIcon, TrashIcon, MagnifyingGlassIcon, EyeIcon, UserGroupIcon, XMarkIcon, CheckIcon } from '@heroicons/react/20/solid';

// Get API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL;

const MastersList = () => {
  const [masters, setMasters] = useState([]);
  const [searchMaster, setSearchMaster] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedMaster, setSelectedMaster] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterSpecialty, setFilterSpecialty] = useState("");
  
  // Edit form states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMaster, setEditingMaster] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    specialty: "",
    experience: "",
    description: "",
    image: null,
    imagePreview: null
  });
  const [saveLoading, setSaveLoading] = useState(false);

  const specialtyList = [
    "Gandhara Art", "Stone Carving", "Calligraphy", "Jewellery Making", 
    "Antique Restoration", "Moulded Art", "Garden Decor", "Building Embellishing"
  ];

  useEffect(() => {
    fetchMasters();
  }, []);

  const fetchMasters = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/masters/all`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Masters API response:', data);
      
      // Handle different response formats
      let mastersArray = [];
      if (Array.isArray(data)) {
        mastersArray = data;
      } else if (data && Array.isArray(data.masters)) {
        mastersArray = data.masters;
      } else if (data && data.message) {
        console.log('API message:', data.message);
        mastersArray = [];
      } else {
        console.warn('Unexpected API response format:', data);
        mastersArray = [];
      }
      
      setMasters(mastersArray.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error("Error loading masters:", err);
      alert(`Failed to load masters: ${err.message}`);
      setMasters([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMasterDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/masters/${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          alert("Master deleted successfully.");
          fetchMasters();
        } else {
          throw new Error('Failed to delete master');
        }
      } catch (err) {
        console.error("Failed to delete master:", err);
        alert(`Failed to delete master. Please check console.`);
      }
    }
  };

  const handleMasterEdit = (master) => {
    console.log("Editing master:", master);
    setEditingMaster(master);
    setEditForm({
      name: master.name || "",
      specialty: master.specialty || "",
      experience: master.experience ? master.experience.toString() : "",
      description: master.description || "",
      image: null,
      imagePreview: master.image ? `${API_BASE_URL}/${master.image}` : null
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
      formData.append("specialty", editForm.specialty);
      formData.append("experience", editForm.experience);
      formData.append("description", editForm.description);
      
      if (editForm.image) {
        formData.append("image", editForm.image);
      }

      console.log("Saving master with ID:", editingMaster._id);
      const response = await fetch(`${API_BASE_URL}/api/masters/${editingMaster._id}`, {
        method: 'PUT',
        body: formData
      });
      
      if (response.ok) {
        alert('Master updated successfully!');
        setShowEditModal(false);
        setEditingMaster(null);
        resetEditForm();
        fetchMasters();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update master');
      }
    } catch (err) {
      console.error("Failed to update master:", err);
      alert('Failed to update master. Please check console for details.');
    } finally {
      setSaveLoading(false);
    }
  };

  const resetEditForm = () => {
    setEditForm({
      name: "",
      specialty: "",
      experience: "",
      description: "",
      image: null,
      imagePreview: null
    });
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingMaster(null);
    resetEditForm();
  };

  const openMasterModal = (master) => {
    setSelectedMaster(master);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMaster(null);
  };

  const filteredMasters = masters.filter(master => {
    const matchesSearch = (master.name || "").toLowerCase().includes(searchMaster.toLowerCase()) ||
                         (master.description || "").toLowerCase().includes(searchMaster.toLowerCase());
    const matchesSpecialty = !filterSpecialty || master.specialty === filterSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const getSpecialtyColor = (specialty) => {
    const colors = {
      'Gandhara Art': 'bg-purple-100 text-purple-800',
      'Stone Carving': 'bg-stone-100 text-stone-800',
      'Calligraphy': 'bg-blue-100 text-blue-800',
      'Jewellery Making': 'bg-yellow-100 text-yellow-800',
      'Antique Restoration': 'bg-amber-100 text-amber-800',
      'Moulded Art': 'bg-green-100 text-green-800',
      'Garden Decor': 'bg-emerald-100 text-emerald-800',
      'Building Embellishing': 'bg-teal-100 text-teal-800'
    };
    return colors[specialty] || 'bg-stone-100 text-stone-800';
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
            <UserGroupIcon className="h-6 w-6 text-teal-600 mr-2" />
            <div>
              <h2 className="text-xl font-semibold text-stone-900">Master Craftsmen Management</h2>
              <p className="text-sm text-stone-600">View, edit, and delete your master craftsmen</p>
            </div>
          </div>
          <div className="text-sm text-stone-500">
            Total: {masters.length} masters
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
              placeholder="Search masters by name or description..."
              value={searchMaster}
              onChange={(e) => setSearchMaster(e.target.value)}
              className="block w-full rounded-md border-stone-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm py-2 px-3 pl-10 placeholder-stone-400"
            />
          </div>
          <div>
            <select
              value={filterSpecialty}
              onChange={(e) => setFilterSpecialty(e.target.value)}
              className="block w-full rounded-md border-stone-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm py-2 px-3"
            >
              <option value="">All Specialties</option>
              {specialtyList.map((specialty) => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Masters Grid */}
      {filteredMasters.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMasters.map((master) => (
            <div key={master._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-stone-200 hover:shadow-lg transition-shadow duration-300">
              <div className="relative p-6 text-center">
                <img
                  src={`${API_BASE_URL}/${master.image}`}
                  alt={master.name}
                  className="w-24 h-24 rounded-full object-cover mx-auto cursor-pointer border-4 border-stone-100 shadow-md"
                  onClick={() => openMasterModal(master)}
                  onError={(e) => { 
                    e.target.onerror = null; 
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                  }}
                />
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => openMasterModal(master)}
                    className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-1.5 transition-all duration-200"
                  >
                    <EyeIcon className="h-4 w-4 text-stone-600" />
                  </button>
                </div>
              </div>
              
              <div className="p-4 pt-0">
                <h4 className="text-base font-semibold text-stone-800 mb-1 text-center line-clamp-2" title={master.name}>
                  {master.name || 'Unnamed Master'}
                </h4>
                
                <div className="text-center mb-3">
                  <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${getSpecialtyColor(master.specialty)}`}>
                    {master.specialty || 'No Specialty'}
                  </span>
                </div>

                <div className="text-center text-sm text-stone-600 mb-3">
                  <span className="font-medium">{master.experience || 0}</span> years of experience
                </div>
                
                <p className="text-sm text-stone-600 leading-relaxed mb-4 line-clamp-3 text-center">
                  {master.description || 'No description available'}
                </p>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-3 border-t border-stone-100">
                  <button 
                    onClick={() => openMasterModal(master)} 
                    className="inline-flex items-center gap-x-1 rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200 transition-colors duration-150 ease-in-out"
                  >
                    <EyeIcon className="h-3 w-3" /> View
                  </button>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleMasterEdit(master)} 
                      className="inline-flex items-center gap-x-1 rounded bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 hover:bg-yellow-200 transition-colors duration-150 ease-in-out"
                    >
                      <PencilIcon className="h-3 w-3" /> Edit
                    </button>
                    <button 
                      onClick={() => handleMasterDelete(master._id, master.name)} 
                      className="inline-flex items-center gap-x-1 rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200 transition-colors duration-150 ease-in-out"
                    >
                      <TrashIcon className="h-3 w-3" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md border border-stone-200 p-12 text-center">
          <div className="mx-auto h-12 w-12 text-stone-400 mb-4">
            <UserGroupIcon className="h-full w-full" />
          </div>
          <h3 className="text-lg font-medium text-stone-900 mb-2">No master craftsmen found</h3>
          <p className="text-stone-500">
            {searchMaster || filterSpecialty ? 
              `No masters match your search criteria` : 
              "No master craftsmen available yet"
            }
          </p>
        </div>
      )}

      {/* Master Detail Modal */}
      {showModal && selectedMaster && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 bg-stone-500 bg-opacity-75 transition-opacity" onClick={closeModal}></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="w-full">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <UserGroupIcon className="h-6 w-6 text-teal-600 mr-2" />
                      <h3 className="text-lg font-medium text-stone-900">Master Craftsman Details</h3>
                    </div>
                    <button
                      onClick={closeModal}
                      className="text-stone-400 hover:text-stone-600 transition-colors"
                    >
                      <span className="sr-only">Close</span>
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <img
                        src={`${API_BASE_URL}/${selectedMaster.image}`}
                        alt={selectedMaster.name}
                        className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-stone-100 shadow-lg"
                        onError={(e) => { 
                          e.target.onerror = null; 
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                        }}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-4">
                      <div>
                        <h4 className="text-xl font-semibold text-stone-900 mb-2">{selectedMaster.name}</h4>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className={`inline-block text-sm px-3 py-1 rounded-full font-medium ${getSpecialtyColor(selectedMaster.specialty)}`}>
                            {selectedMaster.specialty}
                          </span>
                          <span className="inline-block text-sm px-3 py-1 rounded-full font-medium bg-blue-100 text-blue-800">
                            {selectedMaster.experience} years experience
                          </span>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium text-stone-700 mb-2">About the Master:</h5>
                        <p className="text-sm text-stone-600 leading-relaxed">{selectedMaster.description}</p>
                      </div>

                      <div className="pt-4 border-t border-stone-200">
                        <p className="text-xs text-stone-500">
                          Added: {new Date(selectedMaster.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={() => { closeModal(); handleMasterEdit(selectedMaster); }} className="inline-flex items-center gap-x-1.5 rounded-md bg-yellow-100 px-4 py-2 text-sm font-semibold text-yellow-800 hover:bg-yellow-200 transition-colors duration-150 ease-in-out">
                      <PencilIcon className="h-4 w-4" />
                      Edit Master
                    </button>
                    <button onClick={closeModal} className="inline-flex items-center gap-x-1.5 rounded-md bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-200 transition-colors duration-150 ease-in-out">
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Master Modal */}
      {showEditModal && editingMaster && (
        <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <UserGroupIcon className="h-6 w-6 text-teal-600 mr-2" />
                  <h3 className="text-lg font-medium text-stone-900">Edit Master: {editingMaster.name}</h3>
                </div>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="text-stone-400 hover:text-stone-600 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Master Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => handleEditFormChange('name', e.target.value)}
                      className="block w-full rounded-md border-stone-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm py-2 px-3"
                      required
                    />
                  </div>

                  {/* Specialty */}
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Specialty</label>
                    <select
                      value={editForm.specialty}
                      onChange={(e) => handleEditFormChange('specialty', e.target.value)}
                      className="block w-full rounded-md border-stone-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm py-2 px-3"
                      required
                    >
                      <option value="">Select Specialty</option>
                      {specialtyList.map((specialty) => (
                        <option key={specialty} value={specialty}>{specialty}</option>
                      ))}
                    </select>
                  </div>

                  {/* Experience */}
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Years of Experience</label>
                    <input
                      type="number"
                      value={editForm.experience}
                      onChange={(e) => handleEditFormChange('experience', e.target.value)}
                      className="block w-full rounded-md border-stone-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm py-2 px-3"
                      required
                      min="0"
                      max="99"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => handleEditFormChange('description', e.target.value)}
                      className="block w-full rounded-md border-stone-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm py-2 px-3 min-h-[120px] resize-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Master Photo</label>
                    <input
                      type="file"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                      accept=".jpg,.jpeg,.png"
                    />
                    {editForm.imagePreview && (
                      <div className="mt-3 text-center">
                        <img
                          src={editForm.imagePreview}
                          alt="Preview"
                          className="h-32 w-32 rounded-full object-cover mx-auto border border-stone-200 shadow-sm"
                        />
                      </div>
                    )}
                  </div>

                  {/* Current Specialty Preview */}
                  {editForm.specialty && (
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Specialty Preview</label>
                      <div className="p-3 border border-stone-200 rounded-md bg-stone-50">
                        <span className={`inline-block text-sm px-3 py-1 rounded-full font-medium ${getSpecialtyColor(editForm.specialty)}`}>
                          {editForm.specialty}
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
                  className="inline-flex items-center gap-x-1.5 rounded-md bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-200 transition-colors duration-150 ease-in-out"
                  disabled={saveLoading}
                >
                  <XMarkIcon className="h-4 w-4" />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="inline-flex items-center gap-x-1.5 rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 transition-colors duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
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

export default MastersList;
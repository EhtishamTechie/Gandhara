import { useState } from "react";
import { PlusIcon, PencilIcon, XMarkIcon, UserGroupIcon } from '@heroicons/react/20/solid';

// Get API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL;

const AddMaster = () => {
  const [masterName, setMasterName] = useState("");
  const [masterDescription, setMasterDescription] = useState("");
  const [masterSpecialty, setMasterSpecialty] = useState("");
  const [masterExperience, setMasterExperience] = useState("");
  const [masterImage, setMasterImage] = useState(null);
  const [masterImagePreview, setMasterImagePreview] = useState(null);
  const [editingMasterId, setEditingMasterId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Specialty categories for masters
  const specialtyList = [
    "Gandhara Art", "Stone Carving", "Calligraphy", "Jewellery Making", 
    "Antique Restoration", "Moulded Art", "Garden Decor", "Building Embellishing"
  ];

  const resetMasterForm = () => {
    setMasterName(""); 
    setMasterDescription(""); 
    setMasterSpecialty("");
    setMasterExperience("");
    setMasterImage(null);
    setMasterImagePreview(null); 
    setEditingMasterId(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMasterImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMasterImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setMasterImage(null);
      setMasterImagePreview(null);
    }
  };

  const handleMasterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData();
    formData.append("name", masterName);
    formData.append("description", masterDescription);
    formData.append("specialty", masterSpecialty);
    formData.append("experience", masterExperience);
    if (masterImage) formData.append("image", masterImage);

    const url = editingMasterId
      ? `${API_BASE_URL}/api/masters/${editingMasterId}`
      : `${API_BASE_URL}/api/masters/add`;
    const method = editingMasterId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        body: formData
      });
      
      if (response.ok) {
        alert(`Master ${editingMasterId ? 'updated' : 'added'} successfully!`);
        resetMasterForm();
      } else {
        throw new Error('Failed to save master');
      }
    } catch (err) {
      console.error("Failed to save master:", err);
      alert(`Failed to save master. Please check console for details.`);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "block w-full rounded-md border-stone-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm py-2 px-3 placeholder-stone-400";
  const labelClass = "block text-sm font-medium text-stone-700 mb-1";
  const selectClass = "block w-full rounded-md border-stone-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm py-2 px-3";
  const primaryButtonClass = "inline-flex items-center gap-x-1.5 rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 transition-colors duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed";
  const secondaryButtonClass = "inline-flex items-center gap-x-1.5 rounded-md bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-800 shadow-sm hover:bg-stone-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-400 transition-colors duration-150 ease-in-out";
  const fileInputClass = "block w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md border border-stone-200">
        <div className="px-6 py-4 border-b border-stone-200">
          <div className="flex items-center">
            <UserGroupIcon className="h-6 w-6 text-teal-600 mr-2" />
            <div>
              <h2 className="text-xl font-semibold text-stone-900">
                {editingMasterId ? "Edit Master Craftsman" : "Add Master Craftsman"}
              </h2>
              <p className="text-sm text-stone-600 mt-1">
                Showcase the talented artisans behind our beautiful creations
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleMasterSubmit} className="p-6 space-y-6" encType="multipart/form-data">
          {/* Master Name */}
          <div>
            <label htmlFor="masterName" className={labelClass}>Master's Name</label>
            <input 
              type="text" 
              id="masterName" 
              placeholder="e.g., Ustad Mohammad Ali, Master Craftsman Abdul Rahman" 
              value={masterName} 
              onChange={(e) => setMasterName(e.target.value)} 
              className={inputClass} 
              required 
            />
          </div>

          {/* Specialty and Experience Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="masterSpecialty" className={labelClass}>Specialty</label>
              <select 
                id="masterSpecialty" 
                value={masterSpecialty} 
                onChange={(e) => setMasterSpecialty(e.target.value)} 
                className={selectClass}
                required
              >
                <option value="">Select a specialty</option>
                {specialtyList.map((specialty) => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="masterExperience" className={labelClass}>
                Years of Experience
              </label>
              <input 
                type="number" 
                id="masterExperience" 
                placeholder="e.g., 25" 
                value={masterExperience} 
                onChange={(e) => setMasterExperience(e.target.value)} 
                className={inputClass} 
                required
                min="1"
                max="80"
              />
            </div>
          </div>
           
          {/* Description */}
          <div>
            <label htmlFor="masterDescription" className={labelClass}>About the Master</label>
            <textarea 
              id="masterDescription" 
              placeholder="Tell the story of this master craftsman. Include their background, achievements, notable works, and what makes their craftsmanship special..." 
              value={masterDescription} 
              onChange={(e) => setMasterDescription(e.target.value)} 
              className={`${inputClass} min-h-[150px] resize-none`} 
              required 
            />
          </div>

          {/* Image Upload */}
          <div>
            <label htmlFor="masterImage" className={labelClass}>
              Master's Photo <span className="text-xs text-stone-500">(.jpg, .jpeg, .png)</span>
            </label>
            <input 
              type="file" 
              id="masterImage" 
              onChange={handleImageChange} 
              className={fileInputClass} 
              accept=".jpg,.jpeg,.png" 
            />
            <p className="mt-1 text-xs text-stone-500">
              Upload a professional photo of the master craftsman (recommended: square aspect ratio)
            </p>
            {masterImagePreview && (
              <div className="mt-4 p-4 border border-stone-200 rounded-md bg-stone-50">
                <p className="text-sm text-stone-600 mb-2">Photo Preview:</p>
                <img 
                  src={masterImagePreview} 
                  alt="Preview" 
                  className="h-40 w-40 rounded-full object-cover border border-stone-200 shadow-sm mx-auto" 
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-stone-200">
            {editingMasterId && (
              <button 
                type="button" 
                onClick={resetMasterForm} 
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
              disabled={loading}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : editingMasterId ? (
                <PencilIcon className="h-4 w-4" />
              ) : (
                <PlusIcon className="h-4 w-4" />
              )}
              <span>
                {loading ? 'Saving...' : editingMasterId ? "Update Master" : "Add Master"}
              </span>
            </button>
          </div>
        </form>

        {/* Help Section */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 rounded-b-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                <UserGroupIcon className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-medium text-stone-900">Showcasing Master Craftsmen</h4>
              <div className="mt-2 text-sm text-stone-600">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Share the personal stories and heritage of your craftsmen</li>
                  <li>Highlight their unique skills and specializations</li>
                  <li>Include years of experience to build trust and credibility</li>
                  <li>Use professional, respectful photos that show their craftsmanship</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMaster;
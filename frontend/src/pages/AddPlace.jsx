// import { useState } from "react";
// import { PlusIcon, PencilIcon, XMarkIcon, MapPinIcon } from '@heroicons/react/20/solid';

// // Get API URL from environment variables
// const API_BASE_URL = import.meta.env.VITE_API_URL;

// const AddPlace = () => {
//   const [placeName, setPlaceName] = useState("");
//   const [placeDescription, setPlaceDescription] = useState("");
//   const [placeImage, setPlaceImage] = useState(null);
//   const [placeImagePreview, setPlaceImagePreview] = useState(null);
//   const [tourCategory, setTourCategory] = useState("");
//   const [editingVisitId, setEditingVisitId] = useState(null);
//   const [loading, setLoading] = useState(false);

//   // Tour categories for visit places
//   const tourCategoriesList = [
//     "Featured", "Cultural", "Historical", "Adventure"
//   ];

//   const resetVisitForm = () => {
//     setPlaceName(""); 
//     setPlaceDescription(""); 
//     setPlaceImage(null);
//     setPlaceImagePreview(null); 
//     setTourCategory("");
//     setEditingVisitId(null);
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setPlaceImage(file);
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setPlaceImagePreview(reader.result);
//       };
//       reader.readAsDataURL(file);
//     } else {
//       setPlaceImage(null);
//       setPlaceImagePreview(null);
//     }
//   };

//   const handleVisitSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
    
//     const formData = new FormData();
//     formData.append("name", placeName);
//     formData.append("description", placeDescription);
//     formData.append("tourCategory", tourCategory);
//     if (placeImage) formData.append("image", placeImage);

//     const url = editingVisitId
//       ? `${API_BASE_URL}/visit-places/${editingVisitId}`
//       : `${API_BASE_URL}/visit-places/add`;
//     const method = editingVisitId ? 'PUT' : 'POST';

//     try {
//       const response = await fetch(url, {
//         method: method,
//         body: formData
//       });
      
//       if (response.ok) {
//         alert(`Visit place ${editingVisitId ? 'updated' : 'added'} successfully!`);
//         resetVisitForm();
//       } else {
//         throw new Error('Failed to save visit place');
//       }
//     } catch (err) {
//       console.error("Failed to save visit place:", err);
//       alert(`Failed to save visit place. Please check console for details.`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const inputClass = "block w-full rounded-md border-stone-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm py-2 px-3 placeholder-stone-400";
//   const labelClass = "block text-sm font-medium text-stone-700 mb-1";
//   const primaryButtonClass = "inline-flex items-center gap-x-1.5 rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 transition-colors duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed";
//   const secondaryButtonClass = "inline-flex items-center gap-x-1.5 rounded-md bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-800 shadow-sm hover:bg-stone-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-400 transition-colors duration-150 ease-in-out";
//   const fileInputClass = "block w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100";

//   return (
//     <div className="max-w-4xl mx-auto">
//       <div className="bg-white rounded-lg shadow-md border border-stone-200">
//         <div className="px-6 py-4 border-b border-stone-200">
//           <div className="flex items-center">
//             <MapPinIcon className="h-6 w-6 text-teal-600 mr-2" />
//             <div>
//               <h2 className="text-xl font-semibold text-stone-900">
//                 {editingVisitId ? "Edit Tour/Visit Place" : "Add Tour/Visit Place"}
//               </h2>
//               <p className="text-sm text-stone-600 mt-1">
//                 Create beautiful tour experiences in Taxila for your visitors
//               </p>
//             </div>
//           </div>
//         </div>

//         <form onSubmit={handleVisitSubmit} className="p-6 space-y-6" encType="multipart/form-data">
//           {/* Place Name */}
//           <div>
//             <label htmlFor="placeName" className={labelClass}>Place/Tour Name</label>
//             <input 
//               type="text" 
//               id="placeName" 
//               placeholder="e.g., Grand Taxila Day Tour, Sirkap Archaeological Site" 
//               value={placeName} 
//               onChange={(e) => setPlaceName(e.target.value)} 
//               className={inputClass} 
//               required 
//             />
//           </div>
           
//           {/* Tour Category */}
//           <div>
//             <label htmlFor="tourCategory" className={labelClass}>
//               Tour Category <span className="text-xs text-stone-500">(for showcasing in different sections)</span>
//             </label>
//             <select 
//               id="tourCategory" 
//               value={tourCategory} 
//               onChange={(e) => setTourCategory(e.target.value)} 
//               className={inputClass}
//             >
//               <option value="">Select a category (optional)</option>
//               {tourCategoriesList.map((cat) => (
//                 <option key={cat} value={cat}>{cat}</option>
//               ))}
//             </select>
//             <p className="mt-1 text-xs text-stone-500">
//               Featured places appear prominently on the homepage
//             </p>
//           </div>
           
//           {/* Description */}
//           <div>
//             <label htmlFor="placeDescription" className={labelClass}>Description</label>
//             <textarea 
//               id="placeDescription" 
//               placeholder="Detailed description of the tour/place. Describe what visitors will see, historical significance, and what makes this place special..." 
//               value={placeDescription} 
//               onChange={(e) => setPlaceDescription(e.target.value)} 
//               className={`${inputClass} min-h-[150px] resize-none`} 
//               required 
//             />
//           </div>

//           {/* Image Upload */}
//           <div>
//             <label htmlFor="placeImage" className={labelClass}>
//               Tour/Place Image <span className="text-xs text-stone-500">(.jpg, .jpeg, .png)</span>
//             </label>
//             <input 
//               type="file" 
//               id="placeImage" 
//               onChange={handleImageChange} 
//               className={fileInputClass} 
//               accept=".jpg,.jpeg,.png" 
//             />
//             <p className="mt-1 text-xs text-stone-500">
//               Upload a high-quality image that showcases the beauty and significance of this place
//             </p>
//             {placeImagePreview && (
//               <div className="mt-4 p-4 border border-stone-200 rounded-md bg-stone-50">
//                 <p className="text-sm text-stone-600 mb-2">Image Preview:</p>
//                 <img 
//                   src={placeImagePreview} 
//                   alt="Preview" 
//                   className="h-48 w-auto rounded border border-stone-200 shadow-sm" 
//                 />
//               </div>
//             )}
//           </div>

//           {/* Action Buttons */}
//           <div className="flex items-center justify-end space-x-3 pt-6 border-t border-stone-200">
//             {editingVisitId && (
//               <button 
//                 type="button" 
//                 onClick={resetVisitForm} 
//                 className={secondaryButtonClass}
//                 disabled={loading}
//               >
//                 <XMarkIcon className="h-4 w-4" />
//                 <span>Cancel Edit</span>
//               </button>
//             )}
//             <button 
//               type="submit" 
//               className={primaryButtonClass}
//               disabled={loading}
//             >
//               {loading ? (
//                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//               ) : editingVisitId ? (
//                 <PencilIcon className="h-4 w-4" />
//               ) : (
//                 <PlusIcon className="h-4 w-4" />
//               )}
//               <span>
//                 {loading ? 'Saving...' : editingVisitId ? "Update Tour/Place" : "Add Tour/Place"}
//               </span>
//             </button>
//           </div>
//         </form>

//         {/* Help Section */}
//         <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 rounded-b-lg">
//           <div className="flex items-start space-x-3">
//             <div className="flex-shrink-0">
//               <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
//                 <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//               </div>
//             </div>
//             <div className="min-w-0 flex-1">
//               <h4 className="text-sm font-medium text-stone-900">Tips for Great Tour Places</h4>
//               <div className="mt-2 text-sm text-stone-600">
//                 <ul className="list-disc pl-5 space-y-1">
//                   <li>Use descriptive, engaging names that capture the essence of the place</li>
//                   <li>Include historical context and cultural significance in descriptions</li>
//                   <li>Choose high-resolution images that showcase the best features</li>
//                   <li>Featured places get premium placement on your website</li>
//                 </ul>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddPlace;
import { useState } from "react";
import { PlusIcon, PencilIcon, XMarkIcon, MapPinIcon, FilmIcon, PhotoIcon } from '@heroicons/react/20/solid';

// Get API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AddPlace = () => {
  const [placeName, setPlaceName] = useState("");
  const [placeDescription, setPlaceDescription] = useState("");
  const [placeImage, setPlaceImage] = useState(null);
  const [placeImagePreview, setPlaceImagePreview] = useState(null);
  const [placeVideo, setPlaceVideo] = useState(null);
  const [placeVideoPreview, setPlaceVideoPreview] = useState(null);
  const [tourCategory, setTourCategory] = useState("");
  const [editingVisitId, setEditingVisitId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mediaType, setMediaType] = useState("image"); // "image" or "video"

  // Tour categories for visit places
  const tourCategoriesList = [
    "Featured", "Cultural", "Historical", "Adventure"
  ];

  const resetVisitForm = () => {
    setPlaceName(""); 
    setPlaceDescription(""); 
    setPlaceImage(null);
    setPlaceImagePreview(null); 
    setPlaceVideo(null);
    setPlaceVideoPreview(null);
    setTourCategory("");
    setEditingVisitId(null);
    setUploadProgress(0);
    setMediaType("image");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 10MB for images)
      if (file.size > 10 * 1024 * 1024) {
        alert("Image file size should be less than 10MB");
        return;
      }

      setPlaceImage(file);
      setPlaceVideo(null);
      setPlaceVideoPreview(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPlaceImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPlaceImage(null);
      setPlaceImagePreview(null);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 100MB for videos before compression)
      if (file.size > 100 * 1024 * 1024) {
        alert("Video file size should be less than 100MB");
        return;
      }

      // Check video format
      const allowedFormats = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'];
      if (!allowedFormats.includes(file.type)) {
        alert("Please upload a valid video format (MP4, WebM, OGG, AVI, MOV)");
        return;
      }

      setPlaceVideo(file);
      setPlaceImage(null);
      setPlaceImagePreview(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPlaceVideoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPlaceVideo(null);
      setPlaceVideoPreview(null);
    }
  };

  const handleVisitSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    if (!token) {
      alert('Please log in to the admin panel first.');
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('name', placeName);
    formData.append('description', placeDescription);
    formData.append('tourCategory', tourCategory);
    formData.append('mediaType', mediaType);

    if (placeImage) formData.append('image', placeImage);
    if (placeVideo) formData.append('video', placeVideo);

    const base = (API_BASE_URL || '').replace(/\/$/, '');
    const path = editingVisitId
      ? `${base}/api/admin/visit-places/${editingVisitId}`
      : `${base}/api/admin/visit-places/add`;
    const method = editingVisitId ? 'PUT' : 'POST';

    try {
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && event.total > 0) {
          setUploadProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 201) {
          alert(`Visit place ${editingVisitId ? 'updated' : 'added'} successfully!`);
          resetVisitForm();
        } else {
          let msg = 'Failed to save visit place';
          try {
            const j = JSON.parse(xhr.responseText || '{}');
            if (j.message) msg = j.message;
          } catch (_) {
            /* ignore */
          }
          alert(msg);
        }
      };
      xhr.onerror = () => {
        alert('Network error. Check that the backend is running and you are logged in.');
      };
      xhr.onloadend = () => {
        setLoading(false);
        setUploadProgress(0);
      };
      xhr.open(method, path);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    } catch (err) {
      console.error('Failed to save visit place:', err);
      alert(err?.message || 'Failed to save visit place.');
      setLoading(false);
      setUploadProgress(0);
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
          <div className="flex items-center">
            <MapPinIcon className="h-6 w-6 text-teal-600 mr-2" />
            <div>
              <h2 className="text-xl font-semibold text-stone-900">
                {editingVisitId ? "Edit Tour/Visit Place" : "Add Tour/Visit Place"}
              </h2>
              <p className="text-sm text-stone-600 mt-1">
                Create beautiful tour experiences in Taxila with images or videos
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleVisitSubmit} className="p-6 space-y-6" encType="multipart/form-data">
          {/* Place Name */}
          <div>
            <label htmlFor="placeName" className={labelClass}>Place/Tour Name</label>
            <input 
              type="text" 
              id="placeName" 
              placeholder="e.g., Grand Taxila Day Tour, Sirkap Archaeological Site" 
              value={placeName} 
              onChange={(e) => setPlaceName(e.target.value)} 
              className={inputClass} 
              required 
            />
          </div>
           
          {/* Tour Category */}
          <div>
            <label htmlFor="tourCategory" className={labelClass}>
              Tour Category <span className="text-xs text-stone-500">(for showcasing in different sections)</span>
            </label>
            <select 
              id="tourCategory" 
              value={tourCategory} 
              onChange={(e) => setTourCategory(e.target.value)} 
              className={inputClass}
            >
              <option value="">Select a category (optional)</option>
              {tourCategoriesList.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-stone-500">
              Featured places appear prominently on the homepage
            </p>
          </div>
           
          {/* Description */}
          <div>
            <label htmlFor="placeDescription" className={labelClass}>Description</label>
            <textarea 
              id="placeDescription" 
              placeholder="Detailed description of the tour/place. Describe what visitors will see, historical significance, and what makes this place special..." 
              value={placeDescription} 
              onChange={(e) => setPlaceDescription(e.target.value)} 
              className={`${inputClass} min-h-[150px] resize-none`} 
              required 
            />
          </div>

          {/* Media Type Selection */}
          <div>
            <label className={labelClass}>Media Type</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="image"
                  checked={mediaType === "image"}
                  onChange={(e) => setMediaType(e.target.value)}
                  className="mr-2 text-teal-600 focus:ring-teal-500"
                />
                <PhotoIcon className="h-5 w-5 text-stone-600 mr-1" />
                <span className="text-sm text-stone-700">Image</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="video"
                  checked={mediaType === "video"}
                  onChange={(e) => setMediaType(e.target.value)}
                  className="mr-2 text-teal-600 focus:ring-teal-500"
                />
                <FilmIcon className="h-5 w-5 text-stone-600 mr-1" />
                <span className="text-sm text-stone-700">Video</span>
              </label>
            </div>
          </div>

          {/* Conditional Media Upload */}
          {mediaType === "image" ? (
            /* Image Upload */
            <div>
              <label htmlFor="placeImage" className={labelClass}>
                Tour/Place Image <span className="text-xs text-stone-500">(.jpg, .jpeg, .png, max 10MB)</span>
              </label>
              <input 
                type="file" 
                id="placeImage" 
                onChange={handleImageChange} 
                className={fileInputClass} 
                accept=".jpg,.jpeg,.png" 
              />
              <p className="mt-1 text-xs text-stone-500">
                Upload a high-quality image that showcases the beauty and significance of this place
              </p>
              {placeImagePreview && (
                <div className="mt-4 p-4 border border-stone-200 rounded-md bg-stone-50">
                  <p className="text-sm text-stone-600 mb-2">Image Preview:</p>
                  <img 
                    src={placeImagePreview} 
                    alt="Preview" 
                    className="h-48 w-auto rounded border border-stone-200 shadow-sm" 
                  />
                </div>
              )}
            </div>
          ) : (
            /* Video Upload */
            <div>
              <label htmlFor="placeVideo" className={labelClass}>
                Tour/Place Video <span className="text-xs text-stone-500">(.mp4, .webm, .ogg, .avi, .mov, max 100MB)</span>
              </label>
              <input 
                type="file" 
                id="placeVideo" 
                onChange={handleVideoChange} 
                className={fileInputClass} 
                accept=".mp4,.webm,.ogg,.avi,.mov" 
              />
              <p className="mt-1 text-xs text-stone-500">
                Upload a compelling video that shows the tour experience. Video will be automatically compressed for web optimization.
              </p>
              {placeVideoPreview && (
                <div className="mt-4 p-4 border border-stone-200 rounded-md bg-stone-50">
                  <p className="text-sm text-stone-600 mb-2">Video Preview:</p>
                  <video 
                    src={placeVideoPreview} 
                    controls 
                    className="h-48 w-auto rounded border border-stone-200 shadow-sm" 
                  />
                </div>
              )}
            </div>
          )}

          {/* Upload Progress */}
          {loading && uploadProgress > 0 && (
            <div className="w-full bg-stone-200 rounded-full h-2">
              <div 
                className="bg-teal-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
              <p className="text-xs text-stone-600 mt-1">
                Uploading... {uploadProgress}%
                {mediaType === "video" && " (Video is being compressed)"}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-stone-200">
            {editingVisitId && (
              <button 
                type="button" 
                onClick={resetVisitForm} 
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
              ) : editingVisitId ? (
                <PencilIcon className="h-4 w-4" />
              ) : (
                <PlusIcon className="h-4 w-4" />
              )}
              <span>
                {loading ? 'Saving...' : editingVisitId ? "Update Tour/Place" : "Add Tour/Place"}
              </span>
            </button>
          </div>
        </form>

        {/* Help Section */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 rounded-b-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-medium text-stone-900">Media Upload Guidelines</h4>
              <div className="mt-2 text-sm text-stone-600">
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Images:</strong> Use high-resolution photos (max 10MB) in JPG, PNG format</li>
                  <li><strong>Videos:</strong> Upload engaging tour videos (max 100MB) - will be compressed automatically</li>
                  <li><strong>Video Tips:</strong> Keep videos 30-120 seconds, show highlights of the tour experience</li>
                  <li><strong>Featured places</strong> with videos get premium placement and higher engagement</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPlace;

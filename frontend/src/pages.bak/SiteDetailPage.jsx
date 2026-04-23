// src/pages/SiteDetailPage.jsx
import { getImageUrl } from "../utils/imageHelper.js";
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';

const SiteDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSiteDetail = async () => {
      setLoading(true);
      try {
        // Fetch the specific site by ID
       const response = await axios.get(`${import.meta.env.VITE_API_URL}/visit-places/${id}`);
        setSite(response.data);
      } catch (err) {
        console.error('Error fetching site details:', err);
        setError('Could not load site details. Please try again.');
        
        // For demo/development: Create fallback data if API fails
        setSite({
          _id: id,
          name: 'Taxila Archaeological Site',
          image: './src/GandharaImages/The Grand Taxila Day Tour.jpg',
          description: 'This remarkable archaeological site is one of the most significant in Pakistan, showcasing the rich heritage of the ancient Gandhara civilization. The site features well-preserved ruins of Buddhist monasteries, stupas, and ancient urban settlements dating back over 2,500 years. Visitors can explore the various layers of history from different civilizations that once thrived here, including Persian, Greek, and Kushan influences. The architectural details and artifacts found at this location provide incredible insights into the religious practices, daily life, and artistic achievements of these ancient peoples.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSiteDetail();
  }, [id]);

  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#E6A44E]"></div>
      </div>
    );
  }

  if (error && !site) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A] text-white">
        <div className="text-center p-8 bg-[#1E293B] rounded-xl shadow-lg max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-red-400">Error Loading Site</h2>
          <p className="mb-6">{error}</p>
          <button 
            onClick={handleGoBack}
            className="px-6 py-2 bg-[#E6A44E] text-[#0F172A] rounded-lg font-medium hover:bg-[#F1C27D] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Simple header with back button */}
      <div className="bg-[#1E293B] py-4 px-6 sticky top-0 z-50 shadow-md">
        <div className="container mx-auto flex items-center">
          <button 
            onClick={handleGoBack} 
            className="flex items-center text-[#E6A44E] hover:text-[#F1C27D] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto bg-[#1E293B] rounded-xl overflow-hidden shadow-xl">
          {/* Image */}
          <div className="relative aspect-video w-full">
            <img 
              src={site.image.startsWith('http') 
  ? site.image 
  : `${import.meta.env.VITE_API_URL}/${site.image?.replace(/\\/g, '/')}`
}
              alt={site.name} 
              className="w-full h-full object-cover"
              onError={(e) => { 
                e.target.onerror = null; 
                e.target.src="/images/gallery/placeholder-image.jpg";
              }}
            />
          </div>
          
          {/* Content */}
          <div className="p-6 md:p-8">
            {/* Name */}
            <h1 className="text-3xl md:text-4xl font-bold text-[#F8FAFC] mb-6">{site.name}</h1>
            
            {/* Description */}
            <div className="prose prose-lg max-w-none text-[#E2E8F0] leading-relaxed">
              <p>{site.description}</p>
            </div>

            {/* Optional section for additional details if available */}
            {site.location && (
              <div className="mt-8 pt-6 border-t border-white/10">
                <h2 className="text-xl font-semibold text-[#F8FAFC] mb-3">Location</h2>
                <p className="text-[#E2E8F0]">{site.location}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteDetailPage;

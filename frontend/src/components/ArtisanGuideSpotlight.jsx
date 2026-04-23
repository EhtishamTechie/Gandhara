// src/components/ArtisanGuideSpotlight.jsx
import { getImageUrl } from "../utils/imageHelper.js";
import React, { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

// Get API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Individual Person Card Component
const PersonCard = ({ person, index, isVisibleInitially = false }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px',
  });

  const imageIsOnLeft = index % 2 === 0;

  return (
    <div
      ref={ref}
      className={`grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center transition-all duration-1000 ease-out ${
        inView ? 'opacity-100 translate-y-0 sm:translate-x-0' : 'opacity-0 translate-y-10 sm:translate-y-0'
      } ${
        inView ? '' : (imageIsOnLeft ? 'sm:-translate-x-10' : 'sm:translate-x-10')
      }`}
    >
      {/* Image Column */}
      <div className={`w-full ${!imageIsOnLeft ? 'md:order-last' : ''}`}>
        <div className="overflow-hidden rounded-xl shadow-xl group bg-[#334155]">
          <img
            src={person.imageSrc}
            alt={person.altText}
            className="w-full h-auto aspect-[4/5] object-cover transform transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://picsum.photos/seed/fallback/600/750';
            }}
          />
        </div>
      </div>

      {/* Text Column */}
      <div className="text-center md:text-left">
        <h3 className="text-3xl md:text-4xl font-semibold text-[#F8FAFC] mb-1.5 tracking-tight">
          {person.name}
        </h3>
        <p className={`text-sm font-semibold mb-4 tracking-wider uppercase ${
          person.type === 'artisan' ? 'text-[#E6A44E]' : 'text-[#F1C27D]'
        }`}>
          {person.title}
        </p>
        <p className="text-[#E2E8F0] text-base md:text-lg leading-relaxed mb-6">
          {person.bio}
        </p>
        {person.quote && (
          <blockquote className="relative mt-5 pt-5 border-t border-[#E2E8F0]/30">
            <p className="text-lg italic text-[#E2E8F0]/80 leading-relaxed">
              "{person.quote}"
            </p>
          </blockquote>
        )}
        {person.linkText && person.linkUrl && (
          <div className="mt-8">
            <a
              href={person.linkUrl}
              className="inline-flex items-center gap-x-2 bg-[#E6A44E] hover:bg-[#F1C27D] text-[#0F172A] px-7 py-3 rounded-md text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#F1C27D] focus:ring-offset-2 focus:ring-offset-[#0F172A]"
              aria-label={`Learn more about ${person.name}`}
            >
              {person.linkText}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

const ArtisanGuideSpotlight = () => {
  const [masters, setMasters] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch masters from backend
  useEffect(() => {
    fetchMasters();
  }, []);

  const fetchMasters = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/masters/all`);
      if (response.ok) {
        const data = await response.json();
        console.log('Masters data for spotlight:', data);
        
        // Handle different response formats
        let mastersArray = [];
        if (Array.isArray(data)) {
          mastersArray = data;
        } else if (data && Array.isArray(data.masters)) {
          mastersArray = data.masters;
        }
        
        setMasters(mastersArray);
      } else {
        console.log('No masters found from backend');
        setMasters([]);
      }
    } catch (error) {
      console.error('Error fetching masters:', error);
      setMasters([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="bg-[#0F172A] py-20 md:py-28">
        <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E6A44E]"></div>
            <p className="ml-4 text-[#F8FAFC] text-lg">Loading our masters...</p>
          </div>
        </div>
      </section>
    );
  }

  // If no masters available, show message instead of rendering the section
  if (masters.length === 0) {
    return (
      <section className="bg-[#0F172A] py-20 md:py-28">
        <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block bg-[#1E293B] border border-[#334155] rounded-lg px-8 py-12">
              <div className="mb-4">
                <svg className="mx-auto h-16 w-16 text-[#E6A44E]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#F8FAFC] mb-2">No Master Craftsmen Yet</h3>
              <p className="text-[#E2E8F0]/70 text-base max-w-md mx-auto">
                Master craftsmen profiles will appear here once they are added through the admin panel.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Transform masters data to the component format
  const transformedMasters = masters.map((master) => ({
    id: master._id,
    type: 'artisan',
    name: master.name,
    title: `${master.specialty} Specialist`,
    imageSrc: getImageUrl(master.image),
    altText: `Portrait of ${master.name}, ${master.specialty} specialist`,
    bio: master.description,
    quote: master.quote || `"With ${master.experience} years of experience, every piece tells a story."`,
    // linkText: `View ${master.name}'s Work`,
    // linkUrl: `/masters/${master._id}`
  }));

  return (
    <section className="bg-[#0F172A] py-20 md:py-28 overflow-x-hidden">
      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <div
            className="inline-block transition-all duration-700 ease-out"
            style={{ transform: 'translateY(0px)', opacity: 1 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#E6A44E] via-[#F1C27D] to-[#E6A44E] bg-clip-text text-transparent mb-4 tracking-tight">
              Meet Our Master Craftsmen
            </h2>
            <p className="text-lg md:text-xl text-[#F8FAFC] max-w-2xl mx-auto leading-relaxed">
              Discover the talented artisans who bring our Gandhara heritage to life through their skilled craftsmanship.
            </p>
          </div>
        </div>

        {/* Masters Loop */}
        <div className="space-y-20 md:space-y-24">
          {transformedMasters.map((master, index) => (
            <PersonCard 
              key={master.id} 
              person={master} 
              index={index} 
              isVisibleInitially={index === 0} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ArtisanGuideSpotlight;

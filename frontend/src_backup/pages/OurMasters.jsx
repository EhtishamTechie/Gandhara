// Save this as: src/pages/OurMasters.jsx

import React from 'react';
import ArtisanGuideSpotlight from '../components/ArtisanGuideSpotlight';

const OurMasters = () => {
  return (
    <div className="min-h-screen">
      {/* Page Header Section */}
      <section className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-[#E6A44E] via-[#F1C27D] to-[#E6A44E] bg-clip-text text-transparent mb-6 tracking-tight">
              Our Master Craftsmen
            </h1>
            <p className="text-xl md:text-2xl text-[#E2E8F0] leading-relaxed mb-8">
              Meet the skilled artisans who preserve and continue the ancient traditions of Gandhara craftsmanship
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-[#E6A44E] to-[#F1C27D] mx-auto rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="bg-[#F8FAFC] py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-8">
            Guardians of Ancient Traditions
          </h2>
          <div className="prose prose-lg prose-stone mx-auto">
            <p className="text-lg text-[#475569] leading-relaxed mb-6">
              For generations, master craftsmen in the Taxila region have passed down the sacred art of Gandhara sculpture and stonework. Each piece they create is not just an object, but a living testament to thousands of years of artistic heritage.
            </p>
            <p className="text-lg text-[#475569] leading-relaxed">
              Our masters combine traditional techniques with contemporary vision, ensuring that the timeless beauty of Gandhara art continues to inspire and captivate people around the world.
            </p>
          </div>
        </div>
      </section>

      {/* ArtisanGuideSpotlight Component */}
      <ArtisanGuideSpotlight />

      {/* Call to Action Section */}
      <section className="bg-[#F8FAFC] py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-8">
            Experience Their Craftsmanship
          </h2>
          <p className="text-lg text-[#475569] leading-relaxed mb-8">
            Discover the exceptional works created by our master craftsmen, each piece reflecting their dedication to preserving and evolving the art of Gandhara.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/products"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-[#E6A44E] to-[#F1C27D] hover:from-[#F1C27D] hover:to-[#E6A44E] text-[#0F172A] font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              View All Products
            </a>
           
          </div>
        </div>
      </section>
    </div>
  );
};

export default OurMasters;
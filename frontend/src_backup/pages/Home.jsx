// src/pages/Home.jsx
import React from 'react';
// Assuming Router is in App.jsx

// --- Import Components ---
import HeroSection from '../components/HeroSection';
// Removed: import RawStoneSpotlight from '../components/RawStoneSpotlight';
import TaxilaToursShowcase from '../components/TaxilaToursShowcase';
import WhyTaxilaExperience from '../components/WhyTaxilaExperience';
import ArtisanGuideSpotlight from '../components/ArtisanGuideSpotlight';
import VisualTestimonials from '../components/VisualTestimonials';
import FinalCTA from '../components/FinalCTA'; // <-- Import 
import RelatedProducts from '../components/RelatedProducts';
import AnimatedProductShowcase from '../components/AnimatedProductShowcase';
import TaxilaPromoBanner from '../components/TaxilaPromoBanner';
import ProductVideoShowcase from '../components/ProductVideoShowcase';

const Home = () => {
  return (
    <>
      {/* ... Sections 1-11 ... */}
      <HeroSection />
      <ProductVideoShowcase/>
      <RelatedProducts/>
      <TaxilaPromoBanner/>
      <AnimatedProductShowcase/>
      {/* Removed: <RawStoneSpotlight /> */}
      <TaxilaToursShowcase />
      <WhyTaxilaExperience />
      {/* <ArtisanGuideSpotlight /> */}
      <VisualTestimonials />
      <FinalCTA /> 
      {/* <-- Add the component here */}

      <footer className="bg-gray-800 text-white py-8"> {/* Removed mt-16 as CTA section provides space */}
         <div className="container mx-auto px-6 text-center text-gray-400 text-sm">
            Gandhara Arts & Taxila Stone Crafts © {new Date().getFullYear()} | All Rights Reserved
            {/* Add actual footer links/content here */}
         </div>
      </footer>
    </>
  );
};

export default Home;
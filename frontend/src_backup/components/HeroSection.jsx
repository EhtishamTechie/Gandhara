// src/components/HeroSection.jsx
import React, { useEffect, useState } from 'react';
import { Link as ScrollLink } from 'react-scroll';
import { motion } from 'framer-motion'; // Added for enhanced animations
import { Link, useNavigate } from 'react-router-dom'; // Import for page navigation

const HeroSection = () => {
  const videoSrc = "/Product Videos/Gandhara Art Artisans.mp4";

  const headline = "Gandhara Art And Taxila Stone Craft";
  const tagline = "Where Artistry Meets Antiquity";
  const subheading = "Carving Legacies, Crafting Journeys";

  const navigate = useNavigate(); // Hook for programmatic navigation
  const [contentLoaded, setContentLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setContentLoaded(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Prevent context menu (right-click) to disable download
  const handleContextMenu = (e) => {
    e.preventDefault();
  };

  // Stagger animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.6
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-[#0F172A]">
      {/* Video Background */}
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-40"
          preload="auto"
          onContextMenu={handleContextMenu}
          controlsList="nodownload nofullscreen noremoteplayback"
          disablePictureInPicture
          style={{ pointerEvents: 'none' }}
        >
          <source src={videoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#0F172A]/60 via-[#1E293B]/50 to-[#0F172A]/70 z-10"></div>

      {/* Content Area */}
      <motion.div
        initial="hidden"
        animate={contentLoaded ? "show" : "hidden"}
        variants={container}
        className="relative z-20 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8"
      >
        {/* Tagline: Light Silver/Gray (#E2E8F0) */}
        <motion.p
          variants={item}
          className="mb-4 text-lg md:text-xl lg:text-2xl font-light tracking-wider uppercase text-[#E2E8F0]"
        >
          {tagline}
        </motion.p>

        {/* Main Headline: Crisp White (#F8FAFC) */}
        <motion.h1
          variants={item}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold mb-3 leading-tight text-[#F8FAFC] [text-shadow:_0_3px_20px_rgba(0,0,0,0.9)]"
        >
          {headline}
        </motion.h1>

        {/* Subheading: Lighter Gold (#F1C27D) */}
        <motion.p
          variants={item}
          className="text-2xl sm:text-3xl md:text-4xl mb-8 text-[#F1C27D] font-medium italic [text-shadow:_0_2px_10px_rgba(0,0,0,0.7)]"
        >
          {subheading}
        </motion.p>

        {/* Decorative divider: Warm Gold Gradient (#F1C27D to #E6A44E) */}
        <motion.div
          variants={item}
          className="w-24 h-1 bg-gradient-to-r from-[#F1C27D] to-[#E6A44E] rounded-full mb-8"
        />

        {/* Call-to-Action Buttons */}
        <motion.div
          variants={item}
          className="flex flex-col sm:flex-row gap-4 sm:gap-6"
        >
          {/* Primary CTA Button */}
          <button
            onClick={() => navigate('/products')}
            className="cursor-pointer bg-gradient-to-r from-[#E6A44E] to-[#F1C27D] hover:from-[#F1C27D] hover:to-[#E6A44E] text-[#0F172A] font-semibold px-8 py-3.5 rounded-lg transition-all duration-300 ease-in-out text-base md:text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-[#F1C27D] focus:ring-opacity-50"
          >
            Explore Stone Collections
          </button>
          
          {/* Secondary CTA Button */}
          <ScrollLink
            to="tours"
            smooth={true}
            duration={800}
            offset={-70}
            className="cursor-pointer bg-transparent border-2 border-[#E2E8F0] hover:border-[#F1C27D] text-[#E2E8F0] hover:text-[#F1C27D] font-semibold px-8 py-3.5 rounded-lg transition-all duration-300 ease-in-out text-base md:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-[#E2E8F0] focus:ring-opacity-30"
          >
            Discover Taxila Tours
          </ScrollLink>
          
          {/* Luxury Collection Button */}
          <ScrollLink
            to="luxury"
            smooth={true}
            duration={800}
            offset={-70}
            className="cursor-pointer bg-gradient-to-r from-[#E6A44E] to-[#F1C27D] hover:from-[#F1C27D] hover:to-[#E6A44E] text-[#0F172A] font-semibold px-8 py-3.5 rounded-lg transition-all duration-300 ease-in-out text-base md:text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-[#F1C27D] focus:ring-opacity-50"
          >
            Luxury Collection
          </ScrollLink>
        </motion.div>
      </motion.div>

      {/* Down Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: contentLoaded ? 1 : 0 }}
        transition={{ delay: 2.5, duration: 0.8 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-30"
      >
        <ScrollLink
          to="collections"
          smooth={true}
          duration={800}
          offset={-70}
          className="cursor-pointer"
          aria-label="Scroll to next section"
        >
          <motion.div
            className="relative flex justify-center items-center"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute w-10 h-10 bg-[#F1C27D]/20 rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.3 }}
              className="absolute w-6 h-6 bg-[#F1C27D]/30 rounded-full"
            />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#F1C27D" className="w-8 h-8 md:w-10 md:h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </motion.div>
        </ScrollLink>
      </motion.div>
    </section>
  );
};

export default HeroSection;
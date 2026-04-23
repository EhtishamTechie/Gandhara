// src/components/TaxilaPromoBanner.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Calendar, MapPin, Camera } from 'lucide-react';

const TaxilaPromoBanner = () => {
  return (
    <div className="relative w-full bg-[#0F172A] overflow-hidden">
      {/* Static gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A]"></div>
      
      {/* Content section - higher z-index than SVG */}
      <div className="container mx-auto px-4 relative z-30">
        <div className="flex flex-col items-center justify-center py-16 md:py-20 lg:py-24 text-center">
          {/* Main content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center rounded-full bg-[#E6A44E]/20 px-4 py-2 mb-6">
              <span className="text-[#E6A44E] text-sm font-medium">DISCOVER ANCIENT WONDERS</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight">
              Explore the UNESCO Heritage <br/>
              <span className="bg-gradient-to-r from-[#E6A44E] via-[#F1C27D] to-[#E6A44E] bg-clip-text text-transparent">
                Treasures of Taxila
              </span>
            </h2>
            
            <p className="text-[#E2E8F0] text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
              Journey through 2,500 years of civilization with our expert-guided tours of ancient Taxila's archaeological wonders.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 md:gap-8 mb-10">
              <div className="flex items-center text-white/80">
                <Calendar className="w-6 h-6 mr-3 text-[#E6A44E]" />
                <span className="text-lg">Tours Daily</span>
              </div>
              <div className="flex items-center text-white/80">
                <MapPin className="w-6 h-6 mr-3 text-[#E6A44E]" />
                <span className="text-lg">30km from Islamabad</span>
              </div>
              <div className="flex items-center text-white/80">
                <Camera className="w-6 h-6 mr-3 text-[#E6A44E]" />
                <span className="text-lg">Photography Welcome</span>
              </div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Link 
                to="/visit-taxila" 
                className="inline-flex items-center justify-center bg-[#E6A44E] hover:bg-[#F1C27D] text-[#0F172A] px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_30px_rgba(230,164,78,0.4)] relative z-40"
              >
                Explore Tour Packages
                <ChevronRight className="w-6 h-6 ml-2" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      {/* Bottom wave design element - lower z-index and pointer-events-none */}
      <svg 
        className="absolute bottom-0 left-0 w-full text-[#1E293B] z-10 pointer-events-none" 
        viewBox="0 0 1440 120" 
        fill="none" 
        preserveAspectRatio="none"
      >
        <path 
          d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,42.7C1120,32,1280,32,1360,32L1440,32L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" 
          fill="currentColor" 
        />
      </svg>
    </div>
  );
};

export default TaxilaPromoBanner;
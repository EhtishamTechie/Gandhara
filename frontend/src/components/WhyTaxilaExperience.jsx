// src/components/WhyTaxilaExperience.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
// Using simple text for bullet points, but could use icons if desired
// import { AcademicCapIcon, GlobeEuropeAfricaIcon, PuzzlePieceIcon } from '@heroicons/react/24/outline';

// --- Configuration ---
// Background uses a rich CSS gradient (deep navy → archaeological earth tones)
// No external image dependency — works instantly with zero 404 risk

const WhyTaxilaExperience = () => {
  const { ref: headingRef, inView: headingInView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { ref: contentRef, inView: contentInView } = useInView({ triggerOnce: true, threshold: 0.2, rootMargin: '-100px 0px' }); // Trigger a bit early

  const bulletPoints = [
    "Nexus of Persian, Greek & Indian Civilizations",
    "Cradle of Gandhara Buddhist Art & Philosophy",
    "Footprints of Alexander, Ashoka & Kushan Emperors",
    "A UNESCO World Heritage Tapestry Unearthed Daily",
    "Ancient University, a Beacon of Knowledge",
  ];

  return (
    // Section Background: Deep Navy Blue (#0F172A)
    <section className="relative bg-[#0F172A]">

      {/* Section Header (Placed outside parallax for normal scroll) */}
      <div
        ref={headingRef}
        className={`container mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20 md:pt-28 pb-12 md:pb-16 transition-all duration-700 ease-out ${
            headingInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        {/* Heading: Warm Gold Gradient */}
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#E6A44E] via-[#F1C27D] to-[#E6A44E] bg-clip-text text-transparent mb-4 tracking-tight">
          Echoes of Empires, Whispers of Wisdom
        </h2>
        {/* Sub-heading: Crisp White (#F8FAFC) */}
        <p className="text-lg md:text-xl text-[#F8FAFC] max-w-3xl mx-auto leading-relaxed">
          Why Taxila resonates through millennia as a profound cradle of civilization and a beacon of ancient learning.
        </p>
      </div>

      {/* Parallax Container */}
      <div
        className="relative py-28 md:py-40 lg:py-56"
        style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 30%, #2D4A3E 60%, #3B2A1A 80%, #0F172A 100%)' }}
        aria-label="Ancient Taxila heritage section"
      >
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, #E6A44E22 0%, transparent 50%), radial-gradient(circle at 75% 50%, #4A90D922 0%, transparent 50%)' }} aria-hidden="true"></div>

        {/* Content Container (Animated) */}
        <div
          ref={contentRef}
          // Text color remains white for contrast on overlay
          className={`relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white z-10 transition-all duration-1000 ease-out ${
            contentInView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'
          }`}
          style={{ transitionDelay: contentInView ? '200ms' : '0ms' }}
        >
          <div className="space-y-8 md:space-y-10">
            {/* Quote Text: Crisp White (#F8FAFC) - using default text-white */}
            <p className="text-3xl md:text-4xl lg:text-5xl font-semibold italic [text-shadow:_0_2px_10px_rgba(0,0,0,0.6)] leading-tight">
              "Step into a realm where history breathes and ancient wonders await your discovery."
            </p>

            <ul className="space-y-3 text-base md:text-lg list-none [text-shadow:_0_1px_5px_rgba(0,0,0,0.5)]">
              {bulletPoints.map((point, index) => (
                <li key={index} className="flex items-center justify-center md:justify-start">
                  {/* Bullet Point: Warm Gold (#E6A44E) */}
                  <span className="inline-block w-2.5 h-2.5 bg-[#E6A44E] rounded-full mr-3 transform scale-90"></span>
                  {/* Bullet Text: Light Silver/Gray (#E2E8F0) */}
                  <span className="text-[#E2E8F0]">{point}</span>
                </li>
              ))}
            </ul>

            {/* Final Paragraph Text: Light Silver/Gray (#E2E8F0) */}
            <p className="text-md md:text-lg text-[#E2E8F0] leading-relaxed pt-4">
              Visiting Taxila isn't just observing ruins; it's an immersive journey into the very pages of history, feeling the resonance of empires past, and witnessing the enduring legacy of human creativity, spirituality, and intellectual pursuit.
            </p>
          </div>

          {/* Call to Action */}
          <div className="mt-12 md:mt-16">
            {/* Button: Warm Gold Gradient bg, Deep Navy text, Lighter Gold focus ring */}
            <Link
              to="/visit-taxila" // Updated to match Navbar link for consistency
              className="inline-block bg-gradient-to-r from-[#E6A44E] to-[#F1C27D] hover:from-[#F1C27D] hover:to-[#E6A44E] text-[#0F172A] font-semibold px-10 py-4 rounded-lg transition-all duration-300 ease-in-out text-base md:text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-[#F1C27D] focus:ring-opacity-50"
            >
              Experience the Echoes Yourself
            </Link>
          </div>
        </div>
      </div>
      {/* Optional: Another content section after parallax if needed */}
      {/* <div className="bg-[#0F172A] py-10">...</div> */}
    </section>
  );
};

export default WhyTaxilaExperience;

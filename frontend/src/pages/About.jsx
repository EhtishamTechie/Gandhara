import React, { useState, useEffect, useMemo } from 'react';
import { GraduationCap, Award, Users, MapPin, Phone, Mail, Star, BookOpen, Globe, History } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import SEOHead from '../components/SEOHead';
import { useSiteMediaSlot } from '../hooks/useApi';
import { getMediaUrl } from '../utils/imageHelper';

// Fallback assets used only if the admin-managed slots are empty.
// Zero visual regression on first paint.
const FALLBACK_GALLERY = [
  '/GandharaImages/jaulian.webp',
  '/GandharaImages/museum.webp',
  '/GandharaImages/sarsukh.webp',
  '/GandharaImages/artisanWorkshopImage.webp',
  '/GandharaImages/taxilaPanoramicImage.webp',
  '/GandharaImages/The_Grand_Taxila_Day_Tour.webp',
  '/GandharaImages/Monasteries_&_Hidden_Ruins_Walk.webp',
];
const FALLBACK_FOUNDER = '/GandharaImages/Prof_Rashid_Transparent.webp';

const About = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Admin-managed slots (Phase 2 + Phase 3)
  const { data: gallerySlot } = useSiteMediaSlot('about.gallery');
  const { data: founderSlot } = useSiteMediaSlot('about.founder');

  // WhatsApp contact
  const whatsappNumber = "+923005567507";
  const whatsappMessage = "Hello! I would like to learn more about Gandhara Arts & Taxila Stone Crafts.";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  // Resolve gallery image URLs — prefer DB slot, fall back to hardcoded list.
  const galleryImages = useMemo(() => {
    const items = gallerySlot?.items;
    if (Array.isArray(items) && items.length > 0) {
      return items.map((it) => getMediaUrl(it.url));
    }
    return FALLBACK_GALLERY;
  }, [gallerySlot]);

  // Founder portrait — first active item in the slot or fallback.
  const founderImage = useMemo(() => {
    const items = founderSlot?.items;
    if (Array.isArray(items) && items.length > 0) {
      return getMediaUrl(items[0].url);
    }
    return FALLBACK_FOUNDER;
  }, [founderSlot]);

  // Keep the active index within bounds when the gallery shrinks.
  useEffect(() => {
    if (currentImageIndex >= galleryImages.length) setCurrentImageIndex(0);
  }, [galleryImages.length, currentImageIndex]);

  // Auto-advance gallery
  useEffect(() => {
    if (galleryImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [galleryImages.length]);

  return (
    <>
      {/* SEO Head for About Page */}
      <SEOHead
        title="About Us - Gandhara Arts & Taxila Stone Crafts Heritage"
        description="Learn about Gandhara Arts & Taxila Stone Crafts - preserving ancient Pakistani heritage through contemporary craftsmanship. Discover our story, mission, and master artisans."
        keywords={[
          'about gandhara arts',
          'taxila stone crafts history',
          'pakistani heritage crafts',
          'stone carving masters',
          'buddhist art tradition',
          'taxila artisans',
          'cultural preservation',
          'handmade stone art',
          'gandhara tradition',
          'pakistani craftsmanship'
        ]}
        image={`${window.location.origin}/GandharaImages/Gandharalogo.webp`}
        url={window.location.href}
        type="website"
      />

      <div className="bg-[#0F172A] text-[#F8FAFC] min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#E6A44E]/10 via-[#0F172A] to-[#1E293B]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#E6A44E] via-[#F1C27D] to-[#E6A44E] bg-clip-text text-transparent">
              About Gandhara Arts and Taxila Stone Crafts
            </h1>
            <p className="text-xl md:text-2xl text-[#E2E8F0] max-w-4xl mx-auto leading-relaxed">
              Preserving Ancient Heritage Through Contemporary Craftsmanship
            </p>
          </div>

          {/* Company Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-[#F1C27D] mb-6">Our Heritage</h2>
              <p className="text-lg text-[#E2E8F0] leading-relaxed">
                Gandhara Arts & Taxila Stone Crafts stands as a bridge between ancient civilizations and modern appreciation for cultural heritage. Located in the heart of Taxila, a UNESCO World Heritage Site, our organization is dedicated to preserving and promoting the rich artistic traditions of the Gandhara civilization.
              </p>
              <p className="text-lg text-[#E2E8F0] leading-relaxed">
                Through meticulous research, expert craftsmanship, and passionate advocacy, we bring the timeless beauty of Gandhara art to contemporary audiences while maintaining the authenticity and spiritual essence of these ancient masterpieces.
              </p>
              
              <div className="grid grid-cols-2 gap-6 mt-8">
                <div className="bg-[#1E293B] p-6 rounded-xl border border-[#334155]">
                  <History className="w-8 h-8 text-[#E6A44E] mb-3" />
                  <h3 className="font-semibold text-[#F8FAFC] mb-2">2000+ Years</h3>
                  <p className="text-sm text-[#E2E8F0]">of Heritage Preserved</p>
                </div>
                <div className="bg-[#1E293B] p-6 rounded-xl border border-[#334155]">
                  <Globe className="w-8 h-8 text-[#E6A44E] mb-3" />
                  <h3 className="font-semibold text-[#F8FAFC] mb-2">UNESCO Site</h3>
                  <p className="text-sm text-[#E2E8F0]">World Heritage Location</p>
                </div>
              </div>
            </div>

            {/* Gallery Section */}
            <div className="relative">
              {galleryImages.length > 0 && (
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={galleryImages[currentImageIndex]}
                    alt="Gandhara Heritage"
                    className="w-full h-96 object-cover transition-opacity duration-1000"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/GandharaImages/Gandharalogo.webp';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  
                  {galleryImages.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {galleryImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            index === currentImageIndex ? 'bg-[#E6A44E]' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Founder Profile Section */}
      <section className="py-20 bg-[#1E293B]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#E6A44E] via-[#F1C27D] to-[#E6A44E] bg-clip-text text-transparent">
              Meet Our Founder
            </h2>
            <p className="text-xl text-[#E2E8F0] max-w-3xl mx-auto">
              Visionary Leader in Archaeological Research and Cultural Preservation
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Founder Image */}
            <div className="relative">
              <div className="relative mx-auto max-w-md">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#E6A44E] to-[#F1C27D] rounded-2xl blur opacity-30"></div>
                <div className="relative bg-[#0F172A] p-8 rounded-2xl border border-[#334155]">
                  <img
                    src={founderImage}
                    alt="Prof Dr Rashid Khan - Founder"
                    className="w-full h-auto rounded-xl"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/GandharaImages/Gandharalogo.webp';
                    }}
                  />
                  <div className="absolute -bottom-6 -right-6 bg-[#E6A44E] text-[#0F172A] p-4 rounded-full">
                    <GraduationCap className="w-8 h-8" />
                  </div>
                </div>
              </div>
            </div>

            {/* Founder Information */}
            <div className="space-y-8">
              <div>
                <h3 className="text-3xl md:text-4xl font-bold text-[#F8FAFC] mb-3">
                  Prof Dr Rashid Khan
                </h3>
                <p className="text-xl text-[#F1C27D] font-semibold mb-6">
                  Founder
                </p>
                
                <div className="prose prose-lg prose-invert max-w-none">
                  <p className="text-[#E2E8F0] leading-relaxed mb-6">
                    Prof Dr Rashid Khan stands as a distinguished figure in the field of archaeology and cultural heritage preservation. With his PhD in Archaeology and specialization in comparative studies, he brings unparalleled expertise to the understanding and preservation of Gandhara civilization.
                  </p>
                  
                  <p className="text-[#E2E8F0] leading-relaxed mb-6">
                    His groundbreaking research in comparative archaeological studies has established new paradigms in understanding the cultural synthesis that defines Gandhara art. Prof Khan's unique approach combines rigorous academic methodology with practical heritage conservation, making him a respected authority in both scholarly and cultural preservation circles.
                  </p>
                </div>
              </div>

              {/* Expertise Areas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#0F172A] p-6 rounded-xl border border-[#334155]">
                  <BookOpen className="w-8 h-8 text-[#E6A44E] mb-4" />
                  <h4 className="font-bold text-[#F8FAFC] mb-2">PhD in Archaeology</h4>
                  <p className="text-sm text-[#E2E8F0]">Advanced research in ancient civilizations and cultural heritage</p>
                </div>
                
                <div className="bg-[#0F172A] p-6 rounded-xl border border-[#334155]">
                  <Globe className="w-8 h-8 text-[#E6A44E] mb-4" />
                  <h4 className="font-bold text-[#F8FAFC] mb-2">Comparative Studies</h4>
                  <p className="text-sm text-[#E2E8F0]">Cross-cultural analysis of ancient artistic traditions</p>
                </div>
                
                <div className="bg-[#0F172A] p-6 rounded-xl border border-[#334155]">
                  <History className="w-8 h-8 text-[#E6A44E] mb-4" />
                  <h4 className="font-bold text-[#F8FAFC] mb-2">Gandhara Expertise</h4>
                  <p className="text-sm text-[#E2E8F0]">Specialized knowledge in Gandhara art and culture</p>
                </div>
                
                <div className="bg-[#0F172A] p-6 rounded-xl border border-[#334155]">
                  <Award className="w-8 h-8 text-[#E6A44E] mb-4" />
                  <h4 className="font-bold text-[#F8FAFC] mb-2">Cultural Preservation</h4>
                  <p className="text-sm text-[#E2E8F0]">Innovative approaches to heritage conservation</p>
                </div>
              </div>

              {/* Academic Achievements */}
              <div className="bg-gradient-to-r from-[#E6A44E]/10 to-[#F1C27D]/10 p-8 rounded-xl border border-[#E6A44E]/20">
                <h4 className="text-2xl font-bold text-[#F1C27D] mb-4">Academic Excellence</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Star className="w-5 h-5 text-[#E6A44E]" />
                    <span className="text-[#E2E8F0]">Pioneering research in Gandhara-Buddhist art synthesis</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Star className="w-5 h-5 text-[#E6A44E]" />
                    <span className="text-[#E2E8F0]">Published extensively on Indo-Greek cultural heritage</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Star className="w-5 h-5 text-[#E6A44E]" />
                    <span className="text-[#E2E8F0]">International recognition for heritage preservation work</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Star className="w-5 h-5 text-[#E6A44E]" />
                    <span className="text-[#E2E8F0]">Consultant for UNESCO World Heritage initiatives</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-[#1E293B] p-8 rounded-2xl border border-[#334155]">
              <h3 className="text-2xl font-bold text-[#F1C27D] mb-6">Our Mission</h3>
              <p className="text-[#E2E8F0] leading-relaxed mb-6">
                To preserve, promote, and share the rich cultural heritage of the Gandhara civilization through authentic craftsmanship, educational initiatives, and cultural tourism, ensuring these ancient treasures remain accessible to future generations.
              </p>
              <div className="flex items-center space-x-3">
                <Users className="w-6 h-6 text-[#E6A44E]" />
                <span className="text-[#F8FAFC] font-semibold">Cultural Heritage Preservation</span>
              </div>
            </div>

            <div className="bg-[#1E293B] p-8 rounded-2xl border border-[#334155]">
              <h3 className="text-2xl font-bold text-[#F1C27D] mb-6">Our Vision</h3>
              <p className="text-[#E2E8F0] leading-relaxed mb-6">
                To become the leading authority in Gandhara art preservation and education, creating a global network of appreciation for ancient Pakistani heritage while fostering understanding between cultures through the universal language of art.
              </p>
              <div className="flex items-center space-x-3">
                <Globe className="w-6 h-6 text-[#E6A44E]" />
                <span className="text-[#F8FAFC] font-semibold">Global Cultural Bridge</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-[#1E293B]/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-[#F1C27D] mb-6">Connect With Our Heritage</h3>
          <p className="text-lg text-[#E2E8F0] mb-8">
            Discover the timeless beauty of Gandhara arts and join us in preserving this magnificent cultural legacy.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <FaWhatsapp className="w-6 h-6" />
              Connect via WhatsApp
            </a>

            <div className="flex items-center gap-2 text-[#E2E8F0]">
              <Phone className="w-5 h-5 text-[#E6A44E]" />
              <span>+92 300 556 7507</span>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-[#E2E8F0]">
            <MapPin className="w-5 h-5 text-[#E6A44E]" />
            <span>Taxila, Punjab, Pakistan - UNESCO World Heritage Site</span>
          </div>
        </div>
      </section>
    </div>
    </>
  );
};

export default About;

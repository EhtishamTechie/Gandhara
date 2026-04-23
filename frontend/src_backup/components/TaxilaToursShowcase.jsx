import React, { useState, useEffect } from 'react';
import { ArrowRightIcon, ClockIcon, StarIcon, ShoppingBagIcon, ArrowLeftIcon, MapPinIcon, UserGroupIcon, CalendarIcon, PhoneIcon, HeartIcon, ShareIcon, ChevronLeftIcon, ChevronRightIcon, PlayIcon } from '@heroicons/react/24/outline';
import { FaWhatsapp } from 'react-icons/fa';
// Add this import with your existing imports
import WatermarkedImage from '../components/WatermarkedImage';

// Hero Section Component
const TaxilaToursHero = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [tourImages, setTourImages] = useState([]);

  // WhatsApp configuration
  const whatsappNumber = "+923005567507";
  const whatsappMessage = "Hello! I'm interested in learning more about Gandhara Arts & Taxila Stone Crafts.";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  // Default tour content data
  const tourContent = [
    {
      title: "Discover Ancient Taxila",
      subtitle: "UNESCO World Heritage Site"
    },
    {
      title: "Buddhist Heritage",
      subtitle: "Sacred Monasteries & Stupas"
    },
    {
      title: "Gandhara Civilization",
      subtitle: "Art & Cultural Treasures"
    },
    {
      title: "Museum Experience",
      subtitle: "Ancient Artifacts & Stories"
    },
    {
      title: "Expert Guided Tours",
      subtitle: "Professional Local Guides"
    }
  ];

  
  // Load all images from Tour Images folder
  useEffect(() => {
    const loadTourImages = () => {
      // Your actual image filenames from the Tour Images folder
      const imageFiles = [
        'Cultural_Event_Taxila.jpg',
        'Delegation_Group_Tour.jpg', 
        'Dharmarajeka_Group_Tour.jpg',
        'Dharmarajeka_Visit_Group.jpg',
        'Event_group_picture.jpg',
        'Group_Delegation_Visit.jpg',
        'Jullian_Group_Tour_2.jpg',
        'Jullian_Group_Tour.jpg',
        'Sirkap_Group_Tour.jpg',
        'Sirkap_Group_Visit.jpg',
        'Taxila_Museum_Group_Tour.jpg',
        'Taxila_Museum_Group_Visit.jpg',
        'Taxila_Museum_Tour_2.jpg'
      ];

      // Function to create title and subtitle from filename
      const createTitleFromFilename = (filename) => {
        let name = filename.replace('.jpg', '').replace(/_/g, ' ');
        // Remove numbers and extra words like "2", "Tour 2", etc.
        name = name.replace(/\s*\d+$/, '').replace(/\s*Tour\s*\d+/, ' Tour').trim();
        
        // Create title and subtitle based on the content
        if (name.includes('Cultural Event')) {
          return { title: 'Cultural Events at Taxila', subtitle: 'Traditional Celebrations & Heritage' };
        } else if (name.includes('Delegation')) {
          return { title: 'VIP Delegation Tours', subtitle: 'Exclusive Heritage Experiences' };
        } else if (name.includes('Dharmarajeka')) {
          return { title: 'Dharmarajeka Monastery', subtitle: 'Ancient Buddhist Stupa Complex' };
        } else if (name.includes('Event group')) {
          return { title: 'Group Heritage Events', subtitle: 'Community Cultural Programs' };
        } else if (name.includes('Jullian')) {
          return { title: 'Jullian Archaeological Site', subtitle: 'Ancient City Ruins & Excavations' };
        } else if (name.includes('Sirkap')) {
          return { title: 'Sirkap Ancient City', subtitle: 'Greco-Bactrian Urban Planning' };
        } else if (name.includes('Taxila Museum Tour')) { // Added specific check for Taxila_Museum_Tour
        return { title: 'VIP Delegation Tours', subtitle: 'Exclusive Heritage Experiences' }; // Change title
        } else if (name.includes('Taxila Museum')) {
          return { title: 'Taxila Museum Experience', subtitle: 'Gandhara Art & Artifacts Collection' };
        } else {
          return { title: name, subtitle: 'Heritage Site Experience' };
        }
      };

      const images = imageFiles.map((filename) => {
        const { title, subtitle } = createTitleFromFilename(filename);
        return {
          src: `/Tour Images/${filename}`,
          alt: filename.replace('.jpg', '').replace(/_/g, ' ').replace(/\s*\d+$/, '').replace(/\s*Tour\s*\d+/, ' Tour').trim(),
          title: title,
          subtitle: subtitle
        };
      });

      setTourImages(images);
    };

    loadTourImages();
  }, []);

  // Auto-advance slideshow
  useEffect(() => {
    if (isAutoPlaying && tourImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => 
          prevIndex === tourImages.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isAutoPlaying, tourImages.length]);

  // Navigation functions
  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? tourImages.length - 1 : prevIndex - 1
    );
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentImageIndex((prevIndex) => 
      prevIndex === tourImages.length - 1 ? 0 : prevIndex + 1
    );
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToSlide = (index) => {
    setIsAutoPlaying(false);
    setCurrentImageIndex(index);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  if (tourImages.length === 0) {
    return (
      <section className="relative h-screen overflow-hidden bg-[#0F172A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E6A44E] mx-auto mb-4"></div>
          <p className="text-[#F8FAFC] text-xl">Loading Tour Images...</p>
        </div>
      </section>
    );
  }

  const currentImage = tourImages[currentImageIndex];

  return (
    <section className="relative h-screen overflow-hidden bg-[#0F172A]">
      {/* Background Image Slideshow */}
      <div className="absolute inset-0">
        {tourImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          > 
            <WatermarkedImage
            src={image.src}
            alt={image.alt}
            className="w-full h-full object-cover"
            watermarkOpacity={0.25}  // Lighter for hero images
            showLogo={true}
            showWhatsApp={true}
          />

            <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/80 via-[#0F172A]/60 to-[#0F172A]/40"></div>
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      {tourImages.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
            aria-label="Previous image"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
            aria-label="Next image"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3">
            {tourImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentImageIndex 
                    ? 'bg-[#E6A44E] scale-125' 
                    : 'bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Auto-play indicator */}
          <div className="absolute top-4 right-4 z-20">
            <div className={`flex items-center space-x-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-2 text-white text-sm ${
              isAutoPlaying ? 'opacity-100' : 'opacity-60'
            }`}>
              <PlayIcon className={`w-4 h-4 ${isAutoPlaying ? 'text-[#E6A44E]' : 'text-white'}`} />
              <span>Auto</span>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Dynamic Content Based on Current Image */}
          <div className="mb-8">
            <div className="inline-block py-2 px-4 rounded-full bg-[#E6A44E]/20 border border-[#E6A44E]/30 text-[#F1C27D] text-sm font-medium mb-4 backdrop-blur-sm">
              {currentImage.subtitle}
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-[#E6A44E] via-[#F1C27D] to-[#E6A44E] bg-clip-text text-transparent">
                {currentImage.title}
              </span>
            </h1>
          </div>

          {/* Main Hero Content */}
          <div className="max-w-3xl mx-auto mb-12">
            <p className="text-xl md:text-2xl text-[#F8FAFC] leading-relaxed mb-8 font-light">
              Embark on extraordinary journeys through the ancient wonders of Taxila, 
              guided by local experts and historians who bring history to life.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="text-2xl font-bold text-[#E6A44E] mb-1">2000+</div>
                <div className="text-[#E2E8F0] text-sm">Years of History</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="text-2xl font-bold text-[#E6A44E] mb-1">UNESCO</div>
                <div className="text-[#E2E8F0] text-sm">World Heritage Site</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="text-2xl font-bold text-[#E6A44E] mb-1">Expert</div>
                <div className="text-[#E2E8F0] text-sm">Local Guides</div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-x-3 bg-[#E6A44E] hover:bg-[#F1C27D] text-[#0F172A] font-bold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_30px_rgba(230,164,78,0.4)] shadow-lg text-lg"
              aria-label="Chat with us on WhatsApp"
            >
              <FaWhatsapp className="w-6 h-6" />
              Book Your Heritage Tour
            </a>

            <button 
              onClick={() => {
                document.getElementById('tours')?.scrollIntoView({ 
                  behavior: 'smooth' 
                });
              }}
              className="inline-flex items-center justify-center gap-x-3 bg-transparent border-2 border-[#E6A44E] text-[#E6A44E] hover:bg-[#E6A44E] hover:text-[#0F172A] font-semibold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg text-lg backdrop-blur-sm"
            >
              Explore All Tours
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Contact Info */}
          <div className="mt-8 text-center">
            <p className="text-[#E2E8F0] text-sm">
              📞 Call directly: <span className="text-[#F1C27D] font-semibold">+92 300 556 7507</span>
            </p>
            <p className="text-[#E2E8F0]/70 text-xs mt-1">
              Available 24/7 for bookings and inquiries
            </p>
          </div>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
        <div className="flex flex-col items-center text-white/70 hover:text-white transition-colors cursor-pointer"
             onClick={() => document.getElementById('tours')?.scrollIntoView({ behavior: 'smooth' })}>
          <div className="text-xs mb-2 font-medium tracking-wider">EXPLORE TOURS</div>
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

const TaxilaToursShowcase = () => {
  const [tours, setTours] = useState({
    featured: [],
    cultural: [],
    historical: [],
    adventure: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('featured');
  const [selectedTourId, setSelectedTourId] = useState(null);
  const [showDetailPage, setShowDetailPage] = useState(false);

  // WhatsApp number
  const whatsappNumber = "923005567507";

  // Get image path function
  const getImagePath = (imagePath) => {
    if (!imagePath) return '/placeholder-image.png';
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return `${import.meta.env.VITE_API_URL}/${imagePath}`;
  };

  // Create WhatsApp message with tour information
  const createWhatsAppLink = (tour) => {
    const message = `Hello! I'm interested in booking the "${tour.name}" tour. Please provide more information.`;
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  // Fetch all visit places/tours from backend
  useEffect(() => {
    const fetchTours = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/visit-places/all`);
        const data = await response.json();
        
        // Sort by creation date (newest first)
        const sortedTours = data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        // Categorize tours based on their tourCategory field
        const categorizedTours = {
          featured: [],
          cultural: [],
          historical: [],
          adventure: []
        };

        sortedTours.forEach(tour => {
          // If tour has tourCategory field, use it; otherwise default to 'featured'
          const category = tour.tourCategory?.toLowerCase() || 'featured';
          if (categorizedTours[category]) {
            categorizedTours[category].push(tour);
          } else {
            categorizedTours.featured.push(tour); // fallback to featured
          }
        });

        setTours(categorizedTours);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching tours:", err);
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  // Handle view details
  const handleViewDetails = (tourId) => {
    console.log("Opening details for tour:", tourId); // Debug log
    setSelectedTourId(tourId);
    setShowDetailPage(true);
  };

  const handleCloseDetails = () => {
    console.log("Closing details page"); // Debug log
    setShowDetailPage(false);
    setSelectedTourId(null);
  };

  // If detail page is open, show it
  if (showDetailPage && selectedTourId) {
    return <TourDetailPage tourId={selectedTourId} onClose={handleCloseDetails} tours={tours} getImagePath={getImagePath} createWhatsAppLink={createWhatsAppLink} />;
  }

  // Get tours for the active tab
  const activeTours = tours[activeTab] || [];

  // Check if we have any tours at all
  const totalTours = Object.values(tours).flat().length;

  return (
    <>
      {/* Hero Section */}
      <TaxilaToursHero />
      
      {/* Tours Section */}
      {loading ? (
        <section id="tours" className="bg-[#0F172A] py-20 md:py-28">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E6A44E]"></div>
              <p className="ml-4 text-[#F8FAFC] text-xl">Loading Heritage Tours...</p>
            </div>
          </div>
        </section>
      ) : totalTours === 0 ? (
        <section id="tours" className="bg-[#0F172A] py-20 md:py-28">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-20">
              <div className="bg-[#1E293B] border-2 border-[#334155] rounded-3xl p-12 max-w-md mx-auto">
                <h2 className="text-3xl font-bold text-[#F8FAFC] mb-4">No Tours Available Yet</h2>
                <p className="text-[#E2E8F0]">Add tour places with categories in the admin panel to showcase here.</p>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section id="tours" className="bg-[#0F172A] py-20 md:py-28 overflow-hidden">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="relative">
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-72 h-72 bg-[#E6A44E]/10 rounded-full blur-3xl z-0"></div>
              
              <div className="text-center mb-16 md:mb-20 relative z-10">
                <span className="inline-block py-1 px-3 rounded-full bg-[#F1C27D]/20 text-[#E6A44E] text-sm font-medium mb-3">
                  CURATED EXPERIENCES
                </span>
                
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#E6A44E] via-[#F1C27D] to-[#E6A44E] bg-clip-text text-transparent mb-4 tracking-tight">
                  Exclusive Heritage Expeditions
                </h2>
                
                <p className="text-lg md:text-xl text-[#F8FAFC] max-w-2xl mx-auto leading-relaxed">
                  Embark on curated journeys through the ancient wonders of Taxila, guided by local experts and historians.
                </p>
              </div>
            </div>

            {/* Tabs for different tour categories */}
            <div className="flex justify-center mb-12 overflow-x-auto pb-2">
              <div className="inline-flex bg-[#1E293B] rounded-full p-1">
                {Object.keys(tours).filter(tab => tours[tab].length > 0).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                      activeTab === tab 
                        ? 'bg-[#E6A44E] text-[#0F172A]' 
                        : 'text-[#E2E8F0] hover:text-[#F1C27D]'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)} ({tours[tab].length})
                  </button>
                ))}
              </div>
            </div>

            {/* Tours Grid */}
            {activeTours.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                {activeTours.map((tour, index) => (
                  <TourCard 
                    key={tour._id} 
                    tour={tour} 
                    index={index} 
                    getImagePath={getImagePath} 
                    createWhatsAppLink={createWhatsAppLink}
                    onViewDetails={() => handleViewDetails(tour._id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-[#E2E8F0] text-lg">No tours available in the {activeTab} category yet.</p>
                <p className="text-[#E2E8F0]/60 text-sm mt-2">Check other categories or add new tours in the admin panel.</p>
              </div>
            )}

            {/* CTA Section */}
            <div className="mt-16 md:mt-24 flex flex-col items-center">
              <div className="text-center max-w-2xl mb-8">
                <h3 className="text-2xl font-bold text-[#F8FAFC] mb-3">
                  Ready for an Unforgettable Journey?
                </h3>
                <p className="text-[#E2E8F0]">
                  Discover more specialized tours tailored to your interests and time constraints.
                </p>
              </div>
              
              <a
                href="/visit-taxila"
                className="inline-flex items-center justify-center gap-x-2 bg-gradient-to-r from-[#E6A44E] to-[#F1C27D] text-[#0F172A] font-bold px-8 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_30px_rgba(230,164,78,0.3)] shadow-lg"
              >
                Explore All Taxila Tours
                <ArrowRightIcon className="w-5 h-5" />
              </a>
              
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hello! I'm interested in learning more about your Taxila tours.")}`}
                target="_blank"
                rel="noopener noreferrer" 
                className="mt-5 text-[#F1C27D] hover:text-[#E6A44E] text-sm font-medium transition-colors"
              >
                Or contact us directly for custom tour packages
              </a>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

// Individual Tour Card Component
const TourCard = ({ tour, index, getImagePath, createWhatsAppLink, onViewDetails }) => { 
  const [isHovered, setIsHovered] = useState(false);

  // Generate random rating and reviews for display
  const displayRating = tour.rating || (4.5 + Math.random() * 0.4).toFixed(1);
  const displayReviews = tour.reviews || Math.floor(Math.random() * 100) + 50;
  const displayPrice = tour.price || `Contact for pricing`;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-[#1E293B] rounded-xl shadow-xl overflow-hidden flex flex-col transition-all duration-500 hover:shadow-2xl transform hover:-translate-y-2 group"
    >
      <div className="relative overflow-hidden aspect-[16/10]">
        <WatermarkedImage
          src={getImagePath(tour.image)}
          alt={tour.name}
          className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
          watermarkOpacity={0.3}
          showLogo={true}
          showWhatsApp={true}
        />
       
        
        <div className={`absolute inset-0 bg-gradient-to-t from-[#0F172A]/90 via-[#0F172A]/40 to-transparent opacity-60 transition-opacity duration-300 ${isHovered ? 'opacity-80' : 'opacity-60'}`}></div>
        
        <div className="absolute top-3 left-3 flex items-center bg-[#E6A44E] text-[#0F172A] text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
          <ClockIcon className="w-3.5 h-3.5 mr-1" />
          {tour.tourCategory || 'Heritage Site'}
        </div>
        
        <div className="absolute top-3 right-3 flex items-center bg-white/90 text-[#0F172A] text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
          <StarIcon className="w-3.5 h-3.5 mr-1 text-[#E6A44E]" />
          <span>{displayRating}</span>
          <span className="mx-1 text-gray-400">•</span>
          <span className="text-gray-600">{displayReviews} reviews</span>
        </div>
        
        <div className="absolute bottom-3 left-3 bg-black/80 text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-md backdrop-blur-sm">
          {displayPrice}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl lg:text-2xl font-semibold text-[#F8FAFC] mb-2 group-hover:text-[#F1C27D] transition-colors">
          {tour.name}
        </h3>
        
        <p className="text-sm font-medium text-[#F1C27D] mb-3 uppercase tracking-wider">
          {tour.tourCategory ? `${tour.tourCategory} Experience` : 'Heritage Experience'}
        </p>
        
        <p className="text-[#E2E8F0] text-sm md:text-base mb-4 flex-grow leading-relaxed">
          {tour.description || "Explore the rich heritage and cultural significance of this remarkable site with expert guidance and immersive storytelling."}
        </p>
        
        {tour.keywords && tour.keywords.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-2">
            {tour.keywords.slice(0, 4).map((keyword, i) => (
              <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#334155] text-[#E2E8F0]">
                {keyword}
              </span>
            ))}
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-3 mt-auto">
          <a 
            href={createWhatsAppLink(tour)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-x-2 bg-[#E6A44E] hover:bg-[#F1C27D] text-[#0F172A] font-semibold px-4 py-3 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg"
          >
            <ShoppingBagIcon className="w-4 h-4" />
            <span>Book Tour</span>
          </a>
          
          <button 
            onClick={() => {
              console.log("View Details clicked for:", tour._id); // Debug log
              onViewDetails();
            }}
            className="flex items-center justify-center gap-x-2 bg-transparent border border-[#E6A44E] text-[#E6A44E] hover:text-[#F1C27D] hover:border-[#F1C27D] font-semibold px-4 py-3 rounded-lg transition-colors duration-300"
          >
            View Details
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Tour Detail Page Component - SIMPLIFIED VERSION
const TourDetailPage = ({ tourId, onClose, tours, getImagePath }) => {
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  const whatsappNumber = "923005567507";

  console.log("TourDetailPage rendered with tourId:", tourId); // Debug log

  useEffect(() => {
    const fetchTourDetails = async () => {
      if (!tourId) {
        console.log("No tourId provided");
        return;
      }
      
      try {
        setLoading(true);
        console.log("Fetching details for tour:", tourId);
        
        // First try to find the tour in our existing tours data
        const allTours = Object.values(tours).flat();
        const foundTour = allTours.find(t => t._id === tourId);
        console.log("Found tour in existing data:", foundTour);
        
        if (foundTour) {
          setTour(foundTour);
          setLoading(false);
          return;
        }
        
        // If not found, fetch from API
        console.log("Fetching from API...");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/visit-places/${tourId}`);
        if (response.ok) {
          const data = await response.json();
          console.log("API response:", data);
          setTour(data);
        } else {
          console.log("API response not ok:", response.status);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching tour details:", err);
        setLoading(false);
      }
    };

    fetchTourDetails();
  }, [tourId, tours]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0F172A] z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#E6A44E] mx-auto mb-4"></div>
          <p className="text-[#F8FAFC] text-xl">Loading tour details...</p>
        </div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="fixed inset-0 bg-[#0F172A] z-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#F8FAFC] mb-4">Tour not found</h2>
          <p className="text-[#E2E8F0] mb-4">Tour ID: {tourId}</p>
          <button 
            onClick={onClose}
            className="bg-[#E6A44E] text-[#0F172A] px-6 py-3 rounded-lg font-semibold hover:bg-[#F1C27D] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const imageGallery = [
    getImagePath(tour.image),
    getImagePath(tour.image),
    getImagePath(tour.image),
    getImagePath(tour.image)
  ];

  const displayRating = tour.rating || (4.5 + Math.random() * 0.4).toFixed(1);
  const displayReviews = tour.reviews || Math.floor(Math.random() * 100) + 50;

  return (
    <div className="fixed inset-0 bg-[#0F172A] z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-[#0F172A]/95 backdrop-blur-sm border-b border-[#1E293B] z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-[#F8FAFC] hover:text-[#F1C27D] transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back to Tours</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Left Column - Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <WatermarkedImage
                  src={imageGallery[selectedImage]}
                  alt={tour.name}
                  className="w-full h-full object-cover"
                  watermarkOpacity={0.3}
                  showLogo={true}
                  showWhatsApp={true}
                />
            
              </div>
              
              <div className="absolute top-6 left-6 bg-[#E6A44E] text-[#0F172A] px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                {tour.tourCategory || 'Heritage Site'}
              </div>

              <div className="absolute top-6 right-6 flex gap-2">
                <button className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors">
                  {/* <HeartIcon className="w-5 h-5" /> */}
                </button>
                <button className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors">
                  {/* <ShareIcon className="w-5 h-5" /> */}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Tour Info */}
          <div className="space-y-6">
            
            {/* Title and Rating */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-[#F8FAFC] mb-3">
                {tour.name}
              </h1>
              
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon 
                        key={i} 
                        className={`w-5 h-5 ${i < Math.floor(displayRating) ? 'text-[#E6A44E] fill-current' : 'text-gray-400'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-[#F8FAFC] font-semibold">{displayRating}</span>
                  <span className="text-[#E2E8F0]">({displayReviews} reviews)</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[#E2E8F0] mb-4">
                <MapPinIcon className="w-5 h-5" />
                <span>Taxila, Punjab, Pakistan</span>
              </div>

              <p className="text-[#F1C27D] font-semibold text-lg uppercase tracking-wider">
                {tour.tourCategory ? `${tour.tourCategory} Experience` : 'Heritage Experience'}
              </p>
            </div>

            {/* Quick Info */}
            <div className="bg-[#1E293B] p-6 rounded-xl border border-[#334155]">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <ClockIcon className="w-6 h-6 text-[#E6A44E] mx-auto mb-2" />
                  <p className="text-[#E2E8F0] text-sm">Duration</p>
                  <p className="text-[#F8FAFC] font-semibold">Your Wish</p>
                </div>
                <div className="text-center">
                  <UserGroupIcon className="w-6 h-6 text-[#E6A44E] mx-auto mb-2" />
                  <p className="text-[#E2E8F0] text-sm">Group Size</p>
                  <p className="text-[#F8FAFC] font-semibold">2-15 People</p>
                </div>
              </div>
              
              <div className="text-center border-t border-[#334155] pt-4">
                <p className="text-[#E2E8F0] text-sm mb-1">Starting from</p>
                <p className="text-2xl font-bold text-[#E6A44E]">Contact for Pricing</p>
                <p className="text-[#E2E8F0] text-xs">Per person • All inclusive</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xl font-semibold text-[#F8FAFC] mb-4">Description</h3>
              <div className="space-y-4">
                <p className="text-[#E2E8F0] leading-relaxed text-base">
                  {tour.description || "Embark on an extraordinary journey through the ancient heritage of Taxila, where history comes alive through expert storytelling and immersive experiences."}
                </p>
                <p className="text-[#E2E8F0] leading-relaxed text-base">
                  This carefully curated tour offers deep insights into the rich cultural tapestry that has shaped this UNESCO World Heritage site for over two millennia. You'll explore ancient ruins, monasteries, and archaeological treasures while learning about the region's significance in Buddhist history and the Gandhara civilization.
                </p>
              </div>
            </div>

            {/* Tour Highlights */}
            {tour.keywords && tour.keywords.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-[#F8FAFC] mb-4">Tour Highlights</h3>
                <div className="flex flex-wrap gap-2">
                  {tour.keywords.map((keyword, index) => (
                    <span 
                      key={index}
                      className="bg-[#334155] text-[#E2E8F0] px-3 py-1.5 rounded-full text-sm font-medium border border-[#E6A44E]/20"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Booking */}
            <div className="space-y-3 pt-4">
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hello! I'm interested in booking the "${tour.name}" tour. Please provide more information about availability and pricing.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#E6A44E] to-[#F1C27D] text-[#0F172A] font-bold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_30px_rgba(230,164,78,0.3)] shadow-lg"
              >
                <PhoneIcon className="w-6 h-6" />
                <span>Book Now via WhatsApp</span>
              </a>
              
              <div className="text-center text-[#E2E8F0] text-sm pt-2">
                <p>📞 Call directly: +92 300 556 7507</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxilaToursShowcase;
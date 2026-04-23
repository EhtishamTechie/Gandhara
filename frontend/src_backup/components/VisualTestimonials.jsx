import React, { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

// Import Swiper React components & styles
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';

// Import required Swiper modules
import { Pagination, Navigation, Autoplay, A11y } from 'swiper/modules';

// Get API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL;

// --- Component ---
const VisualTestimonials = () => {
  const [masters, setMasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const { ref: headingRef, inView: headingInView } = useInView({ triggerOnce: true, threshold: 0.1 });

  // Fetch masters data from backend
  useEffect(() => {
    fetchMasters();
  }, []);

  const fetchMasters = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/masters/all`);
      if (response.ok) {
        const data = await response.json();
        setMasters(data);
      } else {
        console.error('Failed to fetch masters');
      }
    } catch (error) {
      console.error('Error fetching masters:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fallback testimonial data if no masters are available
  const fallbackTestimonials = [
    {
      id: 'f1',
      quote: "Absolutely breathtaking craftsmanship. The Buddha head carving is the centerpiece of our home. Worth every penny, and the service was impeccable.",
      name: "Eleanor Vance",
      locationOrContext: "London, UK - Art Collector",
      imageSrc: "https://picsum.photos/seed/eleanor/200/200",
      altText: "Portrait of Eleanor Vance, smiling warmly"
    },
    {
      id: 'f2',
      quote: "Our Taxila tour was phenomenal. Our guide's knowledge was incredible, and seeing those ancient sites was unforgettable. Highly recommended for history buffs!",
      name: "Kenji Tanaka",
      locationOrContext: "Tokyo, Japan - Heritage Tour Participant",
      imageSrc: "https://picsum.photos/seed/kenji/200/200",
      altText: "Portrait of Kenji Tanaka giving a thumbs up"
    },
    {
      id: 'f3',
      quote: "The custom fireplace surround exceeded all expectations. The Gandhara Arts team was professional, communicative, and the final result is a true work of art.",
      name: "David & Sarah Chen",
      locationOrContext: "New York, USA - Bespoke Design Client",
      imageSrc: "https://picsum.photos/seed/davidchen/200/200",
      altText: "Portrait of David and Sarah Chen looking pleased"
    }
  ];

  // Transform masters data to testimonial format
  const transformMastersToTestimonials = (mastersData) => {
    return mastersData.map((master) => ({
      id: master._id,
      quote: master.description,
      name: master.name,
      locationOrContext: `${master.specialty} - ${master.experience} years of experience`,
      imageSrc: `${API_BASE_URL}/${master.image}`,
      altText: `Portrait of ${master.name}, master craftsman`
    }));
  };

  // Use masters data if available, otherwise use fallback
  const testimonialData = masters.length > 0 ? transformMastersToTestimonials(masters) : fallbackTestimonials;

  if (loading) {
    return (
      <section className="bg-[#0F172A] py-20 md:py-28">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E6A44E]"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    // Section Background: Deep Navy Blue (#0F172A)
    <section className="bg-[#0F172A] py-20 md:py-28 testimonial-section">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          ref={headingRef}
          className={`text-center mb-16 md:mb-20 transition-all duration-700 ease-out ${
            headingInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {/* Heading: Warm Gold Gradient */}
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#E6A44E] via-[#F1C27D] to-[#E6A44E] bg-clip-text text-transparent mb-4 tracking-tight">
            {masters.length > 0 ? "Meet Our Master Craftsmen" : "Voices of Our Valued Clients"}
          </h2>
          {/* Sub-heading: Crisp White (#F8FAFC) */}
          <p className="text-lg md:text-xl text-[#F8FAFC] max-w-2xl mx-auto leading-relaxed">
            {masters.length > 0 
              ? "Discover the talented artisans behind our beautiful Gandhara Arts creations."
              : "Discover why art enthusiasts and heritage explorers around the world trust Gandhara Arts."
            }
          </p>
        </div>

        {/* Testimonials/Masters Slider */}
        <Swiper
          modules={[Pagination, Navigation, Autoplay, A11y]}
          spaceBetween={40} // Increased space for a more premium feel
          slidesPerView={1}
          loop={testimonialData.length > 1}
          autoplay={{
            delay: 6000, // Longer delay for reading testimonials
            disableOnInteraction: false, // Keep autoplaying
            pauseOnMouseEnter: true,
          }}
          pagination={{
            clickable: true,
            dynamicBullets: false,
            bulletClass: 'swiper-pagination-bullet custom-bullet',
            bulletActiveClass: 'swiper-pagination-bullet-active custom-bullet-active',
          }}
          navigation={{
            nextEl: '.swiper-button-next-custom',
            prevEl: '.swiper-button-prev-custom',
          }}
          breakpoints={{
            768: { slidesPerView: Math.min(2, testimonialData.length), spaceBetween: 30 },
            1024: { slidesPerView: Math.min(3, testimonialData.length), spaceBetween: 40 },
          }}
          a11y={{
            prevSlideMessage: masters.length > 0 ? 'Previous master' : 'Previous testimonial',
            nextSlideMessage: masters.length > 0 ? 'Next master' : 'Next testimonial',
            paginationBulletMessage: masters.length > 0 ? 'Go to master slide {{index}}' : 'Go to testimonial slide {{index}}',
          }}
          className="pb-20 relative" // Increased padding for custom pagination
        >
          {testimonialData.map((item) => (
            <SwiperSlide key={item.id} className="h-auto pb-1">
              {/* Card Background: Slate Blue (#1E293B) */}
              {/* Border: Lighter Slate Blue (#334155) */}
              <div className="bg-[#1E293B] rounded-xl shadow-xl p-8 h-full flex flex-col items-center text-center border border-[#334155] transform transition-all duration-300 ease-out hover:shadow-2xl hover:border-[#E6A44E]/50">
                <img
                  src={item.imageSrc}
                  alt={item.altText}
                  // Image Border: Matches card bg; Ring: Warm Gold (#E6A44E)
                  className="w-24 h-24 rounded-full object-cover mb-6 shadow-lg border-4 border-[#1E293B] ring-2 ring-[#E6A44E]"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://picsum.photos/seed/fallback/200/200';
                  }}
                />
                <blockquote className="relative mb-6 flex-grow">
                  {/* Quote Marks: Lighter Gold (#F1C27D) */}
                  <span className="absolute -top-2 -left-3 text-6xl text-[#F1C27D] opacity-40 font-serif">"</span>
                  {/* Quote Text: Light Silver/Gray (#E2E8F0) */}
                  <p className="text-base md:text-lg italic text-[#E2E8F0] leading-relaxed px-4">
                    {item.quote}
                  </p>
                  <span className="absolute -bottom-5 -right-3 text-6xl text-[#F1C27D] opacity-40 font-serif">"</span>
                </blockquote>
                {/* Divider: Lighter Slate Blue (#334155) */}
                <div className="mt-auto pt-5 border-t border-[#334155] w-full">
                  {/* Name: Crisp White (#F8FAFC) */}
                  <p className="font-semibold text-[#F8FAFC] text-lg">
                    {item.name}
                  </p>
                  {/* Location/Context: Light Silver/Gray with opacity */}
                  <p className="text-sm text-[#E2E8F0]/80">
                    {item.locationOrContext}
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}

          {/* Custom Navigation Arrows - Only show if more than 1 slide */}
          {testimonialData.length > 1 && (
            <>
              <div className="swiper-button-prev-custom absolute top-1/2 -translate-y-1/2 left-0 md:-left-5 z-10 cursor-pointer p-3 bg-[#1E293B]/80 hover:bg-[#E6A44E] text-[#E2E8F0] hover:text-[#0F172A] rounded-full shadow-lg transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
              </div>
              <div className="swiper-button-next-custom absolute top-1/2 -translate-y-1/2 right-0 md:-right-5 z-10 cursor-pointer p-3 bg-[#1E293B]/80 hover:bg-[#E6A44E] text-[#E2E8F0] hover:text-[#0F172A] rounded-full shadow-lg transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </>
          )}
        </Swiper>

        {/* Add custom CSS for Swiper pagination bullets */}
        <style jsx global>{`
          .testimonial-section .swiper-pagination-bullet.custom-bullet {
            width: 10px;
            height: 10px;
            background-color: #334155; /* Lighter Slate Blue */
            opacity: 0.7;
            border-radius: 50%;
            transition: all 0.3s ease;
            margin: 0 5px !important;
          }
          .testimonial-section .swiper-pagination-bullet-active.custom-bullet-active {
            background-color: #E6A44E; /* Warm Gold */
            opacity: 1;
            width: 12px;
            height: 12px;
          }
          .testimonial-section .swiper-button-next,
          .testimonial-section .swiper-button-prev {
             color: #E6A44E; /* Warm Gold */
          }
          .testimonial-section .swiper-button-next::after,
          .testimonial-section .swiper-button-prev::after {
             font-size: 24px !important;
          }
        `}</style>

        {/* Show message if no masters available */}
        {masters.length === 0 && (
          <div className="text-center mt-8">
            <p className="text-[#E2E8F0]/60 text-sm">
              Add master craftsmen through the admin panel to showcase them here instead of sample testimonials.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default VisualTestimonials;
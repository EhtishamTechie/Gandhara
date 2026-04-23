// src/components/FinalCTA.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // For optional secondary links
import { useInView } from 'react-intersection-observer';
import { FaWhatsapp } from 'react-icons/fa'; // Using react-icons for WhatsApp
// import { Mail } from 'lucide-react'; // Example if using Lucide for Newsletter icon

// --- Configuration ---
const whatsappNumber = "+923005567507"; // EXAMPLE: Replace with your number (e.g., 923001234567 for Pakistan)
const whatsappMessage = "Hello! I'm interested in learning more about Gandhara Arts & Taxila Stone Crafts.";

const FinalCTA = () => {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    console.log("Newsletter signup attempt:", email);
    alert(`Thank you for subscribing with ${email}! (This is a demo)`);
    setEmail('');
  };

  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  // Refs for InView animation
  const { ref: headingRef, inView: headingInView } = useInView({ triggerOnce: true, threshold: 0.2 });
  const { ref: newsletterRef, inView: newsletterInView } = useInView({ triggerOnce: true, threshold: 0.2, rootMargin: '0px 0px -50px 0px' });
  const { ref: whatsappRef, inView: whatsappInView } = useInView({ triggerOnce: true, threshold: 0.2, rootMargin: '0px 0px -50px 0px' });
  const { ref: secondaryLinksRef, inView: secondaryLinksInView } = useInView({ triggerOnce: true, threshold: 0.2 });


  return (
    // Section Background: Deep Navy Blue (#0F172A)
    <section className="bg-[#0F172A] text-[#F8FAFC] py-20 md:py-28 relative overflow-hidden">
      {/* Optional: Subtle background pattern or texture - adjust color if used */}
      {/* <div className="absolute inset-0 opacity-5 bg-[url('/path-to-subtle-pattern.svg')] bg-repeat filter invert brightness-50"></div> */}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Section Header */}
        <div
          ref={headingRef}
          className={`max-w-3xl mx-auto mb-12 md:mb-16 transition-all duration-700 ease-out ${
            headingInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {/* Heading Text: Warm Gold Gradient */}
          <h2 className="text-4xl md:text-5xl font-bold mb-5 tracking-tight bg-gradient-to-r from-[#E6A44E] via-[#F1C27D] to-[#E6A44E] bg-clip-text text-transparent">
            Let's Create & Explore Together
          </h2>
          {/* Sub-heading Text: Light Silver/Gray (#E2E8F0) */}
          <p className="text-lg md:text-xl text-[#E2E8F0] leading-relaxed">
            Become an insider. Receive exclusive offers, new arrival alerts, and travel insights, or connect with us directly for your bespoke inquiries.
          </p>
        </div>

        {/* Center the WhatsApp CTA */}
        <div className="flex justify-center max-w-5xl mx-auto">
          <div
            ref={whatsappRef}
            className={`bg-[#1E293B] p-8 md:p-10 rounded-xl shadow-2xl transition-all duration-700 ease-out delay-300 w-full max-w-lg ${
              whatsappInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            {/* Card Heading: Crisp White (#F8FAFC) */}
            <h3 className="text-2xl md:text-3xl font-semibold text-[#F8FAFC] mb-6">
              Have a Vision or Question?
            </h3>
            {/* Card Paragraph: Light Silver/Gray (#E2E8F0) */}
            <p className="text-[#E2E8F0] mb-8 text-base leading-relaxed">
                Our specialists are ready to discuss your bespoke projects or answer any queries you might have.
            </p>
            {/* WhatsApp Button: Warm Gold (#E6A44E) bg, Deep Navy (#0F172A) text. Hover: Lighter Gold (#F1C27D) */}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-x-3 w-full bg-[#E6A44E] hover:bg-[#F1C27D] text-[#0F172A] font-semibold px-8 py-3.5 rounded-lg transition-colors duration-300 ease-in-out text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              aria-label="Chat with us on WhatsApp"
            >
              <FaWhatsapp className="w-6 h-6" /> {/* Icon color will be #0F172A from text color */}
              Chat with Us on WhatsApp
            </a>
          </div>
        </div>

        {/* Optional: Secondary Links */}
        <div
          ref={secondaryLinksRef}
          className={`mt-16 md:mt-20 text-center transition-all duration-700 ease-out delay-500 ${
            secondaryLinksInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {/* Link Text: Light Silver/Gray (#E2E8F0). Hover: Lighter Gold (#F1C27D) */}
          <Link to="/products" className="text-[#E2E8F0] hover:text-[#F1C27D] mx-4 transition-colors text-sm">
            View Full Catalog
          </Link>
          {/* Separator: Light Silver/Gray (#E2E8F0) with opacity */}
          <span className="text-[#E2E8F0]/50">|</span>
          {/* Link Text: Light Silver/Gray (#E2E8F0). Hover: Lighter Gold (#F1C27D) */}
          <Link to="/contact" className="text-[#E2E8F0] hover:text-[#F1C27D] mx-4 transition-colors text-sm">
            Other Contact Methods
          </Link>
          {/* Separator: Light Silver/Gray (#E2E8F0) with opacity */}
          <span className="text-[#E2E8F0]/50">|</span>
          {/* Link Text: Light Silver/Gray (#E2E8F0). Hover: Lighter Gold (#F1C27D) */}
          {/* <Link to="/faq" className="text-[#E2E8F0] hover:text-[#F1C27D] mx-4 transition-colors text-sm">
            FAQ
          </Link> */}
        </div>

      </div>
    </section>
  );
};

export default FinalCTA;

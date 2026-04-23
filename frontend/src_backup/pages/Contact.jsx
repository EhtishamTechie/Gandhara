import React from 'react';
import { MapPinIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

// --- Decorative SVG Pattern Component ---
const DecorativePattern = ({ className }) => (
  <div className={`absolute pointer-events-none ${className}`}>
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" opacity="0.15">
      <path d="M60 0L74.2857 45.7143L120 60L74.2857 74.2857L60 120L45.7143 74.2857L0 60L45.7143 45.7143L60 0Z" fill="url(#paint0_linear)" />
      <defs>
        <linearGradient id="paint0_linear" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E6A44E" />
          <stop offset="1" stopColor="#F1C27D" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

// WhatsApp SVG Icon Component
const WhatsAppIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516z"/>
  </svg>
);

// --- Configuration ---
const contactEmail = "info@gandharataxila.com";
const contactPhone = "+92 300 556 7507";
const whatsappNumber = "923005567507"; // Without + symbol
const physicalAddressLine1 = "Heritage Gallery";
const physicalAddressLine2 = "Taxila, Punjab, Pakistan";
const whatsappMessage = "Hello! I would like to get in touch with you.";

const Contact = () => {
  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5, 
        ease: "easeOut" 
      } 
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  return (
    <div className="bg-[#0F172A] text-[#F8FAFC] min-h-screen relative">
      {/* Decorative patterns */}
      <DecorativePattern className="top-10 left-10 opacity-20 rotate-12" />
      <DecorativePattern className="bottom-20 right-10 opacity-10 -rotate-12" />
      
      {/* Page Header */}
      <section className="bg-[#1E293B] py-16 md:py-20 relative overflow-hidden">
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block mb-4"
          >
            <div className="w-20 h-1 bg-gradient-to-r from-[#E6A44E] to-[#F1C27D] rounded-full mx-auto"></div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#E6A44E] via-[#F1C27D] to-[#E6A44E] bg-clip-text text-transparent mb-4"
          >
            Get In Touch
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg text-[#E2E8F0] max-w-2xl mx-auto"
          >
            We'd love to hear from you. Whether you have questions about our collections, tours, or bespoke projects, please don't hesitate to reach out.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-6"
          >
            <div className="w-20 h-1 bg-gradient-to-r from-[#F1C27D] to-[#E6A44E] rounded-full mx-auto"></div>
          </motion.div>
        </div>
      </section>

      {/* Contact Options Section */}
      <section className="py-16 md:py-24 relative z-10">
        <div className="container mx-auto px-6">
          <motion.div 
            className="max-w-4xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.h2 
              variants={fadeInUp} 
              className="text-2xl md:text-3xl font-semibold text-center text-[#F8FAFC] mb-12"
            >
              Choose Your Preferred Way to Connect
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

              {/* WhatsApp Option */}
              <motion.div 
                variants={fadeInUp}
                className="bg-[#1E293B] p-8 rounded-xl shadow-xl border border-[#334155] hover:border-[#25D366] transition-all duration-300 group relative overflow-hidden"
              >
                {/* Decorative corner patterns */}
                <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-[#25D366]/40 rounded-tl-md group-hover:border-[#25D366]/80 transition-colors"></div>
                <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-[#25D366]/40 rounded-br-md group-hover:border-[#25D366]/80 transition-colors"></div>
                
                <div className="text-center relative z-10">
                  <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-[#25D366]/10 flex items-center justify-center group-hover:bg-[#25D366]/20 transition-colors">
                    <WhatsAppIcon className="h-8 w-8 text-[#25D366]" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-[#F8FAFC] mb-3">WhatsApp</h3>
                  <p className="text-[#E2E8F0] mb-6 text-sm">
                    Quick and easy messaging. Get instant responses to your questions.
                  </p>
                  
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <WhatsAppIcon className="h-5 w-5" />
                    <span>Chat on WhatsApp</span>
                  </a>
                  
                  <p className="text-[#94A3B8] text-xs mt-3">{contactPhone}</p>
                </div>
              </motion.div>

              {/* Phone Call Option */}
              <motion.div 
                variants={fadeInUp}
                className="bg-[#1E293B] p-8 rounded-xl shadow-xl border border-[#334155] hover:border-[#E6A44E] transition-all duration-300 group relative overflow-hidden"
              >
                {/* Decorative corner patterns */}
                <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-[#E6A44E]/40 rounded-tl-md group-hover:border-[#E6A44E]/80 transition-colors"></div>
                <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-[#E6A44E]/40 rounded-br-md group-hover:border-[#E6A44E]/80 transition-colors"></div>
                
                <div className="text-center relative z-10">
                  <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-[#E6A44E]/10 flex items-center justify-center group-hover:bg-[#E6A44E]/20 transition-colors">
                    <PhoneIcon className="h-8 w-8 text-[#E6A44E]" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-[#F8FAFC] mb-3">Phone Call</h3>
                  <p className="text-[#E2E8F0] mb-6 text-sm">
                    Speak directly with our team for detailed discussions and consultations.
                  </p>
                  
                  <a
                    href={`tel:${contactPhone.replace(/\s+/g, '')}`}
                    className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#E6A44E] to-[#F1C27D] hover:from-[#F1C27D] hover:to-[#E6A44E] text-[#0F172A] font-semibold px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <PhoneIcon className="h-5 w-5" />
                    <span>Call Now</span>
                  </a>
                  
                  <p className="text-[#94A3B8] text-xs mt-3">Mon - Sat, 9:00 AM - 6:00 PM (PKT)</p>
                </div>
              </motion.div>

              {/* Email Option */}
              <motion.div 
                variants={fadeInUp}
                className="bg-[#1E293B] p-8 rounded-xl shadow-xl border border-[#334155] hover:border-[#F1C27D] transition-all duration-300 group relative overflow-hidden md:col-span-2 lg:col-span-1"
              >
                {/* Decorative corner patterns */}
                <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-[#F1C27D]/40 rounded-tl-md group-hover:border-[#F1C27D]/80 transition-colors"></div>
                <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-[#F1C27D]/40 rounded-br-md group-hover:border-[#F1C27D]/80 transition-colors"></div>
                
                <div className="text-center relative z-10">
                  <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-[#F1C27D]/10 flex items-center justify-center group-hover:bg-[#F1C27D]/20 transition-colors">
                    <EnvelopeIcon className="h-8 w-8 text-[#F1C27D]" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-[#F8FAFC] mb-3">Email</h3>
                  <p className="text-[#E2E8F0] mb-6 text-sm">
                    Send us a detailed message. Perfect for formal inquiries and documentation.
                  </p>
                  
                  <a
                    href={`mailto:${contactEmail}`}
                    className="inline-flex items-center justify-center gap-2 w-full bg-transparent border-2 border-[#F1C27D] text-[#F1C27D] hover:bg-[#F1C27D] hover:text-[#0F172A] font-semibold px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <EnvelopeIcon className="h-5 w-5" />
                    <span>Send Email</span>
                  </a>
                  
                  <p className="text-[#94A3B8] text-xs mt-3">We typically respond within 24 hours</p>
                </div>
              </motion.div>

            </div>

            {/* Address Information */}
            <motion.div 
              variants={fadeInUp}
              className="mt-16 text-center"
            >
              <div className="bg-[#1E293B] p-8 rounded-xl shadow-xl border border-[#334155] max-w-md mx-auto relative overflow-hidden">
                {/* Decorative corner patterns */}
                <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-[#E6A44E]/40 rounded-tl-md"></div>
                <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-[#E6A44E]/40 rounded-tr-md"></div>
                <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-[#E6A44E]/40 rounded-bl-md"></div>
                <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-[#E6A44E]/40 rounded-br-md"></div>
                
                <div className="relative z-10">
                  <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-[#E6A44E]/10 flex items-center justify-center">
                    <MapPinIcon className="h-6 w-6 text-[#E6A44E]" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-[#F1C27D] mb-2">Visit Us</h3>
                  <address className="not-italic text-[#E2E8F0] text-sm leading-relaxed">
                    {physicalAddressLine1}<br />
                    {physicalAddressLine2}
                  </address>
                  <p className="text-[#94A3B8] text-xs mt-3">By appointment only</p>
                </div>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
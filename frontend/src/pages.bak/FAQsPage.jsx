// src/pages/FAQsPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
// Import MagnifyingGlassIcon instead of SearchIcon (which doesn't exist in heroicons v2)
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

// FAQ Categories and Questions
const faqData = {
  tours: [
    {
      id: 'tour-1',
      question: 'How long do your Taxila tours typically last?',
      answer: 'Our tours range from 3-4 hours for focused experiences like the "Monasteries & Hidden Ruins Walk" to full-day immersions like "The Grand Taxila Day Tour." Each tour listing includes the specific duration so you can plan accordingly. We also offer custom tour options if you have specific time constraints.'
    },
    {
      id: 'tour-2',
      question: 'What should I bring on a Taxila tour?',
      answer: 'We recommend comfortable walking shoes, sun protection (hat, sunscreen, sunglasses), a water bottle, and a camera. For full-day tours, consider bringing a light jacket as temperatures can vary throughout the day. Your tour guide will provide all necessary information about the sites, so there is no need to bring guidebooks.'
    },
    {
      id: 'tour-3',
      question: 'Are your tours suitable for children?',
      answer: 'Yes, many of our tours are family-friendly and can be enjoyed by children, particularly those interested in history and archaeology. For families with young children, we recommend our half-day tours which are more engaging for shorter attention spans. Our guides are experienced in making historical information accessible and interesting for all ages.'
    },
    {
      id: 'tour-4',
      question: 'Do you offer pick-up and drop-off services?',
      answer: 'Yes, we offer pick-up and drop-off services from major hotels in Islamabad and Rawalpindi for an additional fee. This service must be arranged at least 24 hours in advance of your tour. You can request this service when booking your tour through WhatsApp or our website.'
    },
    {
      id: 'tour-5',
      question: 'What languages are your tours conducted in?',
      answer: 'Our standard tours are conducted in English, but we can arrange for guides who speak Urdu, French, German, Chinese, and Arabic upon request. These specialized language tours should be booked at least 48 hours in advance to ensure availability of appropriate guides.'
    },
    {
      id: 'tour-6',
      question: 'Can tours be customized for specific interests?',
      answer: 'Absolutely! We specialize in creating custom experiences based on your specific interests, whether it is Buddhist art, Greek influence in the region, photography opportunities, or architectural history. Contact us with your interests, and we will design a tour that highlights the aspects of Taxila that most fascinate you.'
    }
  ],
  booking: [
    {
      id: 'booking-1',
      question: 'How can I book a tour?',
      answer: 'You can book tours directly through our website using the "Book Tour" button on any tour page, or via WhatsApp at +92 300 123 4567. We will confirm your booking within 24 hours and provide all necessary details about your tour.'
    },
    {
      id: 'booking-2',
      question: 'What is your cancellation policy?',
      answer: 'For cancellations made 7 or more days before the tour date, we offer a full refund. Cancellations 3-6 days before the tour receive a 50% refund. Unfortunately, we cannot offer refunds for cancellations less than 48 hours before the scheduled tour. In case of unexpected weather conditions or site closures, we offer alternative dates or full refunds.'
    },
    {
      id: 'booking-3',
      question: 'Do I need to pay in advance?',
      answer: 'Yes, we require a 30% deposit to secure your booking, with the remaining balance due 48 hours before the tour date. For last-minute bookings (less than 48 hours in advance), full payment is required at the time of booking.'
    },
    {
      id: 'booking-4',
      question: 'What payment methods do you accept?',
      answer: 'We accept bank transfers, major credit/debit cards, and cash (for in-person payments only). International visitors can pay securely through our website using credit cards or PayPal. All online payments are processed through secure payment gateways.'
    },
    {
      id: 'booking-5',
      question: 'Can I reschedule my tour?',
      answer: 'Yes, you can reschedule your tour at no additional cost if the request is made at least 72 hours in advance, subject to availability. Rescheduling requests with less than 72 hours notice may incur a 15% administrative fee.'
    }
  ],
  products: [
    {
      id: 'product-1',
      question: 'Do you ship Gandhara art replicas internationally?',
      answer: 'Yes, we ship our authentic Gandhara art replicas worldwide. Standard international shipping takes 10-15 business days, while express shipping is available for 5-7 business days delivery. Shipping costs are calculated at checkout based on weight and destination. All international shipments include tracking and insurance.'
    },
    {
      id: 'product-2',
      question: 'How are your replicas made?',
      answer: 'Our replicas are handcrafted by skilled local artisans using traditional techniques passed down through generations. Each piece is carefully created using locally sourced materials that closely match the original artifacts. Our craftspeople study the original pieces in detail to ensure historical accuracy in every replica.'
    },
    {
      id: 'product-3',
      question: 'What is your return policy for products?',
      answer: 'We offer a 30-day return window from the date of delivery. Products must be in original condition, unworn/unused with original packaging. Return shipping costs are the responsibility of the customer unless the return is due to our error or a defective product. Refunds will be processed within 7 business days after we receive the returned item.'
    },
    {
      id: 'product-4',
      question: 'Do you offer certificates of authenticity?',
      answer: 'Yes, all our museum-quality replicas come with a certificate of authenticity that details the historical context of the original piece, the materials used in the replica, and the craftsmanship techniques employed. This certificate is signed by our lead artisan and the director of our heritage program.'
    },
    {
      id: 'product-5',
      question: 'Can I commission a custom replica?',
      answer: 'Yes, we offer custom commission services for specific Gandharan artifacts. Our master artisans can create replicas based on your specifications or from historical references. Custom orders typically require 4-6 weeks for completion. Please contact us directly to discuss your custom commission requirements.'
    }
  ],
  general: [
    {
      id: 'general-1',
      question: 'What is the best time of year to visit Taxila?',
      answer: 'The best time to visit Taxila is during spring (March-May) and autumn (September-November) when the weather is pleasant for outdoor exploration. Summer months (June-August) can be quite hot, though early morning tours are still comfortable. Winter months (December-February) offer cooler temperatures but can be chilly in the mornings and evenings.'
    },
    {
      id: 'general-2',
      question: 'How far is Taxila from Islamabad?',
      answer: 'Taxila is located approximately 35 kilometers northwest of Islamabad, the capital city of Pakistan. The drive typically takes about 45-60 minutes, depending on traffic conditions. Our tours with transportation included will pick you up from your accommodation in Islamabad or Rawalpindi.'
    },
    {
      id: 'general-3',
      question: 'Is photography allowed at the archaeological sites?',
      answer: 'Yes, photography is allowed at all Taxila archaeological sites for personal use. There is no additional fee for cameras. Professional photography or filming for commercial purposes requires special permission from the Department of Archaeology and Museums, which we can help arrange with advance notice.'
    },
    {
      id: 'general-4',
      question: 'Are the archaeological sites wheelchair accessible?',
      answer: 'Partial accessibility is available at some sites, but many areas have uneven terrain and steps that may be challenging for wheelchair users. The Taxila Museum has wheelchair accessibility. Please contact us in advance about your specific mobility requirements, and we will design the most accessible experience possible for you.'
    },
    {
      id: 'general-5',
      question: 'What other attractions are near Taxila?',
      answer: 'Near Taxila, you can visit Khanpur Dam for scenic beauty, Mankiala Stupa, Rohtas Fort (a UNESCO World Heritage Site about 1.5 hours away), and the vibrant markets of Islamabad. We offer extended tours that combine Taxila with these nearby attractions for a more comprehensive experience of the region.'
    },
    {
      id: 'general-6',
      question: 'Do you offer educational programs for schools?',
      answer: 'Yes, we offer specialized educational programs for schools and universities. These programs are customized based on the curriculum and age group, featuring interactive learning experiences that bring history to life. We provide educational materials before the visit and follow-up resources for classroom use. Contact us for special group rates for educational institutions.'
    }
  ]
};

const FAQsPage = () => {
  const [activeCategory, setActiveCategory] = useState('tours');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState([]);
  
  const toggleQuestion = (id) => {
    setExpandedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };
  
  // Filter FAQs based on search query
  const filteredFAQs = searchQuery 
    ? Object.values(faqData).flat().filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqData[activeCategory];

  return (
    <div className="bg-white min-h-screen">
      {/* Header Banner */}
      <div className="bg-[#0F172A] py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-repeat" style={{ 
            backgroundImage: "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" 
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">Frequently Asked Questions</h1>
            <div className="w-24 h-1 bg-[#E6A44E] rounded-full mb-6"></div>
            <p className="text-[#E2E8F0] text-lg max-w-2xl text-center">
              Find answers to common questions about Taxila tours, bookings, products, and general information
            </p>
          </div>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="bg-gray-100 border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center text-sm text-gray-600">
            <Link to="/" className="hover:text-[#E6A44E] transition-colors">Home</Link>
            <span className="mx-2">•</span>
            <span className="text-gray-800 font-medium">FAQs</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <Link to="/" className="inline-flex items-center text-[#1E293B] hover:text-[#E6A44E] mb-8 transition-colors">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            <span>Back to Home</span>
          </Link>
          
          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-3 pl-5 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E6A44E] focus:border-transparent"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <MagnifyingGlassIcon className="w-5 h-5" />
              </div>
            </div>
          </div>
          
          {/* Category Tabs - Hidden when searching */}
          {!searchQuery && (
            <div className="mb-8 overflow-x-auto">
              <div className="flex space-x-2 border-b border-gray-200">
                {Object.keys(faqData).map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                      activeCategory === category
                        ? 'text-[#E6A44E] border-b-2 border-[#E6A44E]'
                        : 'text-gray-600 hover:text-[#E6A44E]'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* FAQ Accordion */}
          <div className="space-y-4">
            {searchQuery && filteredFAQs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 text-lg">
                  No questions found matching "{searchQuery}". Try a different search term or browse our categories.
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 text-[#E6A44E] hover:text-[#F1C27D] font-medium"
                >
                  Clear search
                </button>
              </div>
            ) : (
              filteredFAQs.map((faq) => (
                <div 
                  key={faq.id} 
                  className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => toggleQuestion(faq.id)}
                    className="w-full flex justify-between items-center p-5 text-left bg-white hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-[#1E293B]">{faq.question}</span>
                    {expandedIds.includes(faq.id) ? (
                      <ChevronUpIcon className="w-5 h-5 text-[#E6A44E]" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5 text-[#E6A44E]" />
                    )}
                  </button>
                  
                  {expandedIds.includes(faq.id) && (
                    <div className="p-5 bg-gray-50 border-t border-gray-200">
                      <p className="text-gray-700">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          
          {/* Contact Section */}
          <div className="mt-12 bg-[#1E293B] rounded-xl shadow-lg p-6 md:p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Can't find what you're looking for?</h2>
            <p className="text-gray-300 mb-6">
              If you have a question that's not answered here, please feel free to contact us directly.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
  <h3 className="text-lg font-semibold text-[#E6A44E] mb-2">Contact Us</h3>
  {/* <p className="text-gray-300">Email: info@gandharataxila.com</p> */}
  <p className="text-gray-300">
    Phone: 
    <a 
      href="tel:+923005567507" 
      className="text-[#F1C27D] hover:text-[#E6A44E] transition-colors ml-1"
    >
      +92 300 556 7507
    </a>
  </p>
  <p className="text-gray-300">
    WhatsApp: 
    <a 
      href="https://wa.me/923005567507" 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-[#F1C27D] hover:text-[#E6A44E] transition-colors ml-1"
    >
      +92 300 556 7507
    </a>
  </p>
</div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-700">
              <Link 
                to="/contact" 
                className="inline-flex items-center justify-center gap-x-2 bg-[#E6A44E] hover:bg-[#F1C27D] text-[#0F172A] font-semibold px-6 py-3 rounded-lg transition-colors duration-300"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQsPage;

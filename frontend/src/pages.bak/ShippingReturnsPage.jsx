// src/pages/ShippingReturnsPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const ShippingReturnsPage = () => {
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
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">Shipping & Returns Policy</h1>
            <div className="w-24 h-1 bg-[#E6A44E] rounded-full mb-6"></div>
            <p className="text-[#E2E8F0] text-lg max-w-2xl text-center">
              Our policies for shipping artifacts, tour bookings, and customer satisfaction guarantees
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
            <span className="text-gray-800 font-medium">Shipping & Returns</span>
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
          
          {/* Tour Booking Section */}
          <section className="mb-12 bg-white rounded-xl shadow-md p-6 md:p-8">
            <h2 className="text-2xl font-bold text-[#1E293B] mb-6">Tour Booking Information</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-[#1E293B] mb-3">Booking Confirmation</h3>
                <p className="text-gray-700 mb-3">
                  Once you book a tour through WhatsApp or our website, you will receive a booking confirmation within 24 hours. This confirmation will include:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Tour details, including date, time, and meeting location</li>
                  <li>Tour guide information</li>
                  <li>Payment confirmation and receipt</li>
                  <li>What to bring and wear</li>
                  <li>Cancellation policy details</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-[#1E293B] mb-3">Payment Policy</h3>
                <p className="text-gray-700 mb-3">
                  We require a 30% deposit to secure your booking, with the remaining balance due 48 hours before the tour date. Payment options include:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>Bank transfer</li>
                  <li>Credit/debit card (through our secure payment link)</li>
                  <li>Cash on the day of the tour (only for the remaining balance)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-[#1E293B] mb-3">Cancellation & Refunds</h3>
                <p className="text-gray-700 mb-3">
                  Our cancellation policy for tours is as follows:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Cancellation 7+ days before tour date: Full refund of deposit</li>
                  <li>Cancellation 3-6 days before tour date: 50% refund of deposit</li>
                  <li>Cancellation less than 48 hours before tour date: No refund</li>
                  <li>In case of unexpected weather conditions or site closures, we will offer an alternative date or a full refund</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-[#1E293B] mb-3">Rescheduling</h3>
                <p className="text-gray-700">
                  Rescheduling requests made at least 72 hours in advance can be accommodated at no additional cost, subject to availability. Rescheduling requests with less than 72 hours' notice may incur a 15% administrative fee.
                </p>
              </div>
            </div>
          </section>
          
          {/* Product Shipping Section */}
          <section className="mb-12 bg-white rounded-xl shadow-md p-6 md:p-8">
            <h2 className="text-2xl font-bold text-[#1E293B] mb-6">Artifact & Product Shipping</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-[#1E293B] mb-3">Domestic Shipping (Pakistan)</h3>
                <p className="text-gray-700 mb-3">
                  For artifact replicas and merchandise shipped within Pakistan:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Standard shipping: 3-5 business days (PKR 300)</li>
                  <li>Express shipping: 1-2 business days (PKR 600)</li>
                  <li>Free standard shipping on orders over PKR 5,000</li>
                  <li>All domestic shipments are fully insured and tracked</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-[#1E293B] mb-3">International Shipping</h3>
                <p className="text-gray-700 mb-3">
                  We ship our authentic Gandhara art replicas and merchandise worldwide:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Standard international shipping: 10-15 business days</li>
                  <li>Express international shipping: 5-7 business days</li>
                  <li>Shipping costs are calculated at checkout based on weight and destination</li>
                  <li>Import duties and taxes are the responsibility of the recipient</li>
                  <li>All international shipments include tracking and insurance</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-[#1E293B] mb-3">Product Returns</h3>
                <p className="text-gray-700 mb-3">
                  We stand behind the quality of our products and offer a straightforward return policy:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>30-day return window from the date of delivery</li>
                  <li>Products must be in original condition, unworn/unused with original packaging</li>
                  <li>Return shipping costs are the responsibility of the customer unless the return is due to our error or a defective product</li>
                  <li>Refunds will be processed within 7 business days after we receive the returned item</li>
                  <li>Custom-made or personalized items cannot be returned unless defective</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-[#1E293B] mb-3">Damaged or Incorrect Items</h3>
                <p className="text-gray-700">
                  If you receive a damaged or incorrect item, please contact us within 48 hours of receipt with photos of the damage or incorrect item. We will arrange for a replacement or full refund, including return shipping costs.
                </p>
              </div>
            </div>
          </section>
          
          {/* Contact Information */}
          <section className="bg-[#1E293B] rounded-xl shadow-lg p-6 md:p-8 text-white">
            <h2 className="text-2xl font-bold mb-6">Need Assistance?</h2>
            
            <p className="mb-6">
              If you have any questions about our shipping, returns, or tour booking policies, please don't hesitate to contact our customer service team.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-[#E6A44E] mb-2">Customer Service Hours</h3>
                <p className="text-gray-300">Monday to Saturday: 9 AM - 6 PM (PKT)</p>
                <p className="text-gray-300">Sunday: Closed</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-[#E6A44E] mb-2">Contact Information</h3>
                <p className="text-gray-300">Email: support@gandharataxila.com</p>
                <p className="text-gray-300">Phone: +92 300 123 4567</p>
                <p className="text-gray-300">WhatsApp: +92 300 123 4567</p>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-700">
              <p className="text-gray-300">
                Please note that our policies are subject to change. Any changes will be updated on this page with the effective date clearly indicated.
              </p>
              <p className="text-gray-300 mt-2">
                Last updated: May 2025
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ShippingReturnsPage;

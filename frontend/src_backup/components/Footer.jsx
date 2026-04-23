// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaWhatsapp, FaPinterestP, FaYoutube } from 'react-icons/fa';

// --- Configuration ---
const socialLinks = [
  { name: 'Facebook', href: 'https://facebook.com/yourgandharaarts', icon: FaFacebookF },
  { name: 'Instagram', href: 'https://instagram.com/yourgandharaarts', icon: FaInstagram },
  { name: 'Pinterest', href: 'https://pinterest.com/yourgandharaarts', icon: FaPinterestP },
  { name: 'YouTube', href: 'https://youtube.com/yourgandharaarts', icon: FaYoutube },
  { name: 'WhatsApp', href: 'https://wa.me/923005567507', icon: FaWhatsapp },
];

const Footer = () => {
  const linkCategories = [
    {
      title: 'Explore',
      links: [
        { name: 'Home', path: '/' },
        { name: 'All Products', path: '/products' },
        { name: 'Visit Taxila', path: '/visit-taxila' },
        // Add more key exploration links if any
      ],
    },
    {
      title: 'Our Company',
      links: [
        { name: 'About Us', path: '/about' },
        { name: 'Contact Us', path: '/contact' },
      ],
    },
    {
      title: 'Customer Service',
      links: [
        { name: 'FAQs', path: '/FAQsPage' },
        { name: 'Shipping & Returns', path: '/ShippingReturnsPage' },
        { name: 'Privacy Policy', path: '/PrivacyPolicyPage' },
        // { name: 'Cookie Policy', path: '/cookie-policy' }, // Can be here or linked from Privacy
      ],
    },
  ];

  return (
    <footer className="bg-stone-900 text-stone-400 border-t-4 border-brand-gold">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-12 md:py-16">
          
          {/* Column 1: Brand Info & Brief */}
          <div className="md:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <img src="GandharaImages/Gandharalogo.png" alt="Gandhara Arts Logo" className="h-22 w-auto" />
            </Link>
            <p className="text-sm text-stone-500 mb-6 leading-relaxed">
              Discover timeless stone craftsmanship from the heart of Gandhara. We bridge ancient heritage with modern artistry, offering unique pieces and unforgettable Taxila tours.
            </p>
            {/* Optional: Payment icons or certifications */}
          </div>

          {/* Columns 2, 3: Link Categories */}
          {linkCategories.map((category) => (
            <div key={category.title}>
              <h5 className="text-sm font-semibold text-stone-200 tracking-wider uppercase mb-4">
                {category.title}
              </h5>
              <ul className="space-y-3">
                {category.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-sm hover:text-brand-gold transition-colors duration-200 ease-in-out"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Column 4: Stay Connected / Newsletter (if you add one) */}
          {/* 
            This column is currently empty because we moved social links to the bottom bar.
            If you add a newsletter, this is a good spot.
            Otherwise, you might adjust the lg:grid-cols-4 to lg:grid-cols-3 if you only have 3 primary content blocks.
            For now, I'll leave it as 4 columns for potential future use or you can remove it and adjust.
            Alternatively, the 3rd link category could span 2 columns if it's very long, or this column could be for specific contact details.
          */}
          {/* Example Newsletter Placeholder:
          <div>
            <h5 className="text-sm font-semibold text-stone-200 tracking-wider uppercase mb-4">
              Stay Updated
            </h5>
            <p className="text-sm text-stone-500 mb-3">
              Get exclusive offers and updates on new arrivals.
            </p>
            <form action="#" method="POST" className="flex">
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                type="email"
                name="email-address"
                id="email-address"
                autoComplete="email"
                required
                className="w-full px-3 py-2.5 border border-stone-600 rounded-l-md bg-stone-800 text-stone-300 placeholder-stone-500 focus:outline-none focus:ring-brand-gold focus:border-brand-gold sm:text-sm"
                placeholder="Enter your email"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-brand-gold text-stone-900 rounded-r-md hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-900 focus:ring-brand-gold font-medium text-sm"
              >
                Subscribe
              </button>
            </form>
          </div>
          */}

        </div>

        {/* Bottom Bar: Social Links & Copyright */}
        <div className="border-t border-stone-700 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Social Links */}
            <div className="flex space-x-5 mb-4 md:mb-0 md:order-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="text-stone-400 hover:text-brand-gold transition-colors duration-200 ease-in-out transform hover:scale-110"
                >
                  <social.icon className="h-5 w-5" /> {/* Slightly smaller icons for bottom bar */}
                </a>
              ))}
            </div>

            {/* Copyright */}
            <div className="text-xs text-stone-500 text-center md:text-left md:order-1">
              <p>
                © {new Date().getFullYear()-10} Gandhara Arts & Taxila Stone Crafts. All Rights Reserved.
              </p>
              <p className="mt-1">
                Designed with Passion in Pakistan. Handcrafted for the World.
              </p>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
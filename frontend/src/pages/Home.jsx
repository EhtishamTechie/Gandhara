// src/pages/Home.jsx
import React, { lazy, Suspense } from 'react';
import SEOHead from '../components/SEOHead';

// --- Eager load: above-the-fold only ---
import HeroSection from '../components/HeroSection';
import MobileTourHighlights from '../components/MobileTourHighlights';

// --- Lazy load: below-the-fold sections for faster initial load ---
const ProductVideoShowcase = lazy(() => import('../components/ProductVideoShowcase'));
const RelatedProducts = lazy(() => import('../components/RelatedProducts'));
const TaxilaPromoBanner = lazy(() => import('../components/TaxilaPromoBanner'));
const AnimatedProductShowcase = lazy(() => import('../components/AnimatedProductShowcase'));
const TaxilaToursShowcase = lazy(() => import('../components/TaxilaToursShowcase'));
const WhyTaxilaExperience = lazy(() => import('../components/WhyTaxilaExperience'));
const VisualTestimonials = lazy(() => import('../components/VisualTestimonials'));
const FinalCTA = lazy(() => import('../components/FinalCTA'));

// Minimal loading placeholder for lazy sections
const SectionFallback = () => (
  <div className="flex items-center justify-center py-20">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#F1C27D]"></div>
  </div>
);

// Wrapper that uses content-visibility: auto for off-screen sections
// This tells the browser to skip rendering until the section is near the viewport
const LazySection = ({ children, minHeight = '400px' }) => (
  <div style={{ contentVisibility: 'auto', containIntrinsicSize: `0 ${minHeight}` }}>
    {children}
  </div>
);

const Home = () => {
  // Organization Schema for home page
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Gandhara Arts",
    "url": "https://gandhara-arts-and-taxila-stone-crafts.com",
    "logo": "https://gandhara-arts-and-taxila-stone-crafts.com/GandharaImages/Gandharalogo.webp",
    "description": "Authentic Pakistani stone crafts, Gandhara sculptures, and Buddha statues from Taxila heritage region. Handcrafted by master artisans using ancient techniques.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Taxila",
      "addressRegion": "Punjab",
      "postalCode": "47050",
      "addressCountry": "PK"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "33.7489",
      "longitude": "72.8311"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+92-51-9314881",
      "contactType": "Customer Service",
      "availableLanguage": ["English", "Urdu"]
    },
    "sameAs": [
      "https://www.facebook.com/gandharaarts",
      "https://www.instagram.com/gandharaarts"
    ],
    "founder": {
      "@type": "Person",
      "name": "Master Artisans of Taxila"
    },
    "foundingDate": "2010",
    "areaServed": {
      "@type": "Country",
      "name": "Worldwide"
    },
    "knowsAbout": ["Gandhara Art", "Buddhist Sculptures", "Stone Carving", "Pakistani Handicrafts", "Taxila Heritage"]
  };

  return (
    <>
      {/* SEO Head for Home Page */}
      <SEOHead
        title="Authentic Pakistani Stone Crafts & Gandhara Art"
        description="Discover handcrafted Pakistani stone art from Taxila heritage region. Gandhara Buddhist sculptures, home decor, fountains, and cultural artifacts. Worldwide shipping available."
        keywords={[
          'pakistani stone crafts',
          'gandhara art',
          'taxila stone work',
          'handmade sculptures',
          'buddhist art',
          'stone fountains',
          'home decor pakistan',
          'cultural artifacts',
          'heritage crafts'
        ]}
        image={`${window.location.origin}/GandharaImages/Gandharalogo.webp`}
        url={window.location.href}
        type="website"
      />

      {/* Organization Schema */}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>

      {/* ... Sections 1-11 ... */}
      <HeroSection />
      <MobileTourHighlights />
      <LazySection minHeight="600px">
        <Suspense fallback={<SectionFallback />}>
          <ProductVideoShowcase/>
        </Suspense>
      </LazySection>
      <LazySection minHeight="500px">
        <Suspense fallback={<SectionFallback />}>
          <RelatedProducts/>
        </Suspense>
      </LazySection>
      <LazySection minHeight="400px">
        <Suspense fallback={<SectionFallback />}>
          <TaxilaPromoBanner/>
        </Suspense>
      </LazySection>
      <LazySection minHeight="600px">
        <Suspense fallback={<SectionFallback />}>
          <AnimatedProductShowcase/>
        </Suspense>
      </LazySection>
      <LazySection minHeight="100vh">
        <Suspense fallback={<SectionFallback />}>
          <TaxilaToursShowcase />
        </Suspense>
      </LazySection>
      <LazySection minHeight="500px">
        <Suspense fallback={<SectionFallback />}>
          <WhyTaxilaExperience />
        </Suspense>
      </LazySection>
      <LazySection minHeight="400px">
        <Suspense fallback={<SectionFallback />}>
          <VisualTestimonials />
        </Suspense>
      </LazySection>
      <LazySection minHeight="300px">
        <Suspense fallback={<SectionFallback />}>
          <FinalCTA />
        </Suspense>
      </LazySection>

    </>
  );
};

export default Home;

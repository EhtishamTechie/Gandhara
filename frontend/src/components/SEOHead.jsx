import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEOHead = ({ 
  title, 
  description, 
  keywords = [], 
  image, 
  canonicalUrl, 
  ogType = 'website',
  structuredData 
}) => {
  const siteTitle = 'Gandhara Arts';
  const defaultDescription = 'Authentic Pakistani stone sculptures, Buddha statues and heritage crafts from Taxila. Handcrafted by skilled artisans using traditional Gandhara techniques.';
  const baseUrl = 'https://gandhara-arts-and-taxila-stone-crafts.com';
  
  const fullTitle = title ? `${title}` : siteTitle;
  const url = canonicalUrl || baseUrl;
  const defaultImage = `${baseUrl}/images/gandhara-arts-logo.jpg`;
  
  // Ensure keywords is always an array
  const keywordsArray = Array.isArray(keywords) 
    ? keywords 
    : typeof keywords === 'string' 
      ? keywords.split(',').map(k => k.trim()).filter(k => k)
      : [];
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content={keywordsArray.join(', ')} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={image || defaultImage} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={siteTitle} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={image || defaultImage} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Additional SEO Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Gandhara Arts" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;

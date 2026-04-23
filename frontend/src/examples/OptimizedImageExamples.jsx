// Example: Update your existing product components to use optimized images

import React from 'react';
import OptimizedImage, { ProductImage, ImageGallery } from '../components/OptimizedImage';

// Example 1: Update RelatedProducts component
const RelatedProducts = ({ products }) => {
  return (
    <div className="related-products">
      <h3>Related Products</h3>
      <div className="products-grid">
        {products.map((product, index) => (
          <div key={product._id} className="product-card">
            {/* Instead of regular <img>, use OptimizedImage */}
            <ProductImage
              product={product}
              size="medium"
              className="product-image"
              lazy={index > 2} // Lazy load after first 3
              preload={index < 3} // Preload first 3
            />
            <h4>{product.title}</h4>
            <p>${product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Example 2: Update product gallery
const ProductGallery = ({ product }) => {
  const images = product.images?.map((img, index) => ({
    id: index,
    src: img.url || img,
    alt: `${product.title} - Image ${index + 1}`
  })) || [];

  return (
    <div className="product-gallery">
      <ImageGallery 
        images={images}
        itemClassName="gallery-image"
      />
    </div>
  );
};

// Example 3: Hero section with optimized background
const HeroSection = ({ backgroundImage }) => {
  return (
    <section className="hero">
      <OptimizedImage
        src={backgroundImage}
        alt="Hero background"
        size="large"
        className="hero-bg"
        preload={true} // Preload hero images
      />
      <div className="hero-content">
        <h1>Welcome to Gandhara Arts</h1>
        <p>Discover authentic stone crafts</p>
      </div>
    </section>
  );
};

// Example 4: Master/Artisan profiles
const MasterProfile = ({ master }) => {
  return (
    <div className="master-profile">
      <OptimizedImage
        src={master.image}
        alt={master.name}
        size="medium"
        className="master-avatar"
      />
      <h3>{master.name}</h3>
      <p>{master.specialty}</p>
    </div>
  );
};

// Example 5: Category page with lots of products
const CategoryPage = ({ products }) => {
  return (
    <div className="category-page">
      <div className="products-grid">
        {products.map((product, index) => (
          <div key={product._id} className="product-card">
            <OptimizedImage
              src={product.images?.[0]?.url || product.images?.[0]}
              alt={product.title}
              size="medium"
              className="product-image"
              // Lazy load everything except first row (assume 4 per row)
              lazy={index >= 4}
              // Progressive loading with placeholder
              placeholder={
                <div className="product-placeholder">
                  <div className="shimmer"></div>
                </div>
              }
              onLoad={() => console.log(`Loaded: ${product.title}`)}
            />
            <div className="product-info">
              <h3>{product.title}</h3>
              <p className="price">${product.price}</p>
              <p className="category">{product.category}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export {
  RelatedProducts,
  ProductGallery,
  HeroSection,
  MasterProfile,
  CategoryPage
};

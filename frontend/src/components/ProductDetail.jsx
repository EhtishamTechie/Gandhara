import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import '../styles/animations.css';
import './ProductDetailStrip.css';
import OptimizedImage from './OptimizedImage';
import {
  ShoppingBag,
  ArrowLeft,
  Star,
  Heart,
  Share2,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  Package,
  Shield,
  Truck,
  Phone,
  MessageCircle
} from "lucide-react";
import SEOHead from './SEOHead';
import { getImageUrl } from '../utils/imageHelper';
import { buildProductWhatsAppUrl } from '../utils/whatsappHelper';


// Shared image path helper for product pages
const getImagePath = (imageName) => {
  if (typeof imageName === 'string' && imageName.trim() !== '') {
    if (imageName.startsWith('http://') || imageName.startsWith('https://')) {
      return imageName;
    }
    const path = imageName.startsWith('/') ? imageName.substring(1) : imageName;
    return getImageUrl(path);
  }
  return '/GandharaImages/Gandharalogo.webp';
};

// Enhanced WhatsApp Button Component
const WhatsAppButton = ({ phoneNumber, productName, productId, productUrl, product, className, children }) => {
  const digits = (phoneNumber || '+923005567507').replace(/\s+/g, '').replace('+', '');
  const whatsappLink = product
    ? buildProductWhatsAppUrl(product, digits)
    : (() => {
      const message = `Hello, I'm interested in your product: ${productName}\n\nProduct Link: ${productUrl || window.location.href}`;
      return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
    })();

  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className={`${className} hover-scale`}
      aria-label={`Order ${productName} on WhatsApp`}
    >
      {children}
    </a>
  );
};

// Image Gallery Component with Magnifier
const ImageGallery = ({ images, productTitle }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [lensStyle, setLensStyle] = useState({});
  const containerRef = useRef(null);

  const LENS_SIZE = 200; // px diameter
  const ZOOM = 3;        // zoom factor

  const imageArray = Array.isArray(images) ? images : [images];
  const processedImages = imageArray.map(img => getImagePath(img));

  // Use 800w AVIF for magnifier to avoid loading raw PNG
  const getAvifPath = (src) => {
    if (!src) return src;
    return src.replace(/\.(jpg|jpeg|png|webp)$/i, '') + '-800w.avif';
  };

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % processedImages.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + processedImages.length) % processedImages.length);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - left, width));
    const y = Math.max(0, Math.min(e.clientY - top, height));

    setLensStyle({
      left: `${x - LENS_SIZE / 2}px`,
      top: `${y - LENS_SIZE / 2}px`,
      backgroundImage: `url(${getAvifPath(processedImages[currentImage])})`,
      // Scale image to ZOOM × container size inside the lens
      backgroundSize: `${width * ZOOM}px ${height * ZOOM}px`,
      // Offset so the zoomed region is centered on the cursor
      backgroundPosition: `${-(x * ZOOM - LENS_SIZE / 2)}px ${-(y * ZOOM - LENS_SIZE / 2)}px`,
      backgroundRepeat: 'no-repeat',
    });
  };

  return (
    <div className="space-y-4">
      {/* Main Image with Magnifier */}
      <div
        ref={containerRef}
        className="relative aspect-square bg-[#1E293B] rounded-xl overflow-hidden group"
        onMouseEnter={() => setShowMagnifier(true)}
        onMouseLeave={() => setShowMagnifier(false)}
        onMouseMove={handleMouseMove}
        style={{ cursor: showMagnifier ? 'crosshair' : 'default' }}
      >
        <div key={currentImage} className="w-full h-full relative animate-fadeIn">
          <OptimizedImage
            src={processedImages[currentImage]}
            alt={`${productTitle} - Image ${currentImage + 1}`}
            width={1200}
            height={1200}
            lazy={false}
            priority={true}
            sizes="(max-width: 640px) 400px, 800px"
            className="w-full h-full select-none"
            objectFit="cover"
            draggable={false}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/GandharaImages/Gandharalogo.webp';
            }}
          />
        </div>

        {/* Magnifier Lens */}
        {showMagnifier && (
          <div
            className="absolute pointer-events-none border-2 border-white/80 rounded-full shadow-2xl overflow-hidden"
            style={{
              width: `${LENS_SIZE}px`,
              height: `${LENS_SIZE}px`,
              zIndex: 20,
              ...lensStyle,
            }}
          />
        )}

        {/* Navigation buttons */}
        {processedImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-[#0F172A]/70 hover:bg-[#0F172A]/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#0F172A]/70 hover:bg-[#0F172A]/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Image indicator */}
        {processedImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1 z-10">
            {processedImages.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentImage ? 'bg-[#F1C27D]' : 'bg-white/50'
                  }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {processedImages.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {processedImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${index === currentImage
                ? 'border-[#F1C27D] ring-2 ring-[#F1C27D]/30'
                : 'border-[#334155] hover:border-[#F1C27D]/50'
                }`}
            >
              <OptimizedImage
                src={image}
                alt={`${productTitle} - Thumbnail ${index + 1}`}
                width={100}
                height={100}
                className="w-full h-full"
                objectFit="cover"
                lazy={index > 4}
                onError={(e) => { e.target.onerror = null; e.target.src = '/GandharaImages/Gandharalogo.webp'; }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};


const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="flex items-start space-x-3 p-4 bg-[#1E293B] rounded-lg">
    <div className="flex-shrink-0 p-2 bg-[#F1C27D]/10 rounded-lg">
      <Icon size={20} className="text-[#F1C27D]" />
    </div>
    <div>
      <h4 className="font-semibold text-[#F8FAFC] text-sm">{title}</h4>
      <p className="text-[#E2E8F0] text-xs mt-1">{description}</p>
    </div>
  </div>
);

// Main Product Detail Component
const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);

  // Category siblings for prev/next navigation
  const [categoryProducts, setCategoryProducts] = useState([]);
  const mainSectionRef = useRef(null);
  const touchStartX = useRef(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await axios.get(`${API_BASE_URL}/api/products/${productId}`);
        setProduct(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Product not found');
      } finally {
        setLoading(false);
      }
    };
    if (productId) fetchProduct();
  }, [productId]);

  // Fetch a lightweight category list for prev/next navigation.
  // Only IDs + slugs are needed — full product data and images are
  // fetched fresh when the user actually navigates to a product.
  // A limit of 50 covers most categories in one fast, small request.
  useEffect(() => {
    if (!product) return;
    const cats = product.categories || (product.category ? [product.category] : []);
    if (!cats.length) return;
    const slug = cats[0];
    const fetchNavList = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await axios.get(
          `${API_BASE}/api/products/category/${encodeURIComponent(slug)}?limit=50`
        );
        const list = Array.isArray(res.data) ? res.data : (res.data.products || []);
        setCategoryProducts(list);
      } catch { /* silent — arrows simply won't appear */ }
    };
    fetchNavList();
  }, [product]);

  // Derived prev/next from categoryProducts
  const currentCatIndex = categoryProducts.findIndex(p => p._id === product?._id);
  const prevProduct = currentCatIndex > 0 ? categoryProducts[currentCatIndex - 1] : null;
  const nextProduct = currentCatIndex >= 0 && currentCatIndex < categoryProducts.length - 1
    ? categoryProducts[currentCatIndex + 1]
    : null;

  // Navigate using replace:true so Back button returns to the listing, not a previous product
  const goToPrev = () => prevProduct && navigate(`/product/${prevProduct.slug || prevProduct._id}`, { replace: true });
  const goToNext = () => nextProduct && navigate(`/product/${nextProduct.slug || nextProduct._id}`, { replace: true });

  // Touch swipe handlers (mobile)
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 60) {
      if (delta > 0) goToNext();
      else goToPrev();
    }
    touchStartX.current = null;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: product.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="bg-[#0F172A] min-h-screen">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Image skeleton */}
            <div className="space-y-4">
              <div className="aspect-square bg-[#1E293B] rounded-xl animate-pulse"></div>
              <div className="flex space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-16 h-16 bg-[#1E293B] rounded-lg animate-pulse"></div>
                ))}
              </div>
            </div>
            {/* Content skeleton */}
            <div className="space-y-6">
              <div className="h-8 bg-[#1E293B] rounded animate-pulse"></div>
              <div className="h-4 bg-[#1E293B] rounded w-3/4 animate-pulse"></div>
              <div className="h-10 bg-[#1E293B] rounded w-1/2 animate-pulse"></div>
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-4 bg-[#1E293B] rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#0F172A] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#F1C27D] mb-4">Product Not Found</h1>
          <p className="text-[#E2E8F0] mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gradient-to-r from-[#E6A44E] to-[#F1C27D] text-[#0F172A] font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Generate Product Schema.org structured data
  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.title,
    "image": getImagePath(product.image),
    "description": product.seoDescription || product.description,
    "sku": product._id,
    "brand": {
      "@type": "Brand",
      "name": "Gandhara Arts"
    },
    "offers": {
      "@type": "Offer",
      "url": `${window.location.origin}/product/${product.slug || product._id}`,
      "priceCurrency": "USD",
      "price": product.price || "0",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Gandhara Arts",
        "url": "https://gandhara-arts-and-taxila-stone-crafts.com"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "127",
      "bestRating": "5",
      "worstRating": "1"
    },
    "category": product.categories?.[0] || "Stone Craft"
  };



  return (
    <>
      {/* SEO Head Component */}
      <SEOHead
        title={product.seoTitle || product.title}
        description={product.seoDescription || product.description}
        keywords={product.metaKeywords || product.keywords || []}
        image={getImagePath(product.image)}
        url={`${window.location.origin}/product/${product.slug || product._id}`}
        type="product"
        product={product}
      />

      {/* Schema.org Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(productSchema)}
      </script>

      <div className="bg-[#0F172A] min-h-screen">
        <div className="container mx-auto max-w-7xl px-4 py-8">

          {/* ── Category nav arrows ── */}
          <div
            ref={mainSectionRef}
            className="pd-nav-wrap"
          >
            {/* Desktop-only floating arrows (hidden on mobile via CSS) */}
            <button
              onClick={goToPrev}
              disabled={!prevProduct}
              aria-label="Previous product"
              className={`pd-nav-arrow pd-nav-arrow--left pd-nav-arrow--desktop ${prevProduct ? 'pd-nav-arrow--active' : 'pd-nav-arrow--hidden'
                }`}
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={goToNext}
              disabled={!nextProduct}
              aria-label="Next product"
              className={`pd-nav-arrow pd-nav-arrow--right pd-nav-arrow--desktop ${nextProduct ? 'pd-nav-arrow--active' : 'pd-nav-arrow--hidden'
                }`}
            >
              <ChevronRight size={22} />
            </button>

            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Left col: image + mobile arrow bar (bar hidden on desktop) */}
              <div className="lg:sticky lg:top-8 lg:self-start">
                <div
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                >
                  <ImageGallery
                    images={product.image || product.images}
                    productTitle={product.seoTitle || product.title}
                  />
                </div>

                {/* Mobile-only arrow bar: below image, hidden on desktop */}
                <div className="pd-mobile-arrow-bar">
                  <button
                    onClick={goToPrev}
                    disabled={!prevProduct}
                    aria-label="Previous product"
                    className={`pd-mobile-arrow ${prevProduct ? 'pd-mobile-arrow--active' : 'pd-mobile-arrow--faint'
                      }`}
                  >
                    <ChevronLeft size={20} />
                    <span className="pd-mobile-arrow__label">Prev</span>
                  </button>
                  <button
                    onClick={goToNext}
                    disabled={!nextProduct}
                    aria-label="Next product"
                    className={`pd-mobile-arrow ${nextProduct ? 'pd-mobile-arrow--active' : 'pd-mobile-arrow--faint'
                      }`}
                  >
                    <span className="pd-mobile-arrow__label">Next</span>
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              {/* Right col: product information */}
              <div className="space-y-6">
                {/* Header */}
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <h1 className="text-2xl lg:text-3xl font-bold text-[#F8FAFC] leading-tight">
                      {product.seoTitle || product.title}
                    </h1>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => setIsFavorite(!isFavorite)}
                        className={`p-2 rounded-full transition-all duration-300 ${isFavorite
                          ? 'bg-red-500 text-white'
                          : 'bg-[#1E293B] text-[#E2E8F0] hover:bg-[#334155]'
                          }`}
                      >
                        <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                      </button>
                      <button
                        onClick={handleShare}
                        className="p-2 bg-[#1E293B] text-[#E2E8F0] rounded-full hover:bg-[#334155] transition-all duration-300"
                      >
                        <Share2 size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={`${i < 4 ? 'text-[#F1C27D] fill-current' : 'text-[#334155]'
                            }`}
                        />
                      ))}
                    </div>
                    <span className="text-[#E2E8F0] text-sm">(4.0) • 24 Reviews</span>
                  </div>

                  {/* Contact for Price - Removed as requested */}
                </div>

                {/* Description */}
                {product.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-[#F8FAFC] mb-3">Description</h3>
                    <p className="text-[#E2E8F0] leading-relaxed">{product.seoDescription || product.description}</p>
                  </div>
                )}

                {/* Specifications */}
                {product.specifications && (
                  <div>
                    <h3 className="text-lg font-semibold text-[#F8FAFC] mb-3">Specifications</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between p-3 bg-[#1E293B] rounded-lg">
                          <span className="text-[#94A3B8] font-medium">{key}:</span>
                          <span className="text-[#F8FAFC]">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-4">
                  <WhatsAppButton
                    phoneNumber="+923005567507"
                    productName={product.seoTitle || product.title}
                    productId={product._id}
                    productUrl={window.location.href}
                    product={product}
                    className="w-full py-4 bg-gradient-to-r from-[#E6A44E] to-[#F1C27D] hover:from-[#F1C27D] hover:to-[#E6A44E] text-[#0F172A] font-bold text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
                  >
                    <ShoppingBag size={20} className="mr-2" />
                    Order Now on WhatsApp
                  </WhatsAppButton>

                  <div className="grid grid-cols-2 gap-3">
                    <a href="tel:+923005567507" className="flex items-center justify-center py-3 border border-[#334155] text-[#E2E8F0] rounded-lg hover:bg-[#1E293B] transition-all duration-300">
                      <Phone size={18} className="mr-2" />
                      Call Us
                    </a>
                    <a href={buildProductWhatsAppUrl(product)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center py-3 border border-[#334155] text-[#E2E8F0] rounded-lg hover:bg-[#1E293B] transition-all duration-300">
                      <MessageCircle size={18} className="mr-2" />
                      Inquire
                    </a>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h3 className="text-lg font-semibold text-[#F8FAFC] mb-4">Why Choose This Product?</h3>
                  <div className="grid gap-3">
                    <FeatureCard
                      icon={Package}
                      title="Authentic Gandhara Craftsmanship"
                      description="Handcrafted by skilled artisans using traditional techniques"
                    />
                    <FeatureCard
                      icon={Shield}
                      title="Quality Guaranteed"
                      description="Each piece undergoes rigorous quality control"
                    />
                    <FeatureCard
                      icon={Truck}
                      title="Secure Shipping"
                      description="Safe and insured delivery to your doorstep"
                    />
                  </div>
                </div>
              </div>
            </div>{/* end grid lg:grid-cols-2 */}
          </div>{/* end pd-nav-wrap */}

          {/* Back Button */}
          <div className="mt-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 px-6 py-3 bg-[#1E293B] text-[#E2E8F0] rounded-lg hover:bg-[#334155] transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Products</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetail;

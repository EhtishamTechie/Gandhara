// src/components/ProductCard.jsx
//
// Section 5 — Product Card Redesign
// --------------------------------------------------------------
// Canonical, theme-driven product card used by:
//   - AllProductsPage  (grouped + search grid)
//   - ProductPage      (category grid)
//
// Design spec (from the master brief):
//   - Background:  var(--color-bg-card)
//   - Border:      1px solid var(--color-border), radius 12px
//   - Shadow:      0 4px 20px rgba(0,0,0,0.3)
//   - Hover:       border -> gold, shadow -> gold glow
//   - Image:       aspect-ratio 4/3, object-cover, hover scales 1.05
//   - Category:    top-left pill, semi-transparent dark bg, gold text
//   - Title:       var(--color-text-primary), font-weight 600
//   - Price:       var(--color-accent-gold), 1.1rem / 700  (hidden if 0)
//   - Primary CTA: hidden by default, slides up on hover,
//                  gold bg + dark text, full card width
//   - WhatsApp:    circular icon fixed bottom-right of image,
//                  opens wa.me deep link with a pre-filled inquiry
//
// Notes:
//   - Fully self-contained: no extra context, no extra deps.
//   - The click-anywhere-on-card still fires onClick(product); both
//     inner buttons call stopPropagation so they don't double-trigger.
//   - Mobile / reduced-motion friendly: hover transitions are purely
//     CSS; slide-up CTA is always visible on touch devices (see .mobile).

import { memo, useCallback, useMemo, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import OptimizedImage from './OptimizedImage';
import { getImageUrl } from '../utils/imageHelper';
import { buildProductWhatsAppUrl } from '../utils/whatsappHelper';
import './ProductCard.css';

// Default WhatsApp number (same as inline buttons elsewhere on site).
const WHATSAPP_NUMBER = '923005567507';

// Inline SVG so we don't pay for another icon import.
const WhatsAppIcon = ({ size = 16 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M20.52 3.48A11.88 11.88 0 0 0 12.04 0C5.47 0 .14 5.34.14 11.92c0 2.1.55 4.15 1.6 5.96L0 24l6.28-1.64a11.9 11.9 0 0 0 5.76 1.47h.01c6.58 0 11.91-5.35 11.91-11.93 0-3.18-1.24-6.17-3.44-8.42ZM12.05 21.8h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.22-3.73.97 1-3.63-.24-.37a9.88 9.88 0 0 1-1.53-5.25c0-5.46 4.45-9.9 9.91-9.9 2.65 0 5.14 1.03 7.01 2.9a9.85 9.85 0 0 1 2.9 7 9.92 9.92 0 0 1-9.91 9.88Zm5.72-7.4c-.31-.16-1.85-.91-2.14-1.01-.29-.1-.5-.16-.71.16-.21.31-.82 1.01-1 1.22-.18.21-.37.23-.68.08-.31-.16-1.31-.48-2.49-1.53a9.36 9.36 0 0 1-1.73-2.15c-.18-.31-.02-.47.13-.62.13-.13.29-.34.44-.52.15-.18.2-.31.3-.51.1-.21.05-.39-.02-.55-.08-.16-.71-1.72-.98-2.36-.26-.62-.52-.54-.71-.55l-.61-.01c-.21 0-.55.08-.84.39-.29.31-1.11 1.08-1.11 2.64s1.14 3.06 1.3 3.27c.16.21 2.25 3.43 5.44 4.81.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.85-.76 2.11-1.49.26-.73.26-1.36.18-1.49-.08-.13-.29-.21-.61-.37Z" />
  </svg>
);

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------

const waLink = (product) => {
  if (product && typeof product === 'object') {
    return buildProductWhatsAppUrl(product, WHATSAPP_NUMBER);
  }
  const msg = product
    ? `Hello! I'm interested in your product: ${product}. Could you share more details and price?`
    : `Hello! I'd like more information about your products.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
};

const resolveProductImage = (product) => {
  const candidate =
    (Array.isArray(product.images) && product.images[0]) ||
    product.image ||
    null;
  if (!candidate) return '/GandharaImages/Gandharalogo.webp';
  if (typeof candidate === 'string' && /^https?:\/\//i.test(candidate)) {
    return candidate;
  }
  return getImageUrl(candidate);
};

const resolveHoverImage = (product, fallback) => {
  const second =
    Array.isArray(product.images) && product.images.length > 1
      ? product.images[1]
      : null;
  if (!second) return fallback;
  if (/^https?:\/\//i.test(second)) return second;
  return getImageUrl(second);
};

const primaryCategory = (product) =>
  Array.isArray(product.categories) && product.categories.length > 0
    ? product.categories[0]
    : null;

const highlightTerm = (text, term) => {
  if (!term || !text) return text;
  try {
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = String(text).split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="pc-highlight">{part}</mark>
      ) : (
        part
      )
    );
  } catch {
    return text;
  }
};

const formatPrice = (price) => {
  if (price === null || price === undefined) return null;
  const n = Number(price);
  if (!Number.isFinite(n) || n <= 0) return null;
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0
  }).format(n);
};

// ----------------------------------------------------------------
// Component
// ----------------------------------------------------------------
const ProductCard = memo(function ProductCard({
  product,
  index = 0,
  onClick,
  searchTerm
}) {
  const [hover, setHover] = useState(false);

  const primary = useMemo(() => resolveProductImage(product), [product]);
  const secondary = useMemo(
    () => resolveHoverImage(product, primary),
    [product, primary]
  );
  const category = primaryCategory(product);
  const title = product.seoTitle || product.title || 'Untitled Product';
  const priceLabel = formatPrice(product.price);
  const showTwoImages = secondary && secondary !== primary;

  const handleClick = useCallback(() => {
    if (typeof onClick === 'function') onClick(product);
  }, [onClick, product]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick]
  );

  const stop = (e) => e.stopPropagation();

  return (
    <article
      className={`pc-card ${hover ? 'is-hover' : ''}`}
      tabIndex={0}
      role="button"
      aria-label={title}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="pc-media">
        <div className="pc-media-inner">
          <OptimizedImage
            src={hover && showTwoImages ? secondary : primary}
            alt={product.imageAlt || title}
            width={600}
            height={450}
            className="pc-img"
            objectFit="cover"
            lazy={index > 6}
            priority={index < 3}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            draggable={false}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/GandharaImages/Gandharalogo.webp';
            }}
          />
        </div>



        <a
          href={waLink(product)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={stop}
          className="pc-whatsapp"
          aria-label={`Inquire about ${title} on WhatsApp`}
          title="Inquire on WhatsApp"
        >
          <WhatsAppIcon size={8} />
        </a>

        <button
          type="button"
          onClick={(e) => {
            stop(e);
            handleClick();
          }}
          className="pc-cta"
        >
          <ShoppingBag size={16} className="pc-cta-icon" />
          View Details
        </button>
      </div>

      <div className="pc-body">
        <h3 className="pc-title" title={title}>
          {searchTerm ? highlightTerm(title, searchTerm) : title}
        </h3>

        {priceLabel && <div className="pc-price">{priceLabel}</div>}
      </div>
    </article>
  );
},
(prev, next) =>
  prev.product?._id === next.product?._id &&
  prev.searchTerm === next.searchTerm &&
  prev.product?.title === next.product?.title &&
  prev.product?.image === next.product?.image &&
  prev.product?.price === next.product?.price &&
  prev.index === next.index
);

export default ProductCard;

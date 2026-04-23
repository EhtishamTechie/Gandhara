/**
 * Build WhatsApp wa.me URL with product title, page link, and image link.
 * WhatsApp cannot attach binary images via URL, but including the image URL
 * lets the customer forward a direct link; the product page link usually
 * triggers a rich preview when og:image is set on the product page.
 */
import { getImageUrl } from './imageHelper';

export function resolveProductImagePath(product) {
  if (!product) return '/GandharaImages/Gandharalogo.webp';
  const candidate =
    (Array.isArray(product.images) && product.images[0]) ||
    product.image ||
    null;
  if (!candidate) return '/GandharaImages/Gandharalogo.webp';
  if (typeof candidate === 'string' && /^https?:\/\//i.test(candidate)) {
    return candidate;
  }
  return getImageUrl(candidate);
}

/** Absolute URL for sharing (browser origin + path for public assets). */
export function toAbsoluteUrl(pathOrUrl) {
  if (!pathOrUrl) return '';
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  if (typeof window === 'undefined') return pathOrUrl;
  const p = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${window.location.origin}${p}`;
}

export function buildProductWhatsAppUrl(product, phoneDigits = '923005567507') {
  const title = product?.seoTitle || product?.title || 'Product';
  const id = product?._id || product?.id;
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const productPage = id
    ? `${origin}/product/${id}`
    : typeof window !== 'undefined'
      ? window.location.href
      : '';
  const imgPath = resolveProductImagePath(product);
  const imageUrl = toAbsoluteUrl(imgPath);

  const lines = [
    `Hello! I'm interested in your product: *${title}*`,
    '',
    `🔗 Product page: ${productPage}`,
    `🖼️ Product image: ${imageUrl}`,
    '',
    'Could you share more details and pricing?'
  ];
  const text = lines.join('\n');
  return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(text)}`;
}

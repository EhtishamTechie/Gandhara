// src/components/Footer.jsx
//
// Section 6 — Footer Redesign
// --------------------------------------------------------------
// Layout (4-column grid at lg+):
//   1. Brand       — logo, tagline, circular social icons
//   2. Quick Links — Home / All Products / About / Contact / Wholesale
//   3. Top Cats    — dynamic top 6-8 categories from /api/categories/tree
//   4. Contact     — address, phone, email + Google Maps iframe
//
// Styling is 100% token-driven (Section 2):
//   - background: var(--color-bg-footer)
//   - gold 1px divider on top (low opacity)
//   - secondary text: var(--color-text-secondary), hover -> gold
//   - muted copyright: var(--color-text-muted)
//
// The "Top Categories" column degrades gracefully:
//   - while loading  -> a small skeleton
//   - on error/empty -> falls back to a short static list

import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaPinterestP,
  FaYoutube
} from 'react-icons/fa';
import { MapPin, Phone, Mail } from 'lucide-react';
import { useCategoryTree } from '../hooks/useApi';

// --- Configuration ---------------------------------------------
const CONTACT = {
  email: 'info@gandharataxila.com',
  phone: '+92 300 556 7507',
  phoneTel: '+923005567507',
  whatsapp: '923005567507',
  addressLine1: 'Heritage Gallery',
  addressLine2: 'Taxila, Punjab, Pakistan'
};

const SOCIAL_LINKS = [
  { name: 'Facebook',  href: 'https://facebook.com/yourgandharaarts',   Icon: FaFacebookF },
  { name: 'Instagram', href: 'https://instagram.com/yourgandharaarts',  Icon: FaInstagram },
  { name: 'Pinterest', href: 'https://pinterest.com/yourgandharaarts',  Icon: FaPinterestP },
  { name: 'YouTube',   href: 'https://youtube.com/yourgandharaarts',    Icon: FaYoutube   },
  {
    name: 'WhatsApp',
    href: `https://wa.me/${CONTACT.whatsapp}`,
    Icon: FaWhatsapp
  }
];

const QUICK_LINKS = [
  { name: 'Home',              path: '/' },
  { name: 'All Products',      path: '/products' },
  { name: 'About',             path: '/about' },
  { name: 'Contact',           path: '/contact' },
  { name: 'Visit Taxila',      path: '/visit-taxila' },
  {
    name: 'Wholesale Inquiry',
    path: `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(
      'Hello! I would like to inquire about wholesale pricing.'
    )}`,
    external: true
  }
];

// Fallback used if API fails or returns []
const FALLBACK_CATEGORIES = [
  { name: 'Gandhara Art',      slug: 'gandhara-art' },
  { name: 'Home Decor',        slug: 'home-decor' },
  { name: 'Garden Decor',      slug: 'garden-decor' },
  { name: 'Stone Calligraphy', slug: 'stone-calligraphy' },
  { name: 'Fountains',         slug: 'fountains' },
  { name: 'Antique Jewellery', slug: 'antique-jewellery' }
];

// Google Maps embed centered on Taxila, Pakistan (no API key required).
const MAP_SRC =
  'https://www.google.com/maps?q=Taxila,Punjab,Pakistan&output=embed';

// --- Sub-components --------------------------------------------

const ColumnHeading = ({ children }) => (
  <h5
    className="text-sm font-semibold tracking-wider uppercase mb-5"
    style={{ color: 'var(--color-text-primary, #F5F0E8)' }}
  >
    {children}
    <span
      className="block mt-2 h-[2px] w-10 rounded-full"
      style={{ background: 'var(--color-accent-gold, #C9A84C)' }}
    />
  </h5>
);

const FooterLink = ({ to, external, children }) =>
  external ? (
    <a
      href={to}
      target="_blank"
      rel="noopener noreferrer"
      className="footer-link"
    >
      {children}
    </a>
  ) : (
    <Link to={to} className="footer-link">
      {children}
    </Link>
  );

const SocialIcon = ({ name, href, Icon }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={name}
    title={name}
    className="footer-social"
  >
    <Icon className="h-4 w-4" />
  </a>
);

// --- Top Categories column -------------------------------------
const TopCategoriesColumn = () => {
  const { data, isLoading, isError } = useCategoryTree();

  const categories = React.useMemo(() => {
    const tree = data?.tree;
    if (!Array.isArray(tree) || tree.length === 0) return FALLBACK_CATEGORIES;
    return tree
      .filter((c) => c?.name && c?.slug)
      .slice(0, 8)
      .map((c) => ({ name: c.name, slug: c.slug }));
  }, [data]);

  if (isLoading) {
    return (
      <ul className="space-y-3" aria-busy="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <li
            key={i}
            className="h-4 rounded"
            style={{
              background: 'var(--color-border, #2E2E45)',
              width: `${55 + ((i * 9) % 35)}%`,
              opacity: 0.5
            }}
          />
        ))}
      </ul>
    );
  }

  const list = isError ? FALLBACK_CATEGORIES : categories;

  return (
    <ul className="space-y-3">
      {list.map((cat) => (
        <li key={cat.slug}>
          <Link to={`/category/${cat.slug}`} className="footer-link">
            {cat.name}
          </Link>
        </li>
      ))}
    </ul>
  );
};

// --- Main component --------------------------------------------
const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative mt-auto"
      style={{
        background: 'var(--color-bg-footer, #0A0A14)',
        color: 'var(--color-text-secondary, #A89880)'
      }}
    >
      {/* Gold top divider (low opacity) */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'rgba(201, 168, 76, 0.35)' }}
      />

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        {/* ------------- 4-column main grid ------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1 — Brand */}
          <div>
            <Link to="/" className="inline-block mb-4" aria-label="Gandhara Arts — Home">
              <img
                src="/GandharaImages/Gandharalogo.webp"
                alt="Gandhara Arts logo"
                width={96}
                height={96}
                className="h-20 w-auto"
                loading="lazy"
              />
            </Link>
            <p
              className="text-sm leading-relaxed mb-6 max-w-xs"
              style={{ color: 'var(--color-text-secondary, #A89880)' }}
            >
              Timeless stone craftsmanship from the heart of ancient Gandhara —
              unique pieces and guided Taxila heritage tours.
            </p>

            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map((s) => (
                <SocialIcon key={s.name} {...s} />
              ))}
            </div>
          </div>

          {/* Column 2 — Quick Links */}
          <div>
            <ColumnHeading>Quick Links</ColumnHeading>
            <ul className="space-y-3">
              {QUICK_LINKS.map((l) => (
                <li key={l.name}>
                  <FooterLink to={l.path} external={l.external}>
                    {l.name}
                  </FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Top Categories (dynamic) */}
          <div>
            <ColumnHeading>Top Categories</ColumnHeading>
            <TopCategoriesColumn />
          </div>

          {/* Column 4 — Contact + Map */}
          <div>
            <ColumnHeading>Contact</ColumnHeading>

            <ul className="space-y-3 mb-5">
              <li className="flex items-start gap-3">
                <MapPin
                  className="mt-0.5 h-4 w-4 flex-shrink-0"
                  style={{ color: 'var(--color-accent-gold, #C9A84C)' }}
                  aria-hidden="true"
                />
                <div className="text-sm">
                  <div>{CONTACT.addressLine1}</div>
                  <div>{CONTACT.addressLine2}</div>
                </div>
              </li>

              <li className="flex items-center gap-3">
                <Phone
                  className="h-4 w-4 flex-shrink-0"
                  style={{ color: 'var(--color-accent-gold, #C9A84C)' }}
                  aria-hidden="true"
                />
                <a
                  href={`tel:${CONTACT.phoneTel}`}
                  className="footer-link text-sm"
                >
                  {CONTACT.phone}
                </a>
              </li>

              <li className="flex items-center gap-3">
                <Mail
                  className="h-4 w-4 flex-shrink-0"
                  style={{ color: 'var(--color-accent-gold, #C9A84C)' }}
                  aria-hidden="true"
                />
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="footer-link text-sm break-all"
                >
                  {CONTACT.email}
                </a>
              </li>
            </ul>

            {/* Embedded Google map (no API key needed for the /maps?output=embed form) */}
            <div
              className="rounded-lg overflow-hidden border"
              style={{
                borderColor: 'var(--color-border, #2E2E45)',
                boxShadow: '0 4px 14px rgba(0,0,0,0.35)'
              }}
            >
              <iframe
                title="Gandhara Arts — Taxila, Pakistan"
                src={MAP_SRC}
                width="100%"
                height="140"
                style={{ border: 0, display: 'block', filter: 'grayscale(0.3) contrast(1.05)' }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </div>

        {/* ------------- Bottom copyright bar ------------- */}
        <div
          className="mt-12 pt-6 text-center text-xs"
          style={{
            borderTop: '1px solid rgba(201, 168, 76, 0.15)',
            color: 'var(--color-text-muted, #6B6B80)'
          }}
        >
          <p>
            © 2015–{year} Gandhara Arts &amp; Taxila Stone Crafts. All Rights Reserved.
          </p>
          <p className="mt-1">
            Designed with passion in Pakistan. Handcrafted for the world.
          </p>
        </div>
      </div>

      {/* Scoped link + social styles. Kept inline so Footer is self-contained
          and doesn't require a new CSS file to import. */}
      <style>{`
        .footer-link {
          color: var(--color-text-secondary, #A89880);
          font-size: 0.875rem;
          transition: color 200ms ease, transform 200ms ease;
          display: inline-block;
        }
        .footer-link:hover,
        .footer-link:focus-visible {
          color: var(--color-accent-gold, #C9A84C);
          transform: translateX(2px);
        }
        .footer-social {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 9999px;
          border: 1px solid var(--color-accent-gold, #C9A84C);
          color: var(--color-accent-gold, #C9A84C);
          background: transparent;
          transition:
            background-color 200ms ease,
            color 200ms ease,
            transform 200ms ease,
            box-shadow 200ms ease;
        }
        .footer-social:hover,
        .footer-social:focus-visible {
          background: var(--color-accent-gold, #C9A84C);
          color: var(--color-bg-footer, #0A0A14);
          transform: translateY(-2px);
          box-shadow: 0 6px 18px var(--color-shadow, rgba(201,168,76,0.15));
        }
      `}</style>
    </footer>
  );
};

export default Footer;

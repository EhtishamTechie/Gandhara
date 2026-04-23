import { Link } from 'react-router-dom';
import { MapPinIcon, ChatBubbleLeftRightIcon, ArrowRightIcon } from '@heroicons/react/20/solid';

/**
 * Compact “Taxila tours & travel” strip for small screens — surfaces
 * offerings without waiting for lazy-loaded sections below the fold.
 */
const WHATSAPP = '923005567507';
const MSG = encodeURIComponent(
  'Hello! I would like information about Taxila tours and guided visits.'
);

const MobileTourHighlights = () => (
  <section
    className="lg:hidden border-t border-x-0 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-5"
    aria-labelledby="mobile-tour-heading"
  >
    <div className="max-w-2xl mx-auto">
      <h2 id="mobile-tour-heading" className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">
        Taxila tours & travel
      </h2>
      <p className="text-sm text-[var(--color-text-secondary)] mb-4">
        Guided heritage walks, museum visits, and custom day trips from Islamabad / Rawalpindi.
      </p>
      <ul className="space-y-2 text-sm text-[var(--color-text-primary)] mb-4">
        <li className="flex gap-2">
          <span className="text-[var(--color-accent-gold)] shrink-0">✓</span>
          <span>Archaeological sites &amp; Gandhara art highlights</span>
        </li>
        <li className="flex gap-2">
          <span className="text-[var(--color-accent-gold)] shrink-0">✓</span>
          <span>Private group bookings &amp; WhatsApp coordination</span>
        </li>
        <li className="flex gap-2">
          <span className="text-[var(--color-accent-gold)] shrink-0">✓</span>
          <span>Pickup options &amp; flexible scheduling</span>
        </li>
      </ul>
      <div className="flex flex-col sm:flex-row gap-2">
        <Link
          to="/visit-taxila"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-accent-gold)] px-4 py-3 text-sm font-semibold text-[var(--color-bg-primary)] shadow-md hover:opacity-95 transition-opacity"
        >
          <MapPinIcon className="h-5 w-5" aria-hidden />
          Explore tours
          <ArrowRightIcon className="h-4 w-4" aria-hidden />
        </Link>
        <a
          href={`https://wa.me/${WHATSAPP}?text=${MSG}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--color-accent-gold)] px-4 py-3 text-sm font-semibold text-[var(--color-accent-gold)] hover:bg-[var(--color-bg-card)] transition-colors"
        >
          <ChatBubbleLeftRightIcon className="h-5 w-5" aria-hidden />
          WhatsApp us
        </a>
      </div>
    </div>
  </section>
);

export default MobileTourHighlights;

// src/components/HeroSection.jsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Link as ScrollLink } from 'react-scroll';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useSiteMediaSlot } from '../hooks/useApi';
import { getMediaUrl } from '../utils/imageHelper';
import '../styles/animations.css';

/**
 * HeroSection (Section 4 — slideshow edition)
 * -------------------------------------------
 * Reads its slides from the `hero.main` SiteMedia slot. Each slide
 * is independently an image OR a video; admin controls them from
 * /admin -> Site Media (Phase 3).
 *
 * Behaviour:
 *  - Image slide: auto-advances after 5 s (pauses on hover).
 *  - Video slide: auto-advances when the video ends (capped at 20 s).
 *  - Manual prev/next arrows + bottom dots + swipe (touch).
 *  - Current slide's `caption` drives the headline; `subtitle`
 *    drives the italic gold subheading. Falls back to brand
 *    defaults if empty.
 *  - Gracefully falls back to the original hardcoded video if
 *    the API returns nothing (avoids any "blank hero" situation).
 */

const FALLBACK_SLIDES = [
  {
    _id: 'fallback-0',
    url: '/ProductVideos/Gandhara Art Artisans.mp4',
    type: 'video',
    caption: 'Gandhara Arts And Taxila Stone Crafts',
    subtitle: 'Carving Legacies, Crafting Journeys',
    poster: '/GandharaImages/Gandharalogo.webp',
  },
];

const SWIPE_THRESHOLD_PX = 50;

const HeroSection = () => {
  const navigate = useNavigate();
  const { data: slot } = useSiteMediaSlot('hero.main');

  // Resolve the slide set: prefer backend; fall back to the
  // hardcoded video so the hero never renders blank.
  const slides = useMemo(() => {
    const items = slot?.items;
    if (Array.isArray(items) && items.length > 0) return items;
    return FALLBACK_SLIDES;
  }, [slot]);

  const [idx, setIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef(null);
  const videoRef = useRef(null);

  // Reset index if the slides list shrinks (admin removed an item)
  useEffect(() => {
    if (idx >= slides.length) setIdx(0);
  }, [slides.length, idx]);

  const current = slides[idx] || slides[0];
  const isVideoSlide = current?.type === 'video';

  // Advance helpers (wrap around)
  const goTo = useCallback(
    (n) => setIdx(((n % slides.length) + slides.length) % slides.length),
    [slides.length]
  );
  const next = useCallback(() => goTo(idx + 1), [idx, goTo]);
  const prev = useCallback(() => goTo(idx - 1), [idx, goTo]);

  // Backend-configurable autoplay timings (with safe fallbacks)
  const autoplayImageMs = Math.max(1000, Number(slot?.settings?.autoplayImageMs || 5000));
  const videoAutoplayCapMs = Math.max(1000, Number(slot?.settings?.videoAutoplayCapMs || 20000));

  // Autoplay timer. Restarts whenever the slide changes.
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    // Video slides: advance when the video ends OR at the cap.
    if (isVideoSlide) {
      const cap = setTimeout(next, videoAutoplayCapMs);
      return () => clearTimeout(cap);
    }

    const t = setTimeout(next, autoplayImageMs);
    return () => clearTimeout(t);
  }, [idx, slides.length, isPaused, isVideoSlide, next, autoplayImageMs, videoAutoplayCapMs]);

  // Keyboard: ← / → when the hero is focused
  const onKey = (e) => {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  };

  // Touch swipe
  const onTouchStart = (e) => {
    touchStartXRef.current = e.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (e) => {
    const start = touchStartXRef.current;
    touchStartXRef.current = null;
    if (start == null) return;
    const end = e.changedTouches[0]?.clientX ?? start;
    const dx = end - start;
    if (dx > SWIPE_THRESHOLD_PX) prev();
    else if (dx < -SWIPE_THRESHOLD_PX) next();
  };

  // Block right-click download on media
  const blockContextMenu = (e) => e.preventDefault();

  // Evergreen brand text (kept even if slide has no caption)
  const DEFAULT_TAGLINE = 'Where Artistry Meets Antiquity';
  const DEFAULT_HEADLINE = 'Gandhara Arts And Taxila Stone Crafts';
  const DEFAULT_SUBHEAD = 'Carving Legacies, Crafting Journeys';

  // Keep the hero headline on-brand even if an admin-uploaded slide
  // was saved with a shortened caption like "Gandhara Art".
  const normalizedCaption = String(current?.caption || '').trim();
  const isShortBrand =
    /^gandhara\s*art$/i.test(normalizedCaption) ||
    /^gandhara\s*arts$/i.test(normalizedCaption);

  const headline = (!normalizedCaption || isShortBrand)
    ? DEFAULT_HEADLINE
    : normalizedCaption;
  const subheading = current?.subtitle || DEFAULT_SUBHEAD;

  return (
    <section
      className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-[#0F172A] outline-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onKeyDown={onKey}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      tabIndex={0}
      aria-roledescription="carousel"
      aria-label="Featured stories"
    >
      {/* Slides — render all, fade only the active one */}
      <div className="absolute inset-0 z-0">
        {slides.map((s, i) => {
          const active = i === idx;
          const src = getMediaUrl(s.url);
          const poster = s.poster ? getMediaUrl(s.poster) : undefined;

          return (
            <div
              key={s._id || `${s.url}-${i}`}
              className={`absolute inset-0 transition-opacity duration-[900ms] ease-out ${
                active ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              aria-hidden={!active}
            >
              {s.type === 'video' ? (
                <video
                  ref={active ? videoRef : undefined}
                  key={`${s._id || s.url}-${active}`}  /* force reload on activate */
                  autoPlay={active}
                  muted
                  playsInline
                  loop={slides.length === 1}
                  poster={poster}
                  preload={active ? 'auto' : 'none'}
                  className="w-full h-full object-cover opacity-70"
                  onEnded={() => active && slides.length > 1 && next()}
                  onContextMenu={blockContextMenu}
                  controlsList="nodownload nofullscreen noremoteplayback"
                  disablePictureInPicture
                  style={{ pointerEvents: 'none' }}
                >
                  <source src={src} type="video/mp4" />
                </video>
              ) : (
                <img
                  src={src}
                  alt={s.alt || s.caption || 'Hero slide'}
                  className="w-full h-full object-cover"
                  loading={active ? 'eager' : 'lazy'}
                  decoding="async"
                  fetchPriority={active && i === 0 ? 'high' : 'auto'}
                  onContextMenu={blockContextMenu}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Gradient overlay (unchanged) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/60 via-[#1E293B]/50 to-[#0F172A]/70 z-10" />

      {/* Arrow controls — only when there's more than one slide */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-white/25 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-200 hover:scale-110 focus-visible:ring-2 focus-visible:ring-[#F1C27D]"
            aria-label="Previous slide"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-white/25 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-200 hover:scale-110 focus-visible:ring-2 focus-visible:ring-[#F1C27D]"
            aria-label="Next slide"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Text overlay + CTAs (layout unchanged) */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 animate-fadeIn">
        <p className="mb-4 text-lg md:text-xl lg:text-2xl font-light tracking-wider uppercase text-[#E2E8F0] animate-fadeInUp animation-delay-100">
          {DEFAULT_TAGLINE}
        </p>

        <h1
          key={`h-${idx}`}  /* re-triggers the fade when slide changes */
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold mb-3 leading-tight text-[#F8FAFC] [text-shadow:_0_3px_20px_rgba(0,0,0,0.9)] animate-fadeInUp animation-delay-200"
        >
          {headline}
        </h1>

        <p
          key={`s-${idx}`}
          className="text-2xl sm:text-3xl md:text-4xl mb-8 text-[#F1C27D] font-medium italic [text-shadow:_0_2px_10px_rgba(0,0,0,0.7)] animate-fadeInUp animation-delay-300"
        >
          {subheading}
        </p>

        <div className="w-24 h-1 bg-gradient-to-r from-[#F1C27D] to-[#E6A44E] rounded-full mb-8 animate-fadeInUp animation-delay-400" />

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 animate-fadeInUp animation-delay-500">
          <button
            onClick={() => navigate('/products')}
            className="cursor-pointer bg-gradient-to-r from-[#E6A44E] to-[#F1C27D] hover:from-[#F1C27D] hover:to-[#E6A44E] text-[#0F172A] font-semibold px-8 py-3.5 rounded-lg transition-all duration-300 ease-in-out text-base md:text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-[#F1C27D] focus:ring-opacity-50"
          >
            Explore Stone Collections
          </button>

          <ScrollLink
            to="tours"
            smooth
            duration={800}
            offset={-70}
            className="cursor-pointer bg-transparent border-2 border-[#E2E8F0] hover:border-[#F1C27D] text-[#E2E8F0] hover:text-[#F1C27D] font-semibold px-8 py-3.5 rounded-lg transition-all duration-300 ease-in-out text-base md:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-[#E2E8F0] focus:ring-opacity-30"
          >
            Discover Taxila Tours
          </ScrollLink>

          <ScrollLink
            to="luxury"
            smooth
            duration={800}
            offset={-70}
            className="cursor-pointer bg-gradient-to-r from-[#E6A44E] to-[#F1C27D] hover:from-[#F1C27D] hover:to-[#E6A44E] text-[#0F172A] font-semibold px-8 py-3.5 rounded-lg transition-all duration-300 ease-in-out text-base md:text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-[#F1C27D] focus:ring-opacity-50"
          >
            Luxury Collection
          </ScrollLink>
        </div>
      </div>

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === idx ? 'w-8 bg-[#F1C27D]' : 'w-2 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}

      {/* Down scroll indicator (unchanged) */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-30 animate-fadeIn animation-delay-800">
        <ScrollLink
          to="collections"
          smooth
          duration={800}
          offset={-70}
          className="cursor-pointer"
          aria-label="Scroll to next section"
        >
          <div className="relative flex justify-center items-center animate-bounce">
            <div className="absolute w-10 h-10 bg-[#F1C27D]/20 rounded-full animate-pulse" />
            <div className="absolute w-6 h-6 bg-[#F1C27D]/30 rounded-full animate-pulse animation-delay-300" />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#F1C27D" className="w-8 h-8 md:w-10 md:h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </ScrollLink>
      </div>
    </section>
  );
};

export default HeroSection;

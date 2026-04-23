import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { PlayIcon, PauseIcon, SpeakerWaveIcon, SpeakerXMarkIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useSiteMediaSlot } from '../hooks/useApi';
import { getMediaUrl } from '../utils/imageHelper';
import '../styles/animations.css';

// Fallback videos used only if the backend returns no items
// (prevents a blank section during the initial query).
const FALLBACK_VIDEOS = [
  { id: 1, title: "Gandhara Heritage Collection",  description: "Discover our authentic Gandhara art pieces",         src: "/ProductVideos/Gandhara Video 2.mp4",      thumbnail: "/GandharaImages/Gandharalogo.webp", category: "Heritage Art" },
  { id: 2, title: "Stone Art Craftsmanship",       description: "Witness the artistry of traditional stone carving",  src: "/ProductVideos/Stone Art Video.mp4",       thumbnail: "/GandharaImages/Gandharalogo.webp", category: "Stone Art" },
  { id: 3, title: "Stone Fountains Collection",    description: "Elegant fountains for your garden spaces",           src: "/ProductVideos/Stone Fountains Videos.mp4",thumbnail: "/GandharaImages/Gandharalogo.webp", category: "Garden Decor" },
  { id: 4, title: "Featured Product Showcase",     description: "Our premium collection highlights",                  src: "/ProductVideos/Video 1.mp4",               thumbnail: "/GandharaImages/Gandharalogo.webp", category: "Featured" },
];

// Soft keyword -> category heuristic used when the admin hasn't
// set a dedicated category field. Kept local so the SiteMedia
// schema stays generic.
const deriveCategory = (caption = '') => {
  const c = caption.toLowerCase();
  if (c.includes('heritage')) return 'Heritage Art';
  if (c.includes('stone art') || c.includes('craftsmanship')) return 'Stone Art';
  if (c.includes('fountain')) return 'Garden Decor';
  if (c.includes('featured') || c.includes('premium')) return 'Featured';
  return '';
};

const ProductVideoShowcase = () => {
  const [activeVideo, setActiveVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState({});
  const [isMuted, setIsMuted] = useState({});
  const [showFullscreen, setShowFullscreen] = useState(null);
  const [visibleVideos, setVisibleVideos] = useState({});
  const videoRefs = useRef({});
  const cardRefs = useRef({});
  const sectionRef = useRef(null);

  const { data: slot } = useSiteMediaSlot('home.productvideos');

  // Derive the video list: prefer backend, fall back to the
  // original hardcoded set if the API returned nothing.
  const videos = useMemo(() => {
    const items = slot?.items;
    if (!Array.isArray(items) || items.length === 0) return FALLBACK_VIDEOS;
    return items.map((it, idx) => ({
      id: idx + 1,                              /* numeric id — matches existing DOM code */
      title: it.caption || 'Featured',
      description: it.subtitle || '',
      src: getMediaUrl(it.url),
      thumbnail: it.poster ? getMediaUrl(it.poster) : '/GandharaImages/Gandharalogo.webp',
      category: deriveCategory(it.caption),
    }));
  }, [slot]);

  // Lazy-load videos using IntersectionObserver — only play when visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const videoId = Number(entry.target.dataset.videoId);
          if (entry.isIntersecting) {
            setVisibleVideos(prev => ({ ...prev, [videoId]: true }));
            const video = videoRefs.current[videoId];
            if (video) {
              video.play().catch(() => {});
              setIsPlaying(prev => ({ ...prev, [videoId]: true }));
            }
          } else {
            const video = videoRefs.current[videoId];
            if (video) {
              video.pause();
              setIsPlaying(prev => ({ ...prev, [videoId]: false }));
            }
          }
        });
      },
      { threshold: 0.3, rootMargin: '100px' }
    );

    // Observe each video card
    Object.entries(cardRefs.current).forEach(([id, el]) => {
      if (el) {
        el.dataset.videoId = id;
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
    // Re-observe whenever the video list length changes — e.g. admin
    // adds/removes items via the Site Media admin tab. Safe to add
    // videos.length here; the cards' React keys stay stable (idx+1)
    // so existing DOM nodes aren't recreated.
  }, [videos.length]);
  const togglePlay = (videoId) => {
    const video = videoRefs.current[videoId];
    if (video) {
      if (video.paused) {
        video.play();
        setIsPlaying(prev => ({ ...prev, [videoId]: true }));
      } else {
        video.pause();
        setIsPlaying(prev => ({ ...prev, [videoId]: false }));
      }
    }
  };

  // Toggle mute
  const toggleMute = (videoId) => {
    const video = videoRefs.current[videoId];
    if (video) {
      video.muted = !video.muted;
      setIsMuted(prev => ({ ...prev, [videoId]: video.muted }));
    }
  };

  // Handle video end
  const handleVideoEnd = (videoId) => {
    setIsPlaying(prev => ({ ...prev, [videoId]: false }));
  };

  // Fullscreen modal
  const openFullscreen = (video) => {
    setShowFullscreen(video);
  };

  const closeFullscreen = () => {
    setShowFullscreen(null);
  };

  // Prevent context menu (right-click)
  const handleContextMenu = (e) => {
    e.preventDefault();
  };

  // Animation handled by CSS classes

  return (
    <section className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] py-20 md:py-32 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#E6A44E]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#F1C27D]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div
          className="text-center mb-16 animate-fadeInUp"
        >
          <div className="inline-block py-2 px-4 rounded-full bg-[#E6A44E]/20 border border-[#E6A44E]/30 text-[#F1C27D] text-sm font-medium mb-4">
            EXCLUSIVE SHOWCASE
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-[#E6A44E] via-[#F1C27D] to-[#E6A44E] bg-clip-text text-transparent">
              Our Craftsmanship
            </span>
            <br />
            <span className="text-[#F8FAFC]">In Motion</span>
          </h2>
          
          <p className="text-xl text-[#E2E8F0] max-w-3xl mx-auto leading-relaxed">
            Experience the artistry and tradition behind every piece through our exclusive video collection
          </p>
        </div>

        {/* Video Grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          {videos.map((video, index) => (
            <div
              key={video.id}
              ref={(el) => cardRefs.current[video.id] = el}
              className="group relative animate-fadeInUp"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Video Card */}
              <div className="relative bg-[#1E293B] rounded-2xl overflow-hidden shadow-2xl hover:shadow-[0_0_40px_rgba(230,164,78,0.3)] transition-all duration-500 transform hover:-translate-y-2">
                {/* Category Badge — hidden when no category derived */}
                {video.category && (
                  <div className="absolute top-4 left-4 z-20">
                    <span className="inline-block bg-[#E6A44E] text-[#0F172A] text-xs font-bold px-3 py-1.5 rounded-full">
                      {video.category}
                    </span>
                  </div>
                )}

                {/* Video Container */}
                <div className="relative aspect-[4/5] overflow-hidden">
                  <video
                    ref={(el) => videoRefs.current[video.id] = el}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    muted={isMuted[video.id] !== false}
                    loop
                    playsInline
                    preload="none"
                    onEnded={() => handleVideoEnd(video.id)}
                    onContextMenu={handleContextMenu}
                    controlsList="nodownload nofullscreen noremoteplayback"
                    disablePictureInPicture
                    style={{ pointerEvents: 'none' }}
                  >
                    <source src={video.src} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>

                  {/* Video Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {/* Controls */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => togglePlay(video.id)}
                          className="flex items-center justify-center w-14 h-14 bg-[#E6A44E]/90 hover:bg-[#E6A44E] rounded-full backdrop-blur-sm transition-all duration-200 transform hover:scale-110"
                        >
                          {isPlaying[video.id] ? (
                            <PauseIcon className="w-6 h-6 text-[#0F172A]" />
                          ) : (
                            <PlayIcon className="w-6 h-6 text-[#0F172A] ml-1" />
                          )}
                        </button>

                        <button
                          onClick={() => toggleMute(video.id)}
                          className="flex items-center justify-center w-12 h-12 bg-[#1E293B]/90 hover:bg-[#334155] rounded-full backdrop-blur-sm transition-all duration-200"
                        >
                          {isMuted[video.id] ? (
                            <SpeakerXMarkIcon className="w-5 h-5 text-[#F8FAFC]" />
                          ) : (
                            <SpeakerWaveIcon className="w-5 h-5 text-[#F8FAFC]" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Fullscreen Button */}
                    <button
                      onClick={() => openFullscreen(video)}
                      className="absolute top-4 right-4 w-10 h-10 bg-[#1E293B]/90 hover:bg-[#334155] rounded-full backdrop-blur-sm transition-all duration-200 flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 text-[#F8FAFC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-[#F8FAFC] mb-2 group-hover:text-[#F1C27D] transition-colors duration-300">
                    {video.title}
                  </h3>
                  <p className="text-sm text-[#E2E8F0] leading-relaxed">
                    {video.description}
                  </p>
                </div>

                {/* Decorative Border */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#E6A44E]/30 transition-all duration-300 pointer-events-none"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div
          className="text-center mt-16 animate-fadeInUp animation-delay-500"
        >
          <p className="text-lg text-[#E2E8F0] mb-6">
            Interested in commissioning a custom piece?
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-x-2 bg-gradient-to-r from-[#E6A44E] to-[#F1C27D] hover:from-[#F1C27D] hover:to-[#E6A44E] text-[#0F172A] font-bold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[0_0_30px_rgba(230,164,78,0.4)]"
          >
            Get In Touch
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {showFullscreen && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn"
          onClick={closeFullscreen}
        >
          <div
            className="relative max-w-4xl w-full mx-4 animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
              <button
                onClick={closeFullscreen}
                className="absolute -top-12 right-0 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-all duration-200 flex items-center justify-center z-10"
              >
                <XMarkIcon className="w-6 h-6 text-white" />
              </button>

              <div className="bg-[#1E293B] rounded-2xl overflow-hidden shadow-2xl">
                <video
                  className="w-full aspect-video"
                  controls
                  autoPlay
                  muted
                  onContextMenu={handleContextMenu}
                  controlsList="nodownload"
                  disablePictureInPicture
                >
                  <source src={showFullscreen.src} type="video/mp4" />
                </video>
                
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-[#F8FAFC] mb-2">
                    {showFullscreen.title}
                  </h3>
                  <p className="text-[#E2E8F0]">
                    {showFullscreen.description}
                  </p>
                </div>
              </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductVideoShowcase;

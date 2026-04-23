import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  Users,
  Phone,
} from 'lucide-react';
import SEOHead from './SEOHead';
import Breadcrumbs from './Breadcrumbs';
import { getImageUrl } from '../utils/imageHelper';
import { resolveApiUrl } from '../utils/apiBase';

const getTourMediaUrl = (path) => {
  if (!path) return '/GandharaImages/Gandharalogo.webp';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return getImageUrl(path);
};

/**
 * Public tour / visit-place detail — same routing idea as ProductDetail (`/product/:id`).
 */
const TourDetail = () => {
  const { tourId } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Generate stable fallbacks per tourId to avoid hook-order issues and
  // to keep rating/review placeholders consistent while browsing.
  const randomFallback = useMemo(() => {
    const rating = (4.5 + Math.random() * 0.4).toFixed(1);
    const reviews = Math.floor(Math.random() * 100) + 50;
    return { rating, reviews };
  }, [tourId]);

  const displayRating = tour?.rating || randomFallback.rating;
  const displayReviews = tour?.reviews || randomFallback.reviews;

  const canonicalId = tour?.slug || tour?._id || tourId;
  const pageUrl = `${window.location.origin}/tour/${canonicalId}`;

  useEffect(() => {
    const fetchTour = async () => {
      if (!tourId) {
        setError('Missing tour link');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const url = resolveApiUrl(`/api/visit-places/${encodeURIComponent(tourId)}`);
        const { data } = await axios.get(url);
        setTour(data);
      } catch (err) {
        console.error('Tour detail fetch:', err?.response?.status, err?.response?.data, err?.message);
        const status = err?.response?.status;
        if (status === 404) {
          setError('This tour was not found. It may have been removed.');
        } else if (err?.code === 'ERR_NETWORK' || err?.message === 'Network Error') {
          setError('Could not reach the server. Is the API running (and Vite proxy active in dev)?');
        } else {
          setError('Tour not found or unavailable.');
        }
        setTour(null);
      } finally {
        setLoading(false);
      }
    };
    fetchTour();
  }, [tourId]);

  if (loading) {
    return (
      <div className="bg-[#0F172A] min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#E6A44E]" />
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="bg-[#0F172A] min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-[#F1C27D] mb-4">Tour not found</h1>
          <p className="text-[#E2E8F0] mb-6">{error || 'This tour may have been removed.'}</p>
          <button
            type="button"
            onClick={() => navigate('/visit-taxila')}
            className="px-6 py-3 bg-gradient-to-r from-[#E6A44E] to-[#F1C27D] text-[#0F172A] font-semibold rounded-lg hover:shadow-lg transition-all"
          >
            Back to tours
          </button>
        </div>
      </div>
    );
  }
  const locationLine =
    tour.location?.address ||
    [tour.location?.district, tour.location?.province, tour.location?.country]
      .filter(Boolean)
      .join(', ') ||
    'Taxila, Punjab, Pakistan';

  const keywords = tour.metaKeywords?.length
    ? tour.metaKeywords
    : Array.isArray(tour.keywords)
      ? tour.keywords
      : [];

  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Visit Taxila', url: '/visit-taxila' },
    { name: tour.name },
  ];

  const heroImage = getTourMediaUrl(tour.image);
  const heroVideo = tour.video ? getTourMediaUrl(tour.video) : null;
  const showVideoOnly = Boolean(heroVideo && !tour.image);

  return (
    <>
      <SEOHead
        title={tour.seoTitle || tour.name}
        description={tour.seoDescription || tour.description?.slice(0, 160)}
        keywords={keywords}
        image={showVideoOnly ? '/GandharaImages/Gandharalogo.webp' : heroImage}
        url={pageUrl}
        type="article"
      />

      <div className="bg-[#0F172A] min-h-screen">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <Breadcrumbs items={breadcrumbItems} />

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="lg:sticky lg:top-8 lg:self-start space-y-4">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-[#1E293B]">
                {showVideoOnly ? (
                  <video
                    src={heroVideo}
                    className="w-full h-full object-cover"
                    controls
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={heroImage}
                    alt={tour.imageAlt || tour.name}
                    className="w-full h-full object-cover"
                    loading="eager"
                    decoding="async"
                    draggable={false}
                  />
                )}
                <div className="absolute top-4 left-4 bg-[#E6A44E] text-[#0F172A] px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                  {tour.tourCategory || 'Heritage'}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-2xl lg:text-4xl font-bold text-[#F8FAFC] mb-3">{tour.name}</h1>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={
                          i < Math.floor(Number(displayRating))
                            ? 'text-[#E6A44E] fill-current'
                            : 'text-[#334155]'
                        }
                      />
                    ))}
                  </div>
                  <span className="text-[#F8FAFC] font-semibold">{displayRating}</span>
                  <span className="text-[#E2E8F0] text-sm">({displayReviews} reviews)</span>
                </div>
                <div className="flex items-center gap-2 text-[#E2E8F0] mb-2">
                  <MapPin className="w-5 h-5 text-[#E6A44E] shrink-0" />
                  <span>{locationLine}</span>
                </div>
                <p className="text-[#F1C27D] font-semibold uppercase tracking-wider text-sm">
                  {tour.tourCategory ? `${tour.tourCategory} experience` : 'Heritage experience'}
                </p>
              </div>

              <div className="bg-[#1E293B] p-6 rounded-xl border border-[#334155]">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <Clock className="w-6 h-6 text-[#E6A44E] mx-auto mb-2" />
                    <p className="text-[#E2E8F0] text-sm">Duration</p>
                    <p className="text-[#F8FAFC] font-semibold">Flexible</p>
                  </div>
                  <div className="text-center">
                    <Users className="w-6 h-6 text-[#E6A44E] mx-auto mb-2" />
                    <p className="text-[#E2E8F0] text-sm">Group size</p>
                    <p className="text-[#F8FAFC] font-semibold">Small groups</p>
                  </div>
                </div>
                <div className="text-center border-t border-[#334155] pt-4">
                  <p className="text-[#E2E8F0] text-sm mb-1">Pricing</p>
                  <p className="text-xl font-bold text-[#E6A44E]">Contact for details</p>
                </div>
              </div>

              {tour.description && (
                <div>
                  <h2 className="text-lg font-semibold text-[#F8FAFC] mb-3">About this tour</h2>
                  <p className="text-[#E2E8F0] leading-relaxed whitespace-pre-wrap">{tour.description}</p>
                </div>
              )}

              {((tour.attractions && tour.attractions.length > 0) || keywords.length > 0) && (
                <div>
                  <h2 className="text-lg font-semibold text-[#F8FAFC] mb-3">Highlights</h2>
                  <div className="flex flex-wrap gap-2">
                    {(tour.attractions?.length ? tour.attractions : keywords).map((tag, index) => (
                      <span
                        key={`${tag}-${index}`}
                        className="bg-[#334155] text-[#E2E8F0] px-3 py-1.5 rounded-full text-sm border border-[#E6A44E]/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <a
                  href={`https://wa.me/923005567507?text=${encodeURIComponent(
                    `Hello! I'm interested in the "${tour.name}" tour. Page: ${pageUrl}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#E6A44E] to-[#F1C27D] text-[#0F172A] font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Book on WhatsApp
                </a>
                <a
                  href="tel:+923005567507"
                  className="w-full flex items-center justify-center gap-2 py-3 border border-[#334155] text-[#E2E8F0] rounded-lg hover:bg-[#1E293B] transition-colors"
                >
                  <Phone size={18} />
                  Call +92 300 556 7507
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <button
              type="button"
              onClick={() => navigate('/visit-taxila')}
              className="flex items-center gap-2 px-6 py-3 bg-[#1E293B] text-[#E2E8F0] rounded-lg hover:bg-[#334155] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to all tours
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TourDetail;

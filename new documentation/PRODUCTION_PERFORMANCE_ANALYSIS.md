# Production Performance Analysis — Gandhara Arts Website

> **Date**: February 21, 2026  
> **Scope**: Full-stack analysis of frontend (React/Vite) + backend (Express/MongoDB)  
> **Goal**: Identify root causes of low production performance (slow load times, poor Core Web Vitals)

---

## Summary

| Severity | Count | Key Themes |
|----------|-------|------------|
| **Critical** | 7 | Hero video preload, 5 simultaneous videos, render-blocking scripts, triple image protection, all-products client-side search, no home page code splitting, global fetch monkey-patching |
| **High** | 13 | Duplicate navbars, 3 icon libraries, duplicate pages, external image load, duplicate API calls, React Query not used everywhere, duplicate analytics, parallax jank on mobile |
| **Medium** | 17 | 400px-only image srcsets, watermark DOM bloat, 23 category links always rendered, inline component definitions, invalid prefetch URLs, 70+ unoptimized public images, 5 raw MP4 videos |
| **Low** | 13 | Dead dependencies, backup files in source, wrong copyright year, unused imports |

---

## CRITICAL Issues (Direct Impact on Load Time & Core Web Vitals)

### 1. Hero Video Uses `preload="auto"` — Downloads Entire File on Page Load
- **File**: `frontend/src/components/HeroSection.jsx`
- **Issue**: The hero video uses `preload="auto"`, causing the browser to download the **entire MP4 file** (likely 5–50 MB) immediately on page load.
- **Impact**: Steals bandwidth from critical resources (CSS, JS, images). Destroys LCP, FCP, and TTFB scores.
- **Fix**: Change to `preload="none"` or `preload="metadata"`.

### 2. Render-Blocking Image Protection Script in `<head>` (~80 Lines)
- **File**: `frontend/index.html` (lines 57–136)
- **Issue**: A massive inline `<script>` block runs synchronously in `<head>` before any content renders. It attaches event listeners for `contextmenu`, `dragstart`, `selectstart`, `keydown`, and `keyup`.
- **Impact**: Directly blocks HTML parsing and delays First Contentful Paint (FCP).
- **Fix**: Move to a deferred external script or remove entirely (see issue #3).

### 3. Image Protection Logic Loaded THREE Separate Times
- **Files**: `index.html` (inline script), `src/utils/imageProtection.js`, `src/components/ProtectedMedia.jsx`
- **Issue**: The same protection code runs 3 times:
  1. Inline script in HTML `<head>` — synchronous, blocks rendering
  2. `imageProtection.js` — IIFE + `initImageProtection()` + `disableBrowserImageFeatures()`
  3. `GlobalMediaProtection` React component — adds a `MutationObserver` watching every DOM change
- **Impact**: 6+ duplicate `contextmenu` handlers, multiple `dragstart` handlers, and a `MutationObserver` constantly reacting to DOM mutations. All add CPU overhead.
- **Fix**: Keep ONE lightweight layer, remove the other two.

### 4. SearchPage Fetches ALL Products, Then Filters Client-Side
- **File**: `frontend/src/pages/SearchPage.jsx`
- **Issue**: On mount, calls `axios.get('/api/products')` to download the **entire product catalog**, then filters results in JavaScript.
- **Impact**: Downloads potentially thousands of products with full data on every search page visit. Massive payload, slow rendering.
- **Fix**: Implement a server-side search endpoint with query parameters (`/api/products?search=term`).

### 5. Five Videos Auto-Play Simultaneously on Home Page
- **Files**: `HeroSection.jsx` (1 video), `ProductVideoShowcase.jsx` (4 videos)
- **Issue**: Hero video + 4 showcase videos all have `autoPlay` and `loop`. `ProductVideoShowcase` calls `video.play()` on all 4 videos during mount. Even below the fold, they start downloading immediately.
- **Impact**: 5 concurrent video streams massively consume bandwidth and CPU. On mobile or slow connections, this alone can make the site unusable.
- **Fix**: Use `IntersectionObserver` to only play videos when visible. Use `preload="none"` on all non-hero videos.

### 6. Home Page Eagerly Imports 10+ Section Components — No Code Splitting
- **File**: `frontend/src/pages/Home.jsx`
- **Issue**: `Home.jsx` eagerly imports `HeroSection`, `ProductVideoShowcase`, `RelatedProducts`, `TaxilaPromoBanner`, `AnimatedProductShowcase`, `TaxilaToursShowcase`, `WhyTaxilaExperience`, `VisualTestimonials`, and `FinalCTA`. None are lazy-loaded.
- **Impact**: The entire home page bundle (all 10 sections) must be downloaded and parsed before first paint, even though only HeroSection is above the fold.
- **Fix**: Lazy-load below-the-fold sections with `React.lazy()` + `IntersectionObserver`.

### 7. `imagePerformanceMonitor.js` Monkey-Patches `window.fetch` Globally
- **File**: `frontend/src/utils/imagePerformanceMonitor.js`
- **Issue**: The `monitorNetworkRequests()` method replaces `window.fetch` with a wrapped version that adds timing overhead to **every single fetch call**. Runs a `setInterval` every 30 seconds.
- **Impact**: Adds latency to all API calls and image requests in production.
- **Fix**: Remove in production or use the native `PerformanceObserver` API instead.

---

## HIGH Severity Issues

### 8. Duplicate Navbar Components (331 + 472 Lines)
- **Files**: `Navbar.jsx` (331 lines, used in App), `ProfessionalNavbar.jsx` (472 lines, unused)
- **Issue**: Two full navbar implementations with duplicated category lists, scroll handlers, and styling. Even if `ProfessionalNavbar` is unused, it exists in the source tree.
- **Impact**: Potential bundle bloat if accidentally imported. Code maintenance overhead.

### 9. Navbar Uses `window.location.pathname` as useEffect Dependency
- **File**: `frontend/src/components/Navbar.jsx`
- **Issue**: `useEffect(() => { ... }, [window.location.pathname])` — `window.location.pathname` is not a React state variable. It's read fresh on every render, making the dependency comparison unreliable.
- **Impact**: May cause unnecessary re-renders or fail to update on navigation.

### 10. Three Icon Libraries Installed Simultaneously
- **File**: `frontend/package.json`
- **Libraries**: `lucide-react`, `react-icons`, `@heroicons/react`
- **Issue**: Three separate icon libraries are installed. `react-icons` alone contains thousands of icons internally. The Vite config groups all three into a single `'icons'` chunk.
- **Impact**: Icon chunk is unnecessarily large. Even with tree-shaking, the combined overhead is significant.
- **Fix**: Standardize on one icon library (recommend `lucide-react`).

### 11. Duplicate Page: `ProducPage.jsx` (992 Lines, Typo Name)
- **File**: `frontend/src/pages/ProducPage.jsx` (992 lines)
- **Issue**: A typo-named duplicate of `ProductPage.jsx` (762 lines). Contains inline `DecorativePattern`, `SearchBar`, `ImageViewer`, and `ProductCardSkeleton` component definitions.
- **Impact**: 992 lines of dead code in the source tree. If imported anywhere, massively bloats the bundle.
- **Fix**: Delete this file.

### 12. `pages.bak/` Directory Inside `src/` — 25+ Files
- **File**: `frontend/src/pages.bak/`
- **Issue**: A full backup of all pages exists inside the `src/` directory. If any import references these files (even via IDE autocomplete), they enter the production bundle.
- **Impact**: Potential dead code in build, confuses import resolution.
- **Fix**: Move `pages.bak/` outside `src/` or delete it.

### 13. External Unsplash Image Loaded Without Lazy Loading
- **File**: `frontend/src/components/WhyTaxilaExperience.jsx`
- **Issue**: Uses `background-image: url(https://images.unsplash.com/...?w=1920...)` — loads a 1920px image from Unsplash with no lazy loading.
- **Impact**: External dependency with no caching control, CORS overhead, large download competing with critical resources.
- **Fix**: Download and serve locally with responsive variants.

### 14. `bg-fixed` Parallax Causes Paint Issues on Mobile
- **File**: `frontend/src/components/WhyTaxilaExperience.jsx`
- **Issue**: CSS `background-attachment: fixed` triggers repaint on every scroll frame on mobile browsers. Many mobile browsers don't support it and fall back to `scroll`, causing layout shifts (CLS).
- **Impact**: Kills scroll performance on mobile, contributes to CLS score.
- **Fix**: Remove parallax or implement with `transform: translate3d()` instead.

### 15. Home Page Makes 5+ Separate API Calls — 2 Are Duplicates
- **Components**: `AnimatedProductShowcase`, `RelatedProducts`, `VisualTestimonials`, `ArtisanGuideSpotlight`, `TaxilaToursShowcase`
- **Issue**: Each component independently fetches data. `VisualTestimonials` and `ArtisanGuideSpotlight` both call `/api/masters/all` — a **duplicate API request** for the same data.
- **Impact**: Waterfall of 5+ network requests. 2 of them fetch identical data.
- **Fix**: Use React Query hooks to deduplicate and cache. Create a `useApi.js` hook pattern.

### 16. Key Components Bypass React Query — Use Raw `fetch()` / `axios`
- **Files**: `AnimatedProductShowcase.jsx`, `RelatedProducts.jsx`
- **Issue**: These components use raw `fetch()` and `axios.get()`, completely bypassing the React Query setup (`queryClient.js`). No caching, no deduplication, no stale-while-revalidate.
- **Impact**: Every page visit re-fetches data that could be cached for minutes.
- **Fix**: Migrate to React Query hooks.

### 17. `RelatedProducts` Creates 33 Animated DOM Elements for Decorations
- **File**: `frontend/src/components/RelatedProducts.jsx`
- **Issue**: When there's only 1 featured product, renders 25 floating particle `<div>` elements + 8 "golden ray" animated `<div>` elements — all with CSS animations.
- **Impact**: 33 continuously animated DOM elements cause jank on low-end devices and drain mobile battery.
- **Fix**: Remove decorative particles or render only when in viewport.

### 18. GoogleAnalytics Component Monkey-Patches `history.pushState`
- **File**: `frontend/src/components/GoogleAnalytics.jsx`
- **Issue**: Overrides `history.pushState` and `history.replaceState` globally to track SPA page views. GTM is already loaded in `index.html` and handles this automatically.
- **Impact**: Duplicate page view tracking, potential React Router interference.
- **Fix**: Remove the manual history patching; rely on GTM's built-in SPA tracking.

### 19. Duplicate Analytics: GTM in HTML + GA4 in React Component
- **Files**: `index.html` (GTM `GTM-T7LL6RXV`), `GoogleAnalytics.jsx` (GA4 `G-RL5LEWV0H7`)
- **Issue**: Two separate analytics scripts loaded — Google Tag Manager in HTML head (synchronous) and GA4 tag in React component.
- **Impact**: Double network overhead, double JavaScript execution for analytics.
- **Fix**: Consolidate into GTM only (which can load GA4 internally).

### 20. Facebook Pixel Loaded Synchronously in `<head>`
- **File**: `frontend/index.html` (lines 155–167)
- **Issue**: Meta Pixel script runs synchronously in `<head>` before page content.
- **Impact**: Blocks HTML parsing during the critical rendering path.
- **Fix**: Defer loading or move to end of `<body>`.

---

## MEDIUM Severity Issues

### 21. `OptimizedImage` Only Generates 400px-Wide srcSet
- **File**: `frontend/src/utils/imageLoader.js`
- **Issue**: The "CONSERVATIVE STRATEGY" generates AVIF/WebP srcsets only at `400w`. The `generateSizes()` returns `'400px'`.
- **Impact**: All images load at 400px regardless of viewport, looking blurry on desktop and retina displays.
- **Fix**: Generate multiple breakpoints (400w, 800w, 1200w).

### 22. `OptimizedImage` Recreates IntersectionObserver Every Render
- **File**: `frontend/src/components/OptimizedImage.jsx`
- **Issue**: `useEffect` dependencies include `avifSrcSet` and `sizesAttr` which are computed on every render (not memoized). The `IntersectionObserver` is created, observed, and torn down on each render.
- **Impact**: Unnecessary garbage collection pressure and observer churn.
- **Fix**: Memoize the computed srcset values with `useMemo`.

### 23. `WatermarkedImage` Renders 3 Overlay Layers Per Image
- **File**: `frontend/src/components/WatermarkedImage.jsx`
- **Issue**: Each image gets a logo overlay, a WhatsApp number overlay, AND a diagonal text overlay — all absolute-positioned `<div>` elements.
- **Impact**: In product grids, this adds dozens of extra DOM elements, increasing paint time.

### 24. `ProductPage.jsx` Adds 4 Watermark Layers Per Product Image
- **File**: `frontend/src/pages/ProductPage.jsx`
- **Issue**: The inline `SimpleImage` component adds logo (top-left), text (bottom-right), AND center diagonal watermarks as absolute-positioned divs.
- **Impact**: Each product card has 4 extra DOM elements for watermarking. Multiplied across grid listings.

### 25. Product Detail Gallery Uses Unoptimized Images
- **File**: `frontend/src/components/ImageGalleryMagnifier.jsx`
- **Issue**: Uses raw `<img>` tags and `WatermarkedImage` instead of `OptimizedImage`. No AVIF/WebP support, no responsive srcset.
- **Impact**: Product detail page serves original-size images without format optimization.

### 26. Image Magnifier Loads Full-Size Image as CSS Background
- **File**: `frontend/src/components/ProductDetail.jsx`
- **Issue**: Magnifier lens uses `backgroundImage: url(...)` with `backgroundSize: '250%'`, loading the full-resolution image for zoom.
- **Impact**: Doubles memory usage per product image on the detail page.

### 27. Navbar Renders All 23 Category Links Permanently
- **File**: `frontend/src/components/Navbar.jsx`
- **Issue**: Desktop categories bar renders all 23 `NavLink` components in flex wrap, always visible. Each checks `isActive` on every route change.
- **Impact**: 23 React Router link comparisons on every navigation. Hardcoded category list duplicated across files.

### 28. Popup Banner Preloads Large Image After 8 Seconds
- **File**: `frontend/src/App.jsx`
- **Issue**: After 8 seconds, creates a `new Image()` to preload the popup banner image, then shows it with 10-second auto-dismiss.
- **Impact**: Competes with above-the-fold resources if user is still on a slow connection.

### 29. Carousel Renders All 13 Slide Images Simultaneously
- **File**: `frontend/src/components/TaxilaToursShowcase.jsx`
- **Issue**: All 13 tour images are rendered with `opacity-0/100` toggling. Each has a `<picture>` element with AVIF and WebP sources (39 potential requests).
- **Impact**: All 13 images load regardless of which slide is visible. `loading="lazy"` doesn't help because all are in viewport (absolute positioned).

### 30. Admin ProductList Uses Scroll Event for Infinite Scroll
- **File**: `frontend/src/pages/ProductList.jsx`
- **Issue**: Uses `window.addEventListener('scroll', handleScroll)` instead of `IntersectionObserver`.
- **Impact**: Scroll event fires dozens of times per second, causing layout recalculations and jank.

### 31. Duplicate CSS Animation Keyframes Across 3 Files
- **Files**: `animations.css`, `navbar.css`, `index.css`
- **Issue**: `fadeIn`, `fadeInUp`, `scaleIn`, `slideUp`, `slideDown` keyframes are defined in all three CSS files with slightly different values.
- **Impact**: CSS bloat, conflicting animation definitions.

### 32. Navbar CSS Applies Transition to ALL Children
- **File**: `frontend/src/styles/navbar.css`
- **Issue**: `.navbar * { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }` applies a transition to **every element** inside the navbar.
- **Impact**: Forces composite layer creation for all child elements, causing paint storms on any state change.

### 33. Print Media Query Hides All Images
- **File**: `frontend/src/index.css`
- **Issue**: `@media print { img { display: none !important; } }` prevents any image from appearing when users print pages.
- **Impact**: Users cannot print product pages at all. Hurts usability.

### 34. `AllProductsPage.jsx` is 1098 Lines With Inline Sub-Components
- **File**: `frontend/src/pages/AllProductsPage.jsx`
- **Issue**: Contains `DecorativePattern`, `DecorativeBorder`, `SearchBar`, `WhatsAppButton`, `ProductCardSkeleton`, `ImageViewer` — all defined inline inside the file.
- **Impact**: None of these can be memoized or tree-shaken. Every re-render recreates all component function definitions. Shared components (`SearchBar`, `WhatsAppButton`) are duplicated across files.

### 35. `usePrefetch` Hook Creates Invalid Prefetch URLs
- **File**: `frontend/src/hooks/usePrefetch.js`
- **Issue**: Prefetches routes like `/product/:id` and `/category/:name` as literal URLs with colons, which are invalid paths.
- **Impact**: Creates broken `<link rel="prefetch">` tags that waste browser resources trying to fetch 404 URLs.

### 36. 70+ Unoptimized Images in `public/GandharaImages/`
- **Directory**: `frontend/public/GandharaImages/`
- **Issue**: 70+ `.webp` and `.png` files served directly without responsive variants, CDN headers, or optimization pipeline.
- **Impact**: No responsive serving — same image served to mobile and desktop.

### 37. 5 Raw MP4 Videos in `public/ProductVideos/`
- **Directory**: `frontend/public/ProductVideos/`
- **Issue**: 5 uncompressed MP4 files with no WebM/VP9 alternatives, no adaptive bitrate.
- **Impact**: Videos are likely the largest assets on the site (combined 50–200 MB).

---

## LOW Severity Issues

### 38. `compression` Package in Frontend `package.json`
- **Issue**: `compression` is Express middleware, installed in the frontend package. Does nothing in a browser app.

### 39. Duplicate Scroll Packages: `react-scroll` + `reactscroll`
- **Issue**: Both `react-scroll` (v1.9.3) and `reactscroll` (v0.0.1) installed. Only one is needed.

### 40. Two Image Gallery Libraries Installed
- **Issue**: Both `react-image-gallery` and `yet-another-react-lightbox` are installed. Only one should be used.

### 41. Footer Shows Wrong Copyright Year
- **Issue**: `{new Date().getFullYear() - 10}` shows 2016 instead of current year.

### 42. Performance Monitoring Sends to Non-Existent API Endpoint
- **File**: `frontend/src/utils/performanceMonitoring.js`
- **Issue**: In production, sends `POST /api/analytics/vitals` for every web vital event. This endpoint doesn't exist on the backend.

### 43. Image Performance Monitor Runs `setInterval` Every 30 Seconds
- **File**: `frontend/src/utils/imagePerformanceMonitor.js`
- **Issue**: While `console.log` is stripped by terser, the `setInterval` and metric collection logic still runs.

### 44. Unused `BrowserRouter` Import in `main.jsx`
- **Issue**: `BrowserRouter` is imported in `main.jsx` but unused (Router is used in `App.jsx`).

### 45. `AnimatedProductShowcase` Animation Cleanup Issue
- **Issue**: `animate()` calls on refs can fire after component unmount, causing potential memory leaks.

### 46. Swiper CSS Loaded Eagerly on Home Page
- **File**: `frontend/src/components/VisualTestimonials.jsx`
- **Issue**: 4 Swiper CSS files imported at component level. Since this component is eagerly loaded on Home, all Swiper CSS is in the initial bundle.

### 47. Backup Files in `src/pages/` Directory
- **Files**: `AllProductsPage.jsx.backup`, `ProductPage.jsx.backup`, multiple other `.backup` files
- **Issue**: Backup files exist alongside active source files. May inflate source maps.

### 48. `vite-plugin-pwa` Installed But Not Used
- **Issue**: Listed in `package.json` but not added to vite.config.js plugins array.

### 49. Service Worker Not Integrated With Build Pipeline
- **Issue**: `sw.js` is manually placed in `public/` and registered in `main.jsx`. Not integrated with Vite's content hashing, so it may cache stale assets after deployments.

### 50. Backend API Responses Missing HTTP Cache Headers on Some Routes
- **Issue**: Not all controllers set `Cache-Control` or `ETag` headers. The `apiCacheMiddleware` handles in-memory caching but not HTTP-level caching for the browser.

---

## Top 5 Fixes for Maximum Impact

| Priority | Fix | Expected Impact |
|----------|-----|-----------------|
| 1 | Change hero video to `preload="none"` and lazy-load all other videos with `IntersectionObserver` | **-30-50% initial page weight**, massive LCP improvement |
| 2 | Remove 2 of 3 image protection layers; move remaining one to `defer` script at end of `<body>` | **-200ms+ FCP improvement**, reduced CPU overhead |
| 3 | Lazy-load all below-the-fold Home page sections with `React.lazy()` | **-40-60% initial JS bundle**, faster TTI |
| 4 | Implement server-side search API instead of fetching all products client-side | **-80% payload** on search page, instant perceived search |
| 5 | Migrate all data fetching to React Query; deduplicate `/api/masters` calls | **-30-50% API calls**, instant navigation with cached data |

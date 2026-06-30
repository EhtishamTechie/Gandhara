import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { XMarkIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import { useCategoryTree } from '../hooks/useApi';
import './CategorySidebar.css';

/**
 * CategorySidebar (Section 3 — v2 "always docked + translucent")
 * -------------------------------------------------------------
 * Behaviour as of this revision:
 *
 *   DESKTOP (>= 1024px)
 *     - Panel is ALWAYS visible on the right, docked at 260px wide.
 *     - There is NO collapsed tab and NO close button — the sidebar
 *       is a permanent layout element. Page content (<main>/<footer>)
 *       is pushed left by the layout via `.has-right-sidebar` in
 *       App.jsx to prevent overlap.
 *     - The panel uses a solid themed dark palette (navbar-navy ->
 *       sidebar-deep vertical gradient) with a subtle gold hairline
 *       on the left edge so it reads as a deliberate extension of
 *       the site chrome, not a washed-out overlay.
 *     - Every parent category is EXPANDED by default. Users can click
 *       the ► arrow on an individual parent to collapse just that
 *       branch. Their per-parent collapse choices persist in
 *       localStorage under `gandhara.sidebar.collapsed` (JSON array
 *       of parent slugs the user has explicitly closed).
 *
 *   MOBILE (< 1024px)
 *     - Behaviour unchanged from v1: gold "☰ Categories" tab, opens
 *       into a full-height right-side overlay with a dark backdrop.
 *     - Always starts CLOSED on mobile (not persisted).
 *
 * Admin control (server-side):
 *   - Parent visibility  -> SidebarSettings.overrides[].showInSidebar
 *   - Subcategory visibility -> Subcategory.isVisible
 *   - Both are already honored by the category-tree API response.
 *   - Admin UI to toggle these arrives in Section 7.
 */

const DESKTOP_MQ = '(min-width: 1024px)';
const LS_EXPANDED_KEY = 'gandhara.sidebar.expanded';

const readExpandedSet = () => {
  try {
    const raw = localStorage.getItem(LS_EXPANDED_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
};

const CategorySidebar = () => {
  const { data, isLoading, isError } = useCategoryTree();
  const tree = data?.tree || [];

  const location = useLocation();
  const navigate = useNavigate();

  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined'
      ? window.matchMedia(DESKTOP_MQ).matches
      : true
  );

  // Mobile-only: is the overlay open?
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Per-parent expanded set (persisted). Absence = collapsed (default).
  const [expandedSet, setExpandedSet] = useState(readExpandedSet);

  const [search, setSearch] = useState('');
  const searchInputRef = useRef(null);

  // ---- responsive: track desktop vs mobile ----
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia(DESKTOP_MQ);
    const onChange = (e) => {
      setIsDesktop(e.matches);
      if (e.matches) setIsMobileOpen(false); // close overlay if user resizes up
    };
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  // ---- persist the expanded set ----
  const writeExpanded = (set) => {
    try {
      localStorage.setItem(LS_EXPANDED_KEY, JSON.stringify(Array.from(set)));
    } catch { /* ignore quota */ }
  };

  const toggleExpand = (parentSlug) => {
    setExpandedSet((prev) => {
      const next = new Set(prev);
      if (next.has(parentSlug)) next.delete(parentSlug);
      else next.add(parentSlug);
      writeExpanded(next);
      return next;
    });
  };

  // ---- derive the active parent/sub slug from the current URL ----
  const { activeParentSlug, activeSubSlug } = useMemo(() => {
    const match = location.pathname.match(/^\/category\/([^/]+)/i);
    if (!match) return { activeParentSlug: null, activeSubSlug: null };
    const parentSlug = decodeURIComponent(match[1]).toLowerCase();
    const params = new URLSearchParams(location.search);
    const subSlug = (params.get('sub') || '').toLowerCase() || null;
    return { activeParentSlug: parentSlug, activeSubSlug: subSlug };
  }, [location.pathname, location.search]);

  // If the user navigates to a category that is collapsed, force it
  // open so the active item is visible.
  useEffect(() => {
    if (!activeParentSlug) return;
    setExpandedSet((prev) => {
      if (prev.has(activeParentSlug)) return prev;
      const next = new Set(prev);
      next.add(activeParentSlug);
      writeExpanded(next);
      return next;
    });
  }, [activeParentSlug]);

  // ---- filtered tree (real-time client-side search) ----
  const filteredTree = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tree.map((p) => ({ ...p, __matches: true }));

    return tree.map((parent) => {
      const parentHit = parent.name.toLowerCase().includes(q);
      const matchingChildren = (parent.children || []).filter((c) =>
        c.name.toLowerCase().includes(q)
      );
      const childHit = matchingChildren.length > 0;

      return {
        ...parent,
        __matches: parentHit || childHit,
        children: parentHit ? parent.children : matchingChildren
      };
    });
  }, [tree, search]);

  const isSearching = search.trim().length > 0;

  // Close mobile overlay on route change
  useEffect(() => {
    if (!isDesktop) setIsMobileOpen(false);
  }, [location.pathname, location.search, isDesktop]);

  // Close mobile overlay on Escape
  useEffect(() => {
    if (!isMobileOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setIsMobileOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMobileOpen]);

  // Lock body scroll while mobile overlay is open
  useEffect(() => {
    if (isDesktop) return;
    document.body.style.overflow = isMobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileOpen, isDesktop]);

  // ---- handlers ----
  const openMobile = () => setIsMobileOpen(true);
  const closeMobile = () => setIsMobileOpen(false);

  const navigateToParent = (parent) => {
    navigate(`/category/${parent.slug}`);
    if (!isDesktop) closeMobile();
  };

  const navigateToChild = (parent, child) => {
    navigate(`/category/${parent.slug}?sub=${child.slug}`);
    if (!isDesktop) closeMobile();
  };

  // Whether the panel should be rendered visible.
  // Desktop: always visible.  Mobile: only when overlay opened.
  const panelVisible = isDesktop || isMobileOpen;

  return (
    <div
      className={
        `cat-sidebar-host${!isDesktop && isMobileOpen ? ' cat-sidebar-host--overlay-open' : ''}`
      }
      aria-label="Category navigation"
    >
      {/* Mobile backdrop — clicking it closes the overlay */}
      {!isDesktop && (
        <div
          className={`cat-sidebar-backdrop ${isMobileOpen ? 'is-visible' : ''}`}
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* Collapsed "☰ Categories" tab — mobile only (desktop is always docked) */}
      {!isDesktop && !isMobileOpen && (
        <button
          type="button"
          className="cat-sidebar-tab"
          onClick={openMobile}
          aria-label="Open categories"
          aria-expanded={isMobileOpen}
        >
          <span className="cat-sidebar-tab-label">☰ Categories</span>
        </button>
      )}

      {/* Expanded panel */}
      <aside
        className={
          `cat-sidebar-panel ` +
          `${isDesktop ? 'is-docked' : ''} ` +
          `${panelVisible ? 'is-open' : ''}`
        }
        aria-hidden={!panelVisible}
      >
        <div className="cat-sidebar-header">
          <span className="cat-sidebar-header-title">Categories</span>

          {/* Close button mobile only */}
          {!isDesktop && (
            <button
              type="button"
              className="cat-sidebar-close"
              onClick={closeMobile}
              aria-label="Close categories"
            >
              <XMarkIcon className="cat-sidebar-close-icon" aria-hidden />
              <span className="sr-only">Close</span>
            </button>
          )}
        </div>

        <div className="cat-sidebar-search">
          <input
            ref={searchInputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="cat-sidebar-search-input"
            aria-label="Filter categories"
          />
          {search && (
            <button
              type="button"
              className="cat-sidebar-search-clear"
              onClick={() => { setSearch(''); searchInputRef.current?.focus(); }}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <nav className="cat-sidebar-list" aria-label="Category list">
          {isLoading && (
            <p className="cat-sidebar-status">Loading categories…</p>
          )}
          {isError && (
            <p className="cat-sidebar-status">Failed to load categories.</p>
          )}
          {!isLoading && !isError && filteredTree.length === 0 && (
            <p className="cat-sidebar-status">No categories found.</p>
          )}

          {filteredTree.map((parent) => {
            const hasChildren = (parent.children?.length || 0) > 0;
            const isParentActive = activeParentSlug === parent.slug;

            // Default = collapsed.  User-expanded = in expandedSet.
            // While searching, ALWAYS show children so results are visible.
            const isExpanded = isSearching ? true : expandedSet.has(parent.slug);

            return (
              <div
                key={parent.slug}
                className={`cat-sidebar-item ${parent.__matches === false ? 'is-hidden' : ''}`}
              >
                <div className={`cat-sidebar-parent ${isParentActive ? 'is-active' : ''}`}>
                  <Link
                    to={`/category/${parent.slug}`}
                    className="cat-sidebar-parent-link"
                    onClick={(e) => {
                      e.preventDefault();
                      navigateToParent(parent);
                    }}
                  >
                    {parent.name}
                  </Link>

                  {hasChildren && (
                    <button
                      type="button"
                      className={`cat-sidebar-toggle ${isExpanded ? 'is-expanded' : ''}`}
                      aria-label={isExpanded
                        ? `Collapse ${parent.name}`
                        : `Expand ${parent.name}`}
                      aria-expanded={isExpanded}
                      onClick={() => toggleExpand(parent.slug)}
                      disabled={isSearching}
                      title={isSearching ? 'Clear search to expand branches' : undefined}
                    >
                      <ChevronRightIcon className="cat-sidebar-toggle-icon" aria-hidden />
                    </button>
                  )}
                </div>

                {hasChildren && (
                  <div className={`cat-sidebar-children ${isExpanded ? 'is-open' : ''}`}>
                    {parent.children.map((child) => {
                      const isChildActive =
                        isParentActive && activeSubSlug === child.slug;
                      return (
                        <Link
                          key={child._id || child.slug}
                          to={`/category/${parent.slug}?sub=${child.slug}`}
                          className={`cat-sidebar-child-link ${isChildActive ? 'is-active' : ''}`}
                          onClick={(e) => {
                            e.preventDefault();
                            navigateToChild(parent, child);
                          }}
                        >
                          {child.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </div>
  );
};

export default CategorySidebar;

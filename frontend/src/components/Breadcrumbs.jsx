import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Breadcrumb Navigation Component with Schema.org structured data
 * 
 * @param {Array} items - Array of breadcrumb items
 * @param {string} items[].name - Display name for the breadcrumb
 * @param {string} items[].url - URL path for the breadcrumb (optional for last item)
 * 
 * Example usage:
 * <Breadcrumbs items={[
 *   { name: 'Home', url: '/' },
 *   { name: 'Products', url: '/products' },
 *   { name: 'Buddha Statues', url: '/category/buddha-statues' },
 *   { name: 'Product Name' } // No URL for current page
 * ]} />
 */
const Breadcrumbs = ({ items = [] }) => {
  // Always include Home as first item if not present
  const breadcrumbItems = items[0]?.name === 'Home' 
    ? items 
    : [{ name: 'Home', url: '/' }, ...items];

  // Generate Schema.org BreadcrumbList structured data
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      ...(item.url && { "item": `${window.location.origin}${item.url}` })
    }))
  };

  return (
    <>
      {/* Schema.org Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>

      {/* Visual Breadcrumb Navigation */}
      <nav 
        aria-label="Breadcrumb" 
        className="flex items-center space-x-2 text-sm mb-6 overflow-x-auto whitespace-nowrap scrollbar-hide"
      >
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          const isHome = index === 0;

          return (
            <React.Fragment key={index}>
              {/* Breadcrumb Item */}
              {item.url && !isLast ? (
                <Link
                  to={item.url}
                  className="flex items-center gap-1 text-[#94A3B8] hover:text-[#F1C27D] transition-colors duration-200"
                  aria-label={`Go to ${item.name}`}
                >
                  {isHome && <Home size={14} className="flex-shrink-0" />}
                  <span>{item.name}</span>
                </Link>
              ) : (
                <span 
                  className={`flex items-center gap-1 ${
                    isLast 
                      ? 'text-[#F1C27D] font-medium' 
                      : 'text-[#94A3B8]'
                  }`}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {isHome && <Home size={14} className="flex-shrink-0" />}
                  <span className="truncate max-w-[200px] sm:max-w-none">{item.name}</span>
                </span>
              )}

              {/* Separator */}
              {!isLast && (
                <ChevronRight 
                  size={14} 
                  className="text-[#64748B] flex-shrink-0" 
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          );
        })}
      </nav>
    </>
  );
};

export default Breadcrumbs;

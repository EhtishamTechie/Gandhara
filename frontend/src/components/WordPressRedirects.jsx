import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const WordPressRedirects = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    console.log('WordPressRedirects - Checking path:', path);

    // Only handle old WordPress category URLs (product-category/*)
    // Product URLs will now be handled by React Router normally
    if (path.startsWith('/product-category/')) {
      const categorySlug = path.replace('/product-category/', '').replace(/\/$/, '');
      console.log('→ Redirecting category to:', `/category/${categorySlug}`);
      navigate(`/category/${categorySlug}`, { replace: true });
      return;
    }

  }, [location.pathname, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-stone-50">
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
        <p className="text-stone-600 mb-2">Finding the right products for you...</p>
        <p className="text-sm text-stone-500">Redirecting from old page</p>
      </div>
    </div>
  );
};

export default WordPressRedirects;

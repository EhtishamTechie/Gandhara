import { useState, useEffect } from 'react';
import { getImageUrl } from "../utils/imageHelper.js";
import { 
  ShoppingBagIcon, 
  MapPinIcon, 
  EyeIcon, 
  CurrencyDollarIcon,
  ChartBarIcon,
  PlusIcon
} from '@heroicons/react/20/solid';

// Get API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL;

const DashboardHome = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalPlaces: 0,
    recentProducts: [],
    recentPlaces: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch products
      const productsResponse = await fetch(`${API_BASE_URL}/products/all`);
      let products = [];
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        products = Array.isArray(productsData) ? productsData : [];
      }
      
      // Fetch places
      const placesResponse = await fetch(`${API_BASE_URL}/visit-places/all`);
      let places = [];
      if (placesResponse.ok) {
        const placesData = await placesResponse.json();
        places = Array.isArray(placesData) ? placesData : [];
      }
      
      setStats({
        totalProducts: products.length,
        totalPlaces: places.length,
        recentProducts: products.slice(0, 5),
        recentPlaces: places.slice(0, 5)
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats({
        totalProducts: 0,
        totalPlaces: 0,
        recentProducts: [],
        recentPlaces: []
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Total Products',
      value: stats.totalProducts,
      icon: ShoppingBagIcon,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      name: 'Tour Places',
      value: stats.totalPlaces,
      icon: MapPinIcon,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      name: 'Categories',
      value: '21+',
      icon: EyeIcon,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    {
      name: 'Active Status',
      value: 'Live',
      icon: ChartBarIcon,
      color: 'bg-teal-500',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-700'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome to Admin Dashboard</h1>
        <p className="text-teal-100">Manage your Gandhara Arts & Taxila Stone Crafts inventory and tour places</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className={`${stat.bgColor} rounded-lg p-6 border border-stone-200`}>
            <div className="flex items-center">
              <div className={`${stat.color} rounded-lg p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-stone-600">{stat.name}</p>
                <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Items Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Products */}
        <div className="bg-white rounded-lg shadow-md border border-stone-200">
          <div className="px-6 py-4 border-b border-stone-200">
            <h3 className="text-lg font-semibold text-stone-900 flex items-center">
              <ShoppingBagIcon className="h-5 w-5 mr-2 text-blue-600" />
              Recent Products
            </h3>
          </div>
          <div className="p-6">
            {stats.recentProducts.length > 0 ? (
              <div className="space-y-4">
                {stats.recentProducts.map((product) => (
                  <div key={product._id} className="flex items-center space-x-3 p-3 hover:bg-stone-50 rounded-lg transition-colors">
                    <img
                      src={getImageUrl(product.image)}
                      alt={product.title}
                      className="h-12 w-12 rounded-lg object-cover"
                      onError={(e) => { e.target.src='/GandharaImages/Gandharalogo.webp' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-900 truncate">{product.title}</p>
                      <p className="text-sm text-teal-600 font-medium">${product.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <ShoppingBagIcon className="mx-auto h-12 w-12 text-stone-400" />
                <p className="mt-2 text-sm text-stone-500">No products yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Places */}
        <div className="bg-white rounded-lg shadow-md border border-stone-200">
          <div className="px-6 py-4 border-b border-stone-200">
            <h3 className="text-lg font-semibold text-stone-900 flex items-center">
              <MapPinIcon className="h-5 w-5 mr-2 text-green-600" />
              Recent Tour Places
            </h3>
          </div>
          <div className="p-6">
            {stats.recentPlaces.length > 0 ? (
              <div className="space-y-4">
                {stats.recentPlaces.map((place) => (
                  <div key={place._id} className="flex items-center space-x-3 p-3 hover:bg-stone-50 rounded-lg transition-colors">
                    <img
                      src={getImageUrl(place.image)}
                      alt={place.name}
                      className="h-12 w-12 rounded-lg object-cover"
                      onError={(e) => { e.target.src='/GandharaImages/Gandharalogo.webp' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-900 truncate">{place.name}</p>
                      {place.tourCategory && (
                        <span className="inline-block text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          {place.tourCategory}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <MapPinIcon className="mx-auto h-12 w-12 text-stone-400" />
                <p className="mt-2 text-sm text-stone-500">No tour places yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md border border-stone-200 p-6">
        <h3 className="text-lg font-semibold text-stone-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center justify-center px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Product
          </button>
          <button className="flex items-center justify-center px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Tour Place
          </button>
          <button className="flex items-center justify-center px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
            <ShoppingBagIcon className="h-5 w-5 mr-2" />
            View Products
          </button>
          <button className="flex items-center justify-center px-4 py-3 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors">
            <MapPinIcon className="h-5 w-5 mr-2" />
            View Places
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;

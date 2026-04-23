import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  PlusIcon, 
  ListBulletIcon, 
  MapPinIcon, 
  ShoppingBagIcon,
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  UserGroupIcon,
  QueueListIcon,
  ArrowLeftIcon,
  PhotoIcon,
  RectangleStackIcon,
  SwatchIcon,
  EnvelopeIcon
} from '@heroicons/react/20/solid';

// Import components
import AddProduct from './AddProduct';
import ProductList from './ProductList';
import AddPlace from './AddPlace';
import PlacesList from './PlacesList';
import AddMaster from './AddMaster';
import MastersList from './MastersList';
import DashboardHome from './DashboardHome';
import CategoryOrderManager from './CategoryOrderManager';
import SiteMediaManager from './SiteMediaManager';
import SidebarCategoriesManager from './SidebarCategoriesManager';
import ThemeSettingsManager from './ThemeSettingsManager';
import TourInquiriesManager from './TourInquiriesManager';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const navigation = [
    { 
      id: 'dashboard', 
      name: 'Dashboard', 
      icon: HomeIcon, 
      description: 'Overview & Analytics' 
    },
    { 
      id: 'add-product', 
      name: 'Add Product', 
      icon: PlusIcon, 
      description: 'Create new products' 
    },
    { 
      id: 'product-list', 
      name: 'Products List', 
      icon: ShoppingBagIcon, 
      description: 'Manage existing products' 
    },
    { 
      id: 'category-order', 
      name: 'Category Order', 
      icon: QueueListIcon, 
      description: 'Reorder categories display' 
    },
    {
      id: 'site-media',
      name: 'Site Media',
      icon: PhotoIcon,
      description: 'Hero, tours, gallery & videos'
    },
    {
      id: 'sidebar-categories',
      name: 'Sidebar Categories',
      icon: RectangleStackIcon,
      description: 'Show/hide & reorder sidebar items'
    },
    {
      id: 'theme-settings',
      name: 'Theme Settings',
      icon: SwatchIcon,
      description: 'Colors & palette overrides'
    },
    {
      id: 'tour-inquiries',
      name: 'Tour Inquiries',
      icon: EnvelopeIcon,
      description: 'Private booking links & requests'
    },
    { 
      id: 'add-place', 
      name: 'Add Tour/Place', 
      icon: MapPinIcon, 
      description: 'Create new tour places' 
    },
    { 
      id: 'places-list', 
      name: 'Places List', 
      icon: ListBulletIcon, 
      description: 'Manage tour places' 
    },
    { 
      id: 'add-master', 
      name: 'Add Master', 
      icon: UserGroupIcon, 
      description: 'Add craftsmen masters' 
    },
    { 
      id: 'masters-list', 
      name: 'Masters List', 
      icon: UserGroupIcon, 
      description: 'Manage masters' 
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardHome onNavigateTab={setActiveTab} />;
      case 'add-product':
        return <AddProduct />;
      case 'product-list':
        return <ProductList />;
      case 'category-order':
        return <CategoryOrderManager />;
      case 'site-media':
        return <SiteMediaManager />;
      case 'sidebar-categories':
        return <SidebarCategoriesManager />;
      case 'theme-settings':
        return <ThemeSettingsManager />;
      case 'tour-inquiries':
        return <TourInquiriesManager />;
      case 'add-place':
        return <AddPlace />;
      case 'places-list':
        return <PlacesList />;
      case 'add-master':
        return <AddMaster />;
      case 'masters-list':
        return <MastersList />;
      default:
        return <DashboardHome onNavigateTab={setActiveTab} />;
    }
  };

  const getPageTitle = () => {
    const currentNav = navigation.find(nav => nav.id === activeTab);
    return currentNav ? currentNav.name : 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-stone-600 bg-opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-teal-600 to-teal-700 shrink-0">
          <h1 className="text-lg font-bold text-white">Admin Panel</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-teal-200 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-4 space-y-1.5 flex-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-teal-100 text-teal-900 shadow-sm'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <item.icon 
                  className={`h-5 w-5 mr-3 transition-colors ${
                    isActive ? 'text-teal-600' : 'text-stone-400 group-hover:text-stone-600'
                  }`} 
                />
                <div className="flex-1">
                  <div className={`text-sm font-medium ${isActive ? 'text-teal-900' : ''}`}>
                    {item.name}
                  </div>
                  <div className={`text-xs ${isActive ? 'text-teal-700' : 'text-stone-500'}`}>
                    {item.description}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="shrink-0 p-4 border-t border-stone-200 space-y-3">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Website
          </button>
          <div className="text-xs text-stone-500 text-center">
            Gandhara Arts & Taxila Stone Crafts
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 min-h-screen">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex h-16 items-center gap-x-4 border-b border-stone-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-stone-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          {/* Separator */}
          <div className="h-6 w-px bg-stone-200 lg:hidden" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <h2 className="text-xl font-semibold text-stone-900">{getPageTitle()}</h2>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPage;

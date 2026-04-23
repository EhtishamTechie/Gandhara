import { useState } from "react";
import { 
  PlusIcon, 
  ListBulletIcon, 
  MapPinIcon, 
  ShoppingBagIcon,
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  UserGroupIcon
} from '@heroicons/react/20/solid';

// Import components
import AddProduct from './AddProduct';
import ProductList from './ProductList';
import AddPlace from './AddPlace';
import PlacesList from './PlacesList';
import AddMaster from './AddMaster';
import MastersList from './MastersList';
import DashboardHome from './DashboardHome';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        return <DashboardHome />;
      case 'add-product':
        return <AddProduct />;
      case 'product-list':
        return <ProductList />;
      case 'add-place':
        return <AddPlace />;
      case 'places-list':
        return <PlacesList />;
      case 'add-master':
        return <AddMaster />;
      case 'masters-list':
        return <MastersList />;
      default:
        return <DashboardHome />;
    }
  };

  const getPageTitle = () => {
    const currentNav = navigation.find(nav => nav.id === activeTab);
    return currentNav ? currentNav.name : 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-stone-50">
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
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-teal-600 to-teal-700">
          <h1 className="text-lg font-bold text-white">Admin Panel</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-teal-200 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-4 space-y-2">
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
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-stone-200">
          <div className="text-xs text-stone-500 text-center">
            Gandhara Arts & Taxila Stone Crafts
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
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

          {/* Profile section */}
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-stone-200" />
            <div className="flex items-center gap-x-2">
              <div className="h-8 w-8 rounded-full bg-teal-600 flex items-center justify-center">
                <span className="text-sm font-medium text-white">A</span>
              </div>
              <span className="hidden lg:flex lg:items-center">
                <span className="text-sm font-semibold text-stone-900">Admin</span>
              </span>
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

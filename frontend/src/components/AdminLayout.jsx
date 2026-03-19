import React, { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Squares2X2Icon, 
  UsersIcon, 
  TagIcon, 
  FolderIcon, 
  ExclamationTriangleIcon, 
  Cog6ToothIcon, 
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  MapPinIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { label: 'Dashboard', icon: Squares2X2Icon, path: '/admin' },
    { label: 'Users', icon: UsersIcon, path: '/admin/users' },
    { label: 'Ads Management', icon: TagIcon, path: '/admin/ads' },
    { label: 'Categories', icon: FolderIcon, path: '/admin/categories' },
    { label: 'Cities', icon: MapPinIcon, path: '/admin/cities' },
    { label: 'Reports', icon: ExclamationTriangleIcon, path: '/admin/reports' },
    { label: 'SEO Content', icon: DocumentTextIcon, path: '/admin/seo' },
    { label: 'Settings', icon: Cog6ToothIcon, path: '/admin/settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar for Desktop */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#1a2332] text-white transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-white">M</div>
            <span className="text-xl font-black tracking-tight">MarketX <span className="text-orange-500 text-xs">Admin</span></span>
          </Link>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-6 px-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${location.pathname === item.path 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'}
              `}
            >
              <item.icon className={`w-5 h-5 ${location.pathname === item.path ? 'text-white' : 'group-hover:text-white'}`} />
              <span className="font-semibold text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-8 left-0 w-full px-4">
          <div className="bg-white/5 rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center font-bold text-white">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate">{user?.name || 'Administrator'}</p>
                <p className="text-[10px] text-gray-400 truncate tracking-wider uppercase">Master Access</p>
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-red-500/10 rounded-xl transition-all"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            <span className="font-semibold text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-100 flex items-center justify-between px-6 py-4">
          <button className="md:hidden p-2 text-gray-500" onClick={() => setSidebarOpen(true)}>
            <Bars3Icon className="w-6 h-6" />
          </button>
          
          <div className="flex-1 flex justify-end items-center gap-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest hidden sm:inline">Server Status: <span className="text-green-500 ml-1 italic">Online</span></span>
            <div className="w-px h-6 bg-gray-100 hidden sm:block"></div>
            <Link to="/" className="text-sm font-bold text-orange-500 hover:underline">View Website</Link>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Overlay for Mobile Sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}

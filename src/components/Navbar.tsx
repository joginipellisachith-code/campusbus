import React from 'react';
import { useAuth } from '../AuthContext';
import { auth } from '../firebase';
import { BusFront, LogOut, User as UserIcon, LayoutDashboard, Ticket } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function Navbar() {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: 'Available Buses', path: '/', icon: BusFront },
    { label: 'My Bookings', path: '/bookings', icon: Ticket },
  ];

  if (isAdmin) {
    navItems.push({ label: 'Admin Panel', path: '/admin', icon: LayoutDashboard });
  }

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <BusFront className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-slate-900 hidden sm:block">CampusRide</span>
            </Link>
            
            <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    location.pathname === item.path
                      ? "text-blue-600 bg-blue-50"
                      : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                  )}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-700">
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-slate-500" />
              </div>
              <span className="text-sm font-medium hidden md:block">{user?.name}</span>
            </div>
            
            <button
              onClick={() => auth.signOut()}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

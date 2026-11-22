import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { chatService } from '../services/chatService';
import { NotificationBell } from './NotificationBell';
import { Sparkles, Menu, X, User, LogOut, PlusCircle, Compass, LayoutDashboard, Briefcase, Users, MessageSquare } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, role, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const checkUnread = async () => {
      try {
        const threads = await chatService.getThreads();
        const total = threads.reduce((acc, t) => acc + (t.unreadCount || 0), 0);
        setUnreadCount(total);
      } catch {
        // silent fail on network blip
      }
    };

    checkUnread();
    const interval = setInterval(checkUnread, 8000);
    return () => clearInterval(interval);
  }, [user, location.pathname]);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-brand-900 bg-clip-text text-transparent">
                Creator<span className="text-brand-600">Hub</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:ml-8 md:flex md:space-x-1">
              {!user && (
                <>
                  <Link
                    to="/explore"
                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/explore') ? 'text-brand-600 bg-brand-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Compass className="w-4 h-4 mr-1.5" />
                    Explore Collabs
                  </Link>
                  <Link
                    to="/creators"
                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/creators') ? 'text-brand-600 bg-brand-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Users className="w-4 h-4 mr-1.5" />
                    Find Creators
                  </Link>
                </>
              )}

              {role === 'CREATOR' && (
                <>
                  <Link
                    to="/creator/dashboard"
                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/creator/dashboard') ? 'text-brand-600 bg-brand-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 mr-1.5" />
                    Dashboard
                  </Link>
                  <Link
                    to="/creator/explore"
                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/creator/explore') ? 'text-brand-600 bg-brand-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Compass className="w-4 h-4 mr-1.5" />
                    Explore Deals
                  </Link>
                  <Link
                    to="/creator/applications"
                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/creator/applications') ? 'text-brand-600 bg-brand-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Briefcase className="w-4 h-4 mr-1.5" />
                    My Applications
                  </Link>
                  <Link
                    to="/messages"
                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/messages') ? 'text-brand-600 bg-brand-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 mr-1.5" />
                    Messages
                    {unreadCount > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white leading-none">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                </>
              )}

              {role === 'MERCHANT' && (
                <>
                  <Link
                    to="/merchant/dashboard"
                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/merchant/dashboard') ? 'text-brand-600 bg-brand-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 mr-1.5" />
                    Dashboard
                  </Link>
                  <Link
                    to="/merchant/campaigns"
                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/merchant/campaigns') ? 'text-brand-600 bg-brand-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Briefcase className="w-4 h-4 mr-1.5" />
                    My Collabs
                  </Link>
                  <Link
                    to="/merchant/campaigns/new"
                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 transition-colors`}
                  >
                    <PlusCircle className="w-4 h-4 mr-1.5" />
                    Post a Collab
                  </Link>
                  <Link
                    to="/merchant/creators"
                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/merchant/creators') ? 'text-brand-600 bg-brand-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Users className="w-4 h-4 mr-1.5" />
                    Creator Directory
                  </Link>
                  <Link
                    to="/messages"
                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/messages') ? 'text-brand-600 bg-brand-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 mr-1.5" />
                    Messages
                    {unreadCount > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white leading-none">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* User Controls / Actions */}
          <div className="hidden md:flex md:items-center md:space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <NotificationBell />

                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  {role === 'CREATOR' ? 'Creator Account' : 'Merchant Brand'}
                </span>
                
                <Link
                  to={role === 'CREATOR' ? '/creator/profile' : '/merchant/profile'}
                  className="flex items-center space-x-2 text-sm font-medium text-slate-700 hover:text-brand-600 p-1.5 rounded-lg hover:bg-slate-50"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                    {user.phone.slice(-4)}
                  </div>
                  <span>Profile</span>
                </Link>

                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm shadow-brand-500/20 transition-all hover:scale-[1.02]"
                >
                  Join CreatorHub
                </Link>
              </div>
            )}
          </div>

          {/* Mobile header controls */}
          <div className="flex items-center space-x-1 md:hidden">
            {user && <NotificationBell />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {!user ? (
            <>
              <Link
                to="/explore"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Explore Collabs
              </Link>
              <Link
                to="/creators"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Find Creators
              </Link>
              <div className="pt-2 border-t border-slate-100 flex flex-col space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-medium text-white bg-brand-600 rounded-lg"
                >
                  Sign Up
                </Link>
              </div>
            </>
          ) : (
            <>
              {role === 'CREATOR' ? (
                <>
                  <Link
                    to="/creator/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/creator/explore"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Explore Deals
                  </Link>
                  <Link
                    to="/creator/applications"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    My Applications
                  </Link>
                  <Link
                    to="/messages"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <span>Messages</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/creator/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Edit Profile
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/merchant/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/merchant/campaigns"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    My Collabs
                  </Link>
                  <Link
                    to="/merchant/campaigns/new"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-brand-600 hover:bg-brand-50"
                  >
                    Post a Collab
                  </Link>
                  <Link
                    to="/merchant/creators"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Creator Directory
                  </Link>
                  <Link
                    to="/messages"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <span>Messages</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/merchant/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Merchant Profile
                  </Link>
                </>
              )}
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-rose-600 rounded-md hover:bg-rose-50"
                >
                  Log Out
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
};


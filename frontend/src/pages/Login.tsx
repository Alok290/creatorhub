import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Phone, Lock, ArrowRight, ShieldCheck, Instagram } from 'lucide-react';
import { InstagramLoginModal } from '../components/InstagramLoginModal';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInstagramModalOpen, setIsInstagramModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) {
      setError('Please enter your phone number and password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(phone, password);
      // Retrieve stored user to determine redirect
      const saved = localStorage.getItem('creatorhub_user');
      const user = saved ? JSON.parse(saved) : null;
      const userRole = user?.role ? String(user.role).replace(/^ROLE_/, '').toUpperCase() : '';
      if (userRole === 'MERCHANT') {
        navigate('/merchant/dashboard');
      } else {
        navigate('/creator/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid phone or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-2">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold text-slate-900">
            Creator<span className="text-brand-600">Hub</span>
          </span>
        </Link>
        <h2 className="mt-6 text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Sign in to manage your creator deals or brand campaigns
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 sm:rounded-2xl border border-slate-100 sm:px-10">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Instagram One-Click Creator Login */}
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setIsInstagramModalOpen(true)}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 shadow-md flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
            >
              <Instagram className="w-4 h-4" />
              <span>Continue with Instagram (Creators)</span>
            </button>
            <div className="relative mt-5 mb-3">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-wider font-semibold text-slate-400"><span className="bg-white px-2">or with phone</span></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-md shadow-brand-500/20 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 transition-all hover:scale-[1.01]"
            >
              {loading ? 'Authenticating...' : (
                <>
                  Sign In <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>

          {/* Brand / Merchant Callout */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col space-y-3">
            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-center">
              <p className="text-xs font-semibold text-indigo-950">
                Are you a Brand or Merchant?
              </p>
              <p className="text-[11px] text-indigo-600 mt-0.5">
                Post collabs, hire creators & track deliverables.
              </p>
              <Link
                to="/register?role=MERCHANT"
                className="mt-2 inline-block px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
              >
                Create Merchant Account
              </Link>
            </div>

            <p className="text-center text-xs text-slate-500">
              New Content Creator?{' '}
              <Link to="/register?role=CREATOR" className="font-semibold text-brand-600 hover:text-brand-700">
                Sign up free
              </Link>
            </p>
          </div>
        </div>
      </div>

      <InstagramLoginModal
        isOpen={isInstagramModalOpen}
        onClose={() => setIsInstagramModalOpen(false)}
      />
    </div>
  );
};


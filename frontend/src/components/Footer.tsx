import React from 'react';
import { Sparkles, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-slate-900">
                Creator<span className="text-brand-600">Hub</span>
              </span>
            </div>
            <p className="mt-4 text-sm text-slate-500 max-w-sm">
              The premier marketplace connecting hyper-local merchants and retail brands with verified creators, driving real offline footfall and online revenue.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">For Creators</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li><Link to="/explore" className="hover:text-brand-600">Explore Open Deals</Link></li>
              <li><Link to="/login" className="hover:text-brand-600">Creator Sign In</Link></li>
              <li><Link to="/register" className="hover:text-brand-600">Creator Registration</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">For Merchants</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li><Link to="/creators" className="hover:text-brand-600">Discover Creators</Link></li>
              <li><Link to="/register" className="hover:text-brand-600">Post a Campaign</Link></li>
              <li><Link to="/login" className="hover:text-brand-600">Brand Portal</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} CreatorHub Technologies Inc. All rights reserved.</p>
          <p className="flex items-center mt-4 sm:mt-0">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 mx-1 fill-rose-500" /> for creators and local business owners.
          </p>
        </div>
      </div>
    </footer>
  );
};


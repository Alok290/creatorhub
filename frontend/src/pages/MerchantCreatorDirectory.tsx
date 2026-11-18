import React, { useEffect, useState } from 'react';
import { CreatorProfile } from '../types';
import { merchantService } from '../services/merchantService';
import { Search, MapPin, Instagram, Youtube, Users, DollarSign, Filter, Sparkles, CheckCircle2 } from 'lucide-react';

const CATEGORIES = ['All', 'Food & Beverage', 'Fitness & Health', 'Tech & Gadgets', 'Fashion & Beauty', 'Travel & Lifestyle'];

export const MerchantCreatorDirectory: React.FC = () => {
  const [creators, setCreators] = useState<CreatorProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [city, setCity] = useState('');
  const [minFollowers, setMinFollowers] = useState<string>('');
  const [search, setSearch] = useState('');

  const fetchCreators = async () => {
    setLoading(true);
    try {
      const cat = selectedCategory !== 'All' ? selectedCategory : undefined;
      const minF = minFollowers ? Number(minFollowers) : undefined;
      const data = await merchantService.searchCreators(cat, city || undefined, minF, search || undefined);
      setCreators(data);
    } catch (err) {
      console.error('Failed to load creators:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreators();
  }, [selectedCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCreators();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Talent Discovery</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Creator Directory</h1>
        <p className="text-sm text-slate-500 mt-1">Find and partner with top creators across India based on location, niche, and audience size.</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search creator name, bio, or niche..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="City (e.g. Mumbai, Bengaluru)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-colors"
          >
            Filter Talent
          </button>
        </form>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Creators Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : creators.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No creators found</h3>
          <p className="text-xs text-slate-400 mt-1">Try broadening your search or selecting another category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {creators.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-brand-200 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={c.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                    alt={c.displayName}
                    className="w-16 h-16 rounded-full object-cover border-2 border-brand-100 shadow-sm"
                  />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{c.displayName}</h3>
                    <p className="text-xs text-slate-400 flex items-center mt-0.5">
                      <MapPin className="w-3 h-3 mr-1" /> {c.city || 'Location flexible'}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-brand-50 text-brand-700 rounded text-[11px] font-semibold">
                      {(c.totalFollowers || 0).toLocaleString()} Total Audience
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4">
                  {c.bio || 'Creator profile available for sponsorship and custom brand deals.'}
                </p>

                {/* Social Breakdown */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                  {c.instagramHandle && (
                    <div className="flex items-center space-x-1 text-slate-700">
                      <Instagram className="w-3.5 h-3.5 text-pink-600" />
                      <span className="truncate">@{c.instagramHandle}</span>
                    </div>
                  )}
                  {c.youtubeHandle && (
                    <div className="flex items-center space-x-1 text-slate-700">
                      <Youtube className="w-3.5 h-3.5 text-red-600" />
                      <span className="truncate">{c.youtubeHandle}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block font-semibold">Base Rate</span>
                  <span className="text-base font-bold text-slate-900">₹{(c.baseRate || 0).toLocaleString()}</span>
                </div>
                <a
                  href={`tel:${c.phone}`}
                  className="px-4 py-2 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 rounded-xl transition-colors"
                >
                  Direct Contact
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


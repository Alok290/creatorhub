import React, { useEffect, useState } from 'react';
import { Campaign } from '../types';
import { campaignService, CampaignFilter } from '../services/campaignService';
import { CategoryTag } from '../components/CategoryTag';
import { ApplyModal } from '../components/ApplyModal';
import { Search, MapPin, DollarSign, Users, Briefcase, Filter, Calendar, Sparkles } from 'lucide-react';

const CATEGORIES = ['All', 'Food & Beverage', 'Fitness & Health', 'Tech & Gadgets', 'Fashion & Beauty', 'Travel & Lifestyle'];

export const CreatorExplore: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [city, setCity] = useState('');
  const [minBudget, setMinBudget] = useState<string>('');
  const [search, setSearch] = useState('');

  // Modal state
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isApplyOpen, setIsApplyOpen] = useState(false);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const filters: CampaignFilter = {};
      if (selectedCategory !== 'All') filters.category = selectedCategory;
      if (city.trim()) filters.city = city.trim();
      if (minBudget) filters.minBudget = Number(minBudget);
      if (search.trim()) filters.search = search.trim();

      const data = await campaignService.exploreCampaigns(filters);
      setCampaigns(data);
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCampaigns();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Marketplace</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Explore Open Brand Collabs</h1>
        <p className="text-sm text-slate-500 mt-1">Discover sponsorships, product launches, and local store tasting collabs.</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by campaign title, keywords, or brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Filter by city (e.g. Mumbai, Bengaluru)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-colors"
          >
            Apply Filters
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

      {/* Campaigns Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-72 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No open collabs found</h3>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria or category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((camp) => (
            <div
              key={camp.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-brand-300 hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                {/* Brand & Category header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={camp.merchantLogoUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=100&q=80'}
                      alt={camp.merchantBrandName}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-100 shadow-sm"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{camp.merchantBrandName}</h4>
                      {camp.targetCity && (
                        <p className="text-[11px] text-slate-400 flex items-center">
                          <MapPin className="w-3 h-3 mr-0.5" /> {camp.targetCity}
                        </p>
                      )}
                    </div>
                  </div>
                  <CategoryTag category={camp.category} />
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2 line-clamp-2">
                  {camp.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4">
                  {camp.description}
                </p>

                {/* Requirements / Deliverables preview */}
                <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs text-slate-600">
                  {camp.deliverables && (
                    <div>
                      <strong className="text-slate-700">Deliverables:</strong> {camp.deliverables}
                    </div>
                  )}
                  <div className="flex justify-between items-center text-[11px] text-slate-500">
                    <span>Min Followers: <strong className="text-slate-700">{(camp.minFollowers || 0).toLocaleString()}</strong></span>
                    <span>Applicants: <strong className="text-slate-700">{camp.applicationCount}</strong></span>
                  </div>
                </div>
              </div>

              {/* Card Footer with Budget and Apply Button */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Compensation</span>
                  <span className="text-lg font-black text-slate-900">₹{camp.budget.toLocaleString()}</span>
                </div>

                <button
                  onClick={() => {
                    setSelectedCampaign(camp);
                    setIsApplyOpen(true);
                  }}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all hover:scale-105"
                >
                  Apply Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Apply Modal */}
      <ApplyModal
        campaign={selectedCampaign}
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        onSuccess={() => {
          fetchCampaigns();
        }}
      />
    </div>
  );
};


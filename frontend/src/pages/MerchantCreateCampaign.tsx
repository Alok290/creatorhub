import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { campaignService, CreateCampaignInput } from '../services/campaignService';
import { CompensationType } from '../types';
import { Sparkles, DollarSign, Users, MapPin, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';

const CATEGORIES = [
  'Food & Beverage',
  'Fitness & Health',
  'Tech & Gadgets',
  'Fashion & Beauty',
  'Travel & Lifestyle',
  'Entertainment & Gaming',
  'Education & Career'
];

export const MerchantCreateCampaign: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<CreateCampaignInput>({
    title: '',
    description: '',
    category: 'Food & Beverage',
    compensationType: 'PAID',
    budget: 15000,
    deliverables: '1 Instagram Reel + 2 Stories with brand location tag',
    minFollowers: 5000,
    targetCity: 'Bengaluru',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      setError('Please provide a campaign title and description.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await campaignService.createCampaign(formData);
      navigate('/merchant/campaigns');
    } catch (err: any) {
      setError(err.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 px-6 py-8 text-white">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">New Opportunity</span>
          <h1 className="text-2xl font-black mt-1">Post a Creator Campaign</h1>
          <p className="text-xs text-white/70 mt-1">Publish your requirements to the marketplace for verified creators to apply.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Campaign Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Winter Menu Tasting & Reel Series"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Category / Industry *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Compensation Model *
              </label>
              <select
                value={formData.compensationType}
                onChange={(e) => setFormData({ ...formData, compensationType: e.target.value as CompensationType })}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="PAID">Paid Fixed Fee</option>
                <option value="BARTER">Product / Experience Barter</option>
                <option value="HYBRID">Hybrid (Gift Kit + Fixed Fee)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Campaign Description & Creative Brief *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Explain the background, key talking points, aesthetic vibe, and what you expect from the collaboration..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Required Deliverables
            </label>
            <input
              type="text"
              placeholder="e.g. 1 Instagram Reel (30-60s), 2 Stories with swipe-up"
              value={formData.deliverables}
              onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Budget / Compensation (₹) *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                  className="w-full pl-8 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Minimum Followers
              </label>
              <input
                type="number"
                min="0"
                value={formData.minFollowers}
                onChange={(e) => setFormData({ ...formData, minFollowers: Number(e.target.value) })}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Target City
              </label>
              <input
                type="text"
                placeholder="e.g. Mumbai, Pan-India"
                value={formData.targetCity}
                onChange={(e) => setFormData({ ...formData, targetCity: e.target.value })}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/merchant/campaigns')}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-2.5 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-500/20 disabled:opacity-50 transition-all hover:scale-[1.01]"
            >
              {loading ? 'Publishing...' : (
                <>
                  Publish Campaign <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


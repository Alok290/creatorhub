import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { campaignService, CreateCampaignInput } from '../services/campaignService';
import { merchantService } from '../services/merchantService';
import { CompensationType } from '../types';
import { Sparkles, MapPin, ArrowRight, Navigation, CheckCircle2 } from 'lucide-react';

const CATEGORIES = [
  'Food & Beverage',
  'Fitness & Health',
  'Tech & Gadgets',
  'Fashion & Beauty',
  'Travel & Lifestyle',
  'Entertainment & Gaming',
  'Education & Career',
  'Home Decor & Living',
  'Pet Care & Animals',
  'Other'
];

export const MerchantCreateCampaign: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<CreateCampaignInput>({
    title: '',
    description: '',
    category: 'Food & Beverage',
    compensationType: 'PAID',
    budget: 0,
    deliverables: '',
    minFollowers: 0,
    targetCity: '',
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('Food & Beverage');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [budgetInput, setBudgetInput] = useState<string>('');
  const [followersInput, setFollowersInput] = useState<string>('');
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-populate target city & category dynamically from merchant's real profile
  useEffect(() => {
    const loadMerchantProfile = async () => {
      try {
        const profile = await merchantService.getProfile();
        const initialCat = profile.industry && CATEGORIES.includes(profile.industry) ? profile.industry : 'Food & Beverage';
        setSelectedCategory(initialCat);
        setFormData((prev) => ({
          ...prev,
          targetCity: profile.city ? profile.city.trim() : '',
          category: initialCat,
        }));
      } catch (err) {
        console.warn('Could not auto-populate location from merchant profile:', err);
      }
    };
    loadMerchantProfile();
  }, []);

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`
          );
          if (resp.ok) {
            const data = await resp.json();
            const resCity =
              data.address?.city ||
              data.address?.town ||
              data.address?.state_district ||
              data.address?.suburb ||
              '';
            if (resCity) {
              setFormData((prev) => ({ ...prev, targetCity: resCity }));
            }
          }
        } catch (err) {
          console.warn('Reverse geocoding error:', err);
        } finally {
          setDetectingLocation(false);
        }
      },
      () => setDetectingLocation(false),
      { timeout: 8000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Please provide a collab title and brief description.');
      return;
    }

    const finalCategory = selectedCategory === 'Other' ? (customCategory.trim() || 'Other') : selectedCategory;
    if (selectedCategory === 'Other' && !customCategory.trim()) {
      setError('Please specify your custom category.');
      return;
    }

    const parsedBudget = budgetInput ? Number(budgetInput) : 0;
    const parsedMinFollowers = followersInput ? Number(followersInput) : 0;

    setLoading(true);
    setError(null);

    try {
      await campaignService.createCampaign({
        ...formData,
        category: finalCategory,
        budget: parsedBudget,
        minFollowers: parsedMinFollowers,
      });
      navigate('/merchant/campaigns');
    } catch (err: any) {
      setError(err.message || 'Failed to post collab');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 px-6 py-8 text-white">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">New Opportunity</span>
          <h1 className="text-2xl font-black mt-1">Post a Creator Collab</h1>
          <p className="text-xs text-white/70 mt-1">
            Publish your collaboration requirements for verified creators to apply.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Collab Title */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Collab Title / Campaign Headline *
              </label>
              <span className="text-[11px] text-slate-400 font-medium">Clear & descriptive name for creators</span>
            </div>
            <p className="text-xs text-slate-500 mb-2">
              State what you are promoting and what the creator will do so interested creators click on your opportunity.
            </p>
            <input
              type="text"
              required
              placeholder="e.g. 60-Second Cafe Tasting Reel, Summer Fashion Lookbook, Tech Product Unboxing"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
            />
            {/* Quick Suggestions / Inspiration Chips */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-400 font-medium mr-1">Quick ideas:</span>
              {[
                '🍽️ Weekend Cafe Menu Tasting Reel',
                '👗 Summer Collection Lookbook',
                '📱 Tech Gadget Unboxing & Review',
                '✨ Store Visit & Reel Promotion',
                '💪 Fitness Workout & Brand Tag',
              ].map((idea) => (
                <button
                  key={idea}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, title: idea }))}
                  className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition-colors cursor-pointer border border-slate-200/60"
                >
                  {idea}
                </button>
              ))}
            </div>
          </div>

          {/* Category & Compensation Model */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Category / Niche *
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Choose the industry or select &quot;Other&quot; to specify your own custom niche.
              </p>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedCategory(val);
                  if (val !== 'Other') {
                    setFormData((prev) => ({ ...prev, category: val }));
                  }
                }}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white font-medium"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Custom Category Input if "Other" is selected */}
              {selectedCategory === 'Other' && (
                <div className="mt-2.5 p-3 bg-brand-50/40 border border-brand-200 rounded-xl space-y-1">
                  <label className="block text-xs font-semibold text-brand-700">
                    Specify Your Custom Category / Niche *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Real Estate, Automotive, Parenting, Handmade Crafts..."
                    value={customCategory}
                    onChange={(e) => {
                      setCustomCategory(e.target.value);
                      setFormData((prev) => ({ ...prev, category: e.target.value }));
                    }}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  />
                  <p className="text-[11px] text-slate-500">
                    Creators matching this custom niche will see your collab.
                  </p>
                </div>
              )}
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
                <option value="PAID">Paid Fixed Fee (Cash Payment)</option>
                <option value="BARTER">Product / Meal / Experience Barter</option>
                <option value="HYBRID">Hybrid (Gift Kit + Fixed Fee)</option>
              </select>
            </div>
          </div>

          {/* Collab Description & Brief */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              What do you want the creator to do? (Brief & Details) *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Explain what the creator should highlight, key talking points, aesthetic vibe, brand location details, or hashtags..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>

          {/* Deliverables */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Expected Deliverables
            </label>
            <input
              type="text"
              placeholder="e.g. 1 Instagram Reel (30-60s) + 2 Stories with brand location tag"
              value={formData.deliverables}
              onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Budget, Followers, City */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Payment / Budget (₹) *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="e.g. 5000"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
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
                placeholder="e.g. 1000 (or 0 for all)"
                value={followersInput}
                onChange={(e) => setFollowersInput(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Target City
                </label>
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  disabled={detectingLocation}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center transition-colors disabled:opacity-50"
                >
                  <Navigation className="w-3 h-3 mr-1" />
                  {detectingLocation ? 'GPS...' : 'Auto-Detect'}
                </button>
              </div>
              <input
                type="text"
                placeholder="e.g. Bengaluru, Mumbai, Pan-India"
                value={formData.targetCity}
                onChange={(e) => setFormData({ ...formData, targetCity: e.target.value })}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-0 sm:space-x-3">
            <button
              type="button"
              onClick={() => navigate('/merchant/campaigns')}
              className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-500/20 disabled:opacity-50 transition-all hover:scale-[1.01]"
            >
              {loading ? 'Posting...' : (
                <>
                  Post Collab <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

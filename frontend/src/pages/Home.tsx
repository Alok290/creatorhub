import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Campaign, CreatorProfile } from '../types';
import { campaignService } from '../services/campaignService';
import { merchantService } from '../services/merchantService';
import { CategoryTag } from '../components/CategoryTag';
import { StatusBadge } from '../components/StatusBadge';
import { Sparkles, ArrowRight, MapPin, Users, Briefcase, TrendingUp, CheckCircle, Store, Zap } from 'lucide-react';

export const Home: React.FC = () => {
  const [featuredCampaigns, setFeaturedCampaigns] = useState<Campaign[]>([]);
  const [featuredCreators, setFeaturedCreators] = useState<CreatorProfile[]>([]);
  const [stats, setStats] = useState({ totalCreators: 0, activeCampaigns: 0, totalUsers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [camps, creators, statData] = await Promise.all([
          campaignService.getFeaturedCampaigns(),
          merchantService.searchCreators(),
          merchantService.getPlatformStats().catch(() => ({ totalCreators: 0, activeCampaigns: 0, totalUsers: 0 }))
        ]);
        setFeaturedCampaigns(camps);
        setFeaturedCreators(creators);
        if (statData) setStats(statData);
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hyper-Local Creator Collaborations Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Connecting Real Brands with <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              High-Impact Creators
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Eliminate agency markups. Discover local content creators, launch targeted campaigns, track deliverables, and pay securely on completion.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register?role=CREATOR"
              className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-lg shadow-brand-500/25 transition-all hover:scale-105"
            >
              <Zap className="w-5 h-5 mr-2" />
              Join as a Creator
            </Link>
            <Link
              to="/register?role=MERCHANT"
              className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-sm transition-all hover:scale-105"
            >
              <Store className="w-5 h-5 mr-2 text-brand-600" />
              Hire Creators for Your Brand
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-6 max-w-3xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <div className="text-3xl font-extrabold text-brand-600">
                {stats.activeCampaigns}
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Active Campaigns</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-indigo-600">
                {stats.totalCreators}
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Verified Creators</div>
            </div>
            <div className="col-span-2 md:col-span-1">
              <div className="text-3xl font-extrabold text-purple-600">
                100%
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Verified Deliverables</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Campaigns Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8">
          <div>
            <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">Marketplace Feed</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Active Brand Collabs</h2>
          </div>
          <Link
            to="/explore"
            className="inline-flex items-center text-sm font-semibold text-brand-600 hover:text-brand-700 mt-2 sm:mt-0"
          >
            Browse all collabs <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : featuredCampaigns.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500">No active collabs right now. Check back shortly!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCampaigns.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-brand-200 hover:shadow-xl transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={c.merchantLogoUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=100&q=80'}
                        alt={c.merchantBrandName}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-100"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{c.merchantBrandName}</h4>
                        {c.targetCity && (
                          <p className="text-[11px] text-slate-400 flex items-center">
                            <MapPin className="w-3 h-3 mr-0.5" /> {c.targetCity}
                          </p>
                        )}
                      </div>
                    </div>
                    <CategoryTag category={c.category} />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2">
                    {c.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                    {c.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 block">Compensation</span>
                    <span className="text-lg font-black text-slate-900">₹{c.budget.toLocaleString()}</span>
                  </div>
                  <Link
                    to="/login"
                    className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-brand-600 rounded-xl transition-colors"
                  >
                    View & Apply
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Featured Creators Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8">
          <div>
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Top Talent</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Verified Creators</h2>
          </div>
          <Link
            to="/creators"
            className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-700 mt-2 sm:mt-0"
          >
            Explore creator directory <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCreators.map((creator) => (
            <div
              key={creator.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-lg transition-all text-center flex flex-col items-center"
            >
              <img
                src={creator.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                alt={creator.displayName}
                className="w-20 h-20 rounded-full object-cover border-2 border-brand-100 shadow-sm"
              />
              <h3 className="font-bold text-slate-900 mt-3 text-sm">{creator.displayName}</h3>
              <p className="text-xs text-slate-500 flex items-center justify-center mt-1">
                <MapPin className="w-3 h-3 mr-1 text-slate-400" /> {creator.city || 'India'}
              </p>

              <div className="mt-3 px-3 py-1 bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 w-full">
                {(creator.totalFollowers || 0).toLocaleString()} followers
              </div>

              <div className="mt-3 text-[11px] text-slate-400 line-clamp-2">
                {creator.bio}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 w-full flex justify-between items-center text-xs">
                <span className="text-slate-400">Base rate</span>
                <span className="font-bold text-slate-900">₹{(creator.baseRate || 0).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Value Prop Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-brand-950 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-extrabold tracking-tight">
              Ready to grow your brand or creator career?
            </h2>
            <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              Join hundreds of stores, cafes, gym brands, and digital creators running verified collaborations today with zero platform commissions.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/register"
                className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm shadow-md transition-colors"
              >
                Create Free Account
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-colors"
              >
                Sign In to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};


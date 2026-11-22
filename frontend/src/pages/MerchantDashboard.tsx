import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { merchantService } from '../services/merchantService';
import { Application, Campaign, MerchantProfile } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { PlusCircle, Briefcase, Users, Clock, CheckCircle, ArrowRight, Store, MapPin, Sparkles } from 'lucide-react';

export const MerchantDashboard: React.FC = () => {
  const [data, setData] = useState<{
    profile: MerchantProfile;
    totalCampaigns: number;
    pendingApplications: number;
    activeCollaborations: number;
    completedCollaborations: number;
    recentCampaigns: Campaign[];
    recentApplications: Application[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await merchantService.getDashboard();
        setData(res);
      } catch (err) {
        console.error('Failed to load merchant dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-6">
        <div className="h-24 bg-slate-200 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => <div key={n} className="h-32 bg-slate-200 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const profile = data?.profile;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Brand Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center shadow-lg">
        <div className="flex items-center space-x-4">
          <img
            src={profile?.logoUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80'}
            alt={profile?.brandName}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-sm"
          />
          <div>
            <div className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10 mb-1">
              <Store className="w-3 h-3 mr-1 text-indigo-400" /> Verified Merchant Account
            </div>
            <h1 className="text-2xl font-black">{profile?.brandName || 'Brand Dashboard'}</h1>
            <p className="text-xs text-white/70 mt-0.5 flex items-center">
              <MapPin className="w-3 h-3 mr-1" /> {profile?.city || 'City not set'} • {profile?.industry || 'Retail & Commerce'}
            </p>
          </div>
        </div>

        <div className="mt-4 md:mt-0 flex space-x-3">
          <Link
            to="/merchant/campaigns/new"
            className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4 mr-1.5" /> Post a Collab
          </Link>
          <Link
            to="/merchant/creators"
            className="inline-flex items-center px-4 py-2 text-xs font-semibold text-slate-300 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
          >
            Discover Creators
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Collabs</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-extrabold text-slate-900">
            {data?.totalCampaigns || 0}
          </div>
          <p className="mt-1 text-xs text-slate-500">Active or past collabs</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Applicants</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-extrabold text-amber-600">
            {data?.pendingApplications || 0}
          </div>
          <p className="mt-1 text-xs text-slate-500">Awaiting your approval</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Collaborations</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-extrabold text-blue-600">
            {data?.activeCollaborations || 0}
          </div>
          <p className="mt-1 text-xs text-slate-500">Currently in creation / review</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Deals</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-extrabold text-emerald-600">
            {data?.completedCollaborations || 0}
          </div>
          <p className="mt-1 text-xs text-slate-500">Verified and finished</p>
        </div>
      </div>

      {/* Campaigns Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Collabs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Your Collabs</h2>
              <p className="text-xs text-slate-500">Active postings receiving applications</p>
            </div>
            <Link to="/merchant/campaigns" className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center">
              View all <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          {data?.recentCampaigns && data.recentCampaigns.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {data.recentCampaigns.map((camp) => (
                <div key={camp.id} className="py-3 flex justify-between items-center">
                  <div>
                    <Link to={`/merchant/campaigns/${camp.id}`} className="text-sm font-bold text-slate-900 hover:text-brand-600">
                      {camp.title}
                    </Link>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Budget: ₹{camp.budget.toLocaleString()} • {camp.applicationCount} Applicants
                    </p>
                  </div>
                  <Link
                    to={`/merchant/campaigns/${camp.id}`}
                    className="px-3 py-1.5 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
                  >
                    Manage
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-xs text-slate-500">No collabs posted yet.</p>
              <Link
                to="/merchant/campaigns/new"
                className="mt-3 inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-brand-600 rounded-xl"
              >
                Post First Collab
              </Link>
            </div>
          )}
        </div>

        {/* Incoming Applicants / Activity */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Applications</h2>
              <p className="text-xs text-slate-500">Creator pitches submitted to your campaigns</p>
            </div>
          </div>

          {data?.recentApplications && data.recentApplications.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {data.recentApplications.map((app) => (
                <div key={app.id} className="py-3 flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <img
                      src={app.creatorAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                      alt={app.creatorName}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{app.creatorName}</h4>
                      <p className="text-[11px] text-slate-400">
                        {app.campaignTitle} • Proposal: ₹{app.proposedRate?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-xs text-slate-500">No applications received yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


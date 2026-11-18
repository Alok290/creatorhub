import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { creatorService } from '../services/creatorService';
import { Application, CreatorProfile } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { LayoutDashboard, Compass, Briefcase, DollarSign, ArrowRight, CheckCircle, Clock, MapPin, Sparkles } from 'lucide-react';

export const CreatorDashboard: React.FC = () => {
  const [data, setData] = useState<{
    profile: CreatorProfile;
    totalApplications: number;
    activeCollaborations: number;
    completedCollaborations: number;
    totalEarnings: number;
    recentApplications: Application[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await creatorService.getDashboard();
        setData(res);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
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
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center shadow-lg shadow-brand-500/15">
        <div className="flex items-center space-x-4">
          <img
            src={profile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
            alt={profile?.displayName}
            className="w-16 h-16 rounded-full object-cover border-2 border-white/40 shadow-sm"
          />
          <div>
            <div className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20 mb-1">
              <Sparkles className="w-3 h-3 mr-1" /> Verified Creator
            </div>
            <h1 className="text-2xl font-black">Hey, {profile?.displayName || 'Creator'}!</h1>
            <p className="text-xs text-white/80 mt-0.5 flex items-center">
              <MapPin className="w-3 h-3 mr-1" /> {profile?.city || 'Location not set'} • {(profile?.totalFollowers || 0).toLocaleString()} followers
            </p>
          </div>
        </div>

        <div className="mt-4 md:mt-0 flex space-x-3">
          <Link
            to="/creator/explore"
            className="inline-flex items-center px-4 py-2 text-xs font-bold text-brand-700 bg-white hover:bg-slate-100 rounded-xl transition-colors shadow-sm"
          >
            <Compass className="w-4 h-4 mr-1.5" /> Explore Brand Deals
          </Link>
          <Link
            to="/creator/profile"
            className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
          >
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Applications</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-extrabold text-slate-900">
            {data?.totalApplications || 0}
          </div>
          <p className="mt-1 text-xs text-slate-500">Deals applied for</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Deals</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-extrabold text-amber-600">
            {data?.activeCollaborations || 0}
          </div>
          <p className="mt-1 text-xs text-slate-500">In production or review</p>
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
          <p className="mt-1 text-xs text-slate-500">Successfully delivered</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Earnings</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-extrabold text-purple-600">
            ₹{(data?.totalEarnings || 0).toLocaleString()}
          </div>
          <p className="mt-1 text-xs text-slate-500">From completed campaigns</p>
        </div>
      </div>

      {/* Recent Applications Feed */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Applications & Deals</h2>
            <p className="text-xs text-slate-500">Track current status and deliverable submissions</p>
          </div>
          <Link
            to="/creator/applications"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center"
          >
            View all applications <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {data?.recentApplications && data.recentApplications.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {data.recentApplications.map((app) => (
              <div key={app.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-slate-900">{app.campaignTitle}</span>
                    <StatusBadge status={app.status} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Brand: <strong className="text-slate-700">{app.merchantBrandName}</strong> • Rate: <span className="font-semibold text-slate-900">₹{app.proposedRate?.toLocaleString()}</span>
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <Link
                    to="/creator/applications"
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Manage Deal
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-sm text-slate-500">You haven't applied to any campaigns yet.</p>
            <Link
              to="/creator/explore"
              className="mt-3 inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-brand-600 rounded-xl hover:bg-brand-700"
            >
              Explore Open Deals
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};


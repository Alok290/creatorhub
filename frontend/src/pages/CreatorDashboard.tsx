import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { creatorService } from '../services/creatorService';
import { paymentService } from '../services/paymentService';
import { Application, CreatorProfile, CreatorWallet, PayoutRequest } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { WithdrawModal } from '../components/WithdrawModal';
import {
  LayoutDashboard,
  Compass,
  Briefcase,
  DollarSign,
  ArrowRight,
  CheckCircle,
  Clock,
  MapPin,
  Sparkles,
  Wallet,
  Lock,
  ArrowDownRight,
  ShieldCheck,
  Building2,
  Smartphone
} from 'lucide-react';

export const CreatorDashboard: React.FC = () => {
  const [data, setData] = useState<{
    profile: CreatorProfile;
    totalApplications: number;
    activeCollaborations: number;
    completedCollaborations: number;
    totalEarnings: number;
    recentApplications: Application[];
  } | null>(null);

  const [wallet, setWallet] = useState<CreatorWallet | null>(null);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [dashData, walletData, payoutsData] = await Promise.all([
        creatorService.getDashboard(),
        paymentService.getWallet().catch(() => null),
        paymentService.getPayoutHistory().catch(() => []),
      ]);
      setData(dashData);
      setWallet(walletData);
      setPayouts(payoutsData);
    } catch (err) {
      console.error('Failed to load creator dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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
  const availableBalance = wallet?.availableBalance ?? 0;
  const inEscrow = wallet?.inEscrow ?? 0;
  const lifetimeEarnings = wallet?.lifetimeEarnings ?? (data?.totalEarnings || 0);
  const totalWithdrawn = wallet?.totalWithdrawn ?? 0;

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

      {/* Creator Escrow Wallet & Earnings Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 text-brand-600 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-brand-600" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-600">
                Milestone Escrow Wallet
              </span>
              <h2 className="text-lg font-bold text-slate-900">Earnings & Payouts</h2>
            </div>
          </div>

          <button
            onClick={() => setIsWithdrawOpen(true)}
            disabled={availableBalance <= 0}
            className="inline-flex items-center px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] rounded-xl transition-all shadow-md shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowDownRight className="w-4 h-4 mr-1.5" />
            Withdraw to UPI / Bank
          </button>
        </div>

        {/* 4 Financial Meters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
              Available Balance
            </span>
            <span className="text-2xl font-black text-emerald-700 mt-1 block">
              ₹{availableBalance.toLocaleString()}
            </span>
            <p className="text-[11px] text-emerald-600 mt-0.5">Withdrawable immediately</p>
          </div>

          <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-100">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider block">
                In Escrow Vault
              </span>
              <Lock className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <span className="text-2xl font-black text-indigo-700 mt-1 block">
              ₹{inEscrow.toLocaleString()}
            </span>
            <p className="text-[11px] text-indigo-600 mt-0.5">Locked until review approval</p>
          </div>

          <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-100">
            <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider block">
              Lifetime Earnings
            </span>
            <span className="text-2xl font-black text-purple-700 mt-1 block">
              ₹{lifetimeEarnings.toLocaleString()}
            </span>
            <p className="text-[11px] text-purple-600 mt-0.5">From approved deals</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Withdrawn
            </span>
            <span className="text-2xl font-black text-slate-800 mt-1 block">
              ₹{totalWithdrawn.toLocaleString()}
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">Transferred to your bank/UPI</p>
          </div>
        </div>

        {/* Payout History Mini-feed */}
        {payouts.length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Recent Withdrawal Requests ({payouts.length})
            </h4>
            <div className="space-y-2">
              {payouts.slice(0, 3).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 bg-slate-50/80 rounded-xl border border-slate-100 text-xs"
                >
                  <div className="flex items-center space-x-2.5">
                    {p.payoutMethod === 'UPI' ? (
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Building2 className="w-4 h-4 text-indigo-600" />
                    )}
                    <div>
                      <span className="font-bold text-slate-800">₹{p.amount.toLocaleString()}</span>
                      <span className="text-slate-400 text-[11px] ml-2">
                        {p.payoutMethod === 'UPI' ? p.upiId : `${p.accountNumber?.slice(-4)} (${p.ifscCode})`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {p.utrNumber && (
                      <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
                        UTR: {p.utrNumber}
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        p.status === 'TRANSFERRED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.status === 'PROCESSING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
                    {app.paymentStatus === 'ESCROWED' && app.status !== 'COMPLETED' && (
                      <span className="inline-flex items-center text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                        <Lock className="w-3 h-3 mr-1" /> Escrow Secured
                      </span>
                    )}
                    {app.status === 'COMPLETED' && (
                      <span className="inline-flex items-center text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                        <CheckCircle className="w-3 h-3 mr-1" /> Paid
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Brand: <strong className="text-slate-700">{app.merchantBrandName}</strong> • Rate:{' '}
                    <span className="font-semibold text-slate-900">₹{app.proposedRate?.toLocaleString()}</span>
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

      {/* Withdraw Modal */}
      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        availableBalance={availableBalance}
        onSuccess={() => {
          loadData();
        }}
      />
    </div>
  );
};

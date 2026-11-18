import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Campaign } from '../types';
import { campaignService } from '../services/campaignService';
import { StatusBadge } from '../components/StatusBadge';
import { CategoryTag } from '../components/CategoryTag';
import { PlusCircle, Briefcase, Users, Calendar, ArrowRight, Eye } from 'lucide-react';

export const MerchantCampaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const data = await campaignService.getMerchantCampaigns();
        setCampaigns(data);
      } catch (err) {
        console.error('Failed to load campaigns:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Campaign Hub</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">My Posted Campaigns</h1>
          <p className="text-sm text-slate-500 mt-1">Manage deliverables, view creator applicants, and track active collaborations.</p>
        </div>
        <Link
          to="/merchant/campaigns/new"
          className="inline-flex items-center px-4 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all hover:scale-105"
        >
          <PlusCircle className="w-4 h-4 mr-1.5" /> Post New Campaign
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => <div key={n} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">You haven't posted any campaigns yet</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">Post a campaign to start receiving proposals from verified creators.</p>
          <Link
            to="/merchant/campaigns/new"
            className="inline-flex items-center px-5 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl"
          >
            Create Your First Campaign
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((camp) => (
            <div
              key={camp.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-brand-200 hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{camp.title}</h3>
                  <StatusBadge status={camp.status} />
                  <CategoryTag category={camp.category} />
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 max-w-2xl">{camp.description}</p>
                <div className="flex flex-wrap gap-4 text-xs text-slate-400 pt-1">
                  <span>Compensation: <strong className="text-slate-800">₹{camp.budget.toLocaleString()}</strong> ({camp.compensationType})</span>
                  {camp.targetCity && <span>Target City: <strong className="text-slate-800">{camp.targetCity}</strong></span>}
                  <span>Min Followers: <strong className="text-slate-800">{(camp.minFollowers || 0).toLocaleString()}</strong></span>
                </div>
              </div>

              <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0">
                <div className="text-left md:text-right pr-4">
                  <span className="text-xl font-extrabold text-brand-600 block">{camp.applicationCount}</span>
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Applicants</span>
                </div>
                <Link
                  to={`/merchant/campaigns/${camp.id}`}
                  className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-brand-600 rounded-xl transition-colors shadow-sm"
                >
                  <Eye className="w-3.5 h-3.5 mr-1.5" /> View Applicants
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


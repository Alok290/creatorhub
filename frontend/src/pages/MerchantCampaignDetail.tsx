import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Application, Campaign } from '../types';
import { campaignService } from '../services/campaignService';
import { merchantService } from '../services/merchantService';
import { StatusBadge } from '../components/StatusBadge';
import { ReviewApplicationModal } from '../components/ReviewApplicationModal';
import { CollabChatModal } from '../components/CollabChatModal';
import { ArrowLeft, Users, Briefcase, MapPin, DollarSign, Calendar, MessageSquare, CheckCircle, ExternalLink } from 'lucide-react';

export const MerchantCampaignDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const campaignId = Number(id);

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [activeChatApp, setActiveChatApp] = useState<Application | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [campData, appData] = await Promise.all([
        campaignService.getMerchantCampaignDetails(campaignId),
        merchantService.getCampaignApplications(campaignId),
      ]);
      setCampaign(campData);
      setApplications(appData);
    } catch (err) {
      console.error('Failed to load campaign details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (campaignId) {
      loadData();
    }
  }, [campaignId]);

  if (loading) {
    return <div className="max-w-7xl mx-auto py-12 px-4 animate-pulse"><div className="h-64 bg-slate-100 rounded-3xl" /></div>;
  }

  if (!campaign) {
    return (
      <div className="max-w-7xl mx-auto py-16 px-4 text-center">
        <p className="text-slate-500">Campaign not found.</p>
        <Link to="/merchant/campaigns" className="mt-4 inline-block text-brand-600 font-bold text-sm">
          Return to campaigns
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Link to="/merchant/campaigns" className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to all collabs
      </Link>

      {/* Campaign Details Summary Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">{campaign.category}</span>
              <StatusBadge status={campaign.status} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{campaign.title}</h1>
            <p className="text-xs text-slate-500 mt-1 flex items-center">
              Target City: <strong className="text-slate-700 ml-1">{campaign.targetCity || 'Any'}</strong> • Compensation Model:{' '}
              <strong className="text-slate-700 ml-1">{campaign.compensationType}</strong>
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 block font-semibold">Compensation Budget</span>
            <span className="text-2xl font-black text-slate-900">₹{campaign.budget.toLocaleString()}</span>
          </div>
        </div>

        <p className="text-sm text-slate-600 mt-4 leading-relaxed max-w-3xl">{campaign.description}</p>

        {campaign.deliverables && (
          <div className="mt-4 p-3 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-100">
            <strong>Required Deliverables:</strong> {campaign.deliverables}
          </div>
        )}
      </div>

      {/* Creator Applicants List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900 flex items-center">
            <Users className="w-5 h-5 mr-2 text-brand-600" />
            Creator Applicants ({applications.length})
          </h2>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No applicants yet</h3>
            <p className="text-xs text-slate-400 mt-1">Creators browsing the marketplace will appear here once they submit proposals.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <img
                      src={app.creatorAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                      alt={app.creatorName}
                      className="w-12 h-12 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{app.creatorName}</h4>
                      <p className="text-xs text-slate-400">
                        {app.creatorCity || 'India'} • {(app.creatorTotalFollowers || 0).toLocaleString()} followers
                      </p>
                    </div>
                    <div className="ml-auto">
                      <StatusBadge status={app.status} />
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 mb-3 border border-slate-100">
                    <strong className="block text-slate-700 mb-1">Proposal Pitch:</strong>
                    <p className="line-clamp-3">{app.pitch}</p>
                  </div>

                  {app.deliverableUrl && (
                    <div className="p-2.5 bg-indigo-50 rounded-xl text-xs text-indigo-700 flex items-center mb-3">
                      <ExternalLink className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                      <a href={app.deliverableUrl} target="_blank" rel="noreferrer" className="underline truncate">
                        {app.deliverableUrl}
                      </a>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-semibold">Proposed Fee</span>
                    <span className="text-sm font-bold text-slate-900">₹{app.proposedRate?.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setActiveChatApp(app)}
                      className="px-3 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors inline-flex items-center"
                    >
                      <MessageSquare className="w-3.5 h-3.5 mr-1" />
                      Chat
                    </button>
                    <button
                      onClick={() => {
                        setSelectedApp(app);
                        setIsReviewOpen(true);
                      }}
                      className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-brand-600 rounded-xl transition-colors shadow-sm"
                    >
                      Review Proposal
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <ReviewApplicationModal
        application={selectedApp}
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        onSuccess={() => {
          loadData();
        }}
      />

      {/* Collab Chat Modal */}
      <CollabChatModal
        isOpen={!!activeChatApp}
        onClose={() => setActiveChatApp(null)}
        applicationId={activeChatApp?.id || null}
        partnerName={activeChatApp?.creatorName || 'Creator'}
        partnerAvatarUrl={activeChatApp?.creatorAvatarUrl}
        partnerRole="CREATOR"
        collabTitle={campaign.title}
        collabStatus={activeChatApp?.status}
      />
    </div>
  );
};


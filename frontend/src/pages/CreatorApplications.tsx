import React, { useEffect, useState } from 'react';
import { Application } from '../types';
import { creatorService } from '../services/creatorService';
import { StatusBadge } from '../components/StatusBadge';
import { SubmitDeliverableModal } from '../components/SubmitDeliverableModal';
import { CollabChatModal } from '../components/CollabChatModal';
import { Briefcase, ExternalLink, MessageSquare, Star, UploadCloud, Clock, CheckCircle, RotateCcw, Lock, AlertCircle, ShieldCheck } from 'lucide-react';

export const CreatorApplications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [activeChatApp, setActiveChatApp] = useState<Application | null>(null);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const data = await creatorService.getMyApplications();
      setApplications(data);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const filtered = applications.filter((app) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'ACTIVE') return app.status === 'ACCEPTED' || app.status === 'IN_PROGRESS';
    if (statusFilter === 'SUBMITTED') return app.status === 'DELIVERABLES_SUBMITTED';
    if (statusFilter === 'COMPLETED') return app.status === 'COMPLETED';
    if (statusFilter === 'APPLIED') return app.status === 'APPLIED';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Collab Deals</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">My Applications & Collaborations</h1>
        <p className="text-sm text-slate-500 mt-1">Track proposal statuses, upload live post proof, and collaborate with brands.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { label: 'All Deals', key: 'ALL' },
          { label: 'Pending Approval', key: 'APPLIED' },
          { label: 'Active Deals (Needs Submission)', key: 'ACTIVE' },
          { label: 'Under Review', key: 'SUBMITTED' },
          { label: 'Completed', key: 'COMPLETED' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors ${
              statusFilter === tab.key
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => <div key={n} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">No applications in this category.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-slate-300 transition-all flex flex-col md:flex-row justify-between gap-6"
            >
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{app.campaignTitle}</h3>
                  <StatusBadge status={app.status} />
                  {app.status === 'ACCEPTED' && (!app.paymentStatus || app.paymentStatus === 'PENDING') && (
                    <span className="inline-flex items-center text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                      <AlertCircle className="w-3 h-3 mr-1 text-amber-600" /> Awaiting Brand Escrow Deposit
                    </span>
                  )}
                  {(app.paymentStatus === 'ESCROWED' || app.status === 'DELIVERABLES_SUBMITTED' || app.status === 'CHANGES_REQUESTED') && app.status !== 'COMPLETED' && (
                    <span className="inline-flex items-center text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      <Lock className="w-3 h-3 mr-1 text-emerald-600" /> ₹{app.proposedRate?.toLocaleString()} Escrow Secured
                    </span>
                  )}
                  {app.status === 'COMPLETED' && (
                    <span className="inline-flex items-center text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                      <CheckCircle className="w-3 h-3 mr-1 text-blue-600" /> ₹{app.proposedRate?.toLocaleString()} In Your Wallet
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500">
                  Brand: <strong className="text-slate-800">{app.merchantBrandName}</strong> • Agreed Compensation:{' '}
                  <span className="font-bold text-slate-900">₹{app.proposedRate?.toLocaleString()}</span>
                </p>

                {/* Pitch preview */}
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100">
                  <strong className="text-slate-700 block mb-1">Your Pitch:</strong>
                  {app.pitch}
                </div>

                {/* Deliverables URL if submitted */}
                {app.deliverableUrl && (
                  <div className="p-3 bg-indigo-50/50 rounded-xl text-xs text-indigo-700 border border-indigo-100 flex items-center justify-between">
                    <div>
                      <strong>Submitted Link: </strong>
                      <a href={app.deliverableUrl} target="_blank" rel="noreferrer" className="underline hover:text-indigo-900">
                        {app.deliverableUrl}
                      </a>
                    </div>
                  </div>
                )}

                {/* Merchant feedback / revisions requested */}
                {app.status === 'CHANGES_REQUESTED' ? (
                  <div className="p-3 bg-amber-50 rounded-xl text-xs text-amber-900 border border-amber-200 space-y-1">
                    <div className="flex items-center font-bold text-amber-800">
                      <RotateCcw className="w-3.5 h-3.5 mr-1 text-amber-600" />
                      Improvements Requested by Brand:
                    </div>
                    <p className="italic font-medium">"{app.merchantFeedback || 'Please review guidelines and submit updated proof.'}"</p>
                  </div>
                ) : app.merchantFeedback && (
                  <div className="p-3 bg-purple-50/60 rounded-xl text-xs text-purple-900 border border-purple-100">
                    <strong className="block mb-1">Client Feedback:</strong>
                    "{app.merchantFeedback}"
                  </div>
                )}
              </div>

              {/* Action buttons on the side */}
              <div className="flex md:flex-col justify-end items-end gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 min-w-[180px]">
                <button
                  type="button"
                  onClick={() => setActiveChatApp(app)}
                  className="w-full inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors border border-indigo-200/60"
                >
                  <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                  Chat with Brand
                </button>

                {(app.status === 'ACCEPTED' || app.status === 'IN_PROGRESS' || app.status === 'CHANGES_REQUESTED') && (
                  <button
                    onClick={() => {
                      setSelectedApp(app);
                      setIsSubmitModalOpen(true);
                    }}
                    className={`w-full inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold text-white rounded-xl shadow-sm transition-all ${
                      app.status === 'CHANGES_REQUESTED'
                        ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
                        : 'bg-brand-600 hover:bg-brand-700 shadow-brand-500/20'
                    }`}
                  >
                    <UploadCloud className="w-4 h-4 mr-1.5" />
                    {app.status === 'CHANGES_REQUESTED' ? 'Submit Revised Proof' : 'Submit Post Proof'}
                  </button>
                )}

                {app.status === 'DELIVERABLES_SUBMITTED' && (
                  <span className="inline-flex items-center text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                    <Clock className="w-3.5 h-3.5 mr-1" /> Pending Client Approval
                  </span>
                )}

                {app.status === 'COMPLETED' && (
                  <div className="text-right">
                    <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      <CheckCircle className="w-3.5 h-3.5 mr-1" /> Deal Completed
                    </span>
                    {app.rating && (
                      <div className="flex items-center justify-end mt-1 text-amber-500">
                        {[...Array(app.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit Deliverable Modal */}
      <SubmitDeliverableModal
        application={selectedApp}
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSuccess={() => {
          fetchApps();
        }}
      />

      {/* Collab Chat Modal */}
      <CollabChatModal
        isOpen={!!activeChatApp}
        onClose={() => setActiveChatApp(null)}
        applicationId={activeChatApp?.id || null}
        partnerName={activeChatApp?.merchantBrandName || 'Brand Partner'}
        partnerRole="MERCHANT"
        collabTitle={activeChatApp?.campaignTitle || 'Collaboration'}
        collabStatus={activeChatApp?.status}
      />
    </div>
  );
};


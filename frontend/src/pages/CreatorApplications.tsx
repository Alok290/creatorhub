import React, { useEffect, useState } from 'react';
import { Application } from '../types';
import { creatorService } from '../services/creatorService';
import { StatusBadge } from '../components/StatusBadge';
import { SubmitDeliverableModal } from '../components/SubmitDeliverableModal';
import { Briefcase, ExternalLink, MessageSquare, Star, UploadCloud, Clock, CheckCircle } from 'lucide-react';

export const CreatorApplications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

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
        <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Campaign Management</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">My Applications & Collaborations</h1>
        <p className="text-sm text-slate-500 mt-1">Track proposal statuses, upload live post proof, and receive client ratings.</p>
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
                <div className="flex items-center space-x-3">
                  <h3 className="text-base font-bold text-slate-900">{app.campaignTitle}</h3>
                  <StatusBadge status={app.status} />
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

                {/* Merchant feedback / rating if completed */}
                {app.merchantFeedback && (
                  <div className="p-3 bg-purple-50/60 rounded-xl text-xs text-purple-900 border border-purple-100">
                    <strong className="block mb-1">Client Feedback:</strong>
                    "{app.merchantFeedback}"
                  </div>
                )}
              </div>

              {/* Action buttons on the side */}
              <div className="flex md:flex-col justify-end items-end gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 min-w-[180px]">
                {(app.status === 'ACCEPTED' || app.status === 'IN_PROGRESS') && (
                  <button
                    onClick={() => {
                      setSelectedApp(app);
                      setIsSubmitModalOpen(true);
                    }}
                    className="w-full inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all"
                  >
                    <UploadCloud className="w-4 h-4 mr-1.5" />
                    Submit Post Proof
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
    </div>
  );
};


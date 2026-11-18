import React, { useState } from 'react';
import { Application, ApplicationStatus } from '../types';
import { merchantService } from '../services/merchantService';
import { X, CheckCircle, XCircle, Star, ExternalLink, MessageSquare } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface ReviewApplicationModalProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReviewApplicationModal: React.FC<ReviewApplicationModalProps> = ({
  application,
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen || !application) return null;

  const [feedback, setFeedback] = useState(application.merchantFeedback || '');
  const [rating, setRating] = useState<number>(application.rating || 5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateStatus = async (status: ApplicationStatus) => {
    setLoading(true);
    setError(null);
    try {
      await merchantService.updateApplicationStatus(application.id, status, feedback, rating);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <img
            src={application.creatorAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
            alt={application.creatorName}
            className="w-12 h-12 rounded-full object-cover border border-slate-200"
          />
          <div>
            <h2 className="text-lg font-bold text-slate-900">{application.creatorName}</h2>
            <p className="text-xs text-slate-500">
              {application.creatorCity || 'Location flexible'} • {application.creatorTotalFollowers.toLocaleString()} total followers
            </p>
          </div>
          <div className="ml-auto">
            <StatusBadge status={application.status} />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium">
            {error}
          </div>
        )}

        <div className="space-y-4 text-sm">
          {/* Pitch Section */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
              <MessageSquare className="w-3.5 h-3.5 mr-1" />
              Creator Pitch Proposal
            </h4>
            <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{application.pitch}</p>
            <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center text-xs">
              <span className="text-slate-500">Proposed Compensation:</span>
              <span className="font-bold text-slate-900 text-sm">₹{application.proposedRate?.toLocaleString()}</span>
            </div>
          </div>

          {/* Deliverables section if submitted */}
          {application.deliverableUrl && (
            <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100">
              <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2 flex items-center">
                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                Submitted Content
              </h4>
              <a
                href={application.deliverableUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center text-brand-600 hover:text-brand-700 font-medium text-xs break-all"
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                {application.deliverableUrl}
              </a>
              {application.deliverableNotes && (
                <p className="mt-2 text-xs text-slate-600 italic">"{application.deliverableNotes}"</p>
              )}
            </div>
          )}

          {/* Feedback & Review Form */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Feedback / Note to Creator
            </label>
            <textarea
              rows={2}
              placeholder="Add feedback or instructions for the creator..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {(application.status === 'DELIVERABLES_SUBMITTED' || application.status === 'COMPLETED') && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Collaboration Rating
              </label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Buttons based on status */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          >
            Close
          </button>

          {application.status === 'APPLIED' && (
            <>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleUpdateStatus('REJECTED')}
                className="inline-flex items-center px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl"
              >
                <XCircle className="w-3.5 h-3.5 mr-1" />
                Decline
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleUpdateStatus('ACCEPTED')}
                className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm shadow-brand-500/20"
              >
                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                Accept Proposal
              </button>
            </>
          )}

          {application.status === 'DELIVERABLES_SUBMITTED' && (
            <button
              type="button"
              disabled={loading}
              onClick={() => handleUpdateStatus('COMPLETED')}
              className="inline-flex items-center px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
            >
              <CheckCircle className="w-3.5 h-3.5 mr-1" />
              Approve & Complete Deal
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


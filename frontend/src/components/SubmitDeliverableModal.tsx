import React, { useState } from 'react';
import { Application } from '../types';
import { creatorService } from '../services/creatorService';
import { X, UploadCloud, CheckCircle2, Link as LinkIcon } from 'lucide-react';

interface SubmitDeliverableModalProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SubmitDeliverableModal: React.FC<SubmitDeliverableModalProps> = ({
  application,
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen || !application) return null;

  const [deliverableUrl, setDeliverableUrl] = useState(application.deliverableUrl || '');
  const [deliverableNotes, setDeliverableNotes] = useState(application.deliverableNotes || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliverableUrl.trim()) {
      setError('Please provide a URL to your published content or proof.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await creatorService.submitDeliverable(application.id, deliverableUrl, deliverableNotes);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit deliverable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Deliverable Submitted!</h3>
            <p className="text-sm text-slate-500 max-w-xs mx-auto">
              The merchant will verify your posted content and approve the collaboration completion.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <span className="text-xs font-semibold text-brand-600 uppercase tracking-wide">Submit Proof of Work</span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">{application.campaignTitle}</h2>
              <p className="text-xs text-slate-500">Brand: {application.merchantBrandName}</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Live Post / Content URL *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    required
                    placeholder="https://www.instagram.com/reel/... or https://youtube.com/..."
                    value={deliverableUrl}
                    onChange={(e) => setDeliverableUrl(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Deliverable Notes & Analytics (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Share views, engagement comments, or specific timestamps..."
                  value={deliverableNotes}
                  onChange={(e) => setDeliverableNotes(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-500/20 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Confirm Submission'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};


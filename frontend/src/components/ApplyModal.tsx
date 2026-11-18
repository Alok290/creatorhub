import React, { useState } from 'react';
import { Campaign } from '../types';
import { creatorService } from '../services/creatorService';
import { X, Send, DollarSign, CheckCircle2 } from 'lucide-react';

interface ApplyModalProps {
  campaign: Campaign | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({ campaign, isOpen, onClose, onSuccess }) => {
  if (!isOpen || !campaign) return null;

  const [pitch, setPitch] = useState('');
  const [proposedRate, setProposedRate] = useState<number>(campaign.budget || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pitch.trim()) {
      setError('Please provide a short pitch for the merchant.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await creatorService.applyToCampaign(campaign.id, pitch, proposedRate);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Application Submitted!</h3>
            <p className="text-sm text-slate-500 max-w-xs mx-auto">
              The merchant will review your proposal and respond soon.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <span className="text-xs font-semibold text-brand-600 tracking-wide uppercase">Campaign Application</span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">{campaign.title}</h2>
              <p className="text-xs text-slate-500 mt-1">Hosted by <strong className="text-slate-700">{campaign.merchantBrandName}</strong> • Budget: ₹{campaign.budget.toLocaleString()}</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Your Pitch & Creative Idea *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain why you're a great fit, what angles you'll cover, and what your audience will love about this brand..."
                  value={pitch}
                  onChange={(e) => setPitch(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Your Proposed Compensation (₹)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    ₹
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={proposedRate}
                    onChange={(e) => setProposedRate(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent font-semibold text-slate-900"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Default matches the campaign budget. You may adjust according to your package deliverables.
                </p>
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-500/20 disabled:opacity-50 transition-all"
                >
                  {loading ? (
                    <span className="inline-flex items-center">Submitting...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Pitch
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};


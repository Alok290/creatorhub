import React, { useState, useEffect } from 'react';
import { Campaign, CreatorProfile } from '../types';
import { campaignService } from '../services/campaignService';
import { merchantService } from '../services/merchantService';
import { X, Send, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface InviteCreatorModalProps {
  creator: CreatorProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const InviteCreatorModal: React.FC<InviteCreatorModalProps> = ({
  creator,
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen || !creator) return null;

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [offerRate, setOfferRate] = useState<number>(creator.baseRate || 0);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        setLoadingCampaigns(true);
        const data = await campaignService.getMerchantCampaigns();
        const activeOnly = data.filter((c) => c.status === 'ACTIVE');
        setCampaigns(activeOnly);
        if (activeOnly.length > 0) {
          setSelectedCampaignId(activeOnly[0].id);
          if (!offerRate && activeOnly[0].budget) {
            setOfferRate(activeOnly[0].budget);
          }
        }
      } catch (err: any) {
        console.error('Failed to load merchant collabs:', err);
      } finally {
        setLoadingCampaigns(false);
      }
    };
    loadCampaigns();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaignId) {
      setError('Please select an active collab to invite this creator to.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await merchantService.inviteCreator(
        creator.userId,
        selectedCampaignId,
        offerRate,
        message.trim() || undefined
      );
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to send collaboration invite.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Invite Sent Successfully!</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              <strong>{creator.displayName}</strong> has been directly invited to your collab.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center space-x-3 mb-6">
              <img
                src={creator.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                alt={creator.displayName}
                className="w-12 h-12 rounded-full object-cover border border-slate-200"
              />
              <div>
                <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider">Direct Opportunity</span>
                <h2 className="text-lg font-bold text-slate-900">Invite {creator.displayName}</h2>
                <p className="text-xs text-slate-500">{creator.city || 'India'} • Base Rate ₹{(creator.baseRate || 0).toLocaleString()}</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                {error}
              </div>
            )}

            {loadingCampaigns ? (
              <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
                Loading your active collabs...
              </div>
            ) : campaigns.length === 0 ? (
              <div className="py-6 text-center space-y-3 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <Sparkles className="w-8 h-8 text-indigo-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">No active collabs yet</h4>
                <p className="text-xs text-slate-500">
                  You need to post at least one active collab to send an invitation.
                </p>
                <a
                  href="/merchant/campaigns/new"
                  className="inline-block mt-2 px-4 py-2 text-xs font-bold text-white bg-brand-600 rounded-xl hover:bg-brand-700"
                >
                  Post a Collab Now
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Select Active Collab *
                  </label>
                  <select
                    value={selectedCampaignId || ''}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      setSelectedCampaignId(id);
                      const chosen = campaigns.find((c) => c.id === id);
                      if (chosen) setOfferRate(chosen.budget);
                    }}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white font-medium"
                  >
                    {campaigns.map((camp) => (
                      <option key={camp.id} value={camp.id}>
                        {camp.title} (Budget: ₹{camp.budget.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Offered Collaboration Fee (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      min="0"
                      required
                      value={offerRate}
                      onChange={(e) => setOfferRate(Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Personalized Message / Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. We love your food reels and would love to partner for our new brunch menu! Let us know if you're interested."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                  />
                </div>

                <div className="pt-2 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-0 sm:space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md disabled:opacity-50 transition-all hover:scale-[1.01]"
                  >
                    {loading ? 'Sending Invite...' : (
                      <>
                        <Send className="w-3.5 h-3.5 mr-1.5" /> Send Collab Invite
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CreatorProfile } from '../types';
import { merchantService } from '../services/merchantService';
import { InviteCreatorModal } from '../components/InviteCreatorModal';
import {
  ArrowLeft,
  MapPin,
  Sparkles,
  Instagram,
  Youtube,
  Users,
  DollarSign,
  Send,
  MessageCircle,
  Phone,
  ExternalLink,
  ShieldCheck,
  Tag,
  Briefcase
} from 'lucide-react';

export const MerchantCreatorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [creator, setCreator] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await merchantService.getCreatorProfile(Number(id));
        setCreator(data);
      } catch (err: any) {
        console.error('Failed to load creator profile:', err);
        setError(err.message || 'Creator profile not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 animate-pulse space-y-6">
        <div className="h-6 w-36 bg-slate-200 rounded-lg" />
        <div className="h-64 bg-slate-200 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-40 bg-slate-200 rounded-2xl" />
          <div className="h-40 bg-slate-200 rounded-2xl" />
          <div className="h-40 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <Users className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Creator Not Found</h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          {error || 'The requested creator profile could not be loaded.'}
        </p>
        <Link
          to="/merchant/creators"
          className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-slate-900 rounded-xl hover:bg-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Return to Creator Directory
        </Link>
      </div>
    );
  }

  const cleanPhone = creator.phone ? creator.phone.replace(/[^0-9]/g, '') : '';
  const waUrl = cleanPhone
    ? `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=${encodeURIComponent(
        `Hi ${creator.displayName}, I found your profile on CreatorHub and would love to discuss a collaboration with our brand!`
      )}`
    : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Button */}
      <div>
        <Link
          to="/merchant/creators"
          className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Creator Directory
        </Link>
      </div>

      {/* Hero Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-6 sm:p-10 text-white relative">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <img
                src={creator.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                alt={creator.displayName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white/20 shadow-xl flex-shrink-0"
              />
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/10 text-white border border-white/20">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                    Verified Creator
                  </span>
                  {creator.isNearby && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <Sparkles className="w-3.5 h-3.5 mr-1" />
                      {creator.distanceKm !== undefined && creator.distanceKm !== null
                        ? `Nearby (${creator.distanceKm} km away)`
                        : 'Local Talent'}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-black">{creator.displayName}</h1>
                <p className="text-xs text-white/75 flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-slate-300" />
                  {creator.city || 'Location flexible'} • {creator.country || 'India'}
                </p>
              </div>
            </div>

            {/* Base Rate & Primary Action */}
            <div className="flex flex-col items-start md:items-end space-y-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-white/10">
              <div className="text-left md:text-right">
                <span className="text-xs text-white/60 block font-medium">Standard Collab Rate</span>
                <span className="text-2xl sm:text-3xl font-black text-white">
                  ₹{(creator.baseRate || 0).toLocaleString()}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(true)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-lg transition-all flex items-center justify-center hover:scale-[1.02]"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  Invite to Collab
                </button>

                {waUrl && (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center shadow-sm"
                  >
                    <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                    WhatsApp
                  </a>
                )}

                {creator.phone && (
                  <a
                    href={`tel:${creator.phone}`}
                    className="w-full sm:w-auto px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center"
                    title="Direct Call"
                  >
                    <Phone className="w-3.5 h-3.5 mr-1 sm:mr-0" />
                    <span className="sm:hidden ml-1">Call</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Audience Overview Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 divide-x divide-y sm:divide-y-0 divide-slate-100 bg-slate-50/70 border-b border-slate-100 p-4">
          <div className="p-3 text-center">
            <span className="text-xs text-slate-400 font-semibold block uppercase">Total Audience</span>
            <span className="text-xl font-extrabold text-slate-900">
              {(creator.totalFollowers || 0).toLocaleString()}
            </span>
          </div>

          <div className="p-3 text-center">
            <span className="text-xs text-slate-400 font-semibold block uppercase flex items-center justify-center">
              <Instagram className="w-3.5 h-3.5 mr-1 text-pink-600" /> Instagram Followers
            </span>
            <span className="text-xl font-extrabold text-slate-900">
              {(creator.instagramFollowers || 0).toLocaleString()}
            </span>
          </div>

          <div className="p-3 text-center col-span-2 sm:col-span-1">
            <span className="text-xs text-slate-400 font-semibold block uppercase flex items-center justify-center">
              <Youtube className="w-3.5 h-3.5 mr-1 text-red-600" /> YouTube Subs
            </span>
            <span className="text-xl font-extrabold text-slate-900">
              {(creator.youtubeSubscribers || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Bio, Content Style & Niches */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio & Creative Overview */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-brand-600" />
              About & Content Style
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {creator.bio ||
                'This creator collaborates with local and digital brands on custom sponsorship packages, in-store content creation, and product showcases.'}
            </p>

            {/* Content Categories / Niches */}
            {creator.categories && (
              <div className="pt-4 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Specialized Content Niches
                </span>
                <div className="flex flex-wrap gap-2">
                  {creator.categories.split(',').map((cat, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center"
                    >
                      <Tag className="w-3 h-3 mr-1 text-brand-600" />
                      {cat.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Social Channels & Real Content Links */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Connected Social Channels</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {creator.instagramHandle ? (
                <a
                  href={`https://instagram.com/${creator.instagramHandle.replace('@', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-4 rounded-xl border border-pink-100 bg-pink-50/40 hover:bg-pink-50 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center font-bold">
                      <Instagram className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block font-semibold">Instagram</span>
                      <span className="text-sm font-bold text-slate-900 group-hover:text-pink-600 transition-colors">
                        @{creator.instagramHandle.replace('@', '')}
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-pink-600 transition-colors" />
                </a>
              ) : (
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 text-xs text-slate-400 flex items-center">
                  <Instagram className="w-4 h-4 mr-2" /> Instagram not linked
                </div>
              )}

              {creator.youtubeHandle ? (
                <a
                  href={`https://youtube.com/@${creator.youtubeHandle.replace('@', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-4 rounded-xl border border-red-100 bg-red-50/40 hover:bg-red-50 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
                      <Youtube className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block font-semibold">YouTube</span>
                      <span className="text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                        {creator.youtubeHandle}
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-red-600 transition-colors" />
                </a>
              ) : (
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 text-xs text-slate-400 flex items-center">
                  <Youtube className="w-4 h-4 mr-2" /> YouTube not linked
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Collab Action Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div>
              <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">Ready to Partner?</span>
              <h3 className="text-base font-bold text-slate-900 mt-1">Start a Collaboration</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Choose one of your open brand collabs to send an invitation, or start a direct conversation.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsInviteOpen(true)}
              className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition-all flex items-center justify-center hover:scale-[1.01]"
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Invite to Collab
            </button>

            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center"
              >
                <MessageCircle className="w-4 h-4 mr-2 text-emerald-600" />
                Message on WhatsApp
              </a>
            )}

            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-500">
              <div className="flex items-center justify-between">
                <span>Location</span>
                <span className="font-semibold text-slate-800">{creator.city || 'Flexible'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Verified Deliverables</span>
                <span className="font-semibold text-emerald-600">Reels, Stories & Posts</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Payment Protection</span>
                <span className="font-semibold text-slate-800">Escrow on completion</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      <InviteCreatorModal
        creator={creator}
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { merchantService } from '../services/merchantService';
import { MerchantProfile } from '../types';
import { Store, MapPin, Globe, Mail, Save, CheckCircle2, AlertCircle, Navigation } from 'lucide-react';

export const MerchantProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<Partial<MerchantProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const handleDetectGPS = () => {
    if (!navigator.geolocation) return;
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setProfile((prev) => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        }));
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`)
          .then((r) => r.json())
          .then((data) => {
            const detectedCity = data.address?.city || data.address?.town || data.address?.state_district || data.address?.suburb;
            if (detectedCity) {
              setProfile((prev) => ({ ...prev, city: detectedCity }));
            }
          })
          .catch(() => {})
          .finally(() => setDetectingLocation(false));
      },
      () => setDetectingLocation(false),
      { timeout: 8000 }
    );
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await merchantService.getProfile();
        setProfile(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load merchant profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const updated = await merchantService.updateProfile(profile);
      setProfile(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update merchant profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto py-12 px-4 animate-pulse"><div className="h-64 bg-slate-200 rounded-2xl" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 px-6 py-8 text-white">
          <h1 className="text-2xl font-black">Brand & Merchant Profile</h1>
          <p className="text-xs text-white/70 mt-1">Information displayed on your campaigns and partnership listings.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0" />
              Brand profile updated successfully!
            </div>
          )}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Brand / Commercial Name *
              </label>
              <input
                type="text"
                required
                value={profile.brandName || ''}
                onChange={(e) => setProfile({ ...profile, brandName: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Registered Company Name
              </label>
              <input
                type="text"
                value={profile.companyName || ''}
                onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Industry / Category
              </label>
              <input
                type="text"
                placeholder="e.g. Food & Beverage, Fitness, Fashion"
                value={profile.industry || ''}
                onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Website URL
              </label>
              <input
                type="url"
                placeholder="https://brand.com"
                value={profile.website || ''}
                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Logo Image URL
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={profile.logoUrl || ''}
              onChange={(e) => setProfile({ ...profile, logoUrl: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              About the Brand
            </label>
            <textarea
              rows={3}
              value={profile.description || ''}
              onChange={(e) => setProfile({ ...profile, description: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Physical Store Address
              </label>
              <input
                type="text"
                placeholder="e.g. 100ft Road, Indiranagar"
                value={profile.address || ''}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  City *
                </label>
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  disabled={detectingLocation}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center transition-colors disabled:opacity-50"
                >
                  <Navigation className="w-3 h-3 mr-1" />
                  {detectingLocation ? 'Detecting...' : 'Auto-Detect GPS'}
                </button>
              </div>
              <input
                type="text"
                required
                placeholder="e.g. Bengaluru, Mumbai"
                value={profile.city || ''}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-6 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-brand-600 rounded-xl shadow-md disabled:opacity-50 transition-all hover:scale-[1.01]"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Brand Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


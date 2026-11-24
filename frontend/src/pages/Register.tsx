import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { Role } from '../types';
import { Sparkles, Phone, Lock, Mail, ArrowRight, Store, Zap, Check, Instagram, ShieldCheck, KeyRound, CheckCircle2, RotateCw } from 'lucide-react';
import { InstagramLoginModal } from '../components/InstagramLoginModal';

export const Register: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialRole = (searchParams.get('role') as Role) || 'CREATOR';

  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<Role>(initialRole);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [brandName, setBrandName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInstagramModalOpen, setIsInstagramModalOpen] = useState(false);

  // OTP Verification state (Production carrier SMS)
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [otpSuccessMessage, setOtpSuccessMessage] = useState<string | null>(null);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSendOtp = async () => {
    if (!phone || phone.trim().length < 8) {
      setError('Please enter a valid phone number (at least 8 digits) before requesting OTP');
      return;
    }
    setError(null);
    setOtpSending(true);
    setOtpSuccessMessage(null);
    try {
      const res = await authService.sendOtp(phone.trim());
      setOtpSent(true);
      setResendCooldown(30); // 30-second cooldown between carrier SMS dispatches
      setOtpSuccessMessage(res.message || '6-digit OTP code sent via SMS to your mobile phone.');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP code');
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.trim().length < 6) {
      setError('Please enter the 6-digit OTP code received via SMS');
      return;
    }
    setError(null);
    setVerifyingOtp(true);
    try {
      await authService.verifyOtp(phone.trim(), otp.trim());
      setIsPhoneVerified(true);
      setOtpSuccessMessage('Phone number verified successfully!');
    } catch (err: any) {
      setError(err.message || 'Invalid or expired OTP code');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    if (isPhoneVerified || otpSent) {
      setIsPhoneVerified(false);
      setOtpSent(false);
      setOtp('');
      setResendCooldown(0);
      setOtpSuccessMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) {
      setError('Please provide phone number and password');
      return;
    }
    if (role === 'MERCHANT' && !brandName.trim()) {
      setError('Please provide your Brand or Business name');
      return;
    }
    if (!isPhoneVerified) {
      setError('Please verify your phone number with the 6-digit OTP before completing registration');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await register(
        phone.trim(),
        role,
        password,
        email || undefined,
        role === 'MERCHANT' ? brandName.trim() : undefined,
        role === 'CREATOR' ? displayName.trim() || undefined : undefined,
        otp.trim() || undefined
      );
      const saved = localStorage.getItem('creatorhub_user');
      const user = saved ? JSON.parse(saved) : null;
      const userRole = user?.role ? String(user.role).replace(/^ROLE_/, '').toUpperCase() : role;
      if (userRole === 'MERCHANT') {
        navigate('/merchant/dashboard');
      } else {
        navigate('/creator/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-2">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold text-slate-900">
            Creator<span className="text-brand-600">Hub</span>
          </span>
        </Link>
        <h2 className="mt-6 text-3xl font-extrabold text-slate-900 tracking-tight">
          Create your account
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Start collaborating on brand collabs in minutes
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 sm:rounded-2xl border border-slate-100 sm:px-10">
          {/* Role Switcher */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 text-center">
              I want to join as:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => setRole('CREATOR')}
                className={`p-3 rounded-xl border flex flex-col items-center space-y-1 transition-all ${
                  role === 'CREATOR'
                    ? 'border-brand-600 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20 shadow-sm'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Zap className="w-5 h-5 text-brand-600" />
                <span className="text-xs font-bold">Content Creator</span>
                <span className="text-[10px] text-slate-400">Apply to brand deals</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('MERCHANT')}
                className={`p-3 rounded-xl border flex flex-col items-center space-y-1 transition-all ${
                  role === 'MERCHANT'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20 shadow-sm'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Store className="w-5 h-5 text-indigo-600" />
                <span className="text-xs font-bold">Brand / Merchant</span>
                <span className="text-[10px] text-slate-400">Hire creators</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          {role === 'CREATOR' && (
            <div className="mb-6">
              <button
                type="button"
                onClick={() => setIsInstagramModalOpen(true)}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 shadow-md flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
              >
                <Instagram className="w-4 h-4" />
                <span>One-Click Sign Up with Instagram</span>
              </button>
              <div className="relative mt-5 mb-3">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                <div className="relative flex justify-center text-[11px] uppercase tracking-wider font-semibold text-slate-400"><span className="bg-white px-2">or with phone</span></div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {role === 'MERCHANT' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Brand / Business Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Store className="w-4 h-4 text-indigo-600" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Artisan Coffee, Nike Mumbai"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Creator Name / Display Name (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Sparkles className="w-4 h-4 text-brand-600" />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Rohan Sharma"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                  />
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Phone Number (Unique ID) *
                </label>
                {isPhoneVerified && (
                  <span className="inline-flex items-center text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Number Verified
                  </span>
                )}
              </div>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    disabled={isPhoneVerified}
                    placeholder="e.g. +91 98765 43210"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border font-medium ${
                      isPhoneVerified
                        ? 'border-emerald-200 bg-emerald-50/40 text-slate-900 cursor-not-allowed'
                        : 'border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500'
                    }`}
                  />
                  {isPhoneVerified && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-emerald-600">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {!isPhoneVerified && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpSending || resendCooldown > 0 || !phone || phone.trim().length < 8}
                    className="px-3.5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-all shadow-sm flex items-center whitespace-nowrap"
                  >
                    {otpSending ? (
                      <RotateCw className="w-3.5 h-3.5 animate-spin mr-1" />
                    ) : (
                      <KeyRound className="w-3.5 h-3.5 mr-1" />
                    )}
                    <span>
                      {resendCooldown > 0
                        ? `Resend in ${resendCooldown}s`
                        : otpSent
                        ? 'Resend OTP'
                        : 'Send OTP'}
                    </span>
                  </button>
                )}

                {isPhoneVerified && (
                  <button
                    type="button"
                    onClick={() => handlePhoneChange(phone)}
                    className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                  >
                    Change
                  </button>
                )}
              </div>
            </div>

            {/* OTP Verification Box */}
            {otpSent && !isPhoneVerified && (
              <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-3 animate-fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-indigo-950 flex items-center">
                    <KeyRound className="w-3.5 h-3.5 mr-1 text-indigo-600" /> Enter 6-Digit OTP Code
                  </span>
                  <span className="text-[11px] text-indigo-600 font-medium">Valid for 5 mins</span>
                </div>

                <p className="text-[11px] text-slate-600">
                  {otpSuccessMessage || 'Enter the 6-digit verification code received via SMS on your mobile phone.'}
                </p>

                <div className="flex space-x-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 px-3 py-2 text-sm text-center tracking-widest font-mono font-bold rounded-xl border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={verifyingOtp || otp.length < 6}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition-all shadow-sm flex items-center"
                  >
                    {verifyingOtp ? (
                      <RotateCw className="w-3.5 h-3.5 animate-spin mr-1" />
                    ) : (
                      <Check className="w-3.5 h-3.5 mr-1" />
                    )}
                    <span>Verify Code</span>
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Address (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="Create strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-md shadow-brand-500/20 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 transition-all hover:scale-[1.01]"
            >
              {loading ? 'Creating Account...' : (
                <>
                  Register & Continue <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <InstagramLoginModal
        isOpen={isInstagramModalOpen}
        onClose={() => setIsInstagramModalOpen(false)}
      />
    </div>
  );
};


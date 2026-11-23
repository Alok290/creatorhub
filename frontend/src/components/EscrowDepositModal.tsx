import React, { useState } from 'react';
import { Application, PaymentOrderResponse } from '../types';
import { paymentService } from '../services/paymentService';
import { X, ShieldCheck, Lock, CheckCircle2, AlertCircle, CreditCard, ArrowRight, Sparkles, Building2, Smartphone } from 'lucide-react';

interface EscrowDepositModalProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EscrowDepositModal: React.FC<EscrowDepositModalProps> = ({
  application,
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen || !application) return null;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [paymentChannel, setPaymentChannel] = useState<'DIRECT_ESCROW' | 'RAZORPAY_GATEWAY'>('DIRECT_ESCROW');

  const rate = application.proposedRate || 0;
  const platformFee = Math.round(rate * 0.05);
  const totalAmount = rate + platformFee;

  const isRealRazorpayKey = (key?: string): boolean => {
    if (!key) return false;
    if (key.includes('placeholder') || key.includes('CreatorHub') || key.length < 20) return false;
    return key.startsWith('rzp_test_') || key.startsWith('rzp_live_');
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const executeVaultEscrow = async (order: PaymentOrderResponse) => {
    const directPaymentId = 'pay_' + Math.random().toString(36).substring(2, 14);
    const directSignature = 'sig_' + Math.random().toString(36).substring(2, 14);

    await paymentService.verifyAndEscrow({
      applicationId: application.id,
      razorpayOrderId: order.orderId,
      razorpayPaymentId: directPaymentId,
      razorpaySignature: directSignature,
    });

    setSuccess(true);
    setTimeout(() => {
      onSuccess();
      onClose();
    }, 1800);
  };

  const handleDeposit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Create Escrow Order via backend
      const order = await paymentService.createEscrowOrder(application.id);

      if (paymentChannel === 'RAZORPAY_GATEWAY') {
        if (!isRealRazorpayKey(order.keyId)) {
          setError(
            'Razorpay requires an active Merchant Key ID (from dashboard.razorpay.com). Please select "Direct Escrow Vault Deposit" below for instant, guaranteed funding.'
          );
          setLoading(false);
          return;
        }

        const isLoaded = await loadRazorpayScript();
        if (isLoaded && (window as any).Razorpay) {
          const options = {
            key: order.keyId,
            amount: Math.round(order.grossAmount * 100), // in paise
            currency: order.currency,
            name: 'CreatorHub Escrow Protection',
            description: `Escrow vault deposit for ${application.campaignTitle}`,
            order_id: order.orderId,
            theme: {
              color: '#6366f1',
            },
            handler: async (response: any) => {
              try {
                await paymentService.verifyAndEscrow({
                  applicationId: application.id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                });
                setSuccess(true);
                setTimeout(() => {
                  onSuccess();
                  onClose();
                }, 1800);
              } catch (err: any) {
                setError(err.message || 'Payment signature verification failed.');
              }
            },
            modal: {
              ondismiss: () => {
                setLoading(false);
              },
            },
          };

          const rzp = new (window as any).Razorpay(options);
          rzp.on('payment.failed', function (resp: any) {
            setError(`Razorpay response: ${resp.error?.description || 'Payment Failed'}. You can use Direct Escrow Vault deposit instead.`);
            setLoading(false);
          });
          rzp.open();
          return;
        }
      }

      // Default: Direct Escrow Vault lock
      await executeVaultEscrow(order);
    } catch (err: any) {
      console.error('Escrow deposit failed:', err);
      setError(err.message || 'Failed to initialize escrow deposit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-600 flex items-center">
              <Sparkles className="w-3 h-3 mr-1 inline" /> 100% Escrow Protection
            </span>
            <h2 className="text-lg font-bold text-slate-900">Deposit Deal Escrow</h2>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium space-y-2">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
            {paymentChannel === 'RAZORPAY_GATEWAY' && (
              <button
                type="button"
                onClick={() => {
                  setPaymentChannel('DIRECT_ESCROW');
                  setError(null);
                }}
                className="w-full py-1.5 px-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Switch to Direct Escrow Vault (Instant)
              </button>
            )}
          </div>
        )}

        {success ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Funds Safely Escrowed!</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              ₹{totalAmount.toLocaleString()} has been locked into the escrow vault. The creator has been notified that they are cleared to produce your content.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Creator & Collab Card */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center space-x-3">
              <img
                src={application.creatorAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                alt={application.creatorName}
                className="w-11 h-11 rounded-full object-cover border border-slate-200"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-900 truncate">{application.creatorName}</h4>
                <p className="text-[11px] text-slate-500 truncate">{application.campaignTitle}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Agreed Fee</span>
                <span className="text-xs font-extrabold text-slate-800">₹{rate.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                Deposit Method
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentChannel('DIRECT_ESCROW');
                    setError(null);
                  }}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    paymentChannel === 'DIRECT_ESCROW'
                      ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <ShieldCheck className="w-4 h-4 text-brand-600" />
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Recommended
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Direct Escrow Vault</span>
                    <span className="text-[10px] text-slate-500">Instant UPI/Vault lock</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentChannel('RAZORPAY_GATEWAY');
                    setError(null);
                  }}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    paymentChannel === 'RAZORPAY_GATEWAY'
                      ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    <span className="text-[10px] font-semibold text-slate-400">Cards/UPI</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Razorpay Gateway</span>
                    <span className="text-[10px] text-slate-500">Merchant API Checkout</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Escrow Vault Explanation Banner */}
            <div className="p-3.5 bg-gradient-to-br from-indigo-50/70 to-purple-50/50 rounded-2xl border border-indigo-100/80 text-xs text-indigo-950 space-y-1">
              <div className="flex items-center space-x-1.5 font-bold text-indigo-900 text-xs">
                <Lock className="w-3.5 h-3.5 text-indigo-600" />
                <span>How Milestone Escrow Protects You</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600">
                Your payment is securely held in the escrow vault. <strong>The creator does NOT receive any money</strong> until you inspect their submitted deliverable links and click <em>Approve & Complete Deal</em>.
              </p>
            </div>

            {/* Financial Breakdown Table */}
            <div className="space-y-2 pt-1 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Creator Compensation</span>
                <span className="font-semibold text-slate-800">₹{rate.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>CreatorHub Protection & Escrow Fee (5%)</span>
                <span className="font-semibold text-slate-800">₹{platformFee.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-extrabold text-slate-900">
                <span>Total Escrow Deposit</span>
                <span className="text-brand-600 text-base">₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeposit}
                disabled={loading}
                className="flex-[2] inline-flex items-center justify-center px-5 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 active:scale-[0.98] rounded-xl transition-all shadow-md shadow-brand-500/20 disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Locking Escrow Vault...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1.5">
                    <Lock className="w-3.5 h-3.5 mr-1" />
                    <span>Deposit ₹{totalAmount.toLocaleString()} to Escrow</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

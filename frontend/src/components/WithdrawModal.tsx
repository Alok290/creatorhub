import React, { useState } from 'react';
import { PayoutMethod, PayoutRequest } from '../types';
import { paymentService } from '../services/paymentService';
import { X, ArrowDownRight, CheckCircle2, AlertCircle, Building2, Smartphone, ShieldCheck } from 'lucide-react';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  onSuccess: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  availableBalance,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const [method, setMethod] = useState<PayoutMethod>('UPI');
  const [amount, setAmount] = useState<string>(availableBalance > 0 ? String(availableBalance) : '');
  const [upiId, setUpiId] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payoutResult, setPayoutResult] = useState<PayoutRequest | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid withdrawal amount.');
      return;
    }
    if (numAmount > availableBalance) {
      setError(`Withdrawal amount cannot exceed your available balance of ₹${availableBalance.toLocaleString()}`);
      return;
    }

    if (method === 'UPI' && !upiId.trim()) {
      setError('Please enter a valid UPI ID (e.g. yourname@oksbi).');
      return;
    }

    if (method === 'BANK_TRANSFER') {
      if (!accountHolderName.trim() || !accountNumber.trim() || !ifscCode.trim()) {
        setError('Please fill in all bank account details.');
        return;
      }
    }

    setLoading(true);
    try {
      const res = await paymentService.requestPayout({
        amount: numAmount,
        payoutMethod: method,
        upiId: method === 'UPI' ? upiId.trim() : undefined,
        accountNumber: method === 'BANK_TRANSFER' ? accountNumber.trim() : undefined,
        ifscCode: method === 'BANK_TRANSFER' ? ifscCode.trim().toUpperCase() : undefined,
        accountHolderName: method === 'BANK_TRANSFER' ? accountHolderName.trim() : undefined,
      });

      setPayoutResult(res);
      onSuccess();
    } catch (err: any) {
      console.error('Payout failed:', err);
      setError(err.message || 'Failed to process payout request. Please try again.');
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
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <ArrowDownRight className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600">
              Direct Payout
            </span>
            <h2 className="text-lg font-bold text-slate-900">Withdraw Earnings</h2>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {payoutResult ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Withdrawal Initiated!</h3>
              <p className="text-xs text-slate-500 mt-1">
                ₹{payoutResult.amount.toLocaleString()} has been routed to your account.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Status</span>
                <span className="font-bold text-emerald-600">{payoutResult.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Method</span>
                <span className="font-semibold text-slate-800">{payoutResult.payoutMethod}</span>
              </div>
              {payoutResult.utrNumber && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Bank UTR Ref</span>
                  <span className="font-mono font-bold text-slate-800">{payoutResult.utrNumber}</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Available Balance Box */}
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Available to Withdraw
                </span>
                <span className="text-2xl font-black text-emerald-700">₹{availableBalance.toLocaleString()}</span>
              </div>
              <span className="text-[11px] text-emerald-700/80 font-medium bg-white/80 px-2.5 py-1 rounded-lg border border-emerald-200">
                0% Transfer Fee
              </span>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Amount to Withdraw (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  min="1"
                  max={availableBalance}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-16 py-2.5 text-sm font-bold text-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setAmount(String(availableBalance))}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2 py-1 rounded-md transition-colors"
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Payout Method Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Payout Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMethod('UPI')}
                  className={`p-3 rounded-xl border text-left flex items-center space-x-2.5 transition-all ${
                    method === 'UPI'
                      ? 'border-emerald-600 bg-emerald-50/40 text-emerald-950 font-bold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="text-xs">UPI (Instant)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('BANK_TRANSFER')}
                  className={`p-3 rounded-xl border text-left flex items-center space-x-2.5 transition-all ${
                    method === 'BANK_TRANSFER'
                      ? 'border-emerald-600 bg-emerald-50/40 text-emerald-950 font-bold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="text-xs">Direct Bank (NEFT)</span>
                </button>
              </div>
            </div>

            {/* Method Details */}
            {method === 'UPI' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  UPI ID (VPA)
                </label>
                <input
                  type="text"
                  placeholder="e.g. creator@okhdfcbank"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Beneficiary Account Holder Name
                  </label>
                  <input
                    type="text"
                    placeholder="Full name as registered in bank"
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      placeholder="Account number"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC0001234"
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value)}
                      className="w-full px-3 py-2 text-xs uppercase rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Security note */}
            <div className="p-3 bg-slate-50 rounded-xl flex items-center space-x-2 text-[11px] text-slate-500 border border-slate-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Transfers are processed securely through RBI-compliant banking networks.</span>
            </div>

            {/* Modal Actions */}
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
                type="submit"
                disabled={loading || availableBalance <= 0}
                className="flex-[2] py-2.5 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] rounded-xl transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
              >
                {loading ? 'Processing Transfer...' : `Withdraw ₹${amount || '0'}`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

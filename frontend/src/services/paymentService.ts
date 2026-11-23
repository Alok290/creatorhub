import { api } from './api';
import { Payment, PaymentOrderResponse, CreatorWallet, PayoutRequest, PayoutMethod } from '../types';

export const paymentService = {
  async createEscrowOrder(applicationId: number): Promise<PaymentOrderResponse> {
    return api.post<PaymentOrderResponse>(`/payments/create-order?applicationId=${applicationId}`);
  },

  async verifyPayment(
    applicationId: number,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature?: string
  ): Promise<Payment> {
    return api.post<Payment>('/payments/verify', {
      applicationId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });
  },

  async verifyAndEscrow(data: {
    applicationId: number;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature?: string;
  }): Promise<Payment> {
    return api.post<Payment>('/payments/verify', data);
  },

  async getMerchantPaymentHistory(): Promise<Payment[]> {
    return api.get<Payment[]>('/payments/merchant/history');
  },

  async getCreatorWallet(): Promise<CreatorWallet> {
    return api.get<CreatorWallet>('/payments/creator/wallet');
  },

  async getWallet(): Promise<CreatorWallet> {
    return this.getCreatorWallet();
  },

  async getPayoutHistory(): Promise<PayoutRequest[]> {
    const wallet = await this.getCreatorWallet();
    return wallet.recentPayouts || [];
  },

  async requestPayout(data: {
    amount: number;
    payoutMethod: PayoutMethod;
    upiId?: string;
    accountNumber?: string;
    ifscCode?: string;
    accountHolderName?: string;
  }): Promise<PayoutRequest> {
    return api.post<PayoutRequest>('/payments/creator/withdraw', data);
  },

  async getCreatorPaymentHistory(): Promise<Payment[]> {
    return api.get<Payment[]>('/payments/creator/history');
  },
};

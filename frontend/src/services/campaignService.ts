import { api } from './api';
import { Campaign, CampaignStatus, CompensationType } from '../types';

export interface CampaignFilter {
  category?: string;
  city?: string;
  minBudget?: number;
  search?: string;
}

export interface CreateCampaignInput {
  title: string;
  description: string;
  category: string;
  compensationType: CompensationType;
  budget: number;
  deliverables?: string;
  minFollowers?: number;
  targetCity?: string;
  deadline?: string;
}

export const campaignService = {
  async getFeaturedCampaigns(category?: string, city?: string): Promise<Campaign[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (city) params.append('city', city);
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get<Campaign[]>(`/public/campaigns${query}`);
  },

  async exploreCampaigns(filters: CampaignFilter = {}): Promise<Campaign[]> {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.city) params.append('city', filters.city);
    if (filters.minBudget) params.append('minBudget', filters.minBudget.toString());
    if (filters.search) params.append('search', filters.search);
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get<Campaign[]>(`/creators/campaigns${query}`);
  },

  async getCampaignDetails(id: number): Promise<Campaign> {
    return api.get<Campaign>(`/creators/campaigns/${id}`);
  },

  async createCampaign(input: CreateCampaignInput): Promise<Campaign> {
    return api.post<Campaign>('/merchants/campaigns', input);
  },

  async getMerchantCampaigns(): Promise<Campaign[]> {
    return api.get<Campaign[]>('/merchants/campaigns');
  },

  async getMerchantCampaignDetails(id: number): Promise<Campaign> {
    return api.get<Campaign>(`/merchants/campaigns/${id}`);
  },

  async updateCampaign(id: number, input: Partial<CreateCampaignInput>): Promise<Campaign> {
    return api.put<Campaign>(`/merchants/campaigns/${id}`, input);
  },

  async updateCampaignStatus(id: number, status: CampaignStatus): Promise<Campaign> {
    return api.put<Campaign>(`/merchants/campaigns/${id}/status?status=${status}`);
  }
};


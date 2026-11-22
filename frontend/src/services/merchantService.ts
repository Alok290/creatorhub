import { api } from './api';
import { Application, ApplicationStatus, Campaign, CreatorProfile, MerchantProfile } from '../types';

export const merchantService = {
  async getDashboard(): Promise<{
    profile: MerchantProfile;
    totalCampaigns: number;
    pendingApplications: number;
    activeCollaborations: number;
    completedCollaborations: number;
    recentCampaigns: Campaign[];
    recentApplications: Application[];
  }> {
    return api.get('/merchants/dashboard');
  },

  async getProfile(): Promise<MerchantProfile> {
    return api.get<MerchantProfile>('/merchants/profile');
  },

  async updateProfile(data: Partial<MerchantProfile>): Promise<MerchantProfile> {
    return api.put<MerchantProfile>('/merchants/profile', data);
  },

  async getCampaignApplications(campaignId: number): Promise<Application[]> {
    return api.get<Application[]>(`/merchants/campaigns/${campaignId}/applications`);
  },

  async getAllCollaborations(): Promise<Application[]> {
    return api.get<Application[]>('/merchants/collaborations');
  },

  async updateApplicationStatus(
    applicationId: number,
    status: ApplicationStatus,
    feedback?: string,
    rating?: number
  ): Promise<Application> {
    return api.put<Application>(`/merchants/applications/${applicationId}/status`, {
      status,
      feedback,
      rating
    });
  },

  async searchCreators(
    category?: string,
    city?: string,
    minFollowers?: number,
    search?: string,
    latitude?: number,
    longitude?: number,
    nearbyOnly?: boolean
  ): Promise<CreatorProfile[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (city) params.append('city', city);
    if (minFollowers) params.append('minFollowers', minFollowers.toString());
    if (search) params.append('search', search);
    if (latitude !== undefined) params.append('latitude', latitude.toString());
    if (longitude !== undefined) params.append('longitude', longitude.toString());
    if (nearbyOnly !== undefined) params.append('nearbyOnly', nearbyOnly.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get<CreatorProfile[]>(`/merchants/creators${query}`);
  },

  async getCreatorProfile(userId: number): Promise<CreatorProfile> {
    return api.get<CreatorProfile>(`/merchants/creators/${userId}`);
  },

  async getPlatformStats(): Promise<{
    totalCreators: number;
    activeCampaigns: number;
    totalUsers: number;
  }> {
    return api.get('/public/stats');
  }
};


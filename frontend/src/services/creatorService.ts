import { api } from './api';
import { Application, CreatorProfile } from '../types';

export const creatorService = {
  async getDashboard(): Promise<{
    profile: CreatorProfile;
    totalApplications: number;
    activeCollaborations: number;
    completedCollaborations: number;
    totalEarnings: number;
    recentApplications: Application[];
  }> {
    return api.get('/creators/dashboard');
  },

  async getProfile(): Promise<CreatorProfile> {
    return api.get<CreatorProfile>('/creators/profile');
  },

  async updateProfile(data: Partial<CreatorProfile>): Promise<CreatorProfile> {
    return api.put<CreatorProfile>('/creators/profile', data);
  },

  async applyToCampaign(campaignId: number, pitch: string, proposedRate?: number): Promise<Application> {
    return api.post<Application>(`/creators/campaigns/${campaignId}/apply`, { pitch, proposedRate });
  },

  async getMyApplications(): Promise<Application[]> {
    return api.get<Application[]>('/creators/applications');
  },

  async submitDeliverable(applicationId: number, deliverableUrl: string, deliverableNotes?: string): Promise<Application> {
    return api.post<Application>(`/creators/applications/${applicationId}/deliverable`, {
      deliverableUrl,
      deliverableNotes
    });
  }
};


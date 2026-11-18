export type Role = 'CREATOR' | 'MERCHANT' | 'ADMIN';

export interface User {
  id: number;
  phone: string;
  email?: string;
  role: Role;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  role: string;
  phone: string;
  userId: number;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface CreatorProfile {
  id: number;
  userId: number;
  phone: string;
  email?: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  categories?: string;
  instagramHandle?: string;
  instagramFollowers?: number;
  youtubeHandle?: string;
  youtubeSubscribers?: number;
  tiktokHandle?: string;
  tiktokFollowers?: number;
  baseRate?: number;
  totalFollowers?: number;
  portfolioLinks?: string;
  isAvailable: boolean;
}

export interface MerchantProfile {
  id: number;
  userId: number;
  phone: string;
  email?: string;
  companyName: string;
  brandName: string;
  logoUrl?: string;
  website?: string;
  industry?: string;
  description?: string;
  address?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  contactEmail?: string;
}

export type CompensationType = 'PAID' | 'BARTER' | 'HYBRID';
export type CampaignStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CLOSED';
export type ApplicationStatus = 'APPLIED' | 'ACCEPTED' | 'REJECTED' | 'IN_PROGRESS' | 'DELIVERABLES_SUBMITTED' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'ESCROWED' | 'PAID' | 'REFUNDED';

export interface Campaign {
  id: number;
  merchantId: number;
  merchantBrandName: string;
  merchantCompanyName?: string;
  merchantLogoUrl?: string;
  merchantCity?: string;
  title: string;
  description: string;
  category: string;
  compensationType: CompensationType;
  budget: number;
  deliverables?: string;
  minFollowers?: number;
  targetCity?: string;
  targetLatitude?: number;
  targetLongitude?: number;
  radiusKm?: number;
  deadline?: string;
  status: CampaignStatus;
  applicationCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: number;
  campaignId: number;
  campaignTitle: string;
  campaignCategory: string;
  campaignBudget: number;
  campaignTargetCity?: string;
  merchantId: number;
  merchantBrandName: string;
  merchantLogoUrl?: string;
  creatorId: number;
  creatorName: string;
  creatorPhone: string;
  creatorEmail?: string;
  creatorAvatarUrl?: string;
  creatorCity?: string;
  creatorTotalFollowers: number;
  creatorCategories?: string;
  creatorInstagramHandle?: string;
  pitch: string;
  proposedRate: number;
  status: ApplicationStatus;
  deliverableUrl?: string;
  deliverableNotes?: string;
  paymentStatus: PaymentStatus;
  merchantFeedback?: string;
  creatorFeedback?: string;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}


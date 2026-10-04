export type Role = 'user' | 'admin';

export type VerificationStatus = 'unverified' | 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  uid: string;
  fullName: string;
  email: string;
  whatsappNumber: string | null;
  verificationStatus: VerificationStatus;
  rejectionReason: string | null;
  avatarUrl: string | null;
  walletBalance: number;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  uid: string;
  fullName: string;
  email: string;
  whatsappNumber: string;
  status: VerificationStatus;
  rejectionReason?: string | null;
  submittedAt: string;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  avatarUrl?: string | null;
  userCreatedAt?: string;
  userBalance?: number;
}

export interface AppSettings {
  official_whatsapp_group_url: string;
  official_support_whatsapp: string;
  official_support_instagram: string;
  official_support_email: string;
  platform_name: string;
  verification_bonus: number;
  welcome_notice: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetUid: string | null;
  targetUserId: string | null;
  details: Record<string, any>;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'verification_bonus' | 'credit' | 'payout';
  amount: number;
  status: 'completed' | 'pending';
  description: string;
  createdAt: string;
}

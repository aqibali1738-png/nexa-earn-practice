import { User, VerificationRequest, AppSettings, AuditLog, Transaction, Role } from '../types';
import { supabase } from './supabase';

const TOKEN_KEY = 'nexa_earn_session_token';

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Authentication with Supabase
  async register(data: { fullName: string; email: string; password: string }): Promise<{ user: User; role: Role; token: string }> {
    const res = await apiRequest<{ user: User; role: Role; token: string; session?: any }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setAuthToken(res.token);

    if (supabase && res.session?.access_token && res.session?.refresh_token) {
      supabase.auth.setSession({
        access_token: res.session.access_token,
        refresh_token: res.session.refresh_token,
      }).catch(() => {});
    }

    return res;
  },

  async login(data: { email: string; password: string }): Promise<{ user: User; role: Role; token: string }> {
    const res = await apiRequest<{ user: User; role: Role; token: string; session?: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setAuthToken(res.token);

    if (supabase && res.session?.access_token && res.session?.refresh_token) {
      supabase.auth.setSession({
        access_token: res.session.access_token,
        refresh_token: res.session.refresh_token,
      }).catch(() => {});
    }

    return res;
  },

  async getMe(): Promise<{ user: User; role: Role }> {
    return apiRequest<{ user: User; role: Role }>('/api/auth/me');
  },

  async logout(): Promise<void> {
    try {
      if (supabase) {
        await supabase.auth.signOut().catch(() => {});
      }
      await apiRequest('/api/auth/logout', { method: 'POST' }).catch(() => {});
    } finally {
      setAuthToken(null);
    }
  },

  // Public Settings
  async getSettings(): Promise<AppSettings> {
    return apiRequest<AppSettings>('/api/settings');
  },

  // Account Verification
  async submitVerification(whatsappNumber: string): Promise<{ message: string; user: User; verificationStatus: string }> {
    return apiRequest('/api/verification/submit', {
      method: 'POST',
      body: JSON.stringify({ whatsappNumber }),
    });
  },

  async getMyVerificationStatus(): Promise<{
    status: string;
    whatsappNumber: string | null;
    rejectionReason: string | null;
    submittedAt: string | null;
    reviewedAt: string | null;
  }> {
    return apiRequest('/api/verification/my-status');
  },

  // User Profile & Wallet
  async updateProfile(data: { fullName?: string; avatarUrl?: string | null }): Promise<{ message: string; user: User }> {
    return apiRequest('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async getWallet(): Promise<{
    balance: number;
    currency: string;
    verificationStatus: string;
    transactions: Transaction[];
  }> {
    return apiRequest('/api/user/wallet');
  },

  // Admin APIs
  async getAdminUsers(query?: string, status?: string): Promise<{ users: User[]; total: number }> {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (status) params.append('status', status);
    return apiRequest<{ users: User[]; total: number }>(`/api/admin/users?${params.toString()}`);
  },

  async getAdminVerifications(status?: string): Promise<{ requests: VerificationRequest[] }> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    return apiRequest<{ requests: VerificationRequest[] }>(`/api/admin/verifications?${params.toString()}`);
  },

  async approveVerification(id: string): Promise<{ message: string; request: VerificationRequest; user: any }> {
    return apiRequest(`/api/admin/verification/${id}/approve`, {
      method: 'POST',
    });
  },

  async rejectVerification(id: string, reason: string): Promise<{ message: string; request: VerificationRequest; reason: string }> {
    return apiRequest(`/api/admin/verification/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  async updateAdminSettings(settings: Partial<AppSettings>): Promise<{ message: string; settings: AppSettings }> {
    return apiRequest('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  async getAdminAuditLogs(): Promise<{ logs: AuditLog[] }> {
    return apiRequest<{ logs: AuditLog[] }>('/api/admin/audit-logs');
  },
};

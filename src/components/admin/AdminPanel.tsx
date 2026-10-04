import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../Toast';
import { api } from '../../lib/api';
import { User, VerificationRequest, AppSettings, AuditLog } from '../../types';
import {
  Users,
  ShieldCheck,
  Settings as SettingsIcon,
  FileText,
  Search,
  CheckCircle,
  XCircle,
  Copy,
  Clock,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  MessageCircle,
  Save,
  Database,
  Filter,
  Eye,
  Check
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { user, settings, refreshSettings } = useAuth();
  const { showToast, copyToClipboard } = useToast();

  const [activeTab, setActiveTab] = useState<'users' | 'verifications' | 'settings' | 'audit' | 'database'>('verifications');

  // Users State
  const [users, setUsers] = useState<User[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Verifications State
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [loadingVerifications, setLoadingVerifications] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Rejection Modal
  const [rejectingItem, setRejectingItem] = useState<VerificationRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Settings State
  const [formSettings, setFormSettings] = useState<AppSettings>(
    settings || {
      official_whatsapp_group_url: '',
      official_support_whatsapp: '',
      official_support_instagram: '',
      official_support_email: '',
      platform_name: 'Nexa Earn',
      verification_bonus: 50,
      welcome_notice: '',
    }
  );
  const [savingSettings, setSavingSettings] = useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Sync settings when loaded
  useEffect(() => {
    if (settings) {
      setFormSettings(settings);
    }
  }, [settings]);

  useEffect(() => {
    if (activeTab === 'verifications') {
      fetchVerifications();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'audit') {
      fetchAuditLogs();
    }
  }, [activeTab, verificationFilter, userStatusFilter]);

  const fetchVerifications = async () => {
    setLoadingVerifications(true);
    try {
      const res = await api.getAdminVerifications(verificationFilter);
      setVerifications(res.requests);
    } catch (err: any) {
      showToast(err.message || 'Failed to load verifications', 'error');
    } finally {
      setLoadingVerifications(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.getAdminUsers(userSearchQuery, userStatusFilter);
      setUsers(res.users);
    } catch (err: any) {
      showToast(err.message || 'Failed to load users', 'error');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchAuditLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await api.getAdminAuditLogs();
      setAuditLogs(res.logs);
    } catch (err: any) {
      showToast(err.message || 'Failed to load audit logs', 'error');
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleApprove = async (req: VerificationRequest) => {
    if (req.status === 'approved') {
      showToast('This request is already approved', 'info');
      return;
    }
    setActionLoadingId(req.id);
    try {
      const res = await api.approveVerification(req.id);
      showToast(res.message, 'success');
      await Promise.all([fetchVerifications(), refreshSettings()]);
    } catch (err: any) {
      showToast(err.message || 'Failed to approve verification', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenReject = (req: VerificationRequest) => {
    setRejectingItem(req);
    setRejectReason('Did not join the official WhatsApp group or invalid number provided.');
  };

  const handleConfirmReject = async () => {
    if (!rejectingItem) return;
    setActionLoadingId(rejectingItem.id);
    try {
      const res = await api.rejectVerification(rejectingItem.id, rejectReason);
      showToast(res.message, 'success');
      setRejectingItem(null);
      await fetchVerifications();
    } catch (err: any) {
      showToast(err.message || 'Failed to reject verification', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await api.updateAdminSettings(formSettings);
      showToast(res.message, 'success');
      await refreshSettings();
    } catch (err: any) {
      showToast(err.message || 'Failed to update settings', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white pb-24">
      {/* Admin Top Navigation */}
      <div className="border-b border-white/10 bg-zinc-950/80 sticky top-[61px] z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-3 gap-4">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <button
                onClick={() => setActiveTab('verifications')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'verifications'
                    ? 'bg-[#00E676] text-black shadow-[0_0_15px_rgba(0,230,118,0.3)]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verification Requests</span>
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'users'
                    ? 'bg-[#00E676] text-black shadow-[0_0_15px_rgba(0,230,118,0.3)]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Users Management</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'settings'
                    ? 'bg-[#00E676] text-black shadow-[0_0_15px_rgba(0,230,118,0.3)]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <SettingsIcon className="w-4 h-4" />
                <span>App Settings</span>
              </button>

              <button
                onClick={() => setActiveTab('audit')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'audit'
                    ? 'bg-[#00E676] text-black shadow-[0_0_15px_rgba(0,230,118,0.3)]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Audit Logs</span>
              </button>

              <button
                onClick={() => setActiveTab('database')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'database'
                    ? 'bg-[#00E676] text-black shadow-[0_0_15px_rgba(0,230,118,0.3)]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>Supabase Schema</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Admin Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* ================================================================= */}
        {/* TAB 1: VERIFICATIONS MANAGEMENT */}
        {/* ================================================================= */}
        {activeTab === 'verifications' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white font-['Space_Grotesk']">
                  Account Verification Requests
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  Review submitted WhatsApp numbers, confirm membership in official WhatsApp group, and approve or reject accounts.
                </p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <select
                  value={verificationFilter}
                  onChange={(e) => setVerificationFilter(e.target.value)}
                  className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E676]"
                >
                  <option value="all">All Requests</option>
                  <option value="pending">Pending Only</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>

                <button
                  onClick={fetchVerifications}
                  className="p-2.5 rounded-xl bg-zinc-900 border border-white/10 hover:border-white/30 text-zinc-300 hover:text-white transition-all cursor-pointer"
                  title="Refresh Requests"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingVerifications ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Verification Requests List */}
            <div className="bg-zinc-950/80 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              {loadingVerifications ? (
                <div className="p-12 text-center text-zinc-400">
                  <div className="w-6 h-6 border-2 border-[#00E676] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span className="text-xs">Loading verification requests...</span>
                </div>
              ) : verifications.length === 0 ? (
                <div className="p-12 text-center text-zinc-500">
                  <ShieldCheck className="w-10 h-10 mx-auto text-zinc-700 mb-2" />
                  <p className="text-sm font-medium text-zinc-400">No verification requests found</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    When users submit their WhatsApp number to verify, requests will appear here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {verifications.map((req) => (
                    <div
                      key={req.id}
                      className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5 hover:bg-white/[0.02] transition-colors"
                    >
                      {/* User Info */}
                      <div className="flex items-start sm:items-center gap-4">
                        <div className="relative shrink-0">
                          {req.avatarUrl ? (
                            <img
                              src={req.avatarUrl}
                              alt={req.fullName}
                              className="w-12 h-12 rounded-xl object-cover border border-white/10"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center font-bold text-white text-base">
                              {req.fullName.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-base font-bold text-white">{req.fullName}</span>
                            <span className="text-xs text-zinc-400">({req.email})</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 mt-2">
                            {/* UID with copy button */}
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-900 border border-white/10 text-xs font-mono">
                              <span className="text-zinc-500">UID:</span>
                              <span className="font-bold text-[#00E676]">{req.uid}</span>
                              <button
                                onClick={() => copyToClipboard(req.uid, 'Copied')}
                                className="text-zinc-400 hover:text-white ml-1 cursor-pointer"
                                title="Copy UID"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>

                            {/* WhatsApp number with explicit COPY button */}
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-900 border border-emerald-500/20 text-xs">
                              <MessageCircle className="w-3.5 h-3.5 text-[#00E676]" />
                              <span className="font-mono font-bold text-white">{req.whatsappNumber}</span>
                              <button
                                onClick={() => copyToClipboard(req.whatsappNumber, 'Copied')}
                                className="ml-1 px-1.5 py-0.5 rounded bg-emerald-500/20 text-[#00E676] hover:bg-emerald-500/30 text-[10px] font-bold cursor-pointer transition-colors"
                                title="Copy WhatsApp Number"
                              >
                                Copy
                              </button>
                            </div>

                            {/* Date Submitted */}
                            <span className="text-xs text-zinc-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(req.submittedAt).toLocaleDateString()} {new Date(req.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {req.rejectionReason && (
                            <div className="mt-2 text-xs text-red-400 bg-red-950/40 px-2.5 py-1 rounded-lg border border-red-500/30 inline-block">
                              Rejection Reason: {req.rejectionReason}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status & Action Buttons */}
                      <div className="flex flex-wrap items-center gap-3 self-end lg:self-center shrink-0">
                        {/* Status Badge */}
                        {req.status === 'approved' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-[#00E676] border border-[#00E676]/40 text-xs font-bold">
                            <CheckCircle className="w-4 h-4" />
                            Approved
                          </span>
                        ) : req.status === 'rejected' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-bold">
                            <XCircle className="w-4 h-4" />
                            Rejected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-bold">
                            <Clock className="w-4 h-4" />
                            Pending Review
                          </span>
                        )}

                        {/* Action buttons (only if not approved) */}
                        {req.status !== 'approved' && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleApprove(req)}
                              disabled={actionLoadingId === req.id}
                              className="px-3.5 py-2 rounded-xl font-bold text-xs bg-[#00E676] hover:bg-[#00C853] text-black shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              {actionLoadingId === req.id ? (
                                <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Approve</span>
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => handleOpenReject(req)}
                              disabled={actionLoadingId === req.id}
                              className="px-3.5 py-2 rounded-xl font-bold text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: USERS MANAGEMENT */}
        {/* ================================================================= */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white font-['Space_Grotesk']">
                  Users Management
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  Search users by UID, Email, or submitted WhatsApp number. Inspect verification and copy credentials.
                </p>
              </div>

              <button
                onClick={fetchUsers}
                className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 hover:border-white/30 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? 'animate-spin' : ''}`} />
                <span>Refresh Directory</span>
              </button>
            </div>

            {/* Search & Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                  placeholder="Search by UID (e.g. NX-), Email, or WhatsApp number..."
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#00E676] transition-all"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#00E676]"
                >
                  <option value="">All Verification States</option>
                  <option value="approved">Verified (Approved)</option>
                  <option value="pending">Pending Verification</option>
                  <option value="rejected">Rejected</option>
                  <option value="unverified">Unverified</option>
                </select>
                <button
                  type="button"
                  onClick={fetchUsers}
                  className="px-4 py-2.5 bg-[#00E676] text-black font-bold text-xs rounded-xl cursor-pointer hover:bg-[#00C853] transition-colors shrink-0"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Users Directory */}
            <div className="bg-zinc-950/80 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              {loadingUsers ? (
                <div className="p-12 text-center text-zinc-400">
                  <div className="w-6 h-6 border-2 border-[#00E676] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span className="text-xs">Searching user records...</span>
                </div>
              ) : users.length === 0 ? (
                <div className="p-12 text-center text-zinc-500">
                  <Users className="w-10 h-10 mx-auto text-zinc-700 mb-2" />
                  <p className="text-sm font-medium text-zinc-400">No users found matching query</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {users.map((u) => (
                    <div
                      key={u.id}
                      className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-start sm:items-center gap-4">
                        {u.avatarUrl ? (
                          <img
                            src={u.avatarUrl}
                            alt={u.fullName}
                            className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center font-bold text-white text-base shrink-0">
                            {u.fullName.slice(0, 2).toUpperCase()}
                          </div>
                        )}

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-base font-bold text-white">{u.fullName}</span>
                            <span className="text-xs text-zinc-400">{u.email}</span>
                            {u.role === 'admin' && (
                              <span className="text-[10px] uppercase font-bold text-[#00E676] bg-emerald-500/10 px-2 py-0.5 rounded border border-[#00E676]/30">
                                Administrator
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 mt-2">
                            {/* UID with COPY button */}
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-900 border border-white/10 text-xs font-mono">
                              <span className="text-zinc-500">UID:</span>
                              <span className="font-bold text-[#00E676]">{u.uid}</span>
                              <button
                                onClick={() => copyToClipboard(u.uid, 'Copied')}
                                className="ml-1 px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 hover:text-white text-[10px] font-bold cursor-pointer transition-colors"
                                title="Copy UID"
                              >
                                Copy
                              </button>
                            </div>

                            {/* WhatsApp number with mandatory COPY button */}
                            {u.whatsappNumber ? (
                              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-900 border border-emerald-500/20 text-xs">
                                <MessageCircle className="w-3.5 h-3.5 text-[#00E676]" />
                                <span className="font-mono font-bold text-white">{u.whatsappNumber}</span>
                                <button
                                  onClick={() => copyToClipboard(u.whatsappNumber!, 'Copied')}
                                  className="ml-1 px-1.5 py-0.5 rounded bg-emerald-500/20 text-[#00E676] hover:bg-emerald-500/30 text-[10px] font-bold cursor-pointer transition-colors"
                                  title="Copy WhatsApp"
                                >
                                  Copy
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-zinc-500 italic">No WhatsApp submitted</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right side stats */}
                      <div className="flex items-center gap-4 self-end md:self-center">
                        <div className="text-right">
                          <div className="text-xs text-zinc-500">Wallet</div>
                          <div className="text-sm font-bold text-white font-mono">
                            ${u.walletBalance?.toFixed(2) || '0.00'}
                          </div>
                        </div>

                        {u.verificationStatus === 'approved' ? (
                          <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-[#00E676] border border-[#00E676]/40 text-xs font-bold">
                            Verified
                          </span>
                        ) : u.verificationStatus === 'pending' ? (
                          <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-bold">
                            Pending
                          </span>
                        ) : u.verificationStatus === 'rejected' ? (
                          <span className="px-3 py-1 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-bold">
                            Rejected
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-xl bg-zinc-900 text-zinc-400 border border-white/10 text-xs font-medium">
                            Unverified
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: APP SETTINGS */}
        {/* ================================================================= */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-zinc-950/80 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white font-['Space_Grotesk']">
                  Application Settings
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  Configure official WhatsApp group URLs, customer support channels, and platform policies.
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-5">
                {/* Official WhatsApp Group URL */}
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Official WhatsApp Group URL (Mandatory)</span>
                    <span className="text-[11px] text-[#00E676] font-normal">Used in Step 1 join button</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={formSettings.official_whatsapp_group_url}
                    onChange={(e) =>
                      setFormSettings({ ...formSettings, official_whatsapp_group_url: e.target.value })
                    }
                    placeholder="https://chat.whatsapp.com/..."
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00E676]"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Users will be opened to this exact link when they click "Join Official WhatsApp Group".
                  </p>
                </div>

                {/* Official Support WhatsApp Direct URL / Number */}
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Official Support WhatsApp (Direct Chat)
                  </label>
                  <input
                    type="text"
                    value={formSettings.official_support_whatsapp}
                    onChange={(e) =>
                      setFormSettings({ ...formSettings, official_support_whatsapp: e.target.value })
                    }
                    placeholder="https://wa.me/18005550199 or phone number"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00E676]"
                  />
                </div>

                {/* Official Instagram URL */}
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Official Instagram Support URL
                  </label>
                  <input
                    type="url"
                    value={formSettings.official_support_instagram}
                    onChange={(e) =>
                      setFormSettings({ ...formSettings, official_support_instagram: e.target.value })
                    }
                    placeholder="https://instagram.com/nexaearn_official"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00E676]"
                  />
                </div>

                {/* Support Email Desk */}
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Support Email Desk
                  </label>
                  <input
                    type="email"
                    value={formSettings.official_support_email}
                    onChange={(e) =>
                      setFormSettings({ ...formSettings, official_support_email: e.target.value })
                    }
                    placeholder="support@nexaearn.com"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00E676]"
                  />
                </div>

                {/* Verification Bonus */}
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Account Verification Reward Amount ($ USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formSettings.verification_bonus}
                    onChange={(e) =>
                      setFormSettings({ ...formSettings, verification_bonus: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00E676]"
                  />
                </div>

                {/* Welcome Notice Banner */}
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Global Community Announcement
                  </label>
                  <textarea
                    rows={3}
                    value={formSettings.welcome_notice}
                    onChange={(e) =>
                      setFormSettings({ ...formSettings, welcome_notice: e.target.value })
                    }
                    placeholder="Enter announcement text for user dashboard..."
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#00E676]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="px-6 py-3 rounded-xl font-bold text-xs bg-[#00E676] hover:bg-[#00C853] text-black shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingSettings ? 'Saving Settings...' : 'Save Application Settings'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4: AUDIT LOGS */}
        {/* ================================================================= */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white font-['Space_Grotesk']">
                  Administrative Audit Logs
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  Immutable record of approvals, rejections, settings updates, and target UIDs.
                </p>
              </div>

              <button
                onClick={fetchAuditLogs}
                className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 hover:border-white/30 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin' : ''}`} />
                <span>Refresh Logs</span>
              </button>
            </div>

            <div className="bg-zinc-950/80 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              {loadingLogs ? (
                <div className="p-12 text-center text-zinc-400">
                  <div className="w-6 h-6 border-2 border-[#00E676] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span className="text-xs">Loading audit entries...</span>
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="p-12 text-center text-zinc-500">
                  <FileText className="w-10 h-10 mx-auto text-zinc-700 mb-2" />
                  <p className="text-sm font-medium text-zinc-400">No audit logs recorded yet</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5 font-mono text-xs">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-4 sm:p-5 hover:bg-white/[0.02] transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              log.action.includes('APPROVED')
                                ? 'bg-emerald-500/20 text-[#00E676] border border-[#00E676]/30'
                                : log.action.includes('REJECTED')
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            }`}
                          >
                            {log.action}
                          </span>
                          <span className="text-zinc-400">by {log.adminEmail}</span>
                        </div>
                        <span className="text-zinc-500 text-[11px]">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="mt-2 text-zinc-300 flex flex-wrap gap-4">
                        {log.targetUid && (
                          <div>
                            <span className="text-zinc-500">Target UID: </span>
                            <span className="text-[#00E676] font-bold">{log.targetUid}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-zinc-500">Details: </span>
                          <span className="text-zinc-400">
                            {JSON.stringify(log.details)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 5: SUPABASE SCHEMA & DATABASE SETUP */}
        {/* ================================================================= */}
        {activeTab === 'database' && (
          <div className="space-y-6">
            <div className="bg-zinc-950/80 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white font-['Space_Grotesk']">
                    Supabase PostgreSQL Database Schema
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                    Complete DDL including RLS Policies, primary keys, unique constraints, and foreign keys.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const schemaSql = `-- Nexa Earn Supabase Schema\n-- Refer to /supabase-schema.sql in root directory for full code`;
                    copyToClipboard(schemaSql, 'SQL Copied');
                  }}
                  className="px-4 py-2 bg-zinc-900 border border-white/10 hover:border-[#00E676] text-xs font-mono font-bold text-[#00E676] rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy SQL</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10">
                  <div className="text-xs text-zinc-400 uppercase font-semibold">Configured Tables</div>
                  <div className="text-lg font-bold text-white mt-1">6 Core Tables</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">profiles, user_roles, verification_requests, app_settings, audit_logs, transactions</div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10">
                  <div className="text-xs text-zinc-400 uppercase font-semibold">Row Level Security</div>
                  <div className="text-lg font-bold text-[#00E676] mt-1">Enforced (RLS)</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">Strict user-isolation and role-based policies enabled</div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10">
                  <div className="text-xs text-zinc-400 uppercase font-semibold">UID Generator</div>
                  <div className="text-lg font-bold text-white mt-1">PL/pgSQL Trigger</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">Automatic unique NX-XXXXXX assignment</div>
                </div>
              </div>

              <div className="bg-black/90 rounded-2xl p-4 border border-white/10 overflow-x-auto text-[11px] font-mono text-zinc-300 max-h-96 no-scrollbar">
                <pre>{`-- Available in /supabase-schema.sql
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    uid VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    whatsapp_number VARCHAR(30) UNIQUE,
    verification_status verification_status_enum DEFAULT 'unverified' NOT NULL,
    rejection_reason TEXT,
    avatar_url TEXT,
    wallet_balance NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role user_role_enum DEFAULT 'user' NOT NULL,
    CONSTRAINT unique_user_role UNIQUE (user_id, role)
);

CREATE TABLE public.verification_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    uid VARCHAR(20) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    whatsapp_number VARCHAR(30) NOT NULL,
    status verification_status_enum DEFAULT 'pending' NOT NULL,
    rejection_reason TEXT,
    CONSTRAINT unique_pending_whatsapp UNIQUE (whatsapp_number)
);

-- RLS Security:
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;`}</pre>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Rejection Modal */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                  Reject Verification Request
                </h3>
                <p className="text-xs text-zinc-400">
                  Target UID: <strong className="text-[#00E676]">{rejectingItem.uid}</strong> ({rejectingItem.fullName})
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">
                Rejection Reason (Shown to User)
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Specify why this verification request is being rejected..."
                className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={actionLoadingId === rejectingItem.id}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                {actionLoadingId === rejectingItem.id ? 'Processing...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../Toast';
import { api } from '../../lib/api';
import { AccountVerificationSection } from './AccountVerificationSection';
import {
  Home,
  ShieldCheck,
  User as UserIcon,
  Wallet,
  Receipt,
  Headphones,
  Copy,
  CheckCircle,
  Clock,
  AlertTriangle,
  Upload,
  ExternalLink,
  MessageCircle,
  Instagram,
  Mail,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { Transaction } from '../../types';

export const UserDashboard: React.FC = () => {
  const { user, settings, refreshUser, updateUserAvatar } = useAuth();
  const { showToast, copyToClipboard } = useToast();

  const [activeTab, setActiveTab] = useState<'home' | 'verification' | 'wallet' | 'transactions' | 'profile' | 'support'>('home');
  const [walletData, setWalletData] = useState<{ balance: number; transactions: Transaction[] }>({
    balance: user?.walletBalance || 0,
    transactions: [],
  });
  const [walletLoading, setWalletLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [editName, setEditName] = useState(user?.fullName || '');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (activeTab === 'wallet' || activeTab === 'transactions') {
      fetchWallet();
    }
  }, [activeTab]);

  const fetchWallet = async () => {
    setWalletLoading(true);
    try {
      const data = await api.getWallet();
      setWalletData({
        balance: data.balance,
        transactions: data.transactions,
      });
    } catch (err) {
      console.error('Failed to load wallet', err);
    } finally {
      setWalletLoading(false);
    }
  };

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size exceeds 5MB limit', 'error');
      return;
    }

    setAvatarUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Url = reader.result as string;
        await updateUserAvatar(base64Url);
        showToast('Profile picture updated successfully', 'success');
      } catch (err: any) {
        showToast('Failed to update avatar', 'error');
      } finally {
        setAvatarUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    setSavingProfile(true);
    try {
      await api.updateProfile({ fullName: editName.trim() });
      await refreshUser();
      showToast('Profile updated', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#060608] text-white pb-24 lg:pb-12">
      {/* Navigation Sub-bar */}
      <div className="border-b border-white/5 bg-zinc-950/60 sticky top-[61px] z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-2.5">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'home'
                  ? 'bg-[#00E676] text-black shadow-[0_0_15px_rgba(0,230,118,0.3)]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>

            <button
              onClick={() => setActiveTab('verification')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap relative ${
                activeTab === 'verification'
                  ? 'bg-[#00E676] text-black shadow-[0_0_15px_rgba(0,230,118,0.3)]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Account Verification</span>
              {user.verificationStatus !== 'approved' && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse ml-0.5" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('wallet')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'wallet'
                  ? 'bg-[#00E676] text-black shadow-[0_0_15px_rgba(0,230,118,0.3)]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>Wallet</span>
            </button>

            <button
              onClick={() => setActiveTab('transactions')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'transactions'
                  ? 'bg-[#00E676] text-black shadow-[0_0_15px_rgba(0,230,118,0.3)]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Transactions</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'bg-[#00E676] text-black shadow-[0_0_15px_rgba(0,230,118,0.3)]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('support')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'support'
                  ? 'bg-[#00E676] text-black shadow-[0_0_15px_rgba(0,230,118,0.3)]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Headphones className="w-4 h-4" />
              <span>Customer Support</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* TAB 1: HOME */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            {/* Welcome & UID Hero Card */}
            <div className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#00E676]/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.fullName}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-[#00E676]/50 shadow-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center text-xl font-bold text-white">
                        {user.fullName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    {user.verificationStatus === 'approved' && (
                      <div className="absolute -bottom-1 -right-1 bg-[#00E676] text-black rounded-full p-1 border-2 border-black">
                        <CheckCircle className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-extrabold text-white font-['Space_Grotesk']">
                        Hello, {user.fullName}
                      </h2>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">{user.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => copyToClipboard(user.uid, 'UID Copied!')}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/90 border border-white/10 hover:border-[#00E676]/40 text-xs font-mono text-[#00E676] transition-all"
                      >
                        <span className="text-zinc-500">UID:</span>
                        <span className="font-bold">{user.uid}</span>
                        <Copy className="w-3 h-3 text-zinc-400" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Balance & Action Box */}
                <div className="bg-zinc-900/90 border border-white/10 rounded-2xl p-4 sm:p-5 flex items-center justify-between sm:justify-start gap-6">
                  <div>
                    <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                      Wallet Balance
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-white font-['Space_Grotesk'] mt-0.5">
                      ${user.walletBalance.toFixed(2)}
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('wallet')}
                    className="p-3 rounded-xl bg-[#00E676]/10 hover:bg-[#00E676] text-[#00E676] hover:text-black border border-[#00E676]/30 transition-all cursor-pointer"
                  >
                    <ArrowUpRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Verification Alert Callout (if not approved) */}
            {user.verificationStatus !== 'approved' && (
              <div className="bg-gradient-to-r from-amber-500/10 via-zinc-900 to-zinc-950 border border-amber-500/30 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      Complete Account Verification
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Join our official WhatsApp group and submit your number to verify your account and unlock your $50 welcome bonus!
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('verification')}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs bg-amber-400 hover:bg-amber-300 text-black shadow-md transition-all shrink-0 cursor-pointer self-start sm:self-auto"
                >
                  Verify Now
                </button>
              </div>
            )}

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-zinc-950/80 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase">
                  <span>Account State</span>
                  <ShieldCheck className="w-4 h-4 text-[#00E676]" />
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-lg font-bold capitalize text-white">
                    {user.verificationStatus}
                  </span>
                  {user.verificationStatus === 'approved' && (
                    <span className="text-[11px] font-bold text-[#00E676] bg-[#00E676]/10 px-2 py-0.5 rounded-full border border-[#00E676]/20">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 mt-1">Official Member Record</p>
              </div>

              <div className="bg-zinc-950/80 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase">
                  <span>WhatsApp Member</span>
                  <MessageCircle className="w-4 h-4 text-[#00E676]" />
                </div>
                <div className="mt-3 text-sm font-mono font-bold text-white truncate">
                  {user.whatsappNumber || 'Not submitted yet'}
                </div>
                <p className="text-xs text-zinc-500 mt-1">Bound to UID: {user.uid}</p>
              </div>

              <div className="bg-zinc-950/80 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase">
                  <span>Official Group</span>
                  <TrendingUp className="w-4 h-4 text-[#00E676]" />
                </div>
                <div className="mt-3 text-lg font-bold text-white">
                  Nexa Community
                </div>
                <p className="text-xs text-[#00E676] mt-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Exclusive network
                </p>
              </div>
            </div>

            {/* Embedded Verification Component if not verified */}
            <div className="pt-2">
              <AccountVerificationSection />
            </div>
          </div>
        )}

        {/* TAB 2: ACCOUNT VERIFICATION */}
        {activeTab === 'verification' && (
          <AccountVerificationSection />
        )}

        {/* TAB 3: WALLET */}
        {activeTab === 'wallet' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-[#00E676]/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-72 h-72 bg-[#00E676]/15 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 max-w-xl">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00E676]/10 border border-[#00E676]/30 text-[#00E676] text-xs font-semibold uppercase tracking-wider mb-3">
                  <CreditCard className="w-3.5 h-3.5" />
                  Primary Nexa Wallet
                </span>
                <h3 className="text-sm font-semibold text-zinc-400">Available Balance</h3>
                <div className="text-4xl sm:text-5xl font-black text-white font-['Space_Grotesk'] mt-1">
                  ${user.walletBalance.toFixed(2)}
                  <span className="text-xs font-bold text-[#00E676] uppercase ml-2 tracking-normal">USD</span>
                </div>
                <p className="text-xs text-zinc-400 mt-2">
                  Account Status: <strong className="text-white capitalize">{user.verificationStatus}</strong>
                </p>
              </div>
            </div>

            {/* Quick Wallet Rules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-zinc-950/80 border border-white/10 rounded-2xl p-5">
                <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#00E676]" />
                  Verification Bonus Credit
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Upon administrator approval of your official WhatsApp group membership, your account is credited with a $50.00 verification reward.
                </p>
              </div>
              <div className="bg-zinc-950/80 border border-white/10 rounded-2xl p-5">
                <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#00E676]" />
                  Secure Ledger
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  All credits and transaction records are cryptographically verified and bound directly to your unique UID ({user.uid}).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TRANSACTIONS */}
        {activeTab === 'transactions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">Transaction History</h3>
                <p className="text-xs text-zinc-400">Real-time ledger entries associated with UID: {user.uid}</p>
              </div>
            </div>

            <div className="bg-zinc-950/80 border border-white/10 rounded-3xl overflow-hidden shadow-xl">
              {walletLoading ? (
                <div className="p-12 text-center text-zinc-400">
                  <div className="w-6 h-6 border-2 border-[#00E676] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span className="text-xs">Loading transaction ledger...</span>
                </div>
              ) : walletData.transactions.length === 0 ? (
                <div className="p-12 text-center text-zinc-500 space-y-2">
                  <Receipt className="w-8 h-8 mx-auto text-zinc-600" />
                  <p className="text-sm font-medium text-zinc-400">No transactions recorded yet</p>
                  <p className="text-xs text-zinc-500">
                    Complete your WhatsApp verification to receive your initial verification bonus credit.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {walletData.transactions.map((tx) => (
                    <div key={tx.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#00E676]/10 border border-[#00E676]/20 text-[#00E676] flex items-center justify-center font-bold">
                          +
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-white">{tx.description}</div>
                          <div className="text-[11px] text-zinc-500 mt-0.5">
                            {new Date(tx.createdAt).toLocaleDateString()} at {new Date(tx.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm sm:text-base font-black text-[#00E676] font-mono">
                          +${Number(tx.amount).toFixed(2)}
                        </div>
                        <span className="text-[10px] uppercase font-bold text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-white/5">
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: PROFILE */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-zinc-950/80 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
              <h3 className="text-xl font-bold text-white font-['Space_Grotesk'] mb-6">User Profile</h3>

              {/* Avatar Section */}
              <div className="flex items-center gap-5 pb-6 border-b border-white/10">
                <div className="relative">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName}
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-[#00E676]/40 shadow-xl"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center text-2xl font-bold text-white">
                      {user.fullName.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-[#00E676]/40 text-xs font-semibold text-white transition-all cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-[#00E676]" />
                    <span>{avatarUploading ? 'Uploading...' : 'Upload Profile Picture'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFile}
                      disabled={avatarUploading}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-zinc-500">Supported formats: JPG, PNG, WebP (Max 5MB)</p>
                </div>
              </div>

              {/* Profile Details Form */}
              <form onSubmit={handleSaveProfile} className="space-y-4 pt-6">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">
                    Assigned UID (Permanent)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      disabled
                      value={user.uid}
                      className="w-full bg-zinc-900/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-[#00E676] font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => copyToClipboard(user.uid, 'UID Copied!')}
                      className="p-2.5 rounded-xl bg-zinc-900 border border-white/10 hover:border-[#00E676] text-white hover:text-[#00E676] transition-all cursor-pointer"
                      title="Copy UID"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E676]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">
                    Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full bg-zinc-900/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-400 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">
                    Verified WhatsApp Number
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      disabled
                      value={user.whatsappNumber || 'Not verified yet'}
                      className="w-full bg-zinc-900/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-400"
                    />
                    {user.whatsappNumber && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(user.whatsappNumber!, 'WhatsApp Number Copied!')}
                        className="p-2.5 rounded-xl bg-zinc-900 border border-white/10 hover:border-[#00E676] text-white hover:text-[#00E676] transition-all cursor-pointer"
                        title="Copy WhatsApp Number"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="py-2.5 px-5 rounded-xl font-bold text-xs bg-[#00E676] hover:bg-[#00C853] text-black transition-all cursor-pointer"
                  >
                    {savingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 6: CUSTOMER SUPPORT */}
        {activeTab === 'support' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-zinc-950/80 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="max-w-xl">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00E676]/10 border border-[#00E676]/20 text-[#00E676] text-xs font-semibold uppercase tracking-wider mb-3">
                  <Headphones className="w-3.5 h-3.5" />
                  Official Support Desk
                </span>
                <h3 className="text-2xl font-extrabold text-white font-['Space_Grotesk']">
                  How Can We Help You?
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed">
                  Connect directly with verified Nexa Earn administrators and official support representatives.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {/* WhatsApp Support */}
                <div className="p-5 rounded-2xl bg-zinc-900 border border-white/10 hover:border-emerald-500/40 transition-all flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-[#00E676] flex items-center justify-center mb-3">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-white">Official WhatsApp Support</h4>
                    <p className="text-xs text-zinc-400 mt-1">
                      Direct messaging for urgent account verification queries.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/5">
                    {settings?.official_support_whatsapp ? (
                      <a
                        href={settings.official_support_whatsapp.startsWith('http') ? settings.official_support_whatsapp : `https://wa.me/${settings.official_support_whatsapp.replace(/[^\d]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00E676] hover:underline"
                      >
                        <span>Chat on WhatsApp</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="text-xs text-zinc-500">Contact admin for direct link</span>
                    )}
                  </div>
                </div>

                {/* Instagram Support */}
                <div className="p-5 rounded-2xl bg-zinc-900 border border-white/10 hover:border-pink-500/40 transition-all flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center mb-3">
                      <Instagram className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-white">Instagram Community</h4>
                    <p className="text-xs text-zinc-400 mt-1">
                      Follow announcements, proof of earnings, and live updates.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/5">
                    {settings?.official_support_instagram ? (
                      <a
                        href={settings.official_support_instagram}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-400 hover:underline"
                      >
                        <span>Follow on Instagram</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="text-xs text-zinc-500">Configured in admin settings</span>
                    )}
                  </div>
                </div>

                {/* Support Email */}
                <div className="p-5 rounded-2xl bg-zinc-900 border border-white/10 hover:border-blue-500/40 transition-all flex flex-col justify-between sm:col-span-2">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Customer Support Email</h4>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        For business inquiries, partner requests, or compliance reviews.
                      </p>
                      <div className="mt-2 text-xs font-mono font-bold text-blue-300">
                        {settings?.official_support_email || 'support@nexaearn.com'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

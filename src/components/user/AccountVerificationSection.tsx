import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../Toast';
import { api } from '../../lib/api';
import {
  MessageCircle,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  ArrowRight,
  Info,
  Sparkles,
  Lock
} from 'lucide-react';

export const AccountVerificationSection: React.FC = () => {
  const { user, settings, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [whatsappNumber, setWhatsappNumber] = useState(user?.whatsappNumber || '');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const status = user?.verificationStatus || 'unverified';
  const groupUrl = settings?.official_whatsapp_group_url;

  const handleJoinWhatsApp = () => {
    if (!groupUrl || groupUrl.trim() === '' || groupUrl.includes('example')) {
      showToast('Official WhatsApp link is currently being configured by Administrator', 'info');
      return;
    }

    // Try direct WhatsApp URL or fallback
    const targetUrl = groupUrl.trim();
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
    showToast('Opening official Nexa Earn WhatsApp group...', 'success');
  };

  const handleSubmitNumber = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const clean = whatsappNumber.trim();
    if (!clean) {
      setErrorMsg('Please enter your WhatsApp number including country code');
      return;
    }

    if (clean.replace(/[^\d]/g, '').length < 7) {
      setErrorMsg('Please enter a valid phone number (at least 7 digits)');
      return;
    }

    setLoading(true);
    try {
      const res = await api.submitVerification(clean);
      showToast(res.message, 'success');
      await refreshUser();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit verification number');
      showToast(err.message || 'Error submitting request', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 border border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00E676]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E676]/10 border border-[#00E676]/20 text-[#00E676] text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Mandatory Verification Flow
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-['Space_Grotesk'] text-white">
            Account Verification
          </h2>
          <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
            To ensure an exclusive, bot-free network and protect community earnings, complete the 3 steps below to verify your Nexa Earn account.
          </p>

          {/* Current Status Pill */}
          <div className="mt-4 flex items-center gap-3">
            <span className="text-xs text-zinc-400 font-medium">Status:</span>
            {status === 'approved' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-[#00E676] border border-[#00E676]/40 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified Account
              </span>
            ) : status === 'pending' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-bold animate-pulse">
                <Clock className="w-3.5 h-3.5" />
                Pending Admin Approval
              </span>
            ) : status === 'rejected' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-bold">
                <AlertCircle className="w-3.5 h-3.5" />
                Verification Rejected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 border border-white/10 text-xs font-semibold">
                Action Required
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Rejection Notice if applicable */}
      {status === 'rejected' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-red-300">Verification Request Rejected by Admin</h4>
              <p className="text-xs text-red-300/90 mt-1">
                Reason: {user?.rejectionReason || 'Invalid WhatsApp number or failed to join official group.'}
              </p>
              <p className="text-xs text-zinc-300 mt-2">
                Please ensure you join the official WhatsApp group below, double-check your number, and re-submit your verification.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3 Step Interactive Process */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Step 1: Join WhatsApp Group */}
        <div className="bg-zinc-950/80 border border-white/10 hover:border-emerald-500/30 rounded-3xl p-6 flex flex-col justify-between transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#00E676] flex items-center justify-center font-bold text-xs">
                01
              </span>
              <MessageCircle className="w-5 h-5 text-[#00E676]" />
            </div>
            <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
              Step 1 — Join Official WhatsApp Group
            </h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Click the button below to join the official Nexa Earn Community group. Stay in the group to maintain verified status.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5">
            {groupUrl && groupUrl.startsWith('http') ? (
              <button
                type="button"
                onClick={handleJoinWhatsApp}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-zinc-900 hover:bg-[#00E676] text-white hover:text-black border border-emerald-500/30 hover:border-[#00E676] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg group"
              >
                <MessageCircle className="w-4 h-4 text-[#00E676] group-hover:text-black transition-colors" />
                <span>Join Official WhatsApp Group</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="text-center p-3 rounded-xl bg-zinc-900/60 border border-white/5 text-zinc-400 text-xs">
                WhatsApp Group link is currently being updated in settings.
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Submit WhatsApp Number */}
        <div className="bg-zinc-950/80 border border-white/10 hover:border-emerald-500/30 rounded-3xl p-6 flex flex-col justify-between transition-all md:col-span-1">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#00E676] flex items-center justify-center font-bold text-xs">
                02
              </span>
              <Phone className="w-5 h-5 text-[#00E676]" />
            </div>
            <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
              Step 2 — Submit WhatsApp Number
            </h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Enter the exact phone number with country code that you used to join the official WhatsApp group.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5">
            {errorMsg && (
              <div className="mb-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmitNumber} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                  WhatsApp Number Used to Join
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    disabled={status === 'approved' || loading}
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+1 234 567 8900"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#00E676] transition-all disabled:opacity-60"
                  />
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">
                  Include country code (e.g. +1, +44, +91, +234). Unique per account.
                </p>
              </div>

              {status !== 'approved' && (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-[#00E676] to-[#00C853] text-black shadow-md hover:shadow-[0_0_20px_rgba(0,230,118,0.4)] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{status === 'pending' ? 'Update Submitted Number' : 'Submit for Verification'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Step 3: Account Verification Status */}
        <div className="bg-zinc-950/80 border border-white/10 hover:border-emerald-500/30 rounded-3xl p-6 flex flex-col justify-between transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#00E676] flex items-center justify-center font-bold text-xs">
                03
              </span>
              <ShieldCheck className="w-5 h-5 text-[#00E676]" />
            </div>
            <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
              Step 3 — Admin Verification
            </h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Once submitted, an official administrator verifies your membership in the WhatsApp group.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 space-y-3">
            {status === 'approved' ? (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-xs text-[#00E676]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approved & Verified</span>
                </div>
                <p className="text-[11px] text-zinc-300">
                  Your WhatsApp membership is confirmed. Welcome bonus has been credited to your wallet!
                </p>
              </div>
            ) : status === 'pending' ? (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-xs text-amber-400">
                  <Clock className="w-4 h-4" />
                  <span>Pending Admin Review</span>
                </div>
                <p className="text-[11px] text-zinc-300">
                  Your request is queued. An admin will check the official group and approve your account shortly.
                </p>
              </div>
            ) : status === 'rejected' ? (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-xs text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>Submission Rejected</span>
                </div>
                <p className="text-[11px] text-zinc-300">
                  Check the reason above and re-submit with your correct joined WhatsApp number.
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-400 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-xs text-zinc-300">
                  <Info className="w-4 h-4 text-zinc-400" />
                  <span>Awaiting Your Submission</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Complete Steps 1 and 2 to activate your verification review.
                </p>
              </div>
            )}

            <div className="text-[10px] text-zinc-500 flex items-center gap-1">
              <Lock className="w-3 h-3 text-zinc-400" />
              <span>Admin-governed verification policy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

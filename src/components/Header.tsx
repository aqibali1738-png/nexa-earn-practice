import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { ShieldCheck, LogOut, CheckCircle, Clock, AlertTriangle, Copy, UserCheck } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, role, logout } = useAuth();
  const { copyToClipboard } = useToast();

  if (!user) return null;

  const isAdmin = role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00E676] to-[#00A854] flex items-center justify-center text-black font-extrabold shadow-[0_0_20px_rgba(0,230,118,0.35)] shrink-0">
            <span className="font-mono text-base font-black tracking-tighter">NX</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white font-['Space_Grotesk']">
                NEXA<span className="text-[#00E676]">EARN</span>
              </span>
              {isAdmin ? (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#00E676] border border-[#00E676]/40">
                  Admin
                </span>
              ) : (
                <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                  Portal
                </span>
              )}
            </div>
          </div>
        </div>

        {/* User Quick Info & Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* UID Badge with Copy */}
          <button
            onClick={() => copyToClipboard(user.uid, 'UID Copied!')}
            title="Click to copy UID"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-white/10 hover:border-[#00E676]/40 text-xs font-mono text-white/90 hover:text-white transition-all group"
          >
            <span className="text-white/40 group-hover:text-[#00E676] transition-colors">UID:</span>
            <span className="font-semibold text-[#00E676]">{user.uid}</span>
            <Copy className="w-3 h-3 text-white/40 group-hover:text-white ml-0.5" />
          </button>

          {/* Verification Status Pill (for user) */}
          {!isAdmin && (
            <div className="hidden xs:flex items-center">
              {user.verificationStatus === 'approved' ? (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-[#00E676] bg-[#00E676]/10 px-2 py-1 rounded-md border border-[#00E676]/20">
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </span>
              ) : user.verificationStatus === 'pending' ? (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-400/10 px-2 py-1 rounded-md border border-amber-400/20">
                  <Clock className="w-3 h-3" />
                  Pending
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400 bg-zinc-800/80 px-2 py-1 rounded-md border border-white/10">
                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                  Unverified
                </span>
              )}
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-300 hover:text-red-200 text-xs font-medium transition-all"
            title="Log out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

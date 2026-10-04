import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { Lock, Mail, User as UserIcon, ArrowRight, ShieldCheck, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { login, register } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (mode === 'register') {
      if (!fullName.trim()) {
        setErrorMsg('Please enter your full name');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const role = await login({ email, password });
        showToast(role === 'admin' ? 'Welcome back, Administrator' : 'Welcome to Nexa Earn', 'success');
      } else {
        const role = await register({ fullName, email, password });
        showToast('Account registered successfully!', 'success');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please try again.');
      showToast(err.message || 'Failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (roleType: 'admin' | 'user') => {
    if (roleType === 'admin') {
      setEmail('admin@nexaearn.com');
      setPassword('AdminPassword123!');
      setMode('login');
      showToast('Admin credentials filled', 'info');
    } else {
      setEmail('demo@nexaearn.com');
      setPassword('UserPassword123!');
      setMode('login');
      showToast('Demo user credentials filled', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Background ambient decorative glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#00E676]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#00A854]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00E676] to-[#00A854] text-black font-extrabold shadow-[0_0_30px_rgba(0,230,118,0.4)] mb-4">
            <span className="font-mono text-2xl font-black tracking-tight">NX</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-['Space_Grotesk'] tracking-tight">
            NEXA <span className="text-[#00E676]">EARN</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 max-w-xs mx-auto">
            {mode === 'login'
              ? 'Enter your credentials to access your portal'
              : 'Join the premier community and start earning'}
          </p>
        </div>

        {/* Auth Box */}
        <div className="bg-zinc-950/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
          {/* Tab Selector */}
          <div className="grid grid-cols-2 p-1 bg-zinc-900/90 rounded-2xl border border-white/5 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
              }}
              className={`py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-zinc-800 to-zinc-700 text-white shadow-md border border-white/10'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
              }}
              className={`py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-zinc-800 to-zinc-700 text-white shadow-md border border-white/10'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Michael Scott"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#00E676] focus:ring-1 focus:ring-[#00E676] transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#00E676] focus:ring-1 focus:ring-[#00E676] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#00E676] focus:ring-1 focus:ring-[#00E676] transition-all"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#00E676] focus:ring-1 focus:ring-[#00E676] transition-all"
                  />
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div className="text-[11px] text-zinc-400 bg-zinc-900/60 p-3 rounded-xl border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Instant access • Email verification is OFF</span>
                </div>
                <div>A unique UID will be generated automatically for your account.</div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#00E676] to-[#00C853] text-black shadow-[0_0_25px_rgba(0,230,118,0.3)] hover:shadow-[0_0_35px_rgba(0,230,118,0.5)] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'Access Portal' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Toolbar */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#00E676]" />
                Instant Demo Access
              </span>
              <span className="text-[10px] text-zinc-500">1-Click Test</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('admin')}
                className="px-2.5 py-2 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-emerald-500/20 hover:border-emerald-500/40 text-left transition-all"
              >
                <div className="text-[11px] font-bold text-[#00E676]">Admin Panel</div>
                <div className="text-[10px] text-zinc-400 truncate">admin@nexaearn.com</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('user')}
                className="px-2.5 py-2 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 hover:border-white/20 text-left transition-all"
              >
                <div className="text-[11px] font-bold text-white">Normal User</div>
                <div className="text-[10px] text-zinc-400 truncate">demo@nexaearn.com</div>
              </button>
            </div>
          </div>
        </div>

        {/* Single URL Notice */}
        <div className="text-center mt-6 text-zinc-500 text-xs flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#00E676]" />
          <span>Unified Secure Access Portal • Role-Based Redirection</span>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import { Header } from './components/Header';
import { AuthScreen } from './components/AuthScreen';
import { UserDashboard } from './components/user/UserDashboard';
import { AdminPanel } from './components/admin/AdminPanel';

const AppContent: React.FC = () => {
  const { user, role, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00E676] to-[#00A854] flex items-center justify-center font-mono font-black text-black text-xl shadow-[0_0_30px_rgba(0,230,118,0.4)] animate-pulse">
            NX
          </div>
          <div className="text-xs font-semibold tracking-wider uppercase text-zinc-400">
            Loading Nexa Earn...
          </div>
        </div>
      </div>
    );
  }

  // Not logged in -> Show unified /user Auth Screen
  if (!user) {
    return <AuthScreen />;
  }

  // Authenticated: Route strictly based on role
  // Normal User -> User Dashboard
  // Admin -> Admin Panel
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Header />
      {role === 'admin' ? <AdminPanel /> : <UserDashboard />}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}

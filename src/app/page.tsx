'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Shield, Eye, EyeOff, Star } from 'lucide-react';
import AppShell from '@/components/AppShell';

export default function Home() {
  const { currentUser, isLoading } = useStore();
  
  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!currentUser) {
    return <LoginPage />;
  }

  return <AppShell />;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900">
      <div className="text-center animate-fade-in">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
          {/* Emil: nothing should appear from scale(0) — use scale(0.96) */}
          <Shield className="w-10 h-10 text-gold-400" style={{ animation: 'scaleIn 600ms var(--ease-out) forwards' }} />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">BDI CRM</h1>
        <p className="text-primary-200 text-sm">Duke u ngarkuar...</p>
        {/* Emil: faster-spinning feels like faster loading */}
        <div className="mt-6 flex justify-center gap-1.5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-gold-400"
              style={{
                animation: `loadingDot 1s var(--ease-out) ${i * 0.15}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function LoginPage() {
  const { login } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);

    await new Promise(resolve => setTimeout(resolve, 800));

    const success = login(email, password);
    if (!success) {
      setError('Email ose fjalëkalimi nuk është i saktë');
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Branding */}
      <div className="lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-400/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-400/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-400/[0.03] rounded-full" />
        
        <div className="relative z-10 animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <Shield className="w-7 h-7 text-gold-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">BDI CRM</h1>
              <p className="text-primary-200 text-xs">Campaign Management System</p>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 hidden lg:block">
          <h2 className="text-4xl font-bold text-white leading-tight mb-6 stagger-item" style={{ animationDelay: '100ms' }}>
            Sistemi i Menaxhimit<br />
            <span className="text-gold-400">të Fushatës</span>
          </h2>
          <p className="text-primary-200 text-lg leading-relaxed max-w-md stagger-item" style={{ animationDelay: '200ms' }}>
            Platforma moderne për menaxhimin e votuesve, optimizimin e operacioneve në terren dhe vendimmarrjen e bazuar në të dhëna.
          </p>
          
        </div>

        <div className="relative z-10 hidden lg:flex items-center gap-2 text-primary-300 text-sm stagger-item" style={{ animationDelay: '500ms' }}>
          <Star className="w-4 h-4 text-gold-400" />
          <span>Bashkimi Demokratik për Integrim</span>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-white">
        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-surface-900">Mirë se vini përsëri</h2>
            <p className="text-surface-500 mt-2">Identifikohuni për të vazhduar</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="emri@bdi.mk"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Fjalëkalimi</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 pressable"
                  style={{ transition: `color var(--duration-normal) var(--ease-default)` }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 animate-scale-in">
                {error}
              </div>
            )}

            {/* Emil: btn-primary already has :active scale(0.97) */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="btn-primary w-full py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Duke u identifikuar...
                </div>
              ) : (
                'Identifikohu'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

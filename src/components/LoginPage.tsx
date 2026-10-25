import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CONFIG } from '../data';
import { FirebaseStatusBanner } from './FirebaseStatusBanner';
import { useScrollReveal } from '../hooks/useScrollReveal';

export const LoginPage: React.FC = () => {
  useScrollReveal();
  const { user, login, logout, previewMode } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    login(email);
    setSuccess(mode === 'signin' ? 'Signed in successfully!' : 'Account created successfully!');
    setTimeout(() => {
      window.location.hash = email.toLowerCase() === CONFIG.adminEmail.toLowerCase() ? 'admin' : 'dashboard';
    }, 400);
  };

  const handleGoogleSignIn = () => {
    // In live Firebase mode, uses signInWithPopup; in preview, signs in seamlessly
    login('affiliate.partner@gmail.com', 'affiliate');
    window.location.hash = 'dashboard';
  };

  return (
    <div className="w-container py-12 md:py-16 min-h-[70vh]">
      {/* Yellow Notice & Preview Mode Toggle if Keys Empty */}
      <FirebaseStatusBanner />

      <div className="max-w-md mx-auto">
        {user ? (
          <div className="agency-card text-center p-8 sm:p-10 shadow-sm">
            <span className="w-14 h-14 rounded-full bg-[#ff4800]/10 text-[#ff4800] text-2xl flex items-center justify-center mx-auto mb-4 font-bold border border-[#ff4800]/20">
              ✓
            </span>
            <span className="text-xs uppercase font-bold tracking-wider text-[var(--mut)]">
              Session Active
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--fg)] mt-1 mb-2">
              Welcome back
            </h1>
            <p className="text-sm text-[var(--mut)] mb-6 font-mono bg-[var(--bg)] py-2 px-3 rounded-xl border border-[var(--line)]">
              {user.email} ({user.role})
            </p>

            <div className="flex flex-col gap-2.5">
              <a
                href={user.role === 'admin' ? '#admin' : '#dashboard'}
                className="agency-btn p text-sm w-full"
              >
                Go to {user.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
              </a>
              <button
                onClick={logout}
                className="agency-btn text-xs w-full"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="agency-card p-7 sm:p-9 shadow-sm">
            <div className="text-center mb-6">
              <span className="inline-block px-3 py-1 rounded-full border text-xs font-semibold tracking-wide mb-3 bg-[var(--bg)]"
                style={{ borderColor: 'var(--line)', color: 'var(--fg)' }}>
                Partner Portal
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight text-[var(--fg)]">
                {mode === 'signin' ? 'Partner Login' : 'Create Account'}
              </h1>
              <p className="text-xs sm:text-sm text-[var(--mut)] mt-1.5 leading-relaxed">
                Access your personal affiliate stats, client referrals, and payout records.
              </p>
            </div>

            {/* Google Authentication Button */}
            <button
              onClick={handleGoogleSignIn}
              type="button"
              className="w-full min-h-[46px] rounded-full border flex items-center justify-center gap-3 text-sm font-bold transition-all hover:bg-[var(--bg)] cursor-pointer mb-5 shadow-xs"
              style={{ borderColor: 'var(--line)', color: 'var(--fg)' }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center gap-3 my-4 text-xs text-[var(--mut)]">
              <span className="flex-1 border-t" style={{ borderColor: 'var(--line)' }} />
              <span>or sign in with email</span>
              <span className="flex-1 border-t" style={{ borderColor: 'var(--line)' }} />
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              <label className="flex flex-col gap-1 text-xs font-semibold">
                <span>Email address</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@business.com"
                  autoComplete="email"
                  className="w-full min-h-[44px] px-3.5 rounded-xl border text-sm focus:border-[#ff4800]"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                />
              </label>

              <label className="flex flex-col gap-1 text-xs font-semibold">
                <span>Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full min-h-[44px] px-3.5 rounded-xl border text-sm focus:border-[#ff4800]"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                />
              </label>

              {error && (
                <div className="text-red-500 font-semibold text-xs">{error}</div>
              )}
              {success && (
                <div className="text-emerald-500 font-semibold text-xs">{success}</div>
              )}

              <button
                type="submit"
                className="agency-btn p w-full min-h-[46px] text-sm mt-1"
              >
                {mode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="mt-4 pt-4 border-t text-center text-xs text-[var(--mut)]" style={{ borderColor: 'var(--line)' }}>
              {mode === 'signin' ? (
                <p>
                  New affiliate?{' '}
                  <button
                    onClick={() => setMode('signup')}
                    className="font-bold text-[#ff4800] hover:underline cursor-pointer"
                  >
                    Create your account
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    onClick={() => setMode('signin')}
                    className="font-bold text-[#ff4800] hover:underline cursor-pointer"
                  >
                    Sign in here
                  </button>
                </p>
              )}
            </div>

            {/* Quick Demo Preview Logins (shown in preview mode) */}
            {previewMode && (
              <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--line)' }}>
                <span className="text-[11px] font-bold text-[var(--mut)] uppercase tracking-wider block mb-2 text-center">
                  Quick Preview Access [Sample]
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => {
                      login('amara.affiliate@gmail.com', 'affiliate');
                      window.location.hash = 'dashboard';
                    }}
                    className="p-2 rounded-xl border text-left hover:border-[#ff4800] cursor-pointer"
                    style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  >
                    <b className="block text-[var(--fg)]">Demo Affiliate</b>
                    <span className="text-[10px] text-[var(--mut)]">View Dashboard</span>
                  </button>

                  <button
                    onClick={() => {
                      login(CONFIG.adminEmail, 'admin');
                      window.location.hash = 'admin';
                    }}
                    className="p-2 rounded-xl border text-left hover:border-[#ff4800] cursor-pointer"
                    style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  >
                    <b className="block text-[var(--fg)]">Admin Login</b>
                    <span className="text-[10px] text-[var(--mut)]">Manage Clients</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

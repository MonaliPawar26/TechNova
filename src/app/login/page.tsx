'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { fetchApi } from '../../lib/api';
import { Sparkles, Bot, LogIn, ShieldAlert, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mb-4 animate-[spin_0.8s_linear_infinite]"></div>
        <p className="text-slate-600 text-sm font-semibold animate-pulse">Entering SynergyAI Dashboard...</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (data.success) {
        login(data.user, data.token);
        router.push('/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  // One-click login for easy testing of role-based security
  const handleQuickLogin = async (roleEmail: string) => {
    setError('');
    setLoading(true);
    try {
      const data = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: roleEmail, password: 'password123' })
      });

      if (data.success) {
        login(data.user, data.token);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(`Quick login failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      // Simulate Google OAuth popup
      const data = await fetchApi('/auth/google', {
        method: 'POST',
        body: JSON.stringify({
          email: 'google_user@synergyai.com',
          name: 'OAuth Test User',
          avatar: 'https://ui-avatars.com/api/?name=OAuth+User&background=2563eb&color=fff',
          googleId: 'google-oauth2-12345'
        })
      });

      if (data.success) {
        login(data.user, data.token);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(`Google Sign-In failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative flex items-center justify-center p-6 selection:bg-primary-100">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-primary-100 opacity-50 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-accent-100 opacity-50 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-slate-100 rounded-2xl shadow-xl p-8 relative glass-card z-10">
        <Link href="/" className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-primary-600 transition-colors mb-6">
          <ArrowLeft size={14} />
          <span>Back to Home</span>
        </Link>

        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary-500 to-accent-400 flex items-center justify-center text-white font-bold text-xl mx-auto shadow-md mb-3">
            T
          </div>
          <h2 className="text-2xl font-bold text-slate-800 display-font">Welcome back</h2>
          <p className="text-slate-500 text-xs mt-1">TechNova Solutions Pvt Ltd · Bengaluru HQ</p>
        </div>

        {error && (
          <div className="p-3 mb-6 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl flex items-start space-x-2 text-xs font-medium">
            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Work Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-xs bg-slate-50/50"
              placeholder="e.g. admin@synergyai.com"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
              <Link href="/forgot-password" className="text-[11px] font-semibold text-primary-600 hover:text-primary-700">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-xs bg-slate-50/50"
              placeholder="password123"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <LogIn size={16} />
            <span>{loading ? 'Logging in...' : 'Sign In'}</span>
          </button>
        </form>

        {/* Google Sign-in Trigger */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3.5 border border-slate-200 hover:bg-slate-50 disabled:bg-white rounded-xl text-xs font-semibold text-slate-700 transition-colors flex items-center justify-center space-x-2 mb-8 shadow-sm"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.87-4.53-5.84-4.53z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Quick Seeded logins */}
        <div className="border-t border-slate-100 pt-6">
          <div className="flex items-center space-x-1.5 text-slate-500 font-semibold text-[10px] uppercase tracking-wider mb-3">
            <Bot size={13} className="text-primary-500" />
            <span>Developer Quick Roles Login</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <button
              onClick={() => handleQuickLogin('admin@synergyai.com')}
              className="py-2.5 px-3 rounded-lg border border-purple-100 bg-purple-50/30 text-purple-700 hover:bg-purple-50 transition-colors font-medium text-left truncate"
            >
              👑 <strong>Admin</strong>
              <div className="text-[8px] text-purple-400">Monali Pawar</div>
            </button>
            <button
              onClick={() => handleQuickLogin('manager@synergyai.com')}
              className="py-2.5 px-3 rounded-lg border border-sky-100 bg-sky-50/30 text-sky-700 hover:bg-sky-50 transition-colors font-medium text-left truncate"
            >
              💼 <strong>Manager</strong>
              <div className="text-[8px] text-sky-400">Rahul Sharma</div>
            </button>
            <button
              onClick={() => handleQuickLogin('lead@synergyai.com')}
              className="py-2.5 px-3 rounded-lg border border-pink-100 bg-pink-50/30 text-pink-700 hover:bg-pink-50 transition-colors font-medium text-left truncate"
            >
              🎯 <strong>Team Lead</strong>
              <div className="text-[8px] text-pink-400">Pranjal Navgale</div>
            </button>
            <button
              onClick={() => handleQuickLogin('employee@synergyai.com')}
              className="py-2.5 px-3 rounded-lg border border-blue-100 bg-blue-50/30 text-blue-700 hover:bg-blue-50 transition-colors font-medium text-left truncate"
            >
              🧑‍💻 <strong>Employee</strong>
              <div className="text-[8px] text-blue-400">Arjun Patil</div>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 mt-6">
          Don't have an account?{' '}
          <Link href="/signup" className="font-semibold text-primary-600 hover:text-primary-700">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}

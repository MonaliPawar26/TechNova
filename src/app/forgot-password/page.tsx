'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchApi } from '../../lib/api';
import { ArrowLeft, KeyRound, ShieldAlert } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const data = await fetchApi('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });

      if (data.success) {
        setSuccessMsg(`Simulated OTP code generated: ${data.otp}. Redirecting in 3 seconds...`);
        setTimeout(() => {
          router.push('/verify-otp');
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Verification email request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative flex items-center justify-center p-6 selection:bg-primary-100">
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-2xl shadow-xl p-8 relative glass-card">
        <Link href="/login" className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-primary-600 transition-colors mb-6">
          <ArrowLeft size={14} />
          <span>Back to Login</span>
        </Link>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 display-font">Forgot Password</h2>
          <p className="text-slate-500 text-xs mt-1">We will send a simulated OTP code to your inbox.</p>
        </div>

        {error && (
          <div className="p-3 mb-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl flex items-start space-x-2 text-xs font-medium">
            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 mb-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs font-medium">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Registered Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-xs bg-slate-50/50"
              placeholder="e.g. employee@synergyai.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <KeyRound size={16} />
            <span>{loading ? 'Sending OTP...' : 'Send Verification OTP'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

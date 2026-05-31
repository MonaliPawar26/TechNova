'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchApi } from '../../lib/api';
import { ArrowLeft, CheckCircle, ShieldAlert } from 'lucide-react';

export default function VerifyOtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await fetchApi('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ otp })
      });

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 2500);
      }
    } catch (err: any) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative flex items-center justify-center p-6 selection:bg-primary-100">
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-2xl shadow-xl p-8 relative glass-card">
        <Link href="/forgot-password" className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-primary-600 transition-colors mb-6">
          <ArrowLeft size={14} />
          <span>Resend OTP</span>
        </Link>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 display-font">Verify OTP</h2>
          <p className="text-slate-500 text-xs mt-1">Please enter the 4-digit code (hint: enter "6492").</p>
        </div>

        {error && (
          <div className="p-3 mb-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl flex items-start space-x-2 text-xs font-medium">
            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-4 mb-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-center">
            <CheckCircle size={32} className="mx-auto mb-2 text-emerald-600" />
            <h3 className="font-bold text-sm">OTP Verified!</h3>
            <p className="text-[11px] text-emerald-600 mt-1">Simulated password reset success. Redirecting to Login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">4-Digit Code</label>
              <input
                type="text"
                required
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full text-center px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-lg font-bold bg-slate-50/50 letter-spacing-2"
                placeholder="6 4 9 2"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Verifying...' : 'Validate Code'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

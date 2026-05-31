'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { fetchApi } from '../../lib/api';
import { ShieldAlert, ArrowLeft, UserPlus } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [role, setRole] = useState<'Employee' | 'Team Lead' | 'Manager' | 'Admin'>('Employee');
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
      const data = await fetchApi('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, department, role })
      });

      if (data.success) {
        login(data.user, data.token);
        router.push('/dashboard');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative flex items-center justify-center p-6 selection:bg-primary-100">
      <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-primary-100 opacity-50 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-accent-100 opacity-50 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-slate-100 rounded-2xl shadow-xl p-8 relative glass-card z-10">
        <Link href="/login" className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-primary-600 transition-colors mb-6">
          <ArrowLeft size={14} />
          <span>Back to Login</span>
        </Link>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 display-font">Create Account</h2>
          <p className="text-slate-500 text-xs mt-1">Join the SynergyAI collaboration platform.</p>
        </div>

        {error && (
          <div className="p-3 mb-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl flex items-start space-x-2 text-xs font-medium">
            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-xs bg-slate-50/50"
              placeholder="Sarah Connor"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Work Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-xs bg-slate-50/50"
              placeholder="sarah@company.com"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-xs bg-slate-50/50"
              placeholder="••••••••"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-xs bg-slate-50/50 font-medium"
              >
                <option value="Engineering">Engineering</option>
                <option value="Research & Development">R&D</option>
                <option value="Product">Product</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Operations">Operations</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Corporate Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-xs bg-slate-50/50 font-medium"
              >
                <option value="Employee">Employee</option>
                <option value="Team Lead">Team Lead</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <UserPlus size={16} />
            <span>{loading ? 'Creating Account...' : 'Register'}</span>
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary-600 hover:text-primary-700">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

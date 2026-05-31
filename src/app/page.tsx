'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';
import { 
  ArrowRight, 
  Bot, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  ShieldAlert, 
  FileText, 
  MessageSquare,
  Sparkles,
  HelpCircle,
  Menu,
  X
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqs = [
    {
      q: 'How does the Explainable AI (XAI) workflow work?',
      a: 'Unlike opaque AI models, TechNova\'s SynergyAI provides confidence scores, risk indicators, and alternative recommendations. No AI suggestion is executed without direct manager review and authorization.'
    },
    {
      q: 'Can we connect our existing MongoDB Atlas and Cloudinary assets?',
      a: 'Absolutely. TechNova\'s platform is configured out-of-the-box with env variables supporting MongoDB Atlas, Mongoose ODM, and Cloudinary. Local fallbacks are active if no keys are provided.'
    },
    {
      q: 'Is there real-time communication support?',
      a: 'Yes, our Slack-style workplace channels, direct messages, and presence indicators are fully powered by a Node.js Socket.io server, allowing instantaneous status updates.'
    },
    {
      q: 'Does it support role-based user management?',
      a: 'Yes. TechNova supports four distinct roles: Employee, Team Lead, Manager, and Admin. Key routes and optimization controls are restricted based on user role parameters.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden selection:bg-primary-100 selection:text-primary-900">
      {/* Dynamic Background Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-primary-200 to-accent-100 opacity-40 blur-3xl animate-blob-1 pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-accent-200 to-primary-100 opacity-30 blur-3xl animate-blob-2 pointer-events-none" />
      <div className="absolute top-[40%] left-[40%] w-[350px] h-[350px] rounded-full bg-indigo-100 opacity-20 blur-3xl animate-blob-3 pointer-events-none" />

      {/* 1. NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-500 to-accent-400 flex items-center justify-center text-white font-bold shadow-md">
              T
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800 display-font">Tech<span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">Nova</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-primary-600 transition-colors">Features</a>
            <a href="#ai-benefits" className="hover:text-primary-600 transition-colors">AI Engine</a>
            <a href="#pricing" className="hover:text-primary-600 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-primary-600 transition-colors">FAQ</a>
            <a href="#contact" className="hover:text-primary-600 transition-colors">Contact</a>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/dashboard" className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
              Go to Dashboard →
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 text-slate-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 p-6 flex flex-col space-y-4 shadow-lg transition-all animate-in fade-in slide-in-from-top-5 duration-200">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-slate-600 font-medium">Features</a>
            <a href="#ai-benefits" onClick={() => setMobileMenuOpen(false)} className="text-slate-600 font-medium">AI Engine</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-slate-600 font-medium">Pricing</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-slate-600 font-medium">FAQ</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="text-slate-600 font-medium">Contact</a>
            <div className="border-t border-slate-100 pt-4 flex flex-col space-y-2">
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-2.5 text-white bg-primary-600 rounded-xl font-semibold">
                Go to Dashboard →
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative px-6 py-20 md:py-32 max-w-7xl mx-auto text-center z-10">
        <div className="inline-flex items-center space-x-2 bg-white/80 border border-slate-200 rounded-full px-4 py-1.5 mb-6 shadow-sm">
          <Sparkles size={16} className="text-primary-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-600">TechNova Solutions Pvt Ltd · Bengaluru, Karnataka</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 display-font max-w-4xl mx-auto leading-tight">
          Where Human Intelligence <br />
          <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">Meets Artificial Intelligence</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Boost sprint efficiency, eliminate communication bottlenecks, and optimize workflows with real-time Slack channels, Kanban task tracking, and Explainable AI assistance.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-16">
          <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg hover:shadow-primary-100 transition-all flex items-center justify-center space-x-2 group">
            <span>Go to Dashboard</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <a href="#features" className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center">
            Explore Features
          </a>
        </div>

        {/* Hero Interactive UI Showcase */}
        <div className="max-w-5xl mx-auto rounded-2xl bg-white border border-slate-100 shadow-2xl p-4 md:p-6 glass-card relative group">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div className="flex space-x-2">
              <span className="w-3 h-3 rounded-full bg-rose-400" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>
            <div className="bg-slate-100 px-4 py-1 rounded-lg text-xs font-semibold text-slate-500">
              TechNova AI Workspaces
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-4 bg-primary-50/50 rounded-xl border border-primary-100">
              <div className="flex items-center space-x-2 text-primary-600 font-bold mb-2">
                <Bot size={20} />
                <span>Explainable AI Engine</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                "AI prioritized Database Sync with 92% confidence based on milestone deadlines and assignee capacity constraints."
              </p>
            </div>
            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <div className="flex items-center space-x-2 text-emerald-600 font-bold mb-2">
                <CheckCircle size={20} />
                <span>Human Approval Queue</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Task timeline optimization pending Monali Pawar approval. Modify, Approve, or Reject in one click.
              </p>
            </div>
            <div className="p-4 bg-accent-50/50 rounded-xl border border-accent-100">
              <div className="flex items-center space-x-2 text-accent-600 font-bold mb-2">
                <MessageSquare size={20} />
                <span>Real-Time Collaboration</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Instant channels, direct messaging, user availability indicators, and emojis synchronization.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURES SECTION */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto z-10 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 display-font mb-4">
            Stunning Product Features
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Everything your modern team needs to perform efficiently under AI-powered optimization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3 display-font">Kanban Task Board</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Drag-and-drop task workflow management. Includes priority tags, deadlines, attachment integrations, and peer comments.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="w-12 h-12 rounded-xl bg-accent-100 text-accent-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <MessageSquare size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3 display-font">Slack-style Chat</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Real-time workspace channels and secure Direct Messaging. Mentions, reactions, and file uploads built with WebSockets.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Bot size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3 display-font">AI Workflow Engine</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Automated meeting transcript summaries, weekly CSV/PDF analytics reports, and workload optimization alerts.
            </p>
          </div>
        </div>
      </section>

      {/* 4. AI BENEFITS & EXPLAINABLE AI */}
      <section id="ai-benefits" className="py-20 bg-white border-y border-slate-100 px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center space-x-2 bg-primary-50 rounded-full px-3 py-1 mb-4 text-xs font-bold text-primary-600">
              <Bot size={14} />
              <span>Explainable AI (XAI)</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 display-font mb-6 leading-tight">
              Explainable AI Recommendations For Better Decisions
            </h2>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Our system computes workload prediction indexes and deadline risks. Instead of blindly executing schedule transformations, the engine renders an easy-to-read explanation.
            </p>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="text-emerald-500 shrink-0 mt-1" size={20} />
                <div>
                  <h4 className="font-semibold text-slate-800">Clear Action Reasons</h4>
                  <p className="text-sm text-slate-500">Understand exactly why a task was prioritized or assigned.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="text-emerald-500 shrink-0 mt-1" size={20} />
                <div>
                  <h4 className="font-semibold text-slate-800">Confidence Scores (%)</h4>
                  <p className="text-sm text-slate-500">View performance probability checks to gauge success rates.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="text-emerald-500 shrink-0 mt-1" size={20} />
                <div>
                  <h4 className="font-semibold text-slate-800">Risk Assessment Levels</h4>
                  <p className="text-sm text-slate-500">See high, medium, and low bottleneck warnings immediately.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 md:p-8 shadow-inner">
            <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-400">RECOMMENDED ACTION</span>
                <span className="px-2 py-0.5 rounded bg-amber-50 text-[10px] font-bold text-amber-600 border border-amber-100">Pending Review</span>
              </div>
              <div className="font-bold text-slate-800 text-sm mb-4">
                Task Reschedule suggestion: "Core Database Optimization"
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500">Confidence Score:</span>
                  <span className="font-bold text-primary-600">92%</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500">Potential Bottleneck:</span>
                  <span className="font-bold text-rose-500">High Risk (Pranjal Navgale Overloaded)</span>
                </div>
                <div className="py-2 text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <strong>Reason:</strong> Task timeline clashes with sprint release window. Extending the task by 3 days will balance team allocation and clear blocking routes.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. WORKFLOW SECTION */}
      <section className="py-20 px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 display-font mb-4">
            How It Works
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            The Human-in-the-Loop paradigm ensures AI stays advisory while humans hold operational veto powers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl border border-slate-100 shadow-sm relative">
            <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-lg font-bold mb-4">1</div>
            <h4 className="font-bold text-slate-800 mb-2 display-font">AI Evaluation</h4>
            <p className="text-xs text-slate-500">AI monitors task priorities, deadlines, and active developer queues.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl border border-slate-100 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-accent-100 text-accent-600 flex items-center justify-center text-lg font-bold mb-4">2</div>
            <h4 className="font-bold text-slate-800 mb-2 display-font">Recommendation</h4>
            <p className="text-xs text-slate-500">Explainable insights and confidence metrics are generated.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl border border-slate-100 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-lg font-bold mb-4">3</div>
            <h4 className="font-bold text-slate-800 mb-2 display-font">Manager Review</h4>
            <p className="text-xs text-slate-500">Managers accept, reject, or modify details in the approvals dashboard.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl border border-slate-100 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-lg font-bold mb-4">4</div>
            <h4 className="font-bold text-slate-800 mb-2 display-font">Safe Execution</h4>
            <p className="text-xs text-slate-500">System updates the database status and broadcasts real-time updates.</p>
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <section className="py-20 bg-slate-50/50 border-t border-slate-100 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 display-font mb-4">
              Loved by Top Teams
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Read how managers and engineers leverage our human-AI workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
              <p className="text-slate-600 text-sm italic mb-6">
                "The Explainable AI recommendations have been a game changer. We shifted 3 major deadlines using manager approvals and bypassed two sprint blockages in Bengaluru."
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold text-sm">
                  RS
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-800">Rahul Sharma</h5>
                  <span className="text-xs text-slate-400">Engineering Manager, TechNova Solutions</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
              <p className="text-slate-600 text-sm italic mb-6">
                "Meeting Intelligence is superb. Uploading transcripts auto-fills the backlog and assigns clear tasks directly. Saves hours of admin work every week."
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-sky-600 flex items-center justify-center text-white font-bold text-sm">
                  PV
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-800">Priya Verma</h5>
                  <span className="text-xs text-slate-400">AI Division Manager, TechNova Solutions</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
              <p className="text-slate-600 text-sm italic mb-6">
                "The glassmorphic dashboard looks world-class. Slack-style messaging and presence indicators feel premium. Our Pune team adopted it within a week."
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-pink-600 flex items-center justify-center text-white font-bold text-sm">
                  PN
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-800">Pranjal Navgale</h5>
                  <span className="text-xs text-slate-400">Engineering Lead, TechNova Solutions</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. PRICING */}
      <section id="pricing" className="py-20 px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 display-font mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Choose the plan that suits your operational scale.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Tier */}
          <div className="p-8 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
              <h4 className="text-lg font-bold text-slate-800 display-font mb-2">Free Starter</h4>
              <div className="text-3xl font-extrabold text-slate-900 mb-4">$0 <span className="text-xs text-slate-400">/ forever</span></div>
              <p className="text-xs text-slate-500 mb-6">Best for small trials and developers testing APIs.</p>
              <ul className="space-y-3 text-xs text-slate-600 mb-8">
                <li className="flex items-center space-x-2">
                  <CheckCircle size={14} className="text-primary-500" />
                  <span>Up to 5 Users</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle size={14} className="text-primary-500" />
                  <span>Interactive Kanban Board</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle size={14} className="text-primary-500" />
                  <span>Local Mock AI features</span>
                </li>
              </ul>
            </div>
            <Link href="/dashboard" className="w-full text-center py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
              Start Free
            </Link>
          </div>

          {/* Pro Tier */}
          <div className="p-8 rounded-2xl bg-white border-2 border-primary-500 shadow-lg relative flex flex-col justify-between scale-105">
            <span className="absolute top-0 right-6 -translate-y-1/2 px-3 py-1 rounded-full bg-primary-600 text-[10px] font-bold text-white uppercase tracking-wider">Popular</span>
            <div>
              <h4 className="text-lg font-bold text-slate-800 display-font mb-2">Pro Team</h4>
              <div className="text-3xl font-extrabold text-slate-900 mb-4">$29 <span className="text-xs text-slate-400">/ user / month</span></div>
              <p className="text-xs text-slate-500 mb-6">Best for fast-growing companies and remote workforces.</p>
              <ul className="space-y-3 text-xs text-slate-600 mb-8">
                <li className="flex items-center space-x-2">
                  <CheckCircle size={14} className="text-primary-500" />
                  <span>Unlimited Workspace Channels</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle size={14} className="text-primary-500" />
                  <span>Gemini API Live Integration</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle size={14} className="text-primary-500" />
                  <span>Explainable AI Suggestions</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle size={14} className="text-primary-500" />
                  <span>Real-time Socket message relays</span>
                </li>
              </ul>
            </div>
            <Link href="/dashboard" className="w-full text-center py-2.5 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-md transition-colors">
              Upgrade to Pro
            </Link>
          </div>

          {/* Enterprise */}
          <div className="p-8 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
              <h4 className="text-lg font-bold text-slate-800 display-font mb-2">Enterprise</h4>
              <div className="text-3xl font-extrabold text-slate-900 mb-4">Custom <span className="text-xs text-slate-400">/ annual contract</span></div>
              <p className="text-xs text-slate-500 mb-6">For large organizations requiring SSO, audit logging, and SLAs.</p>
              <ul className="space-y-3 text-xs text-slate-600 mb-8">
                <li className="flex items-center space-x-2">
                  <CheckCircle size={14} className="text-primary-500" />
                  <span>SSO & Google SAML OAuth</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle size={14} className="text-primary-500" />
                  <span>Complete Admin Console Security</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle size={14} className="text-primary-500" />
                  <span>Dedicated database configurations</span>
                </li>
              </ul>
            </div>
            <Link href="/dashboard" className="w-full text-center py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* 8. FAQ */}
      <section id="faq" className="py-20 bg-white border-y border-slate-100 px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 display-font mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600">
              Clear answers to core design and technical questions.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl p-4 md:p-6 bg-slate-50/50">
                <button className="w-full flex items-center justify-between text-left font-bold text-slate-800 focus:outline-none" onClick={() => toggleFaq(idx)}>
                  <span>{faq.q}</span>
                  <HelpCircle size={20} className={`text-slate-400 transition-transform ${activeFaq === idx ? 'rotate-180 text-primary-500' : ''}`} />
                </button>
                {activeFaq === idx && (
                  <p className="mt-4 text-sm text-slate-600 leading-relaxed border-t border-slate-200/60 pt-4 animate-in fade-in duration-200">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. CONTACT SECTION */}
      <section id="contact" className="py-20 px-6 max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 display-font mb-4">
            Get In Touch
          </h2>
          <p className="text-slate-600">
            Submit your feedback or request an enterprise pilot access.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-white border border-slate-100 shadow-xl glass-card">
          <form onSubmit={(e) => { e.preventDefault(); alert('Message sent successfully!'); }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Your Name</label>
                <input type="text" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm bg-slate-50/50" placeholder="Arjun Patil" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Work Email</label>
                <input type="email" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm bg-slate-50/50" placeholder="arjun@technova.com" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Message</label>
              <textarea rows={4} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm bg-slate-50/50" placeholder="Describe your team size and operational bottlenecks..." />
            </div>
            <button type="submit" className="w-full py-4 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-all shadow-md">
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center text-white font-bold text-sm">
              T
            </div>
            <span className="font-bold text-white display-font tracking-tight">Tech<span className="text-primary-400">Nova</span></span>
          </div>
          <div className="text-xs text-slate-500">
            &copy; 2026 TechNova Solutions Pvt Ltd. All rights reserved. Where Human Intelligence Meets Artificial Intelligence.
          </div>
          <div className="flex space-x-6 text-xs font-medium">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

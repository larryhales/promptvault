import React, { useState } from 'react';
import { BookMarked, Mail, User, MessageSquare, Loader2, Lock } from 'lucide-react';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';
import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_KEY      = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

interface GatePageProps {
  onSignIn: () => void;
}

export const GatePage: React.FC<GatePageProps> = ({ onSignIn }) => {
  const [tab, setTab] = useState<'request' | 'signin'>('request');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sign in state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signingIn, setSigningIn] = useState(false);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Save to Supabase
      const { error } = await supabase
        .from('access_requests')
        .insert([{ name, email, reason }]);
      if (error) throw new Error(`Database error: ${error.message}`);

      // Send email notification (non-blocking — don't fail the whole form if email fails)
      emailjs.send(
        EMAILJS_SERVICE,
        EMAILJS_TEMPLATE,
        {
          from_name: name,
          from_email: email,
          message: reason || 'No reason provided',
          to_email: 'larry.hales@fnf.com',
        },
        EMAILJS_KEY,
      ).catch(err => console.warn('Email notification failed:', err));

      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSigningIn(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: signInEmail,
        password: signInPassword,
      });
      if (error) throw error;
      toast.success('Welcome back!');
    } catch (err: any) {
      toast.error(err.message || 'Sign in failed');
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center">
          <BookMarked size={20} className="text-white" />
        </div>
        <span className="text-2xl font-bold text-slate-900 tracking-tight">
          Prompt<span className="text-violet-600">Vault</span>
        </span>
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Real Estate AI Prompts</h1>
          <p className="text-slate-500">An exclusive library of AI prompts and skills for real estate professionals.</p>
        </div>

        {/* Tabs */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => setTab('request')}
              className={`flex-1 py-3.5 text-sm font-semibold transition ${
                tab === 'request'
                  ? 'text-violet-700 bg-violet-50 border-b-2 border-violet-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Request Access
            </button>
            <button
              onClick={() => setTab('signin')}
              className={`flex-1 py-3.5 text-sm font-semibold transition ${
                tab === 'signin'
                  ? 'text-violet-700 bg-violet-50 border-b-2 border-violet-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Sign In
            </button>
          </div>

          <div className="p-6">
            {tab === 'request' ? (
              submitted ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">✓</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Request Submitted!</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    We'll review your request and send you login credentials once approved. This usually takes 1–2 business days.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRequest} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name</label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        required
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Why do you want access? <span className="text-slate-400 font-normal">(optional)</span></label>
                    <div className="relative">
                      <MessageSquare size={14} className="absolute left-3 top-3 text-slate-400" />
                      <textarea
                        rows={3}
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        placeholder="Tell us a bit about yourself and how you'll use PromptVault..."
                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 size={15} className="animate-spin" />}
                    Request Access
                  </button>
                </form>
              )
            ) : (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      required
                      type="email"
                      value={signInEmail}
                      onChange={e => setSignInEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      required
                      type="password"
                      value={signInPassword}
                      onChange={e => setSignInPassword(e.target.value)}
                      placeholder="Your password"
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={signingIn}
                  className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2"
                >
                  {signingIn && <Loader2 size={15} className="animate-spin" />}
                  Sign In
                </button>
                <p className="text-center text-xs text-slate-400">
                  Don't have credentials yet?{' '}
                  <button type="button" onClick={() => setTab('request')} className="text-violet-600 hover:underline">
                    Request access
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

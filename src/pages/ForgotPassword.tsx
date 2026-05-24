import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { BACKENED_URL } from '../../config';

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isEmailTouched, setIsEmailTouched] = useState(false);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Clear toast automatically after 4 seconds jisse user friendly lage
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Trigger validation styling
    setIsEmailTouched(true);

    if (!isEmailValid) {
      setToast({
        type: 'error',
        message: 'Please fill in correct inputs (Valid Email).'
      });
      return;
    }

    setIsLoading(true);
    setToast(null);

    try {
      const response = await axios.post(`${BACKENED_URL}/api/v1/user/forgotpassword`, {
        username: email
      });

      const data = response.data;
      if (data.token) {
        localStorage.setItem('token', data.token);
        setToast({
          type: 'success',
          message: 'Successfully sent password reset link. Check your inbox.'
        });

        // Brief pause for success state, then navigate to dashboard
        setTimeout(() => {
          navigate('/signin');
        }, 1500);
      } else {
        setToast({
          type: 'success',
          message: data.msg || 'Failed to send password reset link. Please try again.'
        });
      }
    } catch (error: any) {
      console.error('ForgotPassword error:', error);
      const serverMessage = error.response?.data?.msg || error.response?.data?.message;
      setToast({
        type: 'error',
        message: serverMessage || 'Failed to send password reset link. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-rose-50/60 via-stone-50 to-red-50/50 overflow-hidden font-sans px-4 py-12">
      {/* Inline styles for custom animations */}
      <style>{`
        @keyframes float-glow-1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.12); }
          66% { transform: translate(-20px, 20px) scale(0.92); }
        }
        @keyframes float-glow-2 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(-40px, 40px) scale(0.92); }
          66% { transform: translate(40px, -20px) scale(1.08); }
        }
        .animate-glow-1 {
          animation: float-glow-1 12s infinite ease-in-out;
        }
        .animate-glow-2 {
          animation: float-glow-2 15s infinite ease-in-out alternate;
        }
      `}</style>

      {/* Floating Action Toast Alert */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 transform translate-y-0 animate-bounce ${toast.type === 'success'
          ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800'
          : 'bg-stone-50/90 border-stone-200 text-slate-800'
          }`}>
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />}
          {toast.type === 'error' && <XCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Decorative Glow Spheres */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-rose-200/50 rounded-full blur-[90px] animate-glow-1 pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-red-100/60 rounded-full blur-[90px] animate-glow-2 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-stone-100/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Glass Container */}
      <div className="relative w-full max-w-md z-10 transition-all duration-300">

        {/* Brand / Logo Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-600 to-red-600 text-white font-bold text-xl shadow-lg shadow-rose-500/20 mb-3">
            ✓
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 m-0">
            Task<span className="bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-transparent">Flow</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Experience productivity, streamlined and premium.</p>
        </div>
        {/* Card Body */}
        <div className="backdrop-blur-xl bg-white/80 border border-white shadow-2xl shadow-rose-100/50 rounded-2xl p-8 relative overflow-hidden"></div>
        <div className="flex flex-col items-center">
          <Mail className="text-rose-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-slate-900 mb-2 text-left">Forgot Password</h2>
          <p className="text-sm text-slate-500 mb-6 text-left">Enter your email to receive a password reset link.</p>
          <form className="w-full" onSubmit={(e) => { handleSubmit(e); }}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                id="email"
                className={`w-full px-4 py-3 rounded-lg border ${true ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-rose-500 transition duration-200`}
                placeholder="abhishek@gmail.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="w-full px-4 py-3 rounded-lg bg-rose-600 text-white font-semibold text-sm shadow-md shadow-rose-500/15 hover:shadow-rose-500/25 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send Reset Link
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
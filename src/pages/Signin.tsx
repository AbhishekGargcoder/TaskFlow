import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, Eye, EyeOff, Loader2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { BACKENED_URL } from '../../config';

export default function Signin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isEmailTouched, setIsEmailTouched] = useState(false);
  const [isPasswordTouched, setIsPasswordTouched] = useState(false);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = password.length >= 6;

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
    setIsPasswordTouched(true);

    if (!isEmailValid || !isPasswordValid) {
      setToast({
        type: 'error',
        message: 'Please fill in correct inputs (Valid Email and minimum 6-character Password).'
      });
      return;
    }

    setIsLoading(true);
    setToast(null);

    try {
      const response = await axios.post(`${BACKENED_URL}/api/v1/user/signin`, {
        username: email,
        password
      });

      const data = response.data;
      if (data.token) {
        localStorage.setItem('token', data.token);
        setToast({
          type: 'success',
          message: 'Successfully logged in! Access granted.'
        });

        // Brief pause for success state, then navigate to dashboard
        setTimeout(() => {
          navigate('/todos');
        }, 1500);
      } else {
        setToast({
          type: 'error',
          message: data.msg || 'Authentication failed. Please verify credentials.'
        });
      }
    } catch (error: any) {
      console.error('Signin error:', error);
      const serverMessage = error.response?.data?.msg || error.response?.data?.message;
      setToast({
        type: 'error',
        message: serverMessage || 'Invalid email or password. Please try again.'
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
        <div className="backdrop-blur-xl bg-white/80 border border-white shadow-2xl shadow-rose-100/50 rounded-2xl p-8 relative overflow-hidden">

          {/* Top subtle highlight border */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-rose-500/25 to-transparent" />

          <h2 className="text-2xl font-bold text-slate-900 mb-2 text-left">Welcome back</h2>
          <p className="text-sm text-slate-500 mb-6 text-left">Login to access your dashboard and manage tasks.</p>

          {/* Alert Toast Notification */}
          {toast && (
            <div className={`flex items-start gap-3 p-3 rounded-lg mb-6 text-sm border transition-all duration-300 ${toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
              : 'bg-rose-50 border-rose-100 text-rose-800'
              }`}>
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              )}
              <span className="text-left font-semibold">{toast.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Address */}
            <div className="space-y-1.5 text-left">
              <label htmlFor="email" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (!isEmailTouched) setIsEmailTouched(true);
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 bg-white/95 border rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition duration-200 text-sm shadow-xs ${isEmailTouched
                    ? isEmailValid
                      ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/10'
                      : 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10'
                    : 'border-slate-200 focus:border-rose-500 focus:ring-rose-500/10'
                    }`}
                />
              </div>
              {isEmailTouched && !isEmailValid && (
                <p className="text-xs text-rose-600 mt-1 pl-1 flex items-center gap-1 font-semibold">
                  <span className="w-1 h-1 rounded-full bg-rose-600 inline-block" />
                  Please enter a valid email address.
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5 text-left">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Password (Min. 6 chars)"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (!isPasswordTouched) setIsPasswordTouched(true);
                  }}
                  className={`w-full pl-10 pr-10 py-2.5 bg-white/95 border rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition duration-200 text-sm shadow-xs ${isPasswordTouched
                    ? isPasswordValid
                      ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/10'
                      : 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10'
                    : 'border-slate-200 focus:border-rose-500 focus:ring-rose-500/10'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition duration-150 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-semibold rounded-xl shadow-lg shadow-rose-500/15 hover:shadow-rose-500/25 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Navigation Footer */}
          <div className="mt-8 text-center text-sm border-t border-slate-100 pt-6">
            <span className="text-slate-500">Don't have an account? </span>
            <Link to="/signup" className="font-bold text-rose-600 hover:text-rose-500 transition duration-200 underline decoration-rose-500/20 hover:decoration-rose-500 decoration-2 underline-offset-4">
              Sign Up
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

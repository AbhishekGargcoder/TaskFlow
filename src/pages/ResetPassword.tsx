import React, { useState, useEffect } from 'react';
import { useNavigate,  Link } from 'react-router-dom';
import axios from 'axios';
import { Lock, CheckCircle2, XCircle, Clock, Eye, EyeOff } from 'lucide-react';
import { BACKENED_URL } from '../../config';

export default function ResetPassword() {
    const navigate = useNavigate();

    // Extract the token from the URL
    const [token, setToken] = useState('');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [isPasswordTouched, setIsPasswordTouched] = useState(false);

    const isPasswordValid = password.length >= 6;
    const passwordsMatch = password === confirmPassword && password.length > 0;
    const isFormValid = isPasswordValid && passwordsMatch;

    // URL se token extract karo
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = searchParams.get('token');
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
            setToast({ type: 'success', message: 'Token received. Please set your new password.' });
        } else {
            setToast({ type: 'error', message: 'Invalid or missing reset token.' });
            setTimeout(() => navigate('/signin'), 3000);
        }
    }, [navigate]);

    // Toast clear
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
        setIsPasswordTouched(true);

        if (!isFormValid) {
            setToast({
                type: 'error',
                message: 'Please fill in correct inputs (Passwords must match and be at least 6 characters).'
            });
            return;
        }

        setIsLoading(true);
        setToast(null);

        try {// extract user info from token on backend then update password of that user.
            const response = await axios.put(`${BACKENED_URL}/api/v1/user/resetpassword/${token}`, {
                password: password
            });

            const data = response.data;
            setToast({
                type: 'success',
                message: 'Password reset successful! You can now log in with your new password.'
            });

            // Brief pause for success state, then navigate to login
            setTimeout(() => {
                navigate('/signin');
            }, 1500);

        } catch (error: any) {
            console.error('ResetPassword error:', error);
            const serverMessage = error.response?.data?.msg || error.response?.data?.message;
            setToast({
                type: 'error',
                message: serverMessage || 'Failed to reset password. The token may have expired or is invalid.'
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
          <div className="backdrop-blur-xl bg-white/80 border border-white shadow-2xl shadow-rose-100/50 rounded-2xl p-8 relative overflow-hidden">

            <div className="flex flex-col items-center">
              <Lock className="text-rose-500 mb-4" size={48} />
              <h2 className="text-2xl font-bold text-slate-900 mb-2 text-left">Reset Password</h2>
              <p className="text-sm text-slate-500 mb-6 text-left">Set a new secure password for your account.</p>

              <form className="w-full" onSubmit={(e) => { handleSubmit(e); }}>

                {/* Password Input */}
                <div className="mb-4">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setIsPasswordTouched(true);
                      }}
                      onBlur={() => setIsPasswordTouched(true)}
                      className={`w-full px-4 py-3 pr-12 bg-white/60 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/40 transition-all duration-200 border-slate-200 shadow-inner ${
                        isPasswordTouched && password.length > 0 && !isPasswordValid
                          ? 'border-rose-500 bg-rose-50/10 text-rose-900 focus:ring-rose-500/20'
                          : isPasswordTouched && isPasswordValid
                          ? 'border-emerald-500 bg-emerald-50/10'
                          : ''
                      }`}
                      placeholder="Enter your new password"
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                    {isPasswordTouched && password.length > 0 && !isPasswordValid && (
                      <div className="flex items-center text-rose-600 text-xs mt-1">
                        <XCircle size={14} className="mr-1" /> Password must be at least 6 characters
                      </div>
                    )}
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div className="mb-6">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setIsPasswordTouched(true);
                      }}
                      onBlur={() => setIsPasswordTouched(true)}
                      className={`w-full px-4 py-3 pr-12 bg-white/60 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/40 transition-all duration-200 border-slate-200 shadow-inner ${
                        isPasswordTouched && confirmPassword.length > 0 && !passwordsMatch
                          ? 'border-rose-500 bg-rose-50/10 text-rose-900 focus:ring-rose-500/20'
                          : isPasswordTouched && passwordsMatch
                          ? 'border-emerald-500 bg-emerald-50/10'
                          : ''
                      }`}
                      placeholder="Confirm your new password"
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                    {isPasswordTouched && confirmPassword.length > 0 && !passwordsMatch && (
                      <div className="flex items-center text-rose-600 text-xs mt-1">
                        <XCircle size={14} className="mr-1" /> Passwords do not match
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                {/* Disable ho jayega if password valid nahi hoga or passwords match nahi karega or loading ho raha hoga */}
                <button 
                  type="submit"
                  disabled={!isPasswordValid || !passwordsMatch || isLoading}
                  className={`w-full px-4 py-3 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg ${!isPasswordValid || !passwordsMatch
                    ? 'bg-rose-300 cursor-not-allowed shadow-inner'
                    : 'bg-gradient-to-r from-rose-600 to-red-600 hover:shadow-rose-500/30 hover:-translate-y-0.5 active:scale-95'
                    }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Resetting...</span>
                    </div>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-1">
              <p className="text-sm text-slate-500">Already have an account?</p>
              <Link
                to="/signin"
                className="text-sm font-bold text-rose-600 hover:underline decoration-2 decoration-rose-200 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
}
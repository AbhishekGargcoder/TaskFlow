import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Lock, Eye, EyeOff, Loader2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { BACKENED_URL } from '../../config';

export default function Signup() {
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const [isEmailTouched, setIsEmailTouched] = useState(false);
    const [isPasswordTouched, setIsPasswordTouched] = useState(false);

    const isEmailValid = " ^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$";
    const isPasswordValid = password.length >= 6;

    // Clear toast after 4 seconds jisse user friendly lage
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

        // Set touched to trigger validation states
        setIsEmailTouched(true);
        setIsPasswordTouched(true);

        if (!isEmailValid || !isPasswordValid) {
            setToast({
                type: 'error',
                message: 'Please resolve Zod validation requirements before submitting.'
            });
            return;
        }

        setIsLoading(true);
        setToast(null);

        try {
            const response = await axios.post(`${BACKENED_URL}/api/v1/user/signup`, {
                name,
                username: email,
                password
            });

            const data = response.data;
            if (data.token) {
                localStorage.setItem('token', data.token);
                setToast({
                    type: 'success',
                    message: 'Account created successfully! Redirecting...'
                });

                // wait for success state aur fir navigate karenge.
                setTimeout(() => {
                    
                    navigate('/todos');
                }, 1500);
            } else {  // now token is not received at the time of register, we get verfication email embedded token inside.
                setToast({
                    type: 'error',
                    message: data.msg || 'Signup failed. Please try again.'
                });
            }
        } catch (error: any) {
            console.error('Signup error:', error);
            const serverMessage = error.response?.data?.msg || error.response?.data?.message; // optional properties hai
            setToast({
                type: 'error',
                message: serverMessage || 'Server encountered an error. Please try again later.'
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

            {/* Decorative Glow Spheres - Warm Rose and Soft Red Peach for Premium White/Red Theme */}
            <div className="absolute top-1/4 -left-32 w-96 h-96 bg-rose-200/50 rounded-full blur-[90px] animate-glow-1 pointer-events-none" />
            <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-red-100/60 rounded-full blur-[90px] animate-glow-2 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-stone-100/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Main Glass Container */}
            <div className="relative w-full max-w-md z-10 transition-all duration-300 ">

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

                    <h2 className="text-2xl font-bold text-slate-900 mb-2 text-left">Create your account</h2>
                    <p className="text-sm text-slate-500 mb-6 text-left">Join TaskFlow and take charge of your todos.</p>

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
                        {/* Full Name */}
                        <div className="space-y-1.5 text-left">
                            <label htmlFor="name" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Full Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <User className="w-4 h-4" />
                                </div>
                                <input
                                    id="name"
                                    type="text"
                                    required
                                    placeholder="Abhishek garg"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white/95 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition duration-200 text-sm shadow-xs"
                                />
                            </div>
                        </div>

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
                                    placeholder="abhi@gmail.com"
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
                            <label htmlFor="password" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    placeholder="Min. 6 characters"
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

                            {/* Dynamic validation requirement display */}
                            <div className="mt-2.5 space-y-1.5 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${isPasswordValid ? 'bg-emerald-500 shadow-xs shadow-emerald-500' : 'bg-slate-300'}`} />
                                    <span className={`text-xs transition-colors duration-200 font-semibold ${isPasswordValid ? 'text-emerald-700' : 'text-slate-500'}`}>
                                        At least 6 characters
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-semibold rounded-xl shadow-lg shadow-rose-500/15 hover:shadow-rose-500/25 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4 cursor-pointer"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Creating Account...</span>
                                </>
                            ) : (
                                <>
                                    <span>Sign Up</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Navigation Footer */}
                    <div className="mt-8 text-center text-sm border-t border-slate-100 pt-6">
                        <span className="text-slate-500">Already have an account? </span>
                        <Link to="/signin" className="font-bold text-rose-600 hover:text-rose-500 transition duration-200 underline decoration-rose-500/20 hover:decoration-rose-500 decoration-2 underline-offset-4 cursor-pointer">
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
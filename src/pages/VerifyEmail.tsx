import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { BACKENED_URL, CONTACT_US_EMAIL } from '../../config';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();  // extract kr lo all query params 
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email address...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Verification token is missing from the URL.');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await axios.get(`${BACKENED_URL}/api/v1/user/verify-email?token=${token}`);
        setStatus('success');
        setMessage(response.data.msg || 'Your email has been verified successfully!');
      } catch (error: any) {
        console.error('Verification error:', error);
        const serverMessage = error.response?.data?.msg || error.response?.data?.message;
        setStatus('error');
        setMessage(serverMessage || 'The verification link is invalid or has expired.');
      }
    };

    verifyToken();
  }, [token]);

  useEffect(() => {
    if (status === 'success') {
      // set token to localstorage
      localStorage.setItem('token', token);

      const timer = setTimeout(() => {
        navigate('/todos');
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [status, navigate]);

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
        @keyframes scale-up {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-glow-1 {
          animation: float-glow-1 12s infinite ease-in-out;
        }
        .animate-glow-2 {
          animation: float-glow-2 15s infinite ease-in-out alternate;
        }
        .animate-scale-up {
          animation: scale-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
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
        <div className="backdrop-blur-xl bg-white/80 border border-white shadow-2xl shadow-rose-100/50 rounded-2xl p-8 relative overflow-hidden text-center">
          {/* Top subtle highlight border */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-rose-500/25 to-transparent" />


          {/*  3 states are there: loading, success, error  */}


          {/* it is the loading state intil the backend is hit */}
          {status === 'loading' && (
            <div className="flex flex-col items-center py-6 space-y-4">
              <Loader2 className="w-16 h-16 text-rose-600 animate-spin" />
              <h2 className="text-2xl font-bold text-slate-900">Verifying Email</h2>
              <p className="text-sm text-slate-500 max-w-xs">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center py-6 space-y-4 animate-scale-up">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 shadow-md">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Email Verified!</h2>
              <p className="text-sm text-emerald-700 font-semibold px-4 py-2 bg-emerald-50/50 border border-emerald-100/55 rounded-xl">
                {message}
              </p>

              {/* Redirecting the user to /todos ... */}

              {/* <button
                onClick={() => navigate('/signin')}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-semibold rounded-xl shadow-lg shadow-rose-500/15 hover:shadow-rose-500/25 transition duration-200 mt-6 cursor-pointer"
              >
                <span>Go to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button> */}
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center py-6 space-y-4 animate-scale-up">
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center border border-rose-100 shadow-md">
                <XCircle className="w-10 h-10 text-rose-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Verification Failed</h2>
              <p className="text-sm text-rose-700 font-semibold px-4 py-2 bg-rose-50/50 border border-rose-100/55 rounded-xl">
                {message}
              </p>
              <button
                onClick={() => navigate('/signup')}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-semibold rounded-xl shadow-lg shadow-rose-500/15 hover:shadow-rose-500/25 transition duration-200 mt-6 cursor-pointer"
              >
                <span>Back to Sign Up</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Navigation Footer */}
          <div className="mt-8 text-center text-sm border-t border-slate-100 pt-6">
            <span className="text-slate-500">Need help? Contact </span>
            <a href={`mailto:${CONTACT_US_EMAIL}`} className="font-bold text-rose-600 hover:text-rose-500 transition duration-200">
              support@taskflow.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

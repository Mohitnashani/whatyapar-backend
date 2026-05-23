import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, Store } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      toast.success('Reset link sent!');
      
      // If we got the mock link (in dev), we can alert or log it
      if (response.data._mockLink) {
        console.log('MOCK RESET LINK:', response.data._mockLink);
        toast.success(
          <span>Check console for the reset link! <a href={response.data._mockLink} className="underline font-bold text-white ml-2">Click Here</a></span>,
          { duration: 10000, style: { background: '#25D366' } }
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* Decorative blurred blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-pulse"></div>
      
      <div className="max-w-md w-full bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/10 p-10 shadow-2xl relative z-10 m-4">
        
        <Link to="/login" className="inline-flex items-center text-indigo-300 hover:text-white mb-6 transition-colors text-sm font-medium">
          <ArrowLeft size={16} className="mr-1" /> Back to login
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white mb-6 shadow-[0_0_40px_rgba(99,102,241,0.4)] border border-white/20">
            <Store size={32} strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Forgot Password?
          </h1>
          <p className="text-indigo-200/70 mt-2 font-medium">No worries, we'll send you reset instructions.</p>
        </div>

        {submitted ? (
          <div className="text-center bg-white/5 border border-indigo-500/30 rounded-xl p-6">
            <Mail className="mx-auto text-indigo-400 mb-4" size={40} />
            <h3 className="text-white font-bold text-lg mb-2">Check your email</h3>
            <p className="text-gray-400 text-sm mb-4">
              We've sent a password reset link to <br/>
              <span className="text-white font-medium">{email}</span>
            </p>
            <p className="text-xs text-indigo-300/50">
              (For this demo, check the browser console or the green toast popup for the reset link!)
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-12 pr-4 py-3.5 bg-gray-900/50 border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-white placeholder-gray-600 outline-none"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-4 px-4 border border-transparent rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)] text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed group mt-6"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Send Reset Link
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;

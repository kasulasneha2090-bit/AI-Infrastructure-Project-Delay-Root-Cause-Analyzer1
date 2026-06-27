import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Shield, KeyRound, Mail, User as UserIcon, AlertCircle, CheckCircle, ArrowLeft, Sparkles } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/auth/register`,
        { name, email, password },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(`Account created for ${response.data.user.email} (${response.data.user.role})`);
      setName('');
      setEmail('');
      setPassword('');
    } catch (err) {
      console.error('Create user error:', err);
      setError(err.response?.data?.error || 'Failed to create user account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-dark-900 text-slate-400 border border-white/[0.06] hover:bg-dark-850 hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Admin
        </button>
      </div>

      <div className="max-w-lg mx-auto">
        <div className="glass-panel rounded-3xl p-10 border border-white/[0.06] bg-black/35 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          {/* Glowing Top Ambient Effect */}
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-brand-650 to-brand-450"></div>

          <div className="flex flex-col items-center mb-8 text-center">
            <div className="bg-brand-950/60 p-3.5 rounded-2xl border border-brand-900/30 mb-4 text-brand-400">
              <Shield className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-1">
              Create User Account
              <Sparkles className="h-4.5 w-4.5 text-brand-400" />
            </h2>
            <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
              Register a new logins credential profile. The user's email must first be added to the whitelist in the Admin Panel.
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-2.5 p-4 rounded-xl bg-red-950/40 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 flex items-start gap-2.5 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-xs">
              <CheckCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-focus-within:text-brand-400 transition-colors"><UserIcon className="h-4.5 w-4.5" /></span>
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/40 border border-white/[0.08] focus:border-brand-500/50 text-white text-sm focus:outline-none focus:ring-1 focus:ring-brand-500/20"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Corporate Email</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-focus-within:text-brand-400 transition-colors"><Mail className="h-4.5 w-4.5" /></span>
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/40 border border-white/[0.08] focus:border-brand-500/50 text-white text-sm focus:outline-none focus:ring-1 focus:ring-brand-500/20"
                  placeholder="e.g. j.doe@crownridge.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                This email must match the allowed users list database entry exactly.
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Initial Password</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-focus-within:text-brand-400 transition-colors"><KeyRound className="h-4.5 w-4.5" /></span>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/40 border border-white/[0.08] focus:border-brand-500/50 text-white text-sm focus:outline-none focus:ring-1 focus:ring-brand-500/20"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative w-full py-3.5 px-4 bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 disabled:from-brand-850 disabled:to-emerald-850 disabled:text-slate-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-brand-700/25 cursor-pointer overflow-hidden group"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              {loading ? 'Creating Credentials Access Profile...' : 'Register Authorized User'}
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default Register;

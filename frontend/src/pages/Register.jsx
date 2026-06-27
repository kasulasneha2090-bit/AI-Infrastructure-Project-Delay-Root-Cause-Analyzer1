import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Shield, KeyRound, Mail, User as UserIcon, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

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
    <div className="space-y-6 animate-fade-in">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-dark-800 text-dark-300 border border-dark-700 hover:bg-dark-700 hover:text-dark-200 transition-all cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Admin
        </button>
      </div>

      <div className="max-w-lg mx-auto">
        <div className="glass-panel rounded-3xl p-10 border-white/5 relative overflow-hidden">
          {/* Glowing Top Ambient Effect */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-600 to-brand-400"></div>

          {/* Brand Banner */}
          <div className="flex flex-col items-center mb-8">
            <div className="bg-brand-600 p-3 rounded-2xl shadow-xl shadow-brand-700/25 mb-3">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white font-sans text-center">Create User Account</h2>
            <p className="text-dark-400 text-xs mt-1 text-center font-medium">ADMIN — SET UP NEW WORKSTATION PROFILE</p>
          </div>

          {/* Info notice */}
          <div className="mb-6 flex items-start gap-2.5 p-3.5 rounded-xl bg-brand-950/40 border border-brand-900/30 text-brand-400 text-xs">
            <Shield className="h-4 w-4 shrink-0 mt-0.5" />
            <span>The user's email must already be in the <strong>Allowed Users</strong> list. Their role will be assigned automatically from that list.</span>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-950/40 border border-red-900/30 text-red-400 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-900/30 text-emerald-400 text-sm">
              <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
            <div>
              <label className="block text-xs font-bold text-dark-300 uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-dark-500">
                  <UserIcon className="h-4.5 w-4.5" />
                </span>
                <input
                  type="text"
                  required
                  autoComplete="off"
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-dark-300 uppercase tracking-wider mb-2">Corporate Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-dark-500">
                  <Mail className="h-4.5 w-4.5" />
                </span>
                <input
                  type="email"
                  required
                  autoComplete="off"
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm"
                  placeholder="j.doe@crownridge.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-dark-300 uppercase tracking-wider mb-2">Initial Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-dark-500">
                  <KeyRound className="h-4.5 w-4.5" />
                </span>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                />
              </div>
            </div>

            {/* No role dropdown — role is assigned from allowedUsers */}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-brand-600 hover:bg-brand-500 disabled:bg-brand-800 disabled:text-dark-400 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-brand-700/15 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-dark-950 cursor-pointer"
            >
              {loading ? 'Creating Account...' : 'Create User Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Shield, KeyRound, Mail, AlertCircle, Lock } from 'lucide-react';

const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token, user } = response.data;

      // Save token and credentials
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login submit error:', err);
      setError(err.response?.data?.error || 'Invalid credentials. Please verify and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 animate-fade-in">
      <div className="w-full max-w-lg glass-panel rounded-3xl p-10 border-white/5 relative overflow-hidden">
        {/* Glowing Top Ambient Effect */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-600 to-brand-400"></div>

        {/* Brand Banner */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-brand-600 p-3 rounded-2xl shadow-xl shadow-brand-700/25 mb-3">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white font-sans text-center">Crownridge Systems</h2>
          <p className="text-dark-400 text-xs mt-1 text-center font-medium">AI INFRASTRUCTURE DELAY ANALYZER</p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-950/40 border border-red-900/30 text-red-400 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
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
            <label className="block text-xs font-bold text-dark-300 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-dark-500">
                <KeyRound className="h-4.5 w-4.5" />
              </span>
              <input
                type="password"
                required
                autoComplete="new-password"
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-brand-600 hover:bg-brand-500 disabled:bg-brand-800 disabled:text-dark-400 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-brand-700/15 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-dark-950 cursor-pointer"
          >
            {loading ? 'Authenticating Credentials...' : 'Sign In'}
          </button>
        </form>

        {/* Restricted Access Notice — replaces the old "Create an Account" link */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-dark-500">
          <Lock className="h-3.5 w-3.5" />
          <span>Access is restricted to authorized personnel only.</span>
        </div>
      </div>
    </div>
  );
};

export default Login;

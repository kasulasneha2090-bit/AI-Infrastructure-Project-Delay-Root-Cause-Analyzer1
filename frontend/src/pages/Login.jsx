import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, KeyRound, Mail, AlertCircle, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';

// ============================================================
// Interactive 3D Particle Constellation Background
// ============================================================
const ParticleBackground = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Track mouse coordinates
    const handleMouseMove = (e) => {
      mouseRef.current.targetX = (e.clientX - width / 2) * 0.05;
      mouseRef.current.targetY = (e.clientY - height / 2) * 0.05;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    // Build particle nodes
    const particleCount = Math.min(100, Math.floor((width * height) / 14000));
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 400 + 100, // Z depth
        radius: Math.random() * 1.5 + 0.5,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        baseColor: i % 3 === 0 ? 'rgba(59, 130, 246' : i % 3 === 1 ? 'rgba(34, 197, 94' : 'rgba(139, 92, 246',
      });
    }

    // Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse parallax drift
      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      // Draw background ambient glow grids
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
      ctx.lineWidth = 1;
      const gridSize = 80;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x + mouse.x * 0.2, 0);
        ctx.lineTo(x + mouse.x * 0.2, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y + mouse.y * 0.2);
        ctx.lineTo(width, y + mouse.y * 0.2);
        ctx.stroke();
      }

      // Update and draw particles
      particles.forEach((p, idx) => {
        // Apply velocity & 3D mouse drift projection
        p.x += p.vx + mouse.x * (100 / p.z);
        p.y += p.vy + mouse.y * (100 / p.z);

        // Boundary wrapping
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Project sizes based on Z depth
        const scale = 200 / p.z;
        const xProjected = p.x;
        const yProjected = p.y;
        const size = p.radius * scale;

        // Render point node
        ctx.beginPath();
        ctx.arc(xProjected, yProjected, size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.baseColor}, ${scale})`;
        ctx.fill();

        // Connect vectors to nearby nodes
        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          const maxDist = 120;

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.15 * scale;
            ctx.beginPath();
            ctx.moveTo(xProjected, yProjected);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
            ctx.lineWidth = 0.5 * scale;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />;
};

// ============================================================
// Core Login Component
// ============================================================
const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

      // Store credentials locally
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login submit error:', err);
      setError(err.response?.data?.error || 'Access denied. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-radial-dark p-6 overflow-hidden">
      {/* Interactive 3D Particle Space */}
      <ParticleBackground />

      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>

      {/* Container */}
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg z-10"
      >
        <div className="relative glass-card border border-white/[0.06] rounded-3xl p-10 shadow-2xl shadow-black/60 overflow-hidden bg-black/40 backdrop-blur-2xl">
          {/* Top Edge Gradient Accent */}
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500"></div>

          {/* Header Banner */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group mb-4">
              {/* Spinning glow ring */}
              <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-blue-500 to-emerald-500 opacity-75 blur-md group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-spin-slow"></div>
              
              <div className="relative bg-dark-950 p-4 rounded-2xl border border-white/10 shadow-inner">
                <Shield className="h-8 w-8 text-emerald-400 group-hover:scale-105 transition-transform duration-300" />
              </div>
            </div>
            
            <h2 className="text-3xl font-extrabold tracking-tight text-white font-sans text-center flex items-center gap-1.5">
              Crownridge Systems
              <Sparkles className="h-4.5 w-4.5 text-yellow-400 animate-pulse" />
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 bg-slate-900/80 px-3 py-1 rounded-full border border-white/[0.03]">
              AI Infrastructure Delay Root Cause Analyzer
            </p>
          </div>

          {/* Error Notice */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="mb-6 flex items-start gap-2.5 p-4 rounded-2xl bg-red-950/40 border border-red-500/20 text-red-300 text-xs"
              >
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-400" />
                <span className="leading-relaxed">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Corporate Email</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-blue-400 transition-colors">
                  <Mail className="h-4.5 w-4.5" />
                </span>
                <input
                  type="email"
                  required
                  autoComplete="off"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-950/40 border border-white/[0.08] focus:border-blue-500/50 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all shadow-inner"
                  placeholder="name@crownridge.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Credentials Key</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                  <KeyRound className="h-4.5 w-4.5" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  className="w-full pl-11 pr-11 py-3.5 rounded-xl bg-slate-950/40 border border-white/[0.08] focus:border-emerald-500/50 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all shadow-inner"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            {/* Login Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full py-4 px-4 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 disabled:from-blue-800 disabled:to-emerald-800 disabled:text-slate-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:shadow-blue-500/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer overflow-hidden group"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              {loading ? 'Authorizing Access Clearance...' : 'Verify Workspace Access'}
            </button>
          </form>

          {/* Secure Access Footer Notice */}
          <div className="mt-8 pt-6 border-t border-white/[0.04] flex items-center justify-center gap-2 text-[10px] text-slate-500 font-medium">
            <Lock className="h-3.5 w-3.5 text-slate-500" />
            <span>Workspace access restricted to pre-authorized personnel.</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

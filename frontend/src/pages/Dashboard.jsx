import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FileText, Calendar, Star, Shield, ArrowRight, PlusCircle, Clock, Sparkles } from 'lucide-react';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    total: 0,
    today: 0,
    avgRating: '0.0',
    recentReports: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const res = await axios.get(`${API_URL}/reports`, { headers });
        const reports = res.data;

        const total = reports.length;
        
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const today = reports.filter(r => new Date(r.createdAt) >= startOfToday).length;

        let ratedCount = 0;
        let sumRating = 0;
        reports.forEach(r => {
          if (r.feedback) {
            sumRating += r.feedback.rating;
            ratedCount++;
          }
        });
        const avgRating = ratedCount > 0 ? (sumRating / ratedCount).toFixed(1) : '0.0';

        setMetrics({
          total,
          today,
          avgRating,
          recentReports: reports.slice(0, 5)
        });
      } catch (err) {
        console.error('Error fetching dashboard reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-950/50 text-red-400 border border-red-900/30';
      case 'High':
        return 'bg-orange-950/50 text-orange-400 border border-orange-900/30';
      case 'Medium':
        return 'bg-yellow-950/50 text-yellow-400 border border-yellow-900/30';
      default:
        return 'bg-blue-950/50 text-blue-400 border border-blue-900/30';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Animation constants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Top Banner */}
      <motion.div 
        variants={itemVariants}
        className="relative rounded-3xl overflow-hidden glass-panel p-8 border border-white/[0.06] shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-black/40 backdrop-blur-xl"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-600/10 rounded-full filter blur-[80px] pointer-events-none animate-pulse-slow"></div>
        <div className="relative z-10 space-y-1">
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Welcome, {user.name}
            <Sparkles className="h-5 w-5 text-brand-400 animate-pulse" />
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-xl leading-relaxed">Convert unstructured project delays into comprehensive, AI-powered root cause reports.</p>
        </div>
        <button
          onClick={() => navigate('/analyze')}
          className="relative group shrink-0 flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-brand-700/35 cursor-pointer overflow-hidden z-10"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <PlusCircle className="h-5 w-5" />
          Analyze Delay Event
        </button>
      </motion.div>

      {/* KPI Cards Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card-3d glass-panel rounded-3xl p-6 border border-white/[0.06] bg-black/35 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="translate-z-20">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Reports</p>
              <h3 className="text-3xl font-extrabold text-white mt-2">{metrics.total}</h3>
            </div>
            <div className="p-3 bg-brand-950/60 border border-brand-900/30 rounded-2xl text-brand-400 translate-z-20">
              <FileText className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-500">All analysis logs associated with your organization.</div>
        </div>

        <div className="card-3d glass-panel rounded-3xl p-6 border border-white/[0.06] bg-black/35 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="translate-z-20">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reports Today</p>
              <h3 className="text-3xl font-extrabold text-white mt-2">{metrics.today}</h3>
            </div>
            <div className="p-3 bg-emerald-950/60 border border-emerald-900/30 rounded-2xl text-emerald-400 translate-z-20">
              <Calendar className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-500">Reports filed since 12:00 AM local time.</div>
        </div>

        <div className="card-3d glass-panel rounded-3xl p-6 border border-white/[0.06] bg-black/35 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="translate-z-20">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Quality Score</p>
              <h3 className="text-3xl font-extrabold text-white mt-2">{metrics.avgRating} <span className="text-sm font-semibold text-slate-500">/ 5.0</span></h3>
            </div>
            <div className="p-3 bg-yellow-950/60 border border-yellow-900/30 rounded-2xl text-yellow-400 translate-z-20">
              <Star className="h-6 w-6 fill-yellow-400" />
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-500">Average response score provided by project managers.</div>
        </div>
      </motion.div>

      {/* Main Content Splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Reports Listing (2/3 width) */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-2 glass-panel rounded-3xl p-6 border border-white/[0.06] bg-black/30 backdrop-blur-xl shadow-xl flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white tracking-wide">Recent Delay Analysis Reports</h2>
              <button 
                onClick={() => navigate('/history')} 
                className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-all cursor-pointer bg-slate-900/80 border border-white/[0.04] px-3 py-1.5 rounded-xl hover:border-white/10"
              >
                View History <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {metrics.recentReports.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl">
                <Clock className="h-8 w-8 text-slate-500 mx-auto mb-3" />
                <p className="text-sm text-slate-400 font-medium">No delay reports created yet.</p>
                <button
                  onClick={() => navigate('/analyze')}
                  className="mt-3 text-xs font-bold text-brand-400 hover:text-brand-300 transition-all cursor-pointer"
                >
                  Create your first report now
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      <th className="pb-3 pl-2">Project Metadata</th>
                      <th className="pb-3">Severity</th>
                      <th className="pb-3">Primary Root Cause</th>
                      <th className="pb-3 text-right pr-2">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {metrics.recentReports.map((report) => (
                      <tr key={report.id} className="text-sm hover:bg-white/[0.01] transition-all group">
                        <td className="py-3.5 pr-2 pl-2">
                          <div className="font-semibold text-white group-hover:text-brand-400 transition-colors">{report.projectName}</div>
                          <div className="text-xs text-slate-500 font-medium mt-0.5">ID: {report.projectId} • {report.location}</div>
                        </td>
                        <td className="py-3.5">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getSeverityBadge(report.severity)}`}>
                            {report.severity}
                          </span>
                        </td>
                        <td className="py-3.5 text-xs text-slate-400 font-medium max-w-[150px] truncate">
                          {report.aiResponse?.primaryCause || 'Processing classification...'}
                        </td>
                        <td className="py-3.5 text-right pr-2">
                          <button
                            onClick={() => navigate(`/reports/${report.id}`)}
                            className="px-3.5 py-2 bg-dark-900 hover:bg-dark-850 text-white rounded-xl text-xs font-bold border border-white/[0.06] hover:border-white/20 transition-all cursor-pointer"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>

        {/* Informative Guidance Panel (1/3 width) */}
        <motion.div 
          variants={itemVariants}
          className="glass-panel rounded-3xl p-6 border border-white/[0.06] bg-black/30 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-6"
        >
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white tracking-wide">Crownridge LLP Guidelines</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-lg bg-brand-950 text-brand-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-brand-900/35">1</div>
                <div className="text-xs text-slate-400 leading-relaxed">
                  <strong className="text-white block mb-0.5">Provide accurate values:</strong> Make sure to supply detailed quantities (e.g. specific durations, weather metrics, shortages) for precision diagnostics.
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-lg bg-brand-950 text-brand-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-brand-900/35">2</div>
                <div className="text-xs text-slate-400 leading-relaxed">
                  <strong className="text-white block mb-0.5">Use templates for speed:</strong> Auto-complete core fields using preset templates created by administrators for specific monsoon or logistical contexts.
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-lg bg-brand-950 text-brand-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-brand-900/35">3</div>
                <div className="text-xs text-slate-400 leading-relaxed">
                  <strong className="text-white block mb-0.5">Rate the responses:</strong> Help Crownridge optimize its AI pipelines by rating and providing commentary on each analysis report.
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-2xl bg-dark-900 border border-white/[0.06] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full filter blur-xl"></div>
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-brand-400">
              <Shield className="h-4 w-4" />
              SLA Guarantee Active
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">AI calculations are governed under the under-5-seconds latency SLA compliance rate.</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;

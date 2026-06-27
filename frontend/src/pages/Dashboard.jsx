import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FileText, Calendar, Star, Shield, ArrowRight, PlusCircle, Search, Clock } from 'lucide-react';

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

        // Fetch reports list to aggregate locally for user dashboard
        const res = await axios.get(`${API_URL}/reports`, { headers });
        const reports = res.data;

        // Compute metrics
        const total = reports.length;
        
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const today = reports.filter(r => new Date(r.createdAt) >= startOfToday).length;

        // Calculate average rating
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
          recentReports: reports.slice(0, 5) // Last 5 reports
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

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="relative rounded-3xl overflow-hidden glass-panel p-8 border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600/10 rounded-full filter blur-3xl pointer-events-none"></div>
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Welcome, {user.name}</h1>
          <p className="text-dark-300 text-sm mt-1">Convert unstructured project delays into comprehensive, AI-powered root cause reports.</p>
        </div>
        <button
          onClick={() => navigate('/analyze')}
          className="flex items-center gap-2 px-6 py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-700/25 cursor-pointer"
        >
          <PlusCircle className="h-5 w-5" />
          Analyze Delay Event
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass-panel rounded-2xl p-6 border-white/5 glow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-dark-400 uppercase tracking-widest">Total Reports</p>
              <h3 className="text-3xl font-extrabold text-white mt-2">{metrics.total}</h3>
            </div>
            <div className="p-3 bg-brand-950/60 border border-brand-900/30 rounded-xl text-brand-400">
              <FileText className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 text-xs text-dark-400">All analysis logs associated with your organization.</div>
        </div>

        <div className="glass-panel rounded-2xl p-6 border-white/5 glow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-dark-400 uppercase tracking-widest">Reports Today</p>
              <h3 className="text-3xl font-extrabold text-white mt-2">{metrics.today}</h3>
            </div>
            <div className="p-3 bg-emerald-950/60 border border-emerald-900/30 rounded-xl text-emerald-400">
              <Calendar className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 text-xs text-dark-400">Reports filed since 12:00 AM local time.</div>
        </div>

        <div className="glass-panel rounded-2xl p-6 border-white/5 glow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-dark-400 uppercase tracking-widest">AI Quality Score</p>
              <h3 className="text-3xl font-extrabold text-white mt-2">{metrics.avgRating} <span className="text-sm font-semibold text-dark-400">/ 5.0</span></h3>
            </div>
            <div className="p-3 bg-yellow-950/60 border border-yellow-900/30 rounded-xl text-yellow-400">
              <Star className="h-6 w-6 fill-yellow-400" />
            </div>
          </div>
          <div className="mt-4 text-xs text-dark-400">Average response score provided by project managers.</div>
        </div>
      </div>

      {/* Main Content Splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Reports Listing (2/3 width) */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white tracking-wide">Recent Delay Analysis Reports</h2>
              <button 
                onClick={() => navigate('/history')} 
                className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-all cursor-pointer"
              >
                View History <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {metrics.recentReports.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-white/5 rounded-xl">
                <Clock className="h-8 w-8 text-dark-500 mx-auto mb-3" />
                <p className="text-sm text-dark-400 font-medium">No delay reports created yet.</p>
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
                    <tr className="border-b border-white/5 text-[10px] uppercase font-bold text-dark-400 tracking-wider">
                      <th className="pb-3">Project Metadata</th>
                      <th className="pb-3">Severity</th>
                      <th className="pb-3">Primary Root Cause</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {metrics.recentReports.map((report) => (
                      <tr key={report.id} className="text-sm hover:bg-white/[0.01] transition-all">
                        <td className="py-3.5 pr-2">
                          <div className="font-semibold text-white">{report.projectName}</div>
                          <div className="text-xs text-dark-400 font-medium">ID: {report.projectId} • {report.location}</div>
                        </td>
                        <td className="py-3.5">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getSeverityBadge(report.severity)}`}>
                            {report.severity}
                          </span>
                        </td>
                        <td className="py-3.5 text-xs text-dark-300 font-medium max-w-[150px] truncate">
                          {report.aiResponse?.primaryCause || 'Processing classification...'}
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => navigate(`/reports/${report.id}`)}
                            className="px-3 py-1.5 bg-dark-850 hover:bg-dark-750 text-white rounded-lg text-xs font-semibold border border-white/5 transition-all cursor-pointer"
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
        </div>

        {/* Informative Guidance Panel (1/3 width) */}
        <div className="glass-panel rounded-2xl p-6 border-white/5 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide mb-4">Crownridge LLP Guidelines</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded bg-brand-950 text-brand-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</div>
                <div className="text-xs text-dark-300">
                  <strong className="text-white">Provide accurate values:</strong> Make sure to supply detailed quantities (e.g., specific delay durations, weather volumes, shortages) for precision classification.
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded bg-brand-950 text-brand-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</div>
                <div className="text-xs text-dark-300">
                  <strong className="text-white">Use templates for speed:</strong> Auto-complete core fields using preset templates created by administrators for specific monsoon or logistics contexts.
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded bg-brand-950 text-brand-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</div>
                <div className="text-xs text-dark-300">
                  <strong className="text-white">Rate the responses:</strong> Help Crownridge optimize its AI pipelines by rating and providing commentary on each analysis report.
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 p-4 rounded-xl bg-dark-900 border border-white/5">
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-brand-400">
              <Shield className="h-4 w-4" />
              SLA Guarantee Active
            </div>
            <p className="text-[11px] text-dark-400 leading-relaxed">AI calculations are governed under the under-5-seconds latency SLA compliance rate.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

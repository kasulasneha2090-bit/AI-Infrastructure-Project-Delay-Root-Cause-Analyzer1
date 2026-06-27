import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Search, Calendar, Trash2, FileText, ChevronRight, SlidersHorizontal } from 'lucide-react';

const ReportHistory = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchReports = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = {};
      if (search) params.search = search;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await axios.get(`${API_URL}/reports`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setReports(res.data);
    } catch (err) {
      console.error('Error fetching reports history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReports();
  };

  const handleResetFilters = () => {
    setSearch('');
    setStartDate('');
    setEndDate('');
    setTimeout(async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/reports`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReports(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 50);
  };

  const handleDeleteReport = async (reportId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to permanently delete this delay analysis report?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/reports/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(prev => prev.filter(r => r.id !== reportId));
    } catch (err) {
      console.error('Error deleting report:', err);
      alert('Failed to delete report.');
    }
  };

  const getSeverityBadgeColor = (severity) => {
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

  // Animation constants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 15 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 120 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Page Title */}
      <motion.div variants={itemVariants} className="border-b border-white/[0.06] pb-5">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Project Delay Report History</h1>
        <p className="text-slate-400 text-sm mt-1">Review, filter, and export previously generated AI diagnostic reports.</p>
      </motion.div>

      {/* Filters Form Block */}
      <motion.form 
        variants={itemVariants}
        onSubmit={handleSearchSubmit} 
        className="glass-panel p-5 rounded-3xl border border-white/[0.06] bg-black/30 backdrop-blur-xl shadow-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end"
      >
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Search Query</label>
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 group-focus-within:text-brand-400 transition-colors"><Search className="h-4 w-4" /></span>
            <input
              type="text"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950/40 border border-white/[0.08] focus:border-brand-500/50 text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-500/20"
              placeholder="Project Name, ID, or Location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Start Date</label>
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 group-focus-within:text-brand-400 transition-colors"><Calendar className="h-4 w-4" /></span>
            <input
              type="date"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950/40 border border-white/[0.08] focus:border-brand-500/50 text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-500/20"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">End Date</label>
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 group-focus-within:text-brand-400 transition-colors"><Calendar className="h-4 w-4" /></span>
            <input
              type="date"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950/40 border border-white/[0.08] focus:border-brand-500/50 text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-500/20"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 py-3 bg-brand-700 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg hover:shadow-brand-800/20"
          >
            Apply Filters
          </button>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-3 bg-dark-900 hover:bg-dark-850 text-slate-300 hover:text-white border border-white/[0.06] rounded-xl transition-all cursor-pointer"
          >
            Reset
          </button>
        </div>
      </motion.form>

      {/* Reports List */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
        </div>
      ) : reports.length === 0 ? (
        <motion.div 
          variants={itemVariants}
          className="text-center py-20 border border-dashed border-white/10 rounded-3xl"
        >
          <FileText className="h-10 w-10 text-slate-500 mx-auto mb-3" />
          <p className="text-sm text-slate-400 font-semibold">No delay reports match your search filter criteria.</p>
          <button 
            type="button" 
            onClick={handleResetFilters}
            className="mt-2 text-xs font-bold text-brand-400 hover:text-brand-300 transition-all cursor-pointer"
          >
            Clear active filters
          </button>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {reports.map((report) => (
            <motion.div
              variants={itemVariants}
              key={report.id}
              onClick={() => navigate(`/reports/${report.id}`)}
              className="card-3d glass-panel p-6 rounded-3xl border border-white/[0.06] bg-black/35 backdrop-blur-xl shadow-xl flex flex-col justify-between cursor-pointer group"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <h3 className="font-extrabold text-white group-hover:text-brand-400 transition-all line-clamp-1 translate-z-20">{report.projectName}</h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5 translate-z-10">ID: {report.projectId} • {report.location}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getSeverityBadgeColor(report.severity)}`}>
                    {report.severity}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-slate-400 font-semibold">
                    Primary Cause: 
                    <span className="text-white block mt-0.5 font-medium line-clamp-2">
                      {report.aiResponse?.primaryCause || 'Processing classification...'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Classification: <span className="text-brand-400">{report.aiResponse?.rootCauseClassification || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/[0.04]">
                <div className="text-[10px] text-slate-500 font-semibold">
                  Filed: {new Date(report.createdAt).toLocaleDateString()}
                  {report.user?.name && <span className="block mt-0.5 text-slate-400">By: {report.user.name}</span>}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={(e) => handleDeleteReport(report.id, e)}
                    className="p-2 bg-red-950/40 hover:bg-red-900/40 text-red-400 hover:text-red-300 border border-red-900/30 rounded-xl transition-all cursor-pointer"
                    title="Delete Report"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    className="p-2 bg-dark-900 group-hover:bg-brand-600 group-hover:text-white text-dark-300 border border-white/[0.06] group-hover:border-transparent rounded-xl transition-all"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default ReportHistory;

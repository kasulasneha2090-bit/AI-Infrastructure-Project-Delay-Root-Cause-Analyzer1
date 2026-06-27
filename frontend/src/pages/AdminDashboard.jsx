import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, 
  LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { 
  BarChart3, PlusCircle, CheckCircle, AlertTriangle, 
  MessageSquare, Star, Settings, Calendar, ShieldCheck,
  Users, UserPlus, Trash2, Edit3, AlertCircle, XCircle,
  ToggleLeft, ToggleRight, Shield
} from 'lucide-react';
import { useTheme } from '../components/ThemeContext';
import { useNavigate } from 'react-router-dom';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, 
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

const AdminDashboard = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [feedbackLogs, setFeedbackLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Template form states
  const [templateForm, setTemplateForm] = useState({
    title: '',
    weather: '',
    labour: '',
    material: '',
    equipment: '',
    approval: ''
  });
  const [templateSuccess, setTemplateSuccess] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);

  // User management states
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' or 'users'
  const [allowedUsers, setAllowedUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userError, setUserError] = useState('');
  const [userSuccess, setUserSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ email: '', name: '', role: 'user' });
  const [addingUser, setAddingUser] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', role: '', status: '' });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
  };

  const fetchAdminData = async () => {
    try {
      const headers = getAuthHeaders();

      // Fetch analytics
      const analyticsRes = await axios.get(`${API_URL}/admin/analytics`, { headers });
      setAnalytics(analyticsRes.data);

      // Fetch feedback
      const feedbackRes = await axios.get(`${API_URL}/feedback`, { headers });
      setFeedbackLogs(feedbackRes.data);
    } catch (err) {
      console.error('Error fetching admin details:', err);
      setError('Failed to load administrative reports.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllowedUsers = async () => {
    setUsersLoading(true);
    setUserError('');
    try {
      const headers = getAuthHeaders();
      const res = await axios.get(`${API_URL}/auth/allowed-users`, { headers });
      setAllowedUsers(res.data);
    } catch (err) {
      console.error('Error fetching allowed users:', err);
      setUserError('Failed to load allowed users.');
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchAllowedUsers();
    }
  }, [activeTab]);

  // Add allowed user
  const handleAddAllowedUser = async (e) => {
    e.preventDefault();
    setAddingUser(true);
    setUserError('');
    setUserSuccess('');

    try {
      const headers = getAuthHeaders();
      await axios.post(`${API_URL}/auth/allowed-users`, {
        email: newUserForm.email,
        name: newUserForm.name,
        role: newUserForm.role,
        status: 'active'
      }, { headers });

      setUserSuccess(`${newUserForm.email} added to allowed users list.`);
      setNewUserForm({ email: '', name: '', role: 'user' });
      setShowAddForm(false);
      fetchAllowedUsers();
    } catch (err) {
      setUserError(err.response?.data?.error || 'Failed to add user');
    } finally {
      setAddingUser(false);
    }
  };

  // Toggle user status
  const handleToggleStatus = async (user) => {
    setUserError('');
    setUserSuccess('');
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      const headers = getAuthHeaders();
      await axios.put(`${API_URL}/auth/allowed-users/${user.id}`, { status: newStatus }, { headers });
      setUserSuccess(`${user.email} is now ${newStatus}.`);
      fetchAllowedUsers();
    } catch (err) {
      setUserError(err.response?.data?.error || 'Failed to update status');
    }
  };

  // Start editing
  const startEditing = (user) => {
    setEditingId(user.id);
    setEditForm({ name: user.name || '', role: user.role, status: user.status });
  };

  // Save edit
  const handleSaveEdit = async (userId) => {
    setUserError('');
    setUserSuccess('');
    try {
      const headers = getAuthHeaders();
      await axios.put(`${API_URL}/auth/allowed-users/${userId}`, editForm, { headers });
      setUserSuccess('User updated successfully.');
      setEditingId(null);
      fetchAllowedUsers();
    } catch (err) {
      setUserError(err.response?.data?.error || 'Failed to update user');
    }
  };

  // Delete user
  const handleDeleteUser = async (user) => {
    if (!confirm(`Remove ${user.email} from allowed users? This will prevent them from logging in.`)) return;
    setUserError('');
    setUserSuccess('');
    try {
      const headers = getAuthHeaders();
      await axios.delete(`${API_URL}/auth/allowed-users/${user.id}`, { headers });
      setUserSuccess(`${user.email} removed from allowed users.`);
      fetchAllowedUsers();
    } catch (err) {
      setUserError(err.response?.data?.error || 'Failed to remove user');
    }
  };

  const handleTemplateSubmit = async (e) => {
    e.preventDefault();
    setTemplateLoading(true);
    setTemplateSuccess(false);
    setError('');

    try {
      const headers = getAuthHeaders();
      await axios.post(`${API_URL}/templates`, templateForm, { headers });
      
      setTemplateSuccess(true);
      setTemplateForm({
        title: '',
        weather: '',
        labour: '',
        material: '',
        equipment: '',
        approval: ''
      });
      
      // Refresh templates in delay form if we navigate
    } catch (err) {
      console.error(err);
      setError('Failed to register template.');
    } finally {
      setTemplateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  // Pre-process chart datasets
  const dailyTrendData = {
    labels: analytics?.charts.dailyTrend.map(d => d.date) || [],
    datasets: [{
      label: 'Delay Reports Filed',
      data: analytics?.charts.dailyTrend.map(d => d.count) || [],
      borderColor: isLight ? '#2563eb' : '#22c55e',
      backgroundColor: isLight ? 'rgba(37, 99, 235, 0.1)' : 'rgba(34, 197, 94, 0.1)',
      borderWidth: 2.5,
      tension: 0.35,
      fill: true
    }]
  };

  const rcLabels = Object.keys(analytics?.charts.rootCauseDistribution || {});
  const rcData = Object.values(analytics?.charts.rootCauseDistribution || {});
  const rootCauseChartData = {
    labels: rcLabels,
    datasets: [{
      data: rcData,
      backgroundColor: isLight ? [
        'rgba(37, 99, 235, 0.8)', // royal blue
        'rgba(59, 130, 246, 0.8)', // hover blue
        'rgba(245, 158, 11, 0.8)', // amber
        'rgba(239, 68, 68, 0.8)',  // red
        'rgba(139, 92, 246, 0.8)', // purple
        'rgba(71, 85, 105, 0.8)',  // slate
      ] : [
        'rgba(34, 197, 94, 0.75)', // green
        'rgba(22, 163, 74, 0.75)', // darker green
        'rgba(245, 158, 11, 0.75)', // amber
        'rgba(239, 68, 68, 0.75)',  // red
        'rgba(139, 92, 246, 0.75)', // purple
        'rgba(100, 116, 139, 0.75)', // slate
      ],
      borderWidth: 1,
      borderColor: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.05)'
    }]
  };

  const severityLabels = Object.keys(analytics?.charts.delayCategoryDistribution || {});
  const severityData = Object.values(analytics?.charts.delayCategoryDistribution || {});
  const severityChartData = {
    labels: severityLabels,
    datasets: [{
      label: 'Severities',
      data: severityData,
      backgroundColor: severityLabels.map(s => {
        if (s === 'Critical') return 'rgba(239, 68, 68, 0.75)';
        if (s === 'High') return 'rgba(245, 158, 11, 0.75)';
        if (s === 'Medium') return 'rgba(234, 179, 8, 0.75)';
        return isLight ? 'rgba(37, 99, 235, 0.75)' : 'rgba(59, 130, 246, 0.75)';
      }),
      borderWidth: 0,
      borderRadius: 6
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: isLight ? '#475569' : '#94a3b8', font: { family: 'Outfit', size: 10 } } },
      tooltip: { titleFont: { family: 'Outfit' }, bodyFont: { family: 'Outfit' } }
    },
    scales: {
      x: { 
        grid: { color: isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.03)' }, 
        ticks: { color: isLight ? '#475569' : '#64748b', font: { family: 'Outfit', size: 9 } } 
      },
      y: { 
        grid: { color: isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.03)' }, 
        ticks: { color: isLight ? '#475569' : '#64748b', font: { family: 'Outfit', size: 9 }, stepSize: 1 } 
      }
    }
  };

  // ====================== RENDER ======================
  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="border-b border-white/5 pb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-brand-500" />
            Executive Planning Analytics
          </h1>
          <p className="text-dark-400 text-sm mt-1">Review operational performance metrics, user management, and quality assurance logs.</p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-950/60 border border-brand-900/30 text-xs font-semibold text-brand-400">
          <ShieldCheck className="h-4 w-4" />
          Admin Clearance Verified
        </span>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-brand-600 text-white shadow-lg shadow-brand-700/20'
              : 'glass-panel text-dark-300 hover:text-white border border-white/5'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          Analytics & Templates
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'bg-brand-600 text-white shadow-lg shadow-brand-700/20'
              : 'glass-panel text-dark-300 hover:text-white border border-white/5'
          }`}
        >
          <Users className="h-4 w-4" />
          Manage Users
        </button>
      </div>

      {/* ====================== ANALYTICS TAB ====================== */}
      {activeTab === 'analytics' && (
        <>
          {/* KPI Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-panel p-5 rounded-2xl border-white/5">
              <span className="text-[10px] font-bold text-dark-400 uppercase tracking-widest block">Reports Today / Monthly</span>
              <h3 className="text-2xl font-extrabold text-white mt-1.5">{analytics?.summary.reportsToday} / {analytics?.summary.reportsThisMonth}</h3>
              <p className="text-[10px] text-dark-400 mt-2 font-medium">Daily input rate of diagnostic requests.</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border-white/5">
              <span className="text-[10px] font-bold text-dark-400 uppercase tracking-widest block">AI Rating Average</span>
              <h3 className="text-2xl font-extrabold text-white mt-1.5 flex items-center gap-1">
                {analytics?.summary.averageRating}
                <span className="text-xs text-dark-400 font-semibold">/ 5.0</span>
              </h3>
              <div className="flex gap-0.5 mt-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`h-3 w-3 ${
                    s <= Math.round(parseFloat(analytics?.summary.averageRating || '0')) 
                      ? 'text-yellow-400 fill-yellow-400' 
                      : 'text-dark-600'
                  }`} />
                ))}
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border-white/5">
              <span className="text-[10px] font-bold text-dark-400 uppercase tracking-widest block">Top Delay Driver</span>
              <h3 className="text-lg font-extrabold text-white mt-1.5 truncate" title={analytics?.summary.mostCommonRootCause}>
                {analytics?.summary.mostCommonRootCause}
              </h3>
              <p className="text-[10px] text-brand-400 mt-2 font-medium">Dominant delay classification category.</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border-white/5">
              <span className="text-[10px] font-bold text-dark-400 uppercase tracking-widest block">API Avg Response Time</span>
              <h3 className="text-2xl font-extrabold text-white mt-1.5">
                {((analytics?.responseTimeMetrics.averageLatencyMs || 1420) / 1000).toFixed(2)}s
              </h3>
              <p className="text-[10px] text-emerald-400 mt-2 font-medium">SLA compliance rate is active.</p>
            </div>
          </div>

          {/* Analytics Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Trend Volume Line Chart */}
            <div className="glass-panel p-6 rounded-2xl border-white/5">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <Calendar className="h-4.5 w-4.5 text-brand-500" />
                Report Submission Volume Trend (Daily)
              </h3>
              <div className="h-60">
                <Line data={dailyTrendData} options={chartOptions} />
              </div>
            </div>

            {/* Doughnut Causes Chart */}
            <div className="glass-panel p-6 rounded-2xl border-white/5">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <BarChart3 className="h-4.5 w-4.5 text-brand-500" />
                Root Cause Distribution Share
              </h3>
              <div className="h-60 relative flex justify-center">
                {rcData.length === 0 ? (
                  <div className="flex items-center text-xs text-dark-400">No cause classifications processed yet.</div>
                ) : (
                  <Doughnut 
                    data={rootCauseChartData} 
                    options={{
                      ...chartOptions,
                      scales: { x: { display: false }, y: { display: false } }
                    }} 
                  />
                )}
              </div>
            </div>

            {/* Severity categories Bar Chart */}
            <div className="glass-panel p-6 rounded-2xl border-white/5">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Delay Event Severity Breakdowns</h3>
              <div className="h-60">
                <Bar data={severityChartData} options={chartOptions} />
              </div>
            </div>

            {/* Create template form card */}
            <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
                <Settings className="h-4.5 w-4.5 text-brand-500" />
                Incident Quick-Fill Template Creator
              </h3>
              
              {templateSuccess && (
                <div className="p-3.5 rounded-xl bg-brand-950/40 border border-brand-900/30 text-brand-400 text-xs font-semibold">
                  Template created and indexed globally!
                </div>
              )}

              <form onSubmit={handleTemplateSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[9px] font-bold text-dark-300 uppercase mb-1">Template Title</label>
                  <input
                    type="text" required
                    className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                    placeholder="e.g. Winter Blizzard Contingency"
                    value={templateForm.title}
                    onChange={(e) => setTemplateForm({...templateForm, title: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-dark-300 uppercase mb-1">Weather Factor</label>
                    <input
                      type="text" required
                      className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                      placeholder="Snowstorm, high winds"
                      value={templateForm.weather}
                      onChange={(e) => setTemplateForm({...templateForm, weather: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-dark-300 uppercase mb-1">Labour Factor</label>
                    <input
                      type="text" required
                      className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                      placeholder="Absenteeism, strike"
                      value={templateForm.labour}
                      onChange={(e) => setTemplateForm({...templateForm, labour: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-dark-300 uppercase mb-1">Material Factor</label>
                    <input
                      type="text" required
                      className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                      placeholder="Steel delay, cargo block"
                      value={templateForm.material}
                      onChange={(e) => setTemplateForm({...templateForm, material: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-dark-300 uppercase mb-1">Equipment Factor</label>
                    <input
                      type="text" required
                      className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                      placeholder="Generator break, loader repairs"
                      value={templateForm.equipment}
                      onChange={(e) => setTemplateForm({...templateForm, equipment: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-dark-300 uppercase mb-1">Permits / Approvals Factor</label>
                  <input
                    type="text" required
                    className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                    placeholder="Permit pending zoning review"
                    value={templateForm.approval}
                    onChange={(e) => setTemplateForm({...templateForm, approval: e.target.value})}
                  />
                </div>

                <button
                  type="submit"
                  disabled={templateLoading}
                  className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="h-4 w-4" />
                  {templateLoading ? 'Publishing Template...' : 'Publish Template'}
                </button>
              </form>
            </div>
          </div>

          {/* User comments list table */}
          <div className="glass-panel p-6 rounded-2xl border-white/5">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <MessageSquare className="h-4.5 w-4.5 text-brand-500" />
              User Feedback Comments & Quality Logs
            </h3>

            {feedbackLogs.length === 0 ? (
              <div className="text-center py-8 text-xs text-dark-400">No project manager feedback reports recorded yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[9px] uppercase font-bold text-dark-400 tracking-wider">
                      <th className="pb-3">Project Details</th>
                      <th className="pb-3">Submitter</th>
                      <th className="pb-3">Rating Score</th>
                      <th className="pb-3">Feedback Remarks</th>
                      <th className="pb-3 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {feedbackLogs.map((log) => (
                      <tr key={log.id} className="text-xs hover:bg-white/[0.01] transition-all">
                        <td className="py-3">
                          <div className="font-semibold text-white">{log.report.projectName}</div>
                          <div className="text-[10px] text-dark-400">ID: {log.report.projectId}</div>
                        </td>
                        <td className="py-3">
                          <div className="text-dark-200">{log.report.user?.name || 'Unknown'}</div>
                          <div className="text-[10px] text-dark-500">{log.report.user?.email || 'N/A'}</div>
                        </td>
                        <td className="py-3">
                          <div className="flex gap-0.5 items-center">
                            <span className="font-bold text-white mr-1">{log.rating}.0</span>
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`h-3 w-3 ${
                                s <= log.rating ? 'text-yellow-400 fill-yellow-400' : 'text-dark-700'
                              }`} />
                            ))}
                          </div>
                        </td>
                        <td className="py-3 text-dark-300 font-medium max-w-[200px] truncate" title={log.comment}>
                          {log.comment || <span className="text-dark-500 italic">No comments</span>}
                        </td>
                        <td className="py-3 text-right text-dark-400">
                          {new Date(log.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ====================== MANAGE USERS TAB ====================== */}
      {activeTab === 'users' && (
        <div className="space-y-6">

          {/* User Management Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-brand-500" />
                Allowed Users Directory
              </h2>
              <p className="text-dark-400 text-xs mt-1">Only users listed here can log into the system. Role and status are controlled from this panel.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white transition-all cursor-pointer shadow-lg shadow-brand-700/15"
              >
                <UserPlus className="h-4 w-4" />
                Add Allowed User
              </button>
              <button
                onClick={() => navigate('/register')}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold glass-panel text-dark-300 hover:text-white border border-white/5 transition-all cursor-pointer"
              >
                <PlusCircle className="h-4 w-4" />
                Create Account
              </button>
            </div>
          </div>

          {/* Status Messages */}
          {userError && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-950/40 border border-red-900/30 text-red-400 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{userError}</span>
              <button onClick={() => setUserError('')} className="ml-auto shrink-0 cursor-pointer"><XCircle className="h-4 w-4" /></button>
            </div>
          )}
          {userSuccess && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-900/30 text-emerald-400 text-sm">
              <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{userSuccess}</span>
              <button onClick={() => setUserSuccess('')} className="ml-auto shrink-0 cursor-pointer"><XCircle className="h-4 w-4" /></button>
            </div>
          )}

          {/* Add Allowed User Form (Collapsible) */}
          {showAddForm && (
            <div className="glass-panel p-6 rounded-2xl border-white/5 animate-fade-in">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <UserPlus className="h-4.5 w-4.5 text-brand-500" />
                Add to Allowed Users List
              </h3>
              <form onSubmit={handleAddAllowedUser} className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-[9px] font-bold text-dark-300 uppercase mb-1">Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2.5 rounded-lg glass-input text-xs"
                    placeholder="John Doe"
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm({...newUserForm, name: e.target.value})}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[9px] font-bold text-dark-300 uppercase mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    className="w-full px-3 py-2.5 rounded-lg glass-input text-xs"
                    placeholder="j.doe@crownridge.com"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({...newUserForm, email: e.target.value})}
                  />
                </div>
                <div className="w-36">
                  <label className="block text-[9px] font-bold text-dark-300 uppercase mb-1">Role *</label>
                  <select
                    className="w-full px-3 py-2.5 rounded-lg glass-input text-xs appearance-none"
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({...newUserForm, role: e.target.value})}
                  >
                    <option value="user">User</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={addingUser}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                >
                  {addingUser ? 'Adding...' : 'Add User'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-2.5 text-dark-400 hover:text-dark-200 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
              </form>
              <p className="text-[10px] text-dark-500 mt-3">
                After adding, use <strong>"Create Account"</strong> to set up their login credentials (name, email, password).
              </p>
            </div>
          )}

          {/* Users Table */}
          <div className="glass-panel p-6 rounded-2xl border-white/5">
            {usersLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
              </div>
            ) : allowedUsers.length === 0 ? (
              <div className="text-center py-12 text-xs text-dark-400">
                No allowed users found. Use "Add Allowed User" to add the first entry.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[9px] uppercase font-bold text-dark-400 tracking-wider">
                      <th className="pb-3 pl-2">Email</th>
                      <th className="pb-3">Name</th>
                      <th className="pb-3">Role</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Added</th>
                      <th className="pb-3 text-right pr-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {allowedUsers.map((user) => (
                      <tr key={user.id} className="text-xs hover:bg-white/[0.01] transition-all">
                        <td className="py-3 pl-2">
                          <span className="font-semibold text-white">{user.email}</span>
                        </td>
                        <td className="py-3">
                          {editingId === user.id ? (
                            <input
                              type="text"
                              className="px-2 py-1 rounded glass-input text-xs w-32"
                              value={editForm.name}
                              onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                            />
                          ) : (
                            <span className="text-dark-300">{user.name || '—'}</span>
                          )}
                        </td>
                        <td className="py-3">
                          {editingId === user.id ? (
                            <select
                              className="px-2 py-1 rounded glass-input text-xs appearance-none"
                              value={editForm.role}
                              onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          ) : (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              user.role === 'admin' 
                                ? 'bg-purple-950/40 border border-purple-900/30 text-purple-400' 
                                : 'bg-blue-950/40 border border-blue-900/30 text-blue-400'
                            }`}>
                              {user.role === 'admin' ? '⛨ Admin' : '◉ User'}
                            </span>
                          )}
                        </td>
                        <td className="py-3">
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                              user.status === 'active'
                                ? 'bg-emerald-950/40 border border-emerald-900/30 text-emerald-400 hover:bg-emerald-900/30'
                                : 'bg-red-950/40 border border-red-900/30 text-red-400 hover:bg-red-900/30'
                            }`}
                            title={`Click to ${user.status === 'active' ? 'deactivate' : 'activate'}`}
                          >
                            {user.status === 'active' ? (
                              <><ToggleRight className="h-3 w-3" /> Active</>
                            ) : (
                              <><ToggleLeft className="h-3 w-3" /> Inactive</>
                            )}
                          </button>
                        </td>
                        <td className="py-3 text-dark-500">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-3 text-right pr-2">
                          <div className="flex items-center justify-end gap-1.5">
                            {editingId === user.id ? (
                              <>
                                <button
                                  onClick={() => handleSaveEdit(user.id)}
                                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-brand-600 text-white hover:bg-brand-500 transition-all cursor-pointer"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-dark-400 hover:text-dark-200 transition-all cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEditing(user)}
                                  className="p-1.5 rounded-lg text-dark-400 hover:text-brand-400 hover:bg-brand-950/30 transition-all cursor-pointer"
                                  title="Edit"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user)}
                                  className="p-1.5 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-950/30 transition-all cursor-pointer"
                                  title="Remove"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* How it works info card */}
          <div className="glass-panel p-5 rounded-2xl border-white/5">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-brand-500" />
              How User Access Works
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[11px] text-dark-400">
              <div className="space-y-1">
                <div className="font-bold text-dark-200">Step 1: Allow User</div>
                <p>Add their email and role to this list. Status must be "active".</p>
              </div>
              <div className="space-y-1">
                <div className="font-bold text-dark-200">Step 2: Create Account</div>
                <p>Use "Create Account" to set their name and initial password.</p>
              </div>
              <div className="space-y-1">
                <div className="font-bold text-dark-200">Step 3: User Logs In</div>
                <p>System checks allowedUsers → validates credentials → grants access with assigned role.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

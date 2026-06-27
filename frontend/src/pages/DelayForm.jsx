import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FilePlus, Sparkles, Folder, MapPin, User, Calendar, CloudRain, Users, Box, Hammer, ShieldAlert, FileText, List } from 'lucide-react';

const DelayForm = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  
  const [formData, setFormData] = useState({
    projectName: '',
    projectId: '',
    location: '',
    projectManager: currentUser.name || '',
    date: new Date().toISOString().split('T')[0],
    weather: 'Clear Skies / Standard dry conditions',
    labour: 'Full crew active (100% attendance)',
    material: 'Sufficient materials stored on-site',
    equipment: 'All critical machinery fully operational',
    approval: 'All municipal and structural permits approved',
    delayDuration: '5 working days',
    severity: 'Medium',
    notes: ''
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/templates`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTemplates(res.data);
      } catch (err) {
        console.error('Error fetching templates:', err);
      }
    };
    fetchTemplates();
  }, []);

  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    setSelectedTemplateId(templateId);
    
    if (!templateId) return;

    const selected = templates.find(t => t.id === templateId);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        weather: selected.weather,
        labour: selected.labour,
        material: selected.material,
        equipment: selected.equipment,
        approval: selected.approval
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/reports/generate`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const newReport = response.data;
      navigate(`/reports/${newReport.id}`);
    } catch (err) {
      console.error('Error generating report:', err);
      setError(err.response?.data?.error || 'Failed to analyze delay factors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Animation constants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Header banner */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2 tracking-tight">
            <FilePlus className="h-6 w-6 text-brand-500" />
            Analyze New Project Delay Event
          </h1>
          <p className="text-slate-400 text-sm mt-1">Enter incident logistics and environmental conditions. Our AI model will perform a professional root-cause diagnosis.</p>
        </div>
      </motion.div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-2xl bg-red-950/40 border border-red-500/20 text-red-400 text-sm flex gap-2"
        >
          <span>{error}</span>
        </motion.div>
      )}

      {/* Main card form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Template Selector Row */}
        {templates.length > 0 && (
          <motion.div 
            variants={itemVariants}
            className="glass-panel p-5 rounded-3xl border border-white/[0.06] bg-black/30 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-2 text-sm text-brand-400 font-bold">
              <List className="h-5 w-5" />
              Quick Fill with Preset Incident Template:
            </div>
            <select
              className="px-4 py-2.5 rounded-xl glass-input text-xs sm:w-80 cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-500/30"
              value={selectedTemplateId}
              onChange={handleTemplateChange}
            >
              <option value="">-- Choose template configuration --</option>
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </motion.div>
        )}

        {/* Section 1: Project Metadata */}
        <motion.div 
          variants={itemVariants}
          className="glass-panel p-6 rounded-3xl border border-white/[0.06] bg-black/30 backdrop-blur-xl shadow-xl space-y-5"
        >
          <h2 className="text-xs font-bold text-white uppercase tracking-widest border-b border-white/[0.06] pb-3 flex items-center gap-1.5">
            <Folder className="h-4 w-4 text-brand-500" />
            1. Project Metadata
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Project Name</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-focus-within:text-brand-400 transition-colors"><Folder className="h-4 w-4" /></span>
                <input
                  type="text"
                  required
                  name="projectName"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/40 border border-white/[0.08] focus:border-brand-500/50 text-white text-sm focus:outline-none focus:ring-1 focus:ring-brand-500/20 transition-all shadow-inner"
                  placeholder="Royal Crownridge Bypass"
                  value={formData.projectName}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Project ID</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-focus-within:text-brand-400 transition-colors"><FileText className="h-4 w-4" /></span>
                <input
                  type="text"
                  required
                  name="projectId"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/40 border border-white/[0.08] focus:border-brand-500/50 text-white text-sm focus:outline-none focus:ring-1 focus:ring-brand-500/20 transition-all shadow-inner"
                  placeholder="CRB-2026-098"
                  value={formData.projectId}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Project Location</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-focus-within:text-brand-400 transition-colors"><MapPin className="h-4 w-4" /></span>
                <input
                  type="text"
                  required
                  name="location"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/40 border border-white/[0.08] focus:border-brand-500/50 text-white text-sm focus:outline-none focus:ring-1 focus:ring-brand-500/20 transition-all shadow-inner"
                  placeholder="New Delhi, IN / London, UK"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Project Manager</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-focus-within:text-brand-400 transition-colors"><User className="h-4 w-4" /></span>
                <input
                  type="text"
                  required
                  name="projectManager"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/40 border border-white/[0.08] focus:border-brand-500/50 text-white text-sm focus:outline-none focus:ring-1 focus:ring-brand-500/20 transition-all shadow-inner"
                  placeholder="Manager name"
                  value={formData.projectManager}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Incident Assessment Date</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-focus-within:text-brand-400 transition-colors"><Calendar className="h-4 w-4" /></span>
                <input
                  type="date"
                  required
                  name="date"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/40 border border-white/[0.08] focus:border-brand-500/50 text-white text-sm focus:outline-none focus:ring-1 focus:ring-brand-500/20 transition-all shadow-inner"
                  value={formData.date}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Section 2: Delay Event Parameters */}
        <motion.div 
          variants={itemVariants}
          className="glass-panel p-6 rounded-3xl border border-white/[0.06] bg-black/30 backdrop-blur-xl shadow-xl space-y-5"
        >
          <h2 className="text-xs font-bold text-white uppercase tracking-widest border-b border-white/[0.06] pb-3 flex items-center gap-1.5">
            <CloudRain className="h-4 w-4 text-brand-500" />
            2. Delay Event Parameters
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Weather Condition</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-focus-within:text-brand-400 transition-colors"><CloudRain className="h-4 w-4" /></span>
                <input
                  type="text"
                  required
                  name="weather"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/40 border border-white/[0.08] focus:border-brand-500/50 text-white text-sm focus:outline-none focus:ring-1 focus:ring-brand-500/20 transition-all shadow-inner"
                  placeholder="Heavy Rainfall, high-velocity winds (50km/h)"
                  value={formData.weather}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Labour Availability</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-focus-within:text-brand-400 transition-colors"><Users className="h-4 w-4" /></span>
                <input
                  type="text"
                  required
                  name="labour"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/40 border border-white/[0.08] focus:border-brand-500/50 text-white text-sm focus:outline-none focus:ring-1 focus:ring-brand-500/20 transition-all shadow-inner"
                  placeholder="Critical shortages due to local transit strikes"
                  value={formData.labour}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Material Availability</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-focus-within:text-brand-400 transition-colors"><Box className="h-4 w-4" /></span>
                <input
                  type="text"
                  required
                  name="material"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/40 border border-white/[0.08] focus:border-brand-500/50 text-white text-sm focus:outline-none focus:ring-1 focus:ring-brand-500/20 transition-all shadow-inner"
                  placeholder="Supply chain backlog of structural grade steel"
                  value={formData.material}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Equipment Status</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-focus-within:text-brand-400 transition-colors"><Hammer className="h-4 w-4" /></span>
                <input
                  type="text"
                  required
                  name="equipment"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/40 border border-white/[0.08] focus:border-brand-500/50 text-white text-sm focus:outline-none focus:ring-1 focus:ring-brand-500/20 transition-all shadow-inner"
                  placeholder="Crane hydraulic pumps in repair (estimated down 4 days)"
                  value={formData.equipment}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Regulatory / Permit Approval Status</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-focus-within:text-brand-400 transition-colors"><ShieldAlert className="h-4 w-4" /></span>
                <input
                  type="text"
                  required
                  name="approval"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/40 border border-white/[0.08] focus:border-brand-500/50 text-white text-sm focus:outline-none focus:ring-1 focus:ring-brand-500/20 transition-all shadow-inner"
                  placeholder="Drainage permits pending municipal review"
                  value={formData.approval}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Delay Duration</label>
              <input
                type="text"
                required
                name="delayDuration"
                className="w-full px-4 py-3 rounded-xl bg-slate-950/40 border border-white/[0.08] focus:border-brand-500/50 text-white text-sm focus:outline-none focus:ring-1 focus:ring-brand-500/20 transition-all shadow-inner"
                placeholder="e.g. 10 working days, 3 weeks"
                value={formData.delayDuration}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Reported Delay Severity</label>
              <select
                name="severity"
                className="w-full px-4 py-3 rounded-xl bg-slate-950/40 border border-white/[0.08] focus:border-brand-500/50 text-white text-sm focus:outline-none focus:ring-1 focus:ring-brand-500/20 transition-all cursor-pointer"
                value={formData.severity}
                onChange={handleInputChange}
              >
                <option value="Low">Low (No critical path impact)</option>
                <option value="Medium">Medium (Minor schedule strain)</option>
                <option value="High">High (Serious scheduling conflict)</option>
                <option value="Critical">Critical (Immediate shutdown / contractual danger)</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Section 3: Notes & Analysis Submission */}
        <motion.div 
          variants={itemVariants}
          className="glass-panel p-6 rounded-3xl border border-white/[0.06] bg-black/30 backdrop-blur-xl shadow-xl space-y-5"
        >
          <h2 className="text-xs font-bold text-white uppercase tracking-widest border-b border-white/[0.06] pb-3 flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-brand-500" />
            3. Contextual Notes
          </h2>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Additional Incident Remarks (Optional)</label>
            <textarea
              name="notes"
              rows={4}
              maxLength={1000}
              className="w-full px-4 py-3 rounded-xl bg-slate-950/40 border border-white/[0.08] focus:border-brand-500/50 text-white text-sm focus:outline-none focus:ring-1 focus:ring-brand-500/20 transition-all"
              placeholder="Provide extra detail about structural phases, subcontractor discussions, or specific safety factors (Max 1000 characters)..."
              value={formData.notes}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex justify-end pt-4 gap-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3.5 bg-dark-900 hover:bg-dark-850 text-white font-bold rounded-xl transition-all border border-white/[0.06] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="relative group flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 disabled:from-brand-800 disabled:to-emerald-800 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-brand-700/35 cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-brand-200"></div>
                  Generating AI Analysis...
                </>
              ) : (
                <>
                  <Sparkles className="h-4.5 w-4.5" />
                  Generate AI Analysis
                </>
              )}
            </button>
          </div>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default DelayForm;

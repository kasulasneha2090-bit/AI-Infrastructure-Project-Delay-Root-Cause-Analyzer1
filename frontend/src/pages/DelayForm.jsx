import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2 tracking-tight">
            <FilePlus className="h-6 w-6 text-brand-500" />
            Analyze New Project Delay Event
          </h1>
          <p className="text-dark-400 text-sm mt-1">Enter incident logistics and environmental conditions. Our AI model will perform a professional root-cause diagnosis.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/30 text-red-400 text-sm flex gap-2">
          <span>{error}</span>
        </div>
      )}

      {/* Main card form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Template Selector Row */}
        {templates.length > 0 && (
          <div className="glass-panel p-5 rounded-2xl border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-brand-400 font-semibold">
              <List className="h-5 w-5" />
              Quick Fill with Preset Incident Template:
            </div>
            <select
              className="px-4 py-2.5 rounded-xl glass-input text-xs sm:w-80 cursor-pointer"
              value={selectedTemplateId}
              onChange={handleTemplateChange}
            >
              <option value="">-- Choose template configuration --</option>
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>
        )}

        {/* Section 1: Project Metadata */}
        <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-5">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest border-b border-white/5 pb-2">1. Project Metadata</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-dark-300 uppercase mb-2">Project Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-dark-500"><Folder className="h-4 w-4" /></span>
                <input
                  type="text"
                  required
                  name="projectName"
                  className="w-full pl-9 pr-4 py-3 rounded-xl glass-input text-sm"
                  placeholder="Royal Crownridge Bypass"
                  value={formData.projectName}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-dark-300 uppercase mb-2">Project ID</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-dark-500"><FileText className="h-4 w-4" /></span>
                <input
                  type="text"
                  required
                  name="projectId"
                  className="w-full pl-9 pr-4 py-3 rounded-xl glass-input text-sm"
                  placeholder="CRB-2026-098"
                  value={formData.projectId}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-dark-300 uppercase mb-2">Project Location</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-dark-500"><MapPin className="h-4 w-4" /></span>
                <input
                  type="text"
                  required
                  name="location"
                  className="w-full pl-9 pr-4 py-3 rounded-xl glass-input text-sm"
                  placeholder="New Delhi, IN / London, UK"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-dark-300 uppercase mb-2">Project Manager</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-dark-500"><User className="h-4 w-4" /></span>
                <input
                  type="text"
                  required
                  name="projectManager"
                  className="w-full pl-9 pr-4 py-3 rounded-xl glass-input text-sm"
                  placeholder="Manager name"
                  value={formData.projectManager}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-dark-300 uppercase mb-2">Incident Assessment Date</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-dark-500"><Calendar className="h-4 w-4" /></span>
                <input
                  type="date"
                  required
                  name="date"
                  className="w-full pl-9 pr-4 py-3 rounded-xl glass-input text-sm"
                  value={formData.date}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Delay Event Parameters */}
        <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-5">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest border-b border-white/5 pb-2">2. Delay Event Parameters</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-dark-300 uppercase mb-2">Weather Condition</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-dark-500"><CloudRain className="h-4 w-4" /></span>
                <input
                  type="text"
                  required
                  name="weather"
                  className="w-full pl-9 pr-4 py-3 rounded-xl glass-input text-sm"
                  placeholder="Heavy Rainfall, high-velocity winds (50km/h)"
                  value={formData.weather}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-dark-300 uppercase mb-2">Labour Availability</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-dark-500"><Users className="h-4 w-4" /></span>
                <input
                  type="text"
                  required
                  name="labour"
                  className="w-full pl-9 pr-4 py-3 rounded-xl glass-input text-sm"
                  placeholder="Critical shortages due to local transit strikes"
                  value={formData.labour}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-dark-300 uppercase mb-2">Material Availability</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-dark-500"><Box className="h-4 w-4" /></span>
                <input
                  type="text"
                  required
                  name="material"
                  className="w-full pl-9 pr-4 py-3 rounded-xl glass-input text-sm"
                  placeholder="Supply chain backlog of structural grade steel"
                  value={formData.material}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-dark-300 uppercase mb-2">Equipment Status</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-dark-500"><Hammer className="h-4 w-4" /></span>
                <input
                  type="text"
                  required
                  name="equipment"
                  className="w-full pl-9 pr-4 py-3 rounded-xl glass-input text-sm"
                  placeholder="Crane hydraulic pumps in repair (estimated down 4 days)"
                  value={formData.equipment}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-dark-300 uppercase mb-2">Regulatory / Permit Approval Status</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-dark-500"><ShieldAlert className="h-4 w-4" /></span>
                <input
                  type="text"
                  required
                  name="approval"
                  className="w-full pl-9 pr-4 py-3 rounded-xl glass-input text-sm"
                  placeholder="Drainage permits pending municipal review"
                  value={formData.approval}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-dark-300 uppercase mb-2">Delay Duration</label>
              <input
                type="text"
                required
                name="delayDuration"
                className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                placeholder="e.g. 10 working days, 3 weeks"
                value={formData.delayDuration}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-dark-300 uppercase mb-2">Reported Delay Severity</label>
              <select
                name="severity"
                className="w-full px-4 py-3 rounded-xl glass-input text-sm cursor-pointer"
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
        </div>

        {/* Section 3: Notes & Analysis Submission */}
        <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-5">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest border-b border-white/5 pb-2">3. Contextual Notes</h2>
          <div>
            <label className="block text-xs font-bold text-dark-300 uppercase mb-2">Additional Incident Remarks (Optional)</label>
            <textarea
              name="notes"
              rows={4}
              maxLength={1000}
              className="w-full px-4 py-3 rounded-xl glass-input text-sm"
              placeholder="Provide extra detail about structural phases, subcontractor discussions, or specific safety factors (Max 1000 characters)..."
              value={formData.notes}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex justify-end pt-4 gap-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3.5 bg-dark-900 hover:bg-dark-800 text-white font-bold rounded-xl transition-all border border-white/5 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3.5 bg-brand-600 hover:bg-brand-500 disabled:bg-brand-850 disabled:text-dark-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-700/25 cursor-pointer"
            >
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
        </div>
      </form>
    </div>
  );
};

export default DelayForm;

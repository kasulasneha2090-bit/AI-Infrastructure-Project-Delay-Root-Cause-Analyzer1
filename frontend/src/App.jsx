import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Shield, LayoutDashboard, FileSpreadsheet, History, BarChart3, LogOut, User as UserIcon, Sun, Moon } from 'lucide-react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DelayForm from './pages/DelayForm';
import ReportHistory from './pages/ReportHistory';
import ReportDetails from './pages/ReportDetails';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { ThemeProvider, useTheme } from './components/ThemeContext';

// Fixed Left Sidebar Navigation component
const Sidebar = ({ user, handleLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  if (!user) return null;

  const isActive = (path) => location.pathname === path;
  const linkClass = (path) => `sidebar-link flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
    isActive(path) ? 'active' : ''
  }`;

  return (
    <aside className="fixed top-0 left-0 h-screen w-[260px] bg-dark-950 border-r border-dark-800 flex flex-col justify-between p-6 z-50">
      {/* Top Section: Logo & Links */}
      <div className="space-y-8">
        {/* Crownridge Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer pb-2 border-b border-dark-800" onClick={() => navigate('/dashboard')}>
          <div className="bg-brand-600 p-2 rounded-lg shadow-inner text-white shrink-0">
            <Shield className="h-6 w-6" />
          </div>
          <div className="leading-none">
            <span className="font-extrabold text-lg tracking-wider text-dark-100 block">CROWNRIDGE</span>
            <span className="text-[9px] block font-bold text-brand-600 uppercase tracking-widest mt-0.5">Delay Analyzer</span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex flex-col gap-1.5">
          <Link to="/dashboard" className={linkClass('/dashboard')}>
            <LayoutDashboard className="h-4.5 w-4.5" />
            Dashboard
          </Link>
          <Link to="/analyze" className={linkClass('/analyze')}>
            <FileSpreadsheet className="h-4.5 w-4.5" />
            New Analysis
          </Link>
          <Link to="/history" className={linkClass('/history')}>
            <History className="h-4.5 w-4.5" />
            Report History
          </Link>
          {user.role === 'Administrator' && (
            <Link to="/admin" className={linkClass('/admin')}>
              <BarChart3 className="h-4.5 w-4.5" />
              Admin Panel
            </Link>
          )}
        </div>
      </div>

      {/* Bottom Section: Profile & Logout */}
      <div className="space-y-4 pt-6 border-t border-dark-800">
        {/* Theme Switcher Container */}
        <div className="theme-switcher-container">
          <button
            onClick={() => theme !== 'light' && toggleTheme()}
            className={`theme-switcher-btn ${theme === 'light' ? 'active' : ''}`}
            aria-label="Light Mode"
          >
            <Sun className="h-4 w-4" />
            <span>Light</span>
          </button>
          <button
            onClick={() => theme !== 'dark' && toggleTheme()}
            className={`theme-switcher-btn ${theme === 'dark' ? 'active' : ''}`}
            aria-label="Dark Mode"
          >
            <Moon className="h-4 w-4" />
            <span>Dark</span>
          </button>
        </div>

        {/* User Profile Info Card */}
        <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl bg-dark-900 border border-dark-800">
          <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center text-sm font-bold text-white uppercase shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="text-left leading-tight min-w-0">
            <div className="text-xs font-bold text-dark-100 truncate">{user.name}</div>
            <div className="text-[9px] text-dark-400 font-semibold uppercase tracking-wider">{user.role}</div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold bg-red-950/40 text-red-400 border border-red-900/30 hover:bg-red-900/40 hover:text-red-300 transition-all cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

// Guest Theme Switcher Component
const GuestThemeSwitcher = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="theme-switcher-container shadow-sm w-44">
      <button
        onClick={() => theme !== 'light' && toggleTheme()}
        className={`theme-switcher-btn ${theme === 'light' ? 'active' : ''}`}
        aria-label="Light Mode"
      >
        <Sun className="h-4 w-4" />
        <span>Light</span>
      </button>
      <button
        onClick={() => theme !== 'dark' && toggleTheme()}
        className={`theme-switcher-btn ${theme === 'dark' ? 'active' : ''}`}
        aria-label="Dark Mode"
      >
        <Moon className="h-4 w-4" />
        <span>Dark</span>
      </button>
    </div>
  );
};

function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-600"></div>
          <div className="text-dark-400 text-sm font-semibold tracking-wider">Loading Crownridge Systems...</div>
        </div>
      </div>
    );
  }

  // Guest layout (Login / Register pages)
  if (!user) {
    return (
      <Router>
        <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center p-4 relative transition-colors duration-300">
          <div className="absolute top-6 right-6 z-50">
            <GuestThemeSwitcher />
          </div>
          <Routes>
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    );
  }

  // Authenticated layout (Sidebar + main layout)
  return (
    <Router>
      <div className="min-h-screen bg-dark-950 flex">
        {/* Left Sidebar */}
        <Sidebar user={user} handleLogout={handleLogout} />

        {/* Main Content Area */}
        <div className="flex-1 pl-[260px] min-h-screen flex flex-col justify-between bg-dark-950">
          <div className="p-6 md:p-8 max-w-6xl mx-auto w-full">
            <Routes>
              {/* Protected Core Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/analyze" element={
                <ProtectedRoute>
                  <DelayForm />
                </ProtectedRoute>
              } />
              <Route path="/history" element={
                <ProtectedRoute>
                  <ReportHistory />
                </ProtectedRoute>
              } />
              <Route path="/reports/:id" element={
                <ProtectedRoute>
                  <ReportDetails />
                </ProtectedRoute>
              } />

              {/* Protected Admin Only Routes */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['Administrator']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/register" element={
                <ProtectedRoute allowedRoles={['Administrator']}>
                  <Register />
                </ProtectedRoute>
              } />

              {/* Fallback redirection */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>

          {/* Footer */}
          <footer className="text-center text-dark-400 text-xs py-6 border-t border-dark-800">
            <p>© {new Date().getFullYear()} Crownridge LLP. AI Project Delay Root Cause Analyzer. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;

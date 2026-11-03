import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, Monitor, LayoutDashboard } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import SignalDot from '../ui/SignalDot';
import Button from '../ui/Button';

export default function Navbar() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const { mode, setThemeMode } = useTheme();
  const { user } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardPath = () => {
    if (!user) return '/citizen/dashboard';
    const role = user.role;
    if (role === 'government_admin' || role === 'admin' || role === 'govt_admin' || role === 'platform_admin') {
      return '/admin/analytics';
    }
    if (role === 'hei' || role === 'hei_admin') {
      return '/hei/dashboard';
    }
    if (role === 'industry_csr' || role === 'industry_admin') {
      return '/industry/dashboard';
    }
    return '/citizen/dashboard';
  };

  const handleThemeToggle = () => {
    if (mode === 'light') setThemeMode('dark');
    else if (mode === 'dark') setThemeMode('system');
    else setThemeMode('light');
  };

  const getThemeIcon = () => {
    if (mode === 'light') return <Sun size={18} className="text-accent-primary" />;
    if (mode === 'dark') return <Moon size={18} className="text-muted-custom" />;
    return <Monitor size={18} className="text-muted-custom" />;
  };

  return (
    <header className="border-b border-surface-raised bg-surface/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between elevate-sm">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <SignalDot status="unresolved" size="md" />
          <span className="font-display font-bold text-xl tracking-tight text-primary-custom">
            Samvad-Setu <span className="text-accent-primary font-mono text-xs font-normal ml-1">PS 26043</span>
          </span>
        </Link>
      </div>
      
      <div className="hidden md:flex items-center gap-6">
        <Link to="/" className={`text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-accent-primary' : 'text-muted-custom hover:text-primary-custom'}`}>
          Home
        </Link>
        <Link to="/about" className={`text-sm font-medium transition-colors ${location.pathname === '/about' ? 'text-accent-primary' : 'text-muted-custom hover:text-primary-custom'}`}>
          About Us
        </Link>
        <Link to="/map" className={`text-sm font-medium transition-colors ${location.pathname === '/map' ? 'text-accent-primary' : 'text-muted-custom hover:text-primary-custom'}`}>
          Public Map
        </Link>
        <Link to="/download-app" className={`text-sm font-medium transition-colors ${location.pathname === '/download-app' ? 'text-accent-primary' : 'text-muted-custom hover:text-primary-custom'}`}>
          Download Mobile App
        </Link>
        
        <div className="flex items-center gap-3 pl-4 border-l border-surface-raised">
          <button
            onClick={handleThemeToggle}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-raised/50 hover:bg-surface-raised border border-surface-raised transition-all hover:scale-110 active:scale-95"
            title={`Current theme: ${mode}. Click to change.`}
          >
            {getThemeIcon()}
          </button>
          
          {!isAuthPage && (
            user ? (
              <Link to={getDashboardPath()}>
                <Button variant="primary" className="text-sm py-1.5 px-4 font-semibold elevate-md flex items-center gap-2">
                  <LayoutDashboard size={16} /> Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" className="text-sm py-1.5 px-4 font-semibold hover:bg-surface-raised">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" className="text-sm py-1.5 px-4 font-semibold elevate-md hover:opacity-90">Register</Button>
                </Link>
              </>
            )
          )}
        </div>
      </div>

      {/* Mobile Menu Icon & Drawer */}
      <div className="md:hidden flex items-center gap-3">
        <button
          onClick={handleThemeToggle}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-raised/50 hover:bg-surface-raised border border-surface-raised transition-all"
        >
          {getThemeIcon()}
        </button>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-muted-custom hover:text-primary-custom"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-surface border-b border-surface-raised p-5 flex flex-col gap-4 shadow-xl z-50">
          <Link 
            to="/" 
            onClick={() => setMobileMenuOpen(false)}
            className={`text-sm font-medium ${location.pathname === '/' ? 'text-accent-primary' : 'text-muted-custom'}`}
          >
            Home
          </Link>
          <Link 
            to="/about" 
            onClick={() => setMobileMenuOpen(false)}
            className={`text-sm font-medium ${location.pathname === '/about' ? 'text-accent-primary' : 'text-muted-custom'}`}
          >
            About Us
          </Link>
          <Link 
            to="/map" 
            onClick={() => setMobileMenuOpen(false)}
            className={`text-sm font-medium ${location.pathname === '/map' ? 'text-accent-primary' : 'text-muted-custom'}`}
          >
            Public Map
          </Link>
          <Link 
            to="/download-app" 
            onClick={() => setMobileMenuOpen(false)}
            className={`text-sm font-medium ${location.pathname === '/download-app' ? 'text-accent-primary' : 'text-muted-custom'}`}
          >
            Download Mobile App
          </Link>

          <div className="pt-3 border-t border-surface-raised flex flex-col gap-2">
            {!isAuthPage && (
              user ? (
                <Link to={getDashboardPath()} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full text-sm py-2 flex items-center justify-center gap-2">
                    <LayoutDashboard size={16} /> Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full text-sm py-2">Sign In</Button>
                  </Link>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" className="w-full text-sm py-2">Register</Button>
                  </Link>
                </>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
}

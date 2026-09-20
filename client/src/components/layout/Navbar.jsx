import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import SignalDot from '../ui/SignalDot';
import Button from '../ui/Button';

export default function Navbar() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const { mode, setThemeMode } = useTheme();

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
        <Link to="/how-it-works" className={`text-sm font-medium transition-colors ${location.pathname === '/how-it-works' ? 'text-accent-primary' : 'text-muted-custom hover:text-primary-custom'}`}>
          About
        </Link>
        <Link to="/map" className={`text-sm font-medium transition-colors ${location.pathname === '/map' ? 'text-accent-primary' : 'text-muted-custom hover:text-primary-custom'}`}>
          Public Map
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
            <>
            <Link to="/login">
              <Button variant="outline" className="text-sm py-1.5 px-4 font-semibold hover:bg-surface-raised">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button variant="primary" className="text-sm py-1.5 px-4 font-semibold elevate-md hover:opacity-90">Register</Button>
            </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu Icon (Placeholder for now) */}
      <div className="md:hidden">
        <button className="text-muted-custom hover:text-primary-custom">
          <Menu size={24} />
        </button>
      </div>
    </header>
  );
}

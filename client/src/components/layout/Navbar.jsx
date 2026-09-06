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
    if (mode === 'light') return <Sun size={18} className="text-[#E8A33D]" />;
    if (mode === 'dark') return <Moon size={18} className="text-[#9BA8A6]" />;
    return <Monitor size={18} className="text-[#9BA8A6]" />;
  };

  return (
    <header className="border-b border-[#1D3238] bg-[#16262A]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <SignalDot status="unresolved" size="md" />
          <span className="font-display font-bold text-xl tracking-tight text-[#F2EFE9]">
            Samvad-Setu <span className="text-[#E8A33D] font-mono text-xs font-normal ml-1">PS 26043</span>
          </span>
        </Link>
      </div>
      
      <div className="hidden md:flex items-center gap-6">
        <Link to="/" className={`text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-[#E8A33D]' : 'text-[#9BA8A6] hover:text-[#F2EFE9]'}`}>
          Home
        </Link>
        <Link to="/how-it-works" className={`text-sm font-medium transition-colors ${location.pathname === '/how-it-works' ? 'text-[#E8A33D]' : 'text-[#9BA8A6] hover:text-[#F2EFE9]'}`}>
          About
        </Link>
        <Link to="/map" className={`text-sm font-medium transition-colors ${location.pathname === '/map' ? 'text-[#E8A33D]' : 'text-[#9BA8A6] hover:text-[#F2EFE9]'}`}>
          Public Map
        </Link>
        
        <div className="flex items-center gap-3 pl-4 border-l border-[#1D3238]">
          <button
            onClick={handleThemeToggle}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1D3238]/50 hover:bg-[#1D3238] border border-[#1D3238] transition-all hover:scale-110 active:scale-95"
            title={`Current theme: ${mode}. Click to change.`}
          >
            {getThemeIcon()}
          </button>
          
          {!isAuthPage && (
            <>
            <Link to="/login">
              <Button variant="outline" className="text-sm py-1.5 px-4 font-semibold hover:bg-[#1D3238]">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button variant="primary" className="text-sm py-1.5 px-4 font-semibold shadow-[0_0_15px_rgba(232,163,61,0.3)] hover:shadow-[0_0_20px_rgba(232,163,61,0.5)]">Register</Button>
            </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu Icon (Placeholder for now) */}
      <div className="md:hidden">
        <button className="text-[#9BA8A6] hover:text-[#F2EFE9]">
          <Menu size={24} />
        </button>
      </div>
    </header>
  );
}

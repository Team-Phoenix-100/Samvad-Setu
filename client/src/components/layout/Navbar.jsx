import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import SignalDot from '../ui/SignalDot';
import Button from '../ui/Button';

export default function Navbar() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

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
        
        {!isAuthPage && (
          <div className="flex items-center gap-3 pl-4 border-l border-[#1D3238]">
            <Link to="/login">
              <Button variant="outline" className="text-sm py-1.5 px-4 font-semibold hover:bg-[#1D3238]">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button variant="primary" className="text-sm py-1.5 px-4 font-semibold shadow-[0_0_15px_rgba(232,163,61,0.3)] hover:shadow-[0_0_20px_rgba(232,163,61,0.5)]">Register</Button>
            </Link>
          </div>
        )}
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

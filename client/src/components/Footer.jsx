import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Activity, Mail, ArrowUpRight, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0F1B1E] relative overflow-hidden text-[#F2EFE9] border-t border-[#1D3238]">
      {/* Subtle top border gradient */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Top Section (4-column Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
          
          {/* Column 1: Brand & Mission (Takes 2 cols on lg) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-emerald-400" size={28} />
              <span className="font-display font-bold text-2xl tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Samvad Setu
              </span>
            </div>
            <p className="text-sm text-[#9BA8A6] leading-relaxed max-w-sm">
              A unified civic grievance and institution collaboration platform. We bridge the gap between citizens, students, and industry for real-world resolution.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#16262A]/80 border border-[#1D3238] text-xs font-mono text-emerald-400 backdrop-blur-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              Platform Live & Routing
            </div>
          </div>

          {/* Column 2: Citizen Services */}
          <div className="space-y-5">
            <h4 className="text-sm font-bold tracking-wider text-[#F2EFE9] uppercase">Citizen Services</h4>
            <ul className="space-y-3">
              {['Report Issue', 'Live Map', 'Track Status', 'Local Body Directory'].map((item) => (
                <li key={item}>
                  <Link to="/" className="text-sm text-[#9BA8A6] hover:text-[#E8A33D] hover:translate-x-1 transition-all inline-flex items-center gap-1">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Institutions & R&D */}
          <div className="space-y-5">
            <h4 className="text-sm font-bold tracking-wider text-[#F2EFE9] uppercase">Institutions & R&D</h4>
            <ul className="space-y-3">
              {['Student HEI Portal', 'Research Hub', 'Resolution Benchmarks', 'Open APIs'].map((item) => (
                <li key={item}>
                  <Link to="/" className="text-sm text-[#9BA8A6] hover:text-[#E8A33D] hover:translate-x-1 transition-all inline-flex items-center gap-1">
                    {item} <ArrowUpRight size={14} className="opacity-50" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Civic Bulletin */}
          <div className="space-y-5">
            <h4 className="text-sm font-bold tracking-wider text-[#F2EFE9] uppercase">Civic Bulletin</h4>
            <p className="text-sm text-[#9BA8A6]">Get the latest platform updates and community highlights.</p>
            <div className="relative group">
              <input 
                type="email" 
                placeholder="Email address" 
                className="w-full bg-[#16262A]/80 border border-[#1D3238] rounded-lg py-2.5 pl-4 pr-10 text-sm text-white placeholder:text-[#9BA8A6] focus:outline-none focus:border-emerald-500/50 transition-colors backdrop-blur-sm"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9BA8A6] hover:text-[#E8A33D] transition-colors">
                <Mail size={16} />
              </button>
            </div>
            <div className="pt-2">
              <Link to="/" className="inline-flex items-center gap-2 text-xs font-mono text-[#9BA8A6] hover:text-emerald-400 transition-colors group">
                <Activity size={14} className="group-hover:animate-pulse" /> Emergency Hotline: 104
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-[#1D3238] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-xs text-[#9BA8A6] font-mono">
            <span>© 2026 Samvad Setu. All rights reserved.</span>
            <span className="hidden md:block w-1 h-1 rounded-full bg-[#1D3238]" />
            <span>Built by Team Phoenix</span>
          </div>
          
          <div className="flex items-center gap-5">
            <a href="#" className="text-[#9BA8A6] hover:text-[#E8A33D] transition-colors hover:scale-110 transform">
              <Globe size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

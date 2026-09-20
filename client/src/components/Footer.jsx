import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import SignalDot from './ui/SignalDot';

export default function Footer() {
  return (
    <footer className="border-t border-surface-raised bg-surface/30 pt-16 pb-8 px-6 relative z-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        
        <div className="space-y-4 md:col-span-1">
          <Link to="/" className="flex items-center gap-2">
            <SignalDot status="unresolved" size="sm" />
            <span className="font-display font-bold text-lg text-primary-custom">Samvad Setu</span>
          </Link>
          <p className="text-xs text-muted-custom leading-relaxed">
            SIH 2026 • Problem Statement 26043<br/>
            Govt. of Jharkhand, Dept. of Higher & Technical Education
          </p>
        </div>

        <div>
          <h4 className="font-bold text-primary-custom mb-4 text-sm tracking-wider uppercase font-mono">Citizen Services</h4>
          <ul className="space-y-2.5 text-sm text-muted-custom">
            <li><Link to="/citizen/submit" className="hover:text-accent-primary transition-colors">Report an Issue</Link></li>
            <li><Link to="/map" className="hover:text-accent-primary transition-colors">Public Resolution Map</Link></li>
            <li><Link to="/guide" className="hover:text-accent-primary transition-colors">How to Use Kiosks</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-primary-custom mb-4 text-sm tracking-wider uppercase font-mono">Institutions & R&D</h4>
          <ul className="space-y-2.5 text-sm text-muted-custom">
            <li><Link to="/signup?role=university" className="hover:text-accent-secondary transition-colors">University Registration</Link></li>
            <li><Link to="/nep-guidelines" className="hover:text-accent-secondary transition-colors">NEP 2020 Credit Guidelines</Link></li>
            <li><Link to="/signup?role=industry" className="hover:text-accent-secondary transition-colors">CSR Fund Pledging</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-primary-custom mb-4 text-sm tracking-wider uppercase font-mono">Civic Bulletin</h4>
          <ul className="space-y-2.5 text-sm text-muted-custom">
            <li><Link to="/transparency" className="hover:text-primary-custom transition-colors">Transparency Report</Link></li>
            <li><Link to="/api" className="hover:text-primary-custom transition-colors">Open Data API</Link></li>
            <li><Link to="/privacy" className="hover:text-primary-custom transition-colors">Privacy & DPDP Compliance</Link></li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-surface-raised flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-custom">
        <p>&copy; {new Date().getFullYear()} Team Phoenix 100. Open Source for Jharkhand.</p>
        <div className="flex items-center gap-4 font-mono">
          <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-accent-secondary" /> System Operational</span>
        </div>
      </div>
    </footer>
  );
}

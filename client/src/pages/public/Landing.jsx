import React from 'react';
import { Link } from 'react-router-dom';
import { Users, GraduationCap, Building2, MapPin, ArrowRight, ShieldCheck, Activity } from 'lucide-react';
import SignalDot from '../../components/ui/SignalDot';
import Button from '../../components/ui/Button';

export default function Landing() {
  return (
    <div className="bg-[#0F1B1E] text-[#F2EFE9] flex flex-col justify-between">

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-16 flex-1">
        {/* Hero Section */}
        <section className="text-center space-y-6 max-w-3xl mx-auto pt-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#16262A] border border-[#1D3238] text-xs font-mono text-[#E8A33D]">
            <SignalDot status="unresolved" size="sm" />
            <span>Citizen Signal Network for Civic Resolution</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold font-display leading-tight">
            Every local problem is a signal waiting to be resolved.
          </h1>
          
          <p className="text-[#9BA8A6] text-lg">
            Directly connecting citizen grievances in Jharkhand with university technical teams and industry CSR sponsors for real-world resolution.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link to="/citizen/submit">
              <Button variant="primary" className="text-base px-6 py-3">
                Report a Problem <ArrowRight size={18} />
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="secondary" className="text-base px-6 py-3">
                Register Institution / Industry
              </Button>
            </Link>
          </div>
        </section>

        {/* Live Stats Strip */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-[#16262A] rounded-xl border border-[#1D3238]">
          <div className="space-y-1 text-center md:text-left">
            <p className="text-xs font-mono text-[#9BA8A6] uppercase">Problems Reported</p>
            <p className="text-3xl font-bold font-display text-[#E8A33D]">1,248</p>
          </div>
          <div className="space-y-1 text-center md:text-left">
            <p className="text-xs font-mono text-[#9BA8A6] uppercase">Resolved Projects</p>
            <p className="text-3xl font-bold font-display text-[#2F9E8F]">892</p>
          </div>
          <div className="space-y-1 text-center md:text-left">
            <p className="text-xs font-mono text-[#9BA8A6] uppercase">Active HEIs</p>
            <p className="text-3xl font-bold font-display text-[#F2EFE9]">42</p>
          </div>
          <div className="space-y-1 text-center md:text-left">
            <p className="text-xs font-mono text-[#9BA8A6] uppercase">Districts Active</p>
            <p className="text-3xl font-bold font-display text-[#F2EFE9]">24</p>
          </div>
        </section>

        {/* 3 Role Entry Cards */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold font-display text-center">Select Your Role Entry</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-[#16262A] border border-[#1D3238] rounded-xl space-y-4 hover:border-[#E8A33D]/50 transition-all">
              <div className="p-3 bg-[#1D3238] w-fit rounded-lg text-[#E8A33D]">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-bold font-display">I am a Citizen</h3>
              <p className="text-sm text-[#9BA8A6]">Report civic or infrastructure issues with geolocation and track resolution transparently.</p>
              <Link to="/signup?role=citizen" className="inline-block text-sm font-semibold text-[#E8A33D] hover:underline">
                Submit Report &rarr;
              </Link>
            </div>

            <div className="p-6 bg-[#16262A] border border-[#1D3238] rounded-xl space-y-4 hover:border-[#2F9E8F]/50 transition-all">
              <div className="p-3 bg-[#1D3238] w-fit rounded-lg text-[#2F9E8F]">
                <GraduationCap size={24} />
              </div>
              <h3 className="text-xl font-bold font-display">I represent a University</h3>
              <p className="text-sm text-[#9BA8A6]">Claim AI-matched problem statements, assemble student teams, and build real prototypes.</p>
              <Link to="/signup?role=university" className="inline-block text-sm font-semibold text-[#2F9E8F] hover:underline">
                Claim Problems &rarr;
              </Link>
            </div>

            <div className="p-6 bg-[#16262A] border border-[#1D3238] rounded-xl space-y-4 hover:border-[#E8A33D]/50 transition-all">
              <div className="p-3 bg-[#1D3238] w-fit rounded-lg text-[#E8A33D]">
                <Building2 size={24} />
              </div>
              <h3 className="text-xl font-bold font-display">I represent Industry / CSR</h3>
              <p className="text-sm text-[#9BA8A6]">Pledge funding, mentorship, or prototyping resources to verified college projects.</p>
              <Link to="/signup?role=industry" className="inline-block text-sm font-semibold text-[#E8A33D] hover:underline">
                Fund Projects &rarr;
              </Link>
            </div>
          </div>
        </section>

        {/* "How it Works" 4-Step Process */}
        <section className="space-y-8 bg-[#16262A]/40 p-8 rounded-xl border border-[#1D3238]">
          <h2 className="text-2xl font-bold font-display text-center">How The Platform Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <span className="font-mono text-sm text-[#E8A33D]">01. Report</span>
              <h4 className="font-bold">Citizen Uploads</h4>
              <p className="text-xs text-[#9BA8A6]">Photos, location, and description recorded via web app.</p>
            </div>
            <div className="space-y-2">
              <span className="font-mono text-sm text-[#E8A33D]">02. Classify</span>
              <h4 className="font-bold">AI Categorizes</h4>
              <p className="text-xs text-[#9BA8A6]">AI routes problem to domain, urgency, and nearby HEIs.</p>
            </div>
            <div className="space-y-2">
              <span className="font-mono text-sm text-[#E8A33D]">03. Route</span>
              <h4 className="font-bold">University Claims</h4>
              <p className="text-xs text-[#9BA8A6]">Faculty mentors assign student teams to work on solutions.</p>
            </div>
            <div className="space-y-2">
              <span className="font-mono text-sm text-[#E8A33D]">04. Resolve</span>
              <h4 className="font-bold">Deployed Solution</h4>
              <p className="text-xs text-[#9BA8A6]">CSR funded prototypes deployed to fix the initial issue.</p>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}
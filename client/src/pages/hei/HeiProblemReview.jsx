import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Filter, MapPin, CheckCircle2, ShieldAlert, Download } from 'lucide-react';
import { useProblemStore } from '../../store/problemStore';
import SignalDot from '../../components/ui/SignalDot';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function HeiProblemReview() {
  const navigate = useNavigate();
  const { problems, fetchProblems } = useProblemStore();
  const [selectedFilter, setSelectedFilter] = useState('all');

  const getTier = (item) => item.complexityTier || (item.urgency === 'urgent' ? 3 : item.urgency === 'high' ? 2 : 1);
  const downloadDossier = (item) => {
    const dossier = `SAMVAD SETU ENGINEERING DOSSIER\n\nWHAT: ${item.title}\nWHERE: ${item.location?.district || 'Jharkhand'}\nWHY: ${item.description}\nWHO: Municipal ULB + HEI student team\nHOW: Validate the proposed prototype through a staged field pilot.\nCOMPLEXITY: Tier ${getTier(item)}`;
    const url = URL.createObjectURL(new Blob([dossier], { type: 'text/plain' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${item.id || 'problem'}-engineering-dossier.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const handleClaim = (problemId) => {
    alert(`Problem ${problemId} claimed! Assigning to university project queue.`);
    navigate('/hei/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0F1B1E] text-[#F2EFE9] p-6 max-w-6xl mx-auto space-y-6">
      <div className="space-y-2 border-b border-[#1D3238] pb-4">
        <span className="text-xs font-mono text-[#2F9E8F] uppercase">Phase 5 • Institutional Workflow</span>
        <h1 className="text-3xl font-bold font-display">Problem Review & Claim Queue</h1>
        <p className="text-xs text-[#9BA8A6]">Select AI-categorized civic problems near your institution to adopt as student Capstone / R&D projects.</p>
      </div>

      <div className="flex items-start gap-3 p-4 rounded-xl border border-[#C1443B]/40 bg-[#C1443B]/10 text-sm text-red-200"><ShieldAlert size={18} className="shrink-0 text-[#C1443B]" /><span><strong>1st-year safety guardrail:</strong> Tier 3 and Tier 4 R&D briefs require senior faculty supervision and are hidden from junior-only teams.</span></div>

      {/* Filter Toolbar */}
      <div className="flex items-center gap-3 bg-[#16262A] p-3 rounded-lg border border-[#1D3238] text-xs">
        <Filter size={16} className="text-[#E8A33D]" />
        <span className="text-[#9BA8A6]">Domain Filter:</span>
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-3 py-1 rounded-md transition-colors ${selectedFilter === 'all' ? 'bg-[#1D3238] text-[#E8A33D] font-bold' : 'text-[#9BA8A6]'}`}
        >
          All Open Issues
        </button>
        <button
          onClick={() => setSelectedFilter('energy')}
          className={`px-3 py-1 rounded-md transition-colors ${selectedFilter === 'energy' ? 'bg-[#1D3238] text-[#2F9E8F] font-bold' : 'text-[#9BA8A6]'}`}
        >
          Renewable Energy & Water
        </button>
      </div>

      {/* Problem Queue List */}
      <div className="space-y-4">
        {problems.map((item) => (
          <div key={item.id} className="p-6 bg-[#16262A] border border-[#1D3238] rounded-xl space-y-4 hover:border-[#2F9E8F]/40 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <SignalDot status={item.status} size="md" />
                <span className="text-xs font-mono text-[#9BA8A6]">{item.id}</span>
                <Badge status={item.status} />
              </div>
              <span className="text-xs font-mono text-[#E8A33D] bg-[#E8A33D]/10 px-2.5 py-1 rounded w-fit">
                AI Urgency: {item.urgency || 'Urgent'}
              </span>
                <span className="text-xs font-mono text-[#2F9E8F] bg-[#2F9E8F]/10 px-2.5 py-1 rounded w-fit">Tier {getTier(item)} {getTier(item) === 4 ? 'R&D' : getTier(item) === 3 ? 'Advanced' : getTier(item) === 2 ? 'Applied' : 'Foundation'}</span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#F2EFE9]">{item.title}</h3>
              <p className="text-xs text-[#9BA8A6] mt-1 line-clamp-2">{item.description}</p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#1D3238] text-xs text-[#9BA8A6]">
              <span className="flex items-center gap-1">
                <MapPin size={14} className="text-[#E8A33D]" /> District: {item.location?.district || 'Jharkhand'}
              </span>

              <div className="flex items-center gap-3">
                <Button variant="outline" className="py-1.5 text-xs" onClick={() => downloadDossier(item)}><Download size={14} /> Dossier</Button>
                <Link to={`/problem/${item.id}`} className="hover:text-[#F2EFE9]">
                  View Details
                </Link>
                <Button variant="primary" className="py-1.5 text-xs" onClick={() => handleClaim(item.id)}>
                  <CheckCircle2 size={14} /> Claim Problem
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
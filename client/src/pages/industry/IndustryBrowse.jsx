import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Award, CheckCircle, ShieldCheck, X } from 'lucide-react';
import { useProblemStore } from '../../store/problemStore';
import SignalDot from '../../components/ui/SignalDot';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function IndustryBrowse() {
  const { problems, fetchProblems } = useProblemStore();
  const [selectedProject, setSelectedProject] = useState(null);
  const [pledged, setPledged] = useState(false);

  useEffect(() => {
    fetchProblems();
  }, []);

  const handlePledge = (problemId) => {
    setSelectedProject(problemId);
    setPledged(false);
  };

  return (
    <div className="min-h-screen bg-[#0F1B1E] text-[#F2EFE9] p-6 max-w-6xl mx-auto space-y-6">
      <div className="space-y-2 border-b border-[#1D3238] pb-4">
        <span className="text-xs font-mono text-[#E8A33D] uppercase">Phase 7 • Corporate Social Responsibility</span>
        <h1 className="text-3xl font-bold font-display">CSR Funding Explorer</h1>
        <p className="text-xs text-[#9BA8A6]">Browse verified academic prototypes requiring funding, equipment, or industry mentorship.</p>
      </div>

      <div className="space-y-4">
        {problems.map((item) => (
          <div key={item.id} className="p-6 bg-[#16262A] border border-[#1D3238] rounded-xl space-y-4 hover:border-[#E8A33D]/40 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SignalDot status={item.status} size="md" />
                <span className="text-xs font-mono text-[#9BA8A6]">{item.id}</span>
                <Badge status={item.status} />
              </div>
              <span className="text-xs font-mono text-[#2F9E8F] bg-[#2F9E8F]/10 px-2.5 py-1 rounded">
                Target Budget: ₹45,000
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#F2EFE9]">{item.title}</h3>
              <p className="text-xs text-[#9BA8A6] mt-1">{item.description}</p>
              <div className="flex flex-wrap gap-2 mt-3"><span className="text-[11px] px-2 py-1 rounded bg-[#E8A33D]/10 text-[#E8A33D]">TRL {item.trl || 3}</span><span className="text-[11px] px-2 py-1 rounded bg-[#2F9E8F]/10 text-[#2F9E8F]">MCA Schedule VII: item_iv</span><span className="text-[11px] px-2 py-1 rounded bg-[#2F9E8F]/10 text-[#2F9E8F]">item_ii</span></div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#1D3238] text-xs text-[#9BA8A6]">
              <span className="flex items-center gap-1">
                <Building2 size={14} className="text-[#2F9E8F]" /> Technical Team: {item.assignedInstitution || "Bit Sindri Team Alpha"}
              </span>

              <div className="flex items-center gap-3">
                <Link to={`/problem/${item.id}`} className="hover:text-[#F2EFE9]">
                  View Project Timeline
                </Link>
                <Button variant="secondary" className="py-1.5 text-xs" onClick={() => handlePledge(item.id)}>
                  <Award size={14} /> Pledge Support
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedProject && <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"><div className="w-full max-w-lg bg-[#16262A] border border-[#1D3238] rounded-xl p-6 space-y-5"><div className="flex items-center justify-between"><div><p className="text-xs font-mono text-[#E8A33D] uppercase">CSR pledge intent</p><h2 className="text-xl font-bold font-display">Fund this civic prototype</h2></div><button onClick={() => setSelectedProject(null)} aria-label="Close"><X size={18} /></button></div><div className="grid grid-cols-3 gap-2 text-center text-xs"><div className="p-3 bg-[#0F1B1E] rounded-lg border border-[#2F9E8F]/40"><b className="block text-[#2F9E8F]">30%</b>Lab build</div><div className="p-3 bg-[#0F1B1E] rounded-lg border border-[#E8A33D]/40"><b className="block text-[#E8A33D]">40%</b>Field pilot</div><div className="p-3 bg-[#0F1B1E] rounded-lg border border-[#1D3238]"><b className="block">30%</b>Handover</div></div><label className="flex gap-3 text-sm text-[#9BA8A6]"><input type="checkbox" defaultChecked /> I accept the 3-tranche escrow and Civic Commons License terms.</label><p className="text-xs text-[#9BA8A6]">Tranche 2 remains locked until a ULB engineer clears the site. MCA Schedule VII eligibility is recorded with this pledge.</p>{pledged && <p className="text-sm text-[#2F9E8F] flex items-center gap-2"><CheckCircle size={16} /> Pledge intent recorded for {selectedProject}.</p>}<div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setSelectedProject(null)}>Cancel</Button><Button variant="primary" onClick={() => setPledged(true)}><ShieldCheck size={16} /> Confirm pledge</Button></div></div></div>}
    </div>
  );
}
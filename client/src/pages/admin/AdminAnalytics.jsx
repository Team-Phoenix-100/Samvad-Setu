import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, TrendingUp, AlertTriangle, CheckCircle2, Award, Wrench, LockKeyhole } from 'lucide-react';
import { useProblemStore } from '../../store/problemStore';
import SignalDot from '../../components/ui/SignalDot';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function AdminAnalytics() {
  const { problems, fetchProblems } = useProblemStore();
  const [resolution, setResolution] = useState(null);
  const [clearance, setClearance] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchProblems();
  }, []);

  const total = problems.length;
  const resolved = problems.filter((p) => p.status === 'resolved').length;
  const inProgress = problems.filter((p) => p.status === 'in-progress' || p.status === 'new').length;

  return (
    <div className="min-h-screen bg-base text-primary-custom p-6 max-w-6xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-raised pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-accent-secondary mb-1">
            <ShieldCheck size={14} /> DHTE State Administrative Access
          </div>
          <h1 className="text-3xl font-bold font-display">Government Analytics & Oversight</h1>
          <p className="text-xs text-muted-custom">Statewide civic resolution metrics and university performance tracking.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/map">
            <Button variant="outline" className="py-2.5 px-4 text-xs">
              <MapPin size={16} /> Open District Map
            </Button>
          </Link>
        </div>
      </div>

      {/* State Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface p-5 rounded-xl border border-surface-raised space-y-1">
          <p className="text-xs font-mono text-muted-custom uppercase">Total Geo-Signals</p>
          <p className="text-3xl font-bold font-display text-accent-primary">{total + 1247}</p>
        </div>
        <div className="bg-surface p-5 rounded-xl border border-surface-raised space-y-1">
          <p className="text-xs font-mono text-muted-custom uppercase">Active HEI Partners</p>
          <p className="text-3xl font-bold font-display text-accent-secondary">42</p>
        </div>
        <div className="bg-surface p-5 rounded-xl border border-surface-raised space-y-1">
          <p className="text-xs font-mono text-muted-custom uppercase">CSR Funds Mobilized</p>
          <p className="text-3xl font-bold font-display text-primary-custom">₹1.28 Cr</p>
        </div>
        <div className="bg-surface p-5 rounded-xl border border-surface-raised space-y-1">
          <p className="text-xs font-mono text-muted-custom uppercase">Resolution Rate</p>
          <p className="text-3xl font-bold font-display text-accent-secondary">71.4%</p>
        </div>
      </div>

      {/* Two Column Layout: Leaderboard & Moderation Queue */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* HEI Institutional Leaderboard */}
        <div className="bg-surface p-6 rounded-xl border border-surface-raised space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-display flex items-center gap-2">
              <Award size={18} className="text-accent-primary" /> Top HEI Technical Partners
            </h2>
            <span className="text-xs font-mono text-muted-custom">Ranked by Resolutions</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 bg-base rounded-lg border border-surface-raised">
              <div className="flex items-center gap-3">
                <span className="font-mono text-accent-primary font-bold">01</span>
                <div>
                  <p className="font-bold text-primary-custom">BIT Sindri</p>
                  <p className="text-muted-custom">18 Active Projects • 34 Resolved</p>
                </div>
              </div>
              <span className="font-bold text-accent-secondary bg-[#2F9E8F]/10 px-2 py-1 rounded">Grade A</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-base rounded-lg border border-surface-raised">
              <div className="flex items-center gap-3">
                <span className="font-mono text-muted-custom font-bold">02</span>
                <div>
                  <p className="font-bold text-primary-custom">Ranchi University</p>
                  <p className="text-muted-custom">12 Active Projects • 22 Resolved</p>
                </div>
              </div>
              <span className="font-bold text-accent-secondary bg-[#2F9E8F]/10 px-2 py-1 rounded">Grade A</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-base rounded-lg border border-surface-raised">
              <div className="flex items-center gap-3">
                <span className="font-mono text-muted-custom font-bold">03</span>
                <div>
                  <p className="font-bold text-primary-custom">NIT Jamshedpur</p>
                  <p className="text-muted-custom">09 Active Projects • 19 Resolved</p>
                </div>
              </div>
              <span className="font-bold text-accent-primary bg-[#E8A33D]/10 px-2 py-1 rounded">Grade B+</span>
            </div>
          </div>
        </div>

        {/* Live Problem Feed & Audit Monitor */}
        <div className="bg-surface p-6 rounded-xl border border-surface-raised space-y-4">
          <h2 className="text-lg font-bold font-display flex items-center gap-2">
            <TrendingUp size={18} className="text-accent-secondary" /> Live Problem Signal Feed
          </h2>

          <div className="space-y-3">
            {problems.map((item) => (
              <div key={item.id} className="p-3 bg-base rounded-lg border border-surface-raised space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-muted-custom">{item.id}</span>
                  <Badge status={item.status} />
                </div>
                <p className="font-bold text-primary-custom line-clamp-1">{item.title}</p>
                <div className="flex justify-between text-muted-custom">
                  <span>District: {item.location?.district || "Ranchi"}</span>
                  <Link to={`/problem/${item.id}`} className="text-accent-primary hover:underline">
                    Inspect &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="grid lg:grid-cols-2 gap-6">
        <div className="bg-surface p-6 rounded-xl border border-surface-raised space-y-4"><div className="flex items-center gap-2"><Wrench size={18} className="text-accent-primary" /><h2 className="text-lg font-bold font-display">Municipal resolution attempt</h2></div><p className="text-sm text-muted-custom">Close a standard fix or record a failed/chronic recurrence to activate escalation.</p><textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} placeholder="Officer notes and inspection evidence" className="w-full bg-base border border-surface-raised rounded-lg p-3 text-sm" /><div className="flex gap-2"><Button variant="primary" onClick={() => setResolution('RESOLVED')}><CheckCircle2 size={15} /> Mark resolved</Button><Button variant="danger" onClick={() => setResolution('FAILED')}><AlertTriangle size={15} /> Mark failed</Button></div>{resolution && <p className="text-sm text-accent-secondary">{resolution} recorded locally. {resolution === 'FAILED' ? 'Escalation engine can now open the HEI bank.' : 'Case can proceed to closure.'}</p>}</div>
        <div className="bg-surface p-6 rounded-xl border border-surface-raised space-y-4"><div className="flex items-center gap-2"><LockKeyhole size={18} className="text-accent-primary" /><h2 className="text-lg font-bold font-display">Site clearance gatekeeper</h2></div><p className="text-sm text-muted-custom">Inspect the pilot site and unlock Tranche 2 only after the ULB engineer signs off.</p><div className="p-4 bg-base rounded-lg border border-surface-raised text-xs space-y-2"><p><span className="text-muted-custom">Tranche 1</span><strong className="float-right text-accent-secondary">RELEASED · 30%</strong></p><p><span className="text-muted-custom">Tranche 2</span><strong className={`float-right ${clearance ? 'text-accent-secondary' : 'text-accent-primary'}`}>{clearance ? 'UNLOCKED · 40%' : 'LOCKED · 40%'}</strong></p><p><span className="text-muted-custom">Tranche 3</span><strong className="float-right">LOCKED · 30%</strong></p></div><Button variant={clearance ? 'outline' : 'secondary'} className="w-full" onClick={() => setClearance(true)} disabled={clearance}><ShieldCheck size={15} /> {clearance ? 'Site cleared by ULB engineer' : 'Sign site clearance'}</Button></div>
      </section>
    </div>
  );
}
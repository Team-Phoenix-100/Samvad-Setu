import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Filter, MapPin, Search, ShieldCheck } from 'lucide-react';
import { useProblemStore } from '../../store/problemStore';
import SignalDot from '../../components/ui/SignalDot';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function AdminProblems() {
  const { problems, fetchProblems } = useProblemStore();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');

  useEffect(() => { fetchProblems(); }, [fetchProblems]);

  const filteredProblems = useMemo(() => problems.filter((problem) => {
    const haystack = `${problem.id} ${problem.title} ${problem.description} ${problem.location?.district || ''}`.toLowerCase();
    return (status === 'all' || problem.status === status) && haystack.includes(query.toLowerCase());
  }), [problems, query, status]);

  return (
    <div className="min-h-screen bg-base text-primary-custom p-6 max-w-7xl mx-auto space-y-7">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 border-b border-surface-raised pb-6">
        <div><div className="inline-flex items-center gap-2 text-xs font-mono text-accent-secondary mb-2"><ShieldCheck size={14} /> DHTE OPERATIONS CONSOLE</div><h1 className="text-3xl font-bold font-display">Problem Operations</h1><p className="text-sm text-muted-custom mt-2">Moderate civic reports, route ownership, and monitor resolution progress.</p></div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs"><div className="bg-surface border border-surface-raised rounded-lg px-4 py-3"><b className="block text-lg text-accent-primary">{problems.length}</b>Total</div><div className="bg-surface border border-surface-raised rounded-lg px-4 py-3"><b className="block text-lg text-accent-secondary">{problems.filter((p) => p.status === 'resolved').length}</b>Resolved</div><div className="bg-surface border border-surface-raised rounded-lg px-4 py-3"><b className="block text-lg text-accent-urgent">{problems.filter((p) => p.urgency === 'urgent').length}</b>Urgent</div></div>
      </header>

      <div className="flex flex-col sm:flex-row gap-3 bg-surface border border-surface-raised rounded-xl p-3"><div className="relative flex-1"><Search size={16} className="absolute left-3 top-3 text-muted-custom" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search ID, title, or district" className="w-full bg-base border border-surface-raised rounded-lg py-2.5 pl-9 pr-3 text-sm" /></div><div className="flex items-center gap-2"><Filter size={16} className="text-accent-primary" /><select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-base border border-surface-raised rounded-lg py-2.5 px-3 text-sm"><option value="all">All statuses</option><option value="new">New</option><option value="in-progress">In progress</option><option value="resolved">Resolved</option></select></div></div>

      <div className="space-y-3">{filteredProblems.map((problem) => <article key={problem.id} className="bg-surface border border-surface-raised rounded-xl p-5"><div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"><div className="space-y-2"><div className="flex flex-wrap items-center gap-2"><SignalDot status={problem.status} size="sm" /><span className="text-xs font-mono text-muted-custom">{problem.id}</span><Badge status={problem.status} />{problem.urgency === 'urgent' && <span className="inline-flex items-center gap-1 text-xs text-accent-urgent"><AlertTriangle size={13} /> Urgent</span>}</div><h2 className="text-base font-bold">{problem.title}</h2><p className="text-sm text-muted-custom line-clamp-2">{problem.description}</p><div className="flex flex-wrap gap-4 text-xs text-muted-custom"><span className="flex items-center gap-1"><MapPin size={13} /> {problem.location?.district || 'Jharkhand'}</span><span>Category: {problem.category || 'Unclassified'}</span></div></div><div className="flex items-center gap-2"><Link to={`/problem/${problem.id}`}><Button variant="outline" className="text-xs py-2">Inspect</Button></Link><Button variant="secondary" className="text-xs py-2"><CheckCircle2 size={14} /> Route</Button></div></div></article>)}</div>
      {filteredProblems.length === 0 && <div className="text-center border border-dashed border-surface-raised rounded-xl p-12 text-sm text-muted-custom">No problems match the current filters.</div>}
    </div>
  );
}

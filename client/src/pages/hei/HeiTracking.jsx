import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock3, GraduationCap, MapPin, Search } from 'lucide-react';
import { useProblemStore } from '../../store/problemStore';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function HeiTracking() {
  const { problems, fetchProblems } = useProblemStore();
  const [view, setView] = useState('all');
  const [query, setQuery] = useState('');
  useEffect(() => { fetchProblems(); }, [fetchProblems]);
  const tracked = useMemo(() => problems.filter((p) => {
    const text = `${p.title} ${p.description} ${p.location?.district || ''}`.toLowerCase();
    const claimed = Boolean(p.assignedInstitution);
    return (view === 'all' || (view === 'claimed' && claimed) || (view === 'available' && !claimed)) && text.includes(query.toLowerCase());
  }), [problems, view, query]);

  return <div className="min-h-screen bg-base text-primary-custom p-6 max-w-7xl mx-auto space-y-7"><header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-surface-raised pb-6"><div><div className="inline-flex items-center gap-2 text-xs font-mono text-accent-secondary mb-2"><GraduationCap size={14} /> UNIVERSITY INNOVATION CELL</div><h1 className="text-3xl font-bold font-display">Problem Tracking</h1><p className="text-sm text-muted-custom mt-2">Track adopted challenges, team progress, and new problems suitable for your institution.</p></div><div className="flex gap-2"><Button variant={view === 'all' ? 'primary' : 'outline'} className="text-xs py-2" onClick={() => setView('all')}>All</Button><Button variant={view === 'available' ? 'primary' : 'outline'} className="text-xs py-2" onClick={() => setView('available')}>Available</Button><Button variant={view === 'claimed' ? 'primary' : 'outline'} className="text-xs py-2" onClick={() => setView('claimed')}>Claimed</Button></div></header><div className="relative"><Search size={16} className="absolute left-3 top-3 text-muted-custom" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tracked problems" className="w-full bg-surface border border-surface-raised rounded-lg py-2.5 pl-9 pr-3 text-sm" /></div><div className="grid md:grid-cols-2 gap-4">{tracked.map((problem) => { const claimed = Boolean(problem.assignedInstitution); return <article key={problem.id} className="bg-surface border border-surface-raised rounded-xl p-5 space-y-4"><div className="flex items-start justify-between gap-3"><div><span className="text-xs font-mono text-muted-custom">{problem.id}</span><h2 className="font-bold mt-1">{problem.title}</h2></div><Badge status={problem.status} /></div><p className="text-sm text-muted-custom line-clamp-3">{problem.description}</p><div className="flex justify-between text-xs text-muted-custom"><span className="flex items-center gap-1"><MapPin size={13} /> {problem.location?.district || 'Jharkhand'}</span><span className="flex items-center gap-1">{claimed ? <CheckCircle2 size={13} className="text-accent-secondary" /> : <Clock3 size={13} className="text-accent-primary" />}{claimed ? 'Team tracking active' : 'Open for claim'}</span></div><div className="flex justify-end border-t border-surface-raised pt-3"><Link to={`/problem/${problem.id}`}><Button variant={claimed ? 'outline' : 'primary'} className="text-xs py-2">{claimed ? 'Open project timeline' : 'Review challenge'}</Button></Link></div></article>; })}</div></div>;
}

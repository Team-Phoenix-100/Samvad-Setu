import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowUpRight, Search, Sparkles, Plus, Trash2, Send } from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import SignalDot from '../../components/ui/SignalDot';

export default function HeiDashboard() {
  const [showSubmission, setShowSubmission] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [materials, setMaterials] = useState(['Solar pump controller', 'Weatherproof enclosure']);
  const [form, setForm] = useState({ trl: 3, funding: '', abstract: '' });
  const activeClaims = [
    {
      id: 'SICP-2026-8901',
      title: 'Solar Water Pump Malfunction in Secondary School',
      district: 'Khunti',
      team: 'Team Alpha (CSE)',
      status: 'in-progress',
      progress: '60%',
    },
  ];

  return (
    <div className="min-h-screen bg-base text-primary-custom p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-raised pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-accent-secondary mb-1">
            <Sparkles size={14} /> Birsa Institute of Technology, Sindri
          </div>
          <h1 className="text-3xl font-bold font-display">HEI Portal & Workspace</h1>
        </div>
        <Link to="/hei/review">
          <Button variant="primary" className="py-2.5 px-4">
            <Search size={18} /> Browse Problem Queue
          </Button>
        </Link>
        <Button variant="secondary" className="py-2.5 px-4" onClick={() => setShowSubmission(true)}><Plus size={18} /> Submit Prototype</Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface p-5 rounded-xl border border-surface-raised space-y-1">
          <p className="text-xs font-mono text-muted-custom">Claimed Problems</p>
          <p className="text-3xl font-bold font-display text-accent-primary">04</p>
        </div>
        <div className="bg-surface p-5 rounded-xl border border-surface-raised space-y-1">
          <p className="text-xs font-mono text-muted-custom">Student Teams Assigned</p>
          <p className="text-3xl font-bold font-display text-accent-secondary">06</p>
        </div>
        <div className="bg-surface p-5 rounded-xl border border-surface-raised space-y-1">
          <p className="text-xs font-mono text-muted-custom">Deployed Solutions</p>
          <p className="text-3xl font-bold font-display text-primary-custom">02</p>
        </div>
      </div>

      {/* Active Projects Table */}
      <div className="bg-surface border border-surface-raised rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-bold font-display">Active Institutional Projects</h2>

        <div className="divide-y divide-[#1D3238]">
          {activeClaims.map((item) => (
            <div key={item.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <SignalDot status={item.status} size="sm" />
                  <span className="text-xs font-mono text-muted-custom">{item.id}</span>
                  <Badge status={item.status} />
                </div>
                <h3 className="font-bold text-primary-custom">{item.title}</h3>
                <p className="text-xs text-muted-custom">Location: {item.district} | Assigned: <strong className="text-accent-secondary">{item.team}</strong></p>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                <div className="text-right">
                  <span className="text-xs font-mono text-muted-custom">Milestone Progress</span>
                  <p className="text-sm font-bold text-accent-primary">{item.progress}</p>
                </div>
                <Link to={`/problem/${item.id}`}>
                  <Button variant="outline" className="text-xs py-2">
                    Workspace <ArrowUpRight size={14} />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showSubmission && <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-2xl bg-surface border border-surface-raised rounded-xl p-6 space-y-5 my-8">
          <div className="flex items-start justify-between"><div><p className="text-xs font-mono text-accent-secondary uppercase">Capstone intake</p><h2 className="text-2xl font-bold font-display">Submit working prototype</h2></div><button onClick={() => setShowSubmission(false)} aria-label="Close">×</button></div>
          <div className="grid sm:grid-cols-2 gap-4"><label className="text-sm space-y-2"><span className="text-muted-custom">TRL level (1-7)</span><input type="number" min="1" max="7" value={form.trl} onChange={(e) => setForm({ ...form, trl: e.target.value })} className="w-full bg-base border border-surface-raised rounded-lg p-3" /></label><label className="text-sm space-y-2"><span className="text-muted-custom">Funding goal (INR)</span><input type="number" min="0" placeholder="45000" value={form.funding} onChange={(e) => setForm({ ...form, funding: e.target.value })} className="w-full bg-base border border-surface-raised rounded-lg p-3" /></label></div>
          <label className="text-sm space-y-2 block"><span className="text-muted-custom">Technical abstract</span><textarea rows="4" placeholder="State the design, test method, and expected civic outcome" value={form.abstract} onChange={(e) => setForm({ ...form, abstract: e.target.value })} className="w-full bg-base border border-surface-raised rounded-lg p-3" /></label>
          <div className="space-y-2"><div className="flex items-center justify-between"><span className="text-sm text-muted-custom">Bill of Materials</span><button type="button" className="text-xs text-accent-primary" onClick={() => setMaterials([...materials, ''])}><Plus size={14} className="inline" /> Add item</button></div>{materials.map((material, index) => <div key={index} className="flex gap-2"><input value={material} onChange={(e) => setMaterials(materials.map((entry, itemIndex) => itemIndex === index ? e.target.value : entry))} className="flex-1 bg-base border border-surface-raised rounded-lg p-2.5 text-sm" placeholder="Component or service" /><button type="button" onClick={() => setMaterials(materials.filter((_, itemIndex) => itemIndex !== index))} aria-label="Remove material"><Trash2 size={16} className="text-red-400" /></button></div>)}</div>
          {submitted && <p className="text-sm text-accent-secondary flex items-center gap-2"><CheckCircle2 size={16} /> Prototype brief saved to the showcase queue.</p>}
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setShowSubmission(false)}>Cancel</Button><Button variant="primary" onClick={() => setSubmitted(true)} disabled={!form.abstract.trim() || !form.funding}><Send size={16} /> Submit brief</Button></div>
        </div>
      </div>}
    </div>
  );
}
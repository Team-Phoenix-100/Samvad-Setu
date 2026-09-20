import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, AlertCircle, CheckCircle2, Clock, MapPin } from 'lucide-react';
import { useProblemStore } from '../../store/problemStore';
import SignalDot from '../../components/ui/SignalDot';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function CitizenDashboard() {
  const { problems, isLoading, fetchProblems } = useProblemStore();

  useEffect(() => {
    fetchProblems();
  }, []);

  const totalReported = problems.length;
  const resolvedCount = problems.filter(p => p.status === 'resolved').length;
  const inProgressCount = problems.filter(p => p.status === 'in-progress' || p.status === 'new').length;

  return (
    <div className="min-h-screen bg-base text-primary-custom p-6 max-w-5xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-raised pb-6">
        <div>
          <h1 className="text-3xl font-bold font-display">Citizen Dashboard</h1>
          <p className="text-sm text-muted-custom">Track and manage civic issues reported by you.</p>
        </div>
        <Link to="/citizen/submit">
          <Button variant="primary" className="py-2.5 px-4">
            <Plus size={18} /> Report a New Problem
          </Button>
        </Link>
      </div>

      {/* Quick Stats Strip (Section 3.5) */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface p-4 rounded-xl border border-surface-raised flex items-center gap-3">
          <AlertCircle className="text-accent-primary" size={24} />
          <div>
            <p className="text-xs text-muted-custom">Total Reported</p>
            <p className="text-2xl font-bold font-display">{totalReported}</p>
          </div>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-surface-raised flex items-center gap-3">
          <Clock className="text-amber-400" size={24} />
          <div>
            <p className="text-xs text-muted-custom">In Progress</p>
            <p className="text-2xl font-bold font-display">{inProgressCount}</p>
          </div>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-surface-raised flex items-center gap-3">
          <CheckCircle2 className="text-accent-secondary" size={24} />
          <div>
            <p className="text-xs text-muted-custom">Resolved</p>
            <p className="text-2xl font-bold font-display">{resolvedCount}</p>
          </div>
        </div>
      </div>

      {/* Problems List or Empty State */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold font-display">My Submitted Reports</h2>

        {isLoading ? (
          <div className="p-8 text-center text-muted-custom">Loading problem feeds...</div>
        ) : problems.length === 0 ? (
          /* Empty State (Section 3.5) */
          <div className="p-12 text-center bg-surface border border-surface-raised rounded-xl space-y-4">
            <SignalDot status="unresolved" size="lg" />
            <h3 className="text-lg font-bold">No problems submitted yet</h3>
            <p className="text-sm text-muted-custom max-w-sm mx-auto">
              Report your first civic or educational infrastructure problem to initiate AI classification and university routing.
            </p>
            <Link to="/citizen/submit" className="inline-block">
              <Button variant="primary">Report First Problem</Button>
            </Link>
          </div>
        ) : (
          /* Active List[cite: 1] */
          <div className="space-y-3">
            {problems.map((item) => (
              <Link
                key={item.id}
                to={`/problem/${item.id}`}
                className="block p-5 bg-surface border border-surface-raised rounded-xl hover:border-[#E8A33D]/50 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <SignalDot status={item.status} size="md" />
                    <div>
                      <span className="text-xs font-mono text-muted-custom">{item.id}</span>
                      <h3 className="text-base font-bold text-primary-custom">{item.title}</h3>
                    </div>
                  </div>
                  <Badge status={item.status} />
                </div>

                <div className="flex items-center gap-6 text-xs text-muted-custom">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} /> {item.location?.district || "Jharkhand"}
                  </span>
                  <span>Category: <strong className="text-primary-custom">{item.category}</strong></span>
                  <span>Submitted: {new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
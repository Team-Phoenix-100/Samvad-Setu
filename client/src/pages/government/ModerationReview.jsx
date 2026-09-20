import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, RefreshCw, AlertTriangle } from 'lucide-react';
import { useGovModerationStore } from '../../store/govModerationStore';
import { useToastStore } from '../../store/toastStore';
import * as govApi from '../../api/govApi'; // Direct import to get single problem

export default function ModerationReview() {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const { moderateItem } = useGovModerationStore();
  const { showToast } = useToastStore();
  
  const [problem, setProblem] = useState(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We could add getProblemForReview in govApi, but for now we fetch it by standard problems public route or a new admin route.
    // Assuming backend returns it via queue if we filter, or we just write a quick fetch.
    const fetchProb = async () => {
      try {
        // Just use standard problem fetch or assuming queue has it. Since we might navigate directly, let's just get it.
        // Quick hack: fetch all queue and find it.
        const res = await govApi.getModerationQueue({ limit: 100 });
        const found = res.problems.find(p => p.id === problemId);
        setProblem(found);
      } finally {
        setLoading(false);
      }
    };
    fetchProb();
  }, [problemId]);

  const handleAction = async (action) => {
    if (action === 'reject' && !note) {
      showToast('Rejection note is required.', 'error');
      return;
    }
    try {
      await moderateItem(problemId, { action, note });
      showToast(`Problem ${action}ed successfully.`, 'success');
      navigate('/government/moderation');
    } catch (err) {
      showToast('Action failed', 'error');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!problem) return <div className="p-8">Problem not found in moderation queue.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="text-muted-custom hover:text-primary-custom flex items-center gap-2 text-sm">
        <ArrowLeft size={16} /> Back to Queue
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col: Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-[#16272B] p-8 rounded-xl border border-[#233E44]">
            <h1 className="text-2xl font-bold font-display mb-4">{problem.title}</h1>
            <p className="text-muted-custom mb-6">{problem.description}</p>
            {problem.images && problem.images.length > 0 && (
              <img src={problem.images[0].url} alt="Evidence" className="w-full h-64 object-cover rounded-lg border border-[#233E44]" />
            )}
          </div>
        </div>

        {/* Right Col: AI Analysis & Actions */}
        <div className="space-y-6">
          <div className="bg-base p-6 rounded-xl border border-[#E8A33D]/50 shadow-[0_0_15px_rgba(232,163,61,0.1)]">
            <h3 className="font-bold font-display flex items-center gap-2 text-accent-primary mb-4">
              <AlertTriangle size={18} /> AI Analysis
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-[#233E44] pb-2">
                <span className="text-muted-custom">Category</span>
                <span className="font-medium text-primary-custom">{problem.aiMetadata?.category}</span>
              </div>
              <div className="flex justify-between border-b border-[#233E44] pb-2">
                <span className="text-muted-custom">Confidence</span>
                <span className="font-mono text-accent-urgent font-bold">{Math.round((problem.aiMetadata?.confidence || 0)*100)}%</span>
              </div>
              <div className="flex justify-between border-b border-[#233E44] pb-2">
                <span className="text-muted-custom">Reason</span>
                <span className="font-mono text-accent-primary text-xs">{problem.aiMetadata?.flagReason}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#16272B] p-6 rounded-xl border border-[#233E44] space-y-4">
            <textarea 
              placeholder="Moderation notes (required for rejection)" 
              value={note} onChange={e => setNote(e.target.value)}
              className="w-full bg-base border border-[#233E44] rounded-lg p-3 text-sm focus:outline-none focus:border-[#2F9E8F] text-primary-custom"
              rows={3}
            />
            <button onClick={() => handleAction('approve')} className="w-full flex items-center justify-center gap-2 bg-[#2F9E8F] text-[#0F1B1E] font-bold py-2 rounded-lg hover:bg-[#2F9E8F]/90 transition">
              <Check size={18} /> Approve AI Classification
            </button>
            <button onClick={() => handleAction('reject')} className="w-full flex items-center justify-center gap-2 bg-transparent border border-[#C1443B] text-accent-urgent font-bold py-2 rounded-lg hover:bg-[#C1443B]/10 transition">
              <X size={18} /> Reject Submission
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

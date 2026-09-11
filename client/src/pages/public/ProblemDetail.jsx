import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Building2, ShieldCheck, ArrowLeft, CheckCircle2, Trash2, Camera, ThumbsUp, Activity, Wrench, Banknote, FileCheck, Clock, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useProblemStore } from '../../store/problemStore';
import { useToastStore } from '../../store/toastStore';
import SignalDot from '../../components/ui/SignalDot';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function ProblemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { problems, fetchProblems, deleteProblem } = useProblemStore();
  const { user } = useAuthStore();
  const { showToast } = useToastStore();
  const [problem, setProblem] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [actionModal, setActionModal] = useState(null);
  const [actionNote, setActionNote] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Mock engagement state
  const [upvotes, setUpvotes] = useState(142);
  const [hasUpvoted, setHasUpvoted] = useState(false);

  const handleUpvote = () => {
    if (!hasUpvoted) {
      setUpvotes(prev => prev + 1);
      setHasUpvoted(true);
      showToast("Thank you for supporting this issue!", "success");
    }
  };

  const confirmDelete = async () => {
    const success = await deleteProblem(id);
    if (success) {
      showToast("Problem deleted successfully.", "success");
      setShowDeleteModal(false);
      navigate('/citizen/dashboard');
    }
  };

  useEffect(() => {
    if (problems.length === 0) {
      fetchProblems();
    } else {
      const found = problems.find((p) => p.id === id);
      setProblem(found || problems[0]);
    }
  }, [id, problems]);

  if (!problem) {
    return (
      <div className="min-h-screen bg-[#0F1B1E] text-[#F2EFE9] flex items-center justify-center">
        <p className="text-[#9BA8A6]">Loading problem details...</p>
      </div>
    );
  }

  const slaHours = problem.urgency === 'urgent' ? 168 : 336;
  const reportedAt = new Date(problem.createdAt || Date.now()).getTime();
  const dueAt = reportedAt + slaHours * 60 * 60 * 1000;
  const remainingHours = Math.max(0, Math.ceil((dueAt - Date.now()) / (60 * 60 * 1000)));
  const role = user?.role || 'citizen';
  const roleAction = ['government_admin', 'admin', 'govt_admin', 'platform_admin'].includes(role)
    ? { label: 'Record municipal attempt', options: ['RESOLVED', 'FAILED'] }
    : role.includes('hei')
      ? { label: 'Open capstone workspace', options: ['CLAIM FOR HEI'] }
      : role.includes('industry')
        ? { label: 'Review CSR pledge', options: ['PLEDGE SUPPORT'] }
        : null;

  const completeAction = (option) => {
    showToast(`${option} recorded for this prototype view.`, 'success');
    setActionModal(null);
    setActionNote('');
  };

  // Dynamic Timeline mapping
  const extendedTimeline = problem.timeline?.length > 0 ? problem.timeline.map((item, idx) => {
    let icon = FileCheck;
    let color = "bg-blue-500";
    let text = "text-blue-400";
    
    if (item.stage?.toLowerCase().includes('report') || item.actor === 'Citizen') {
      icon = FileCheck; color = "bg-blue-500"; text = "text-blue-400";
    } else if (item.stage?.toLowerCase().includes('ai') || item.actor?.includes('AI')) {
      icon = Activity; color = "bg-[#E8A33D]"; text = "text-[#E8A33D]";
    } else if (item.stage?.toLowerCase().includes('escalated') || item.stage?.toLowerCase().includes('review')) {
      icon = Building2; color = "bg-purple-500"; text = "text-purple-400";
    } else if (item.stage?.toLowerCase().includes('resolved')) {
      icon = CheckCircle2; color = "bg-emerald-500"; text = "text-emerald-400";
    }

    return {
      stage: item.stage,
      timestamp: new Date(item.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      actor: item.actor,
      icon, color, text, active: true
    };
  }) : [
    { stage: "Reported & Pending", timestamp: new Date().toLocaleString(), actor: "System", icon: Activity, color: "bg-[#1D3238]", text: "text-[#9BA8A6]", active: true }
  ];

  return (
    <div className="min-h-screen bg-[#0F1B1E] text-[#F2EFE9] p-6 max-w-6xl mx-auto space-y-8">
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between border-b border-[#1D3238] pb-4">
        <Link 
          to={(() => {
            const role = user?.role;
            if (role === "hei" || role === "hei_admin") return "/hei/dashboard";
            if (role === "industry_csr" || role === "industry_admin") return "/industry/dashboard";
            if (role === "government_admin" || role === "admin" || role === "govt_admin" || role === "platform_admin") return "/admin/analytics";
            return "/citizen/dashboard";
          })()}
          className="inline-flex items-center gap-2 text-sm font-mono text-[#9BA8A6] hover:text-[#F2EFE9] transition-colors"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <span className="text-xs font-mono font-bold text-[#E8A33D] bg-[#E8A33D]/10 border border-[#E8A33D]/20 px-3 py-1.5 rounded-full shadow-[0_0_10px_rgba(232,163,61,0.1)]">
          REF: #{problem.id?.substring(0,8).toUpperCase()}
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Details & Evidence */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Hero Card */}
          <div className="bg-[#16262A] rounded-2xl border border-[#1D3238] overflow-hidden shadow-xl">
            <div className="p-8 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <SignalDot status={problem.status} size="lg" />
                <Badge status={problem.status} />
                <span className="text-xs font-mono font-bold px-2 py-1 bg-[#1D3238] rounded text-[#9BA8A6]">
                  URGENCY: <span className="text-[#E8A33D]">{problem.urgency?.toUpperCase() || 'MEDIUM'}</span>
                </span>
              </div>

              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <h1 className="text-3xl md:text-4xl font-bold font-display leading-tight">{problem.title}</h1>
                  {problem.reportedBy && (
                    <div className="text-[#9BA8A6] text-sm flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#1D3238] flex items-center justify-center text-[10px] text-white font-bold">
                        {problem.reportedBy.name?.charAt(0) || "C"}
                      </span>
                      Reported by <strong className="text-[#F2EFE9]">{problem.reportedBy.name || "Citizen"}</strong> • {new Date(problem.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
                {user && (user.id === problem.reportedBy?._id || user.id === problem.reportedBy?.id || user.id === problem.reportedBy) && (
                  <button 
                    onClick={() => setShowDeleteModal(true)}
                    className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors border border-transparent hover:border-red-400/30 shrink-0"
                    title="Delete Problem"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm text-[#9BA8A6] font-medium">
                <span className="flex items-center gap-2 text-[#F2EFE9] bg-[#1D3238] px-2 py-1 rounded">
                  <Activity size={16} className="text-[#2F9E8F]" /> {problem.category || 'General'}
                </span>
                <span className="flex items-center gap-2">
                  <Building2 size={16} className="text-[#E8A33D]" /> {problem.department || 'Public Works Department'}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin size={16} className="text-[#E8A33D]" /> {problem.location?.district || "Jharkhand"}, {problem.location?.block || "Block"}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar size={16} className="text-[#2F9E8F]" /> Reported {new Date(problem.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>

              <div className="w-full h-px bg-gradient-to-r from-transparent via-[#1D3238] to-transparent my-4" />

              {/* AI Metadata Tabular Grid */}
              {problem.aiMetadata && (
                <div className="bg-[#0F1B1E] rounded-xl border border-[#1D3238] p-5 space-y-4">
                  <h3 className="text-sm font-bold font-display text-[#2F9E8F] flex items-center gap-2 border-b border-[#1D3238] pb-2">
                    <Activity size={16} /> AI Classification Analysis
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-[#9BA8A6] text-xs uppercase tracking-wider mb-1">Category</div>
                      <div className="font-medium text-[#F2EFE9]">{problem.aiMetadata.category || problem.category || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-[#9BA8A6] text-xs uppercase tracking-wider mb-1">Confidence Score</div>
                      <div className="font-medium text-[#E8A33D]">
                        {problem.aiMetadata.confidence ? `${Math.round(problem.aiMetadata.confidence * 100)}%` : "N/A"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[#9BA8A6] text-xs uppercase tracking-wider mb-1">Severity</div>
                      <div className="font-medium text-[#F2EFE9] uppercase">{problem.aiMetadata.severity || "MEDIUM"}</div>
                    </div>
                    <div>
                      <div className="text-[#9BA8A6] text-xs uppercase tracking-wider mb-1">Priority Index</div>
                      <div className="font-medium text-[#E8A33D]">{problem.aiMetadata.priority || 50}/100</div>
                    </div>
                    <div>
                      <div className="text-[#9BA8A6] text-xs uppercase tracking-wider mb-1">Human Review Req.</div>
                      <div className="font-medium text-[#F2EFE9]">{problem.aiMetadata.needsHumanReview ? 'Yes' : 'No'}</div>
                    </div>
                    <div>
                      <div className="text-[#9BA8A6] text-xs uppercase tracking-wider mb-1">Assigned Department</div>
                      <div className="font-medium text-[#F2EFE9] truncate" title={problem.department}>{problem.department || 'PWD'}</div>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-[#F2EFE9] text-lg leading-relaxed font-light mt-6">
                {problem.description}
              </p>
              <div className={`flex items-center gap-3 rounded-lg border p-3 text-sm mt-6 ${remainingHours === 0 ? 'border-[#C1443B]/50 bg-[#C1443B]/10 text-red-300' : 'border-[#E8A33D]/30 bg-[#E8A33D]/10 text-[#E8A33D]'}`}>
                <Clock size={18} />
                <span><strong>Municipal SLA:</strong> {remainingHours ? `${remainingHours} hours remaining` : 'SLA breached'} <span className="text-xs opacity-75">({slaHours / 24}-day target)</span></span>
              </div>
            </div>
            
            {/* Citizen Impact Bar */}
            <div className="bg-[#0F1B1E] border-t border-[#1D3238] p-4 px-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  <div className="w-8 h-8 rounded-full border-2 border-[#0F1B1E] bg-[#1D3238] flex items-center justify-center text-[10px] text-white">A</div>
                  <div className="w-8 h-8 rounded-full border-2 border-[#0F1B1E] bg-[#2F9E8F] flex items-center justify-center text-[10px] text-white">R</div>
                  <div className="w-8 h-8 rounded-full border-2 border-[#0F1B1E] bg-[#E8A33D] flex items-center justify-center text-[10px] text-white">K</div>
                </div>
                <span className="text-sm font-medium text-[#9BA8A6]">
                  <strong className="text-[#F2EFE9]">+{upvotes} citizens</strong> impacted
                </span>
              </div>
              <Button 
                variant={hasUpvoted ? "primary" : "outline"} 
                className="rounded-full px-6 py-2 flex items-center gap-2 text-sm shadow-[0_0_15px_rgba(232,163,61,0.1)]"
                onClick={handleUpvote}
              >
                <ThumbsUp size={16} className={hasUpvoted ? "" : "text-[#E8A33D]"} />
                {hasUpvoted ? 'Supported' : 'Support Issue'}
              </Button>
            </div>
          </div>

          {/* Uploaded Media Display */}
          <div className="bg-[#16262A] p-8 rounded-2xl border border-[#1D3238] space-y-6 shadow-lg">
            <h3 className="text-lg font-bold font-display flex items-center gap-2 border-b border-[#1D3238] pb-4">
              <Camera size={20} className="text-[#E8A33D]" /> Verified Photographic Evidence
            </h3>
            {problem.images && problem.images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {problem.images.map((img, idx) => (
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    key={idx}
                    className="cursor-pointer rounded-xl overflow-hidden border border-[#1D3238] hover:border-[#E8A33D] transition-colors shadow-sm aspect-square relative group bg-[#0F1B1E]"
                    onClick={() => setPreviewImage(img.url)}
                  >
                    <img 
                      src={img.url} 
                      alt={`Evidence ${idx + 1}`} 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-[#0F1B1E]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                      <span className="text-white text-xs font-mono font-bold bg-[#E8A33D] px-3 py-1.5 rounded-full shadow-lg">Expand</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-10 border-2 border-dashed border-red-900/50 rounded-xl bg-red-900/5 flex flex-col items-center justify-center text-red-400/80">
                <Camera size={48} className="mb-4 opacity-50" />
                <p className="text-sm font-bold uppercase tracking-wider">No Proof Attached</p>
                <p className="text-xs mt-1 text-center max-w-xs">Warning: Issues without evidence are highly unlikely to be processed by authorities.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Timeline & Ownership */}
        <div className="space-y-6">
          
          {/* Extended Life Cycle Audit Timeline */}
          <div className="bg-[#16262A] p-6 rounded-2xl border border-[#1D3238] shadow-lg sticky top-24">
            <h2 className="text-lg font-bold font-display flex items-center gap-2 mb-8">
              <Activity size={20} className="text-[#2F9E8F]" /> Resolution Tracker
            </h2>

            <div className="relative border-l-2 border-[#1D3238] ml-5 space-y-8">
              {extendedTimeline.map((item, index) => (
                <div key={index} className={`relative pl-8 transition-opacity ${item.active ? 'opacity-100' : 'opacity-40'}`}>
                  {/* Timeline Node */}
                  <div className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full border-4 border-[#16262A] ${item.color} flex items-center justify-center shadow-lg`}>
                    <item.icon size={12} className="text-[#0F1B1E]" />
                  </div>
                  
                  {/* Content */}
                  <div className="space-y-1.5 -mt-1">
                    <h4 className={`text-sm font-bold ${item.active ? 'text-[#F2EFE9]' : 'text-[#9BA8A6]'}`}>{item.stage}</h4>
                    <p className={`text-xs font-medium ${item.text}`}>{item.actor}</p>
                    <span className="inline-block text-[10px] font-mono font-bold bg-[#0F1B1E] border border-[#1D3238] text-[#9BA8A6] px-2 py-0.5 rounded">
                      {item.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {roleAction && <Button variant="secondary" className="w-full mt-8" onClick={() => setActionModal(true)}><ShieldCheck size={16} /> {roleAction.label}</Button>}
          </div>

        </div>
      </div>

      <AnimatePresence>
        {actionModal && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] bg-black/70 flex items-center justify-center p-4">
          <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-md bg-[#16262A] border border-[#1D3238] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between"><h2 className="font-bold font-display">{roleAction.label}</h2><button onClick={() => setActionModal(null)} aria-label="Close"><X size={18} /></button></div>
            <p className="text-sm text-[#9BA8A6]">Capture the next lifecycle decision for this issue.</p>
            <textarea value={actionNote} onChange={(event) => setActionNote(event.target.value)} rows={3} placeholder="Notes, inspection findings, or pledge context" className="w-full bg-[#0F1B1E] border border-[#1D3238] rounded-lg p-3 text-sm" />
            <div className="flex flex-wrap gap-2">{roleAction.options.map((option) => <Button key={option} variant={option === 'FAILED' ? 'danger' : 'primary'} onClick={() => completeAction(option)}>{option}</Button>)}</div>
          </motion.div>
        </motion.div>}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 10, opacity: 0 }}
              className="w-full max-w-sm bg-[#16262A] border border-[#1D3238] rounded-2xl p-6 space-y-6 shadow-2xl"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 border border-red-500/20">
                  <Trash2 size={32} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold font-display text-white">Delete Problem?</h2>
                  <p className="text-[#9BA8A6] text-sm">
                    Are you sure you want to delete this problem? If you delete it, all related data, evidence, and AI classifications will be lost forever.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full">
                <Button variant="outline" className="flex-1" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </Button>
                <Button variant="danger" className="flex-1 bg-red-600 hover:bg-red-700 text-white border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.2)]" onClick={confirmDelete}>
                  Delete Forever
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Screen Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F1B1E]/95 backdrop-blur-xl p-4 md:p-12"
            onClick={() => setPreviewImage(null)}
          >
            <button className="absolute top-6 right-6 text-[#9BA8A6] hover:text-white bg-[#1D3238]/50 hover:bg-[#1D3238] rounded-full w-12 h-12 flex items-center justify-center backdrop-blur-sm transition-all shadow-lg border border-[#1D3238]">
              <span className="text-xl leading-none -mt-0.5">✕</span>
            </button>
            <motion.img 
              initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.35 }}
              src={previewImage} 
              alt="Full Preview" 
              className="max-w-full max-h-full object-contain rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-[#1D3238]"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

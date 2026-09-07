import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Building2, ShieldCheck, ArrowLeft, Award, Sparkles, CheckCircle2, Trash2, Camera, Users, ThumbsUp, Activity, Wrench, Banknote, FileCheck } from 'lucide-react';
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

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this problem?")) {
      const success = await deleteProblem(id);
      if (success) {
        showToast("Problem deleted successfully.", "success");
        navigate('/citizen/dashboard');
      }
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

  // Enhanced Mock Timeline Stages
  const extendedTimeline = [
    { stage: "Reported & Classified", timestamp: "Oct 12, 10:30 AM", actor: "Citizen & AI Engine", icon: FileCheck, color: "bg-blue-500", border: "border-blue-500", text: "text-blue-400", active: true },
    { stage: "Verified by Authority", timestamp: "Oct 13, 09:15 AM", actor: "Municipal Admin", icon: ShieldCheck, color: "bg-emerald-500", border: "border-emerald-500", text: "text-emerald-400", active: true },
    { stage: "Assigned to Tech Partner", timestamp: "Oct 15, 02:00 PM", actor: "Ranchi University", icon: Building2, color: "bg-purple-500", border: "border-purple-500", text: "text-purple-400", active: true },
    { stage: "CSR Funds Pledged", timestamp: "Oct 18, 11:45 AM", actor: "Tata Steel CSR", icon: Banknote, color: "bg-[#E8A33D]", border: "border-[#E8A33D]", text: "text-[#E8A33D]", active: true },
    { stage: "Work in Progress", timestamp: "Pending", actor: "Local Contractor", icon: Wrench, color: "bg-[#1D3238]", border: "border-[#1D3238]", text: "text-[#9BA8A6]", active: false },
    { stage: "Resolved", timestamp: "Pending", actor: "Admin", icon: CheckCircle2, color: "bg-[#1D3238]", border: "border-[#1D3238]", text: "text-[#9BA8A6]", active: false }
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
                <h1 className="text-3xl md:text-4xl font-bold font-display leading-tight">{problem.title}</h1>
                {user && (user.id === problem.reportedBy?._id || user.id === problem.reportedBy?.id || user.id === problem.reportedBy) && (
                  <button 
                    onClick={handleDelete}
                    className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors border border-transparent hover:border-red-400/30"
                    title="Delete Problem"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm text-[#9BA8A6] font-medium">
                <span className="flex items-center gap-2">
                  <MapPin size={16} className="text-[#E8A33D]" /> {problem.location?.district || "Jharkhand"}, {problem.location?.block || "Block"}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar size={16} className="text-[#2F9E8F]" /> Reported {new Date(problem.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>

              <div className="w-full h-px bg-gradient-to-r from-transparent via-[#1D3238] to-transparent my-4" />

              <p className="text-[#F2EFE9] text-lg leading-relaxed font-light">
                {problem.description}
              </p>
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
          </div>

        </div>
      </div>

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

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  X, Info, ArrowLeft, LayoutDashboard, ChevronRight,
  Users, Building2, Briefcase, ShieldCheck, Map, Cpu, Activity,
  Network, Code, CheckCircle2, Sparkles, Layers, FileText
} from 'lucide-react';

export default function AboutPortalModal({ isOpen, onClose, role }) {
  const { t } = useTranslation('about');
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('pillars');

  // Reset internal view state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowFullDetails(false);
      setActiveTab('pillars');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Map app roles to the 4 audience sections defined in translation JSON
  const getRoleKey = () => {
    if (role === 'citizen') return 'citizen';
    if (role === 'hei' || role === 'hei_admin') return 'hei';
    if (role === 'industry_csr' || role === 'industry_admin') return 'industry';
    if (role === 'government_admin' || role === 'admin' || role === 'govt_admin' || role === 'platform_admin') return 'government';
    return 'citizen';
  };

  const roleKey = getRoleKey();

  const roleHighlights = {
    citizen: [
      { icon: Map, title: 'Multimodal Reporting', desc: 'Report civic issues with photos, voice notes, and GPS geotagging.' },
      { icon: Activity, title: 'Real-time SLA Tracking', desc: 'Track resolution status with active 48-hour SLA timers and live updates.' },
      { icon: Sparkles, title: 'AI Triage & Routing', desc: 'Intelligent severity classification auto-routes complaints to HEIs and local authorities.' }
    ],
    hei: [
      { icon: Building2, title: 'NEP 2020 Capstone Projects', desc: 'Adopt community problems as accredited R&D and student capstone projects.' },
      { icon: Users, title: 'Faculty & Student Teams', desc: 'Form multidisciplinary teams to build field prototypes.' },
      { icon: Briefcase, title: 'CSR Milestone Funding', desc: 'Submit completed blueprints to industrial CSR partners for grant funding.' }
    ],
    industry: [
      { icon: Briefcase, title: 'MCA Section 135 Compliant', desc: 'Direct corporate CSR funds toward validated, measurable community problems.' },
      { icon: Layers, title: '30/40/30 Milestone Escrow', desc: 'Release funds in transparent tranches tied to verified project milestones.' },
      { icon: CheckCircle2, title: 'Certified Civic Handover', desc: 'Official handover documentation and impact certification.' }
    ],
    government: [
      { icon: ShieldCheck, title: '24-District Command Center', desc: 'Real-time analytics and heatmaps for Jharkhand districts.' },
      { icon: Activity, title: 'Triage & Moderation Queue', desc: 'Review flagged high-severity issues and ensure SLA compliance.' },
      { icon: Building2, title: 'Institutional Coordination', desc: 'Coordinate with 447+ universities and industrial stakeholders.' }
    ]
  };

  const pillars = [
    { icon: Users, title: 'Multimodal Citizen Reporting', desc: 'Voice, photo, geotag, and text reporting via app, WhatsApp, IVR, and web.' },
    { icon: Map, title: 'Geospatial Mapping & Smart Routing', desc: 'Hotspot mapping across all 24 districts of Jharkhand, auto-forwarding verified issues to 447+ HEIs.' },
    { icon: Cpu, title: 'Actionable R&D Pipelines', desc: 'Converts raw complaints into structured, fundable engineering research projects instead of one-off repairs.' },
    { icon: Briefcase, title: 'CSR Funding Bridge', desc: 'Connects validated community challenges to regional industrial CSR funds for rapid prototyping and deployment.' },
    { icon: Activity, title: 'Proactive Prevention & Transparency', desc: 'Catches slow-building disasters early and sends citizens live progress updates to build public trust.' }
  ];

  const workflowSteps = [
    { num: 1, title: 'Citizen Input', desc: 'Multilingual reporting (Voice / Photo / Geotag / Text) via Web & Mobile.' },
    { num: 2, title: 'Language Normalization', desc: 'Hindi / Hinglish / English translation & sentiment normalization.' },
    { num: 3, title: 'AI Engine Triage', desc: 'IndicBERT classification, severity prediction, and FAISS duplicate detection.' },
    { num: 4, title: 'Decision Layer', desc: 'High confidence issues auto-route; uncertain issues go to human moderation.' },
    { num: 5, title: 'Action & Feedback Loop', desc: 'Assigned to HEI/Industry/Govt with live SLA tracking and model retraining.' }
  ];

  const audiences = [
    { key: 'citizens', title: 'Citizens', icon: Users, color: 'text-accent-secondary', desc: 'Report civic issues, track SLA countdowns, and upvote community concerns.' },
    { key: 'heis', title: 'HEIs & Universities', icon: Building2, color: 'text-accent-primary', desc: 'Adopt community problems as NEP-2020 capstone projects with student teams.' },
    { key: 'industry', title: 'Industry & CSR', icon: Briefcase, color: 'text-[#9B4F96]', desc: 'Fund validated prototypes via milestone-based escrow aligned with MCA Sec 135.' },
    { key: 'government', title: 'State Authorities', icon: ShieldCheck, color: 'text-accent-urgent', desc: 'Monitor district-wise heatmaps, triage moderation queues, and enforce SLAs.' }
  ];

  const techStack = [
    { category: 'Frontend', items: 'React 18, Vite, Tailwind CSS v4, Framer Motion, Zustand, Leaflet Maps' },
    { category: 'Mobile App', items: 'React Native, Expo, NativeWind, Offline Storage, Camera & Geolocation' },
    { category: 'Backend & Gateway', items: 'Node.js, Express, REST APIs, JWT Auth Interceptors, Socket.io' },
    { category: 'AI & ML Services', items: 'Python, FastAPI, IndicBERT/MuRIL, Sentence-Transformers, FAISS, PyTorch' },
    { category: 'Data & Storage', items: 'MongoDB Atlas, PostgreSQL, Redis / BullMQ, Cloudinary CDN' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          {/* Slide-over panel */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.32, ease: 'easeInOut' }}
            className={`relative w-full ${showFullDetails ? 'max-w-2xl lg:max-w-3xl' : 'max-w-md'} h-full bg-surface border-l border-surface-raised shadow-2xl flex flex-col z-10 transition-[max-width] duration-300 ease-in-out`}
          >
            {/* Header */}
            <div className="p-6 flex items-center justify-between border-b border-surface-raised bg-surface/90 backdrop-blur-md">
              <div className="flex items-center gap-3">
                {showFullDetails ? (
                  <button
                    onClick={() => setShowFullDetails(false)}
                    className="p-2 -ml-2 rounded-lg hover:bg-surface-raised text-muted-custom hover:text-primary-custom transition-colors flex items-center gap-1.5 text-xs font-semibold"
                    title="Back to portal summary"
                  >
                    <ArrowLeft size={16} />
                    <span>Back</span>
                  </button>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-accent-primary/10 text-accent-primary flex items-center justify-center shrink-0">
                    <Info size={20} />
                  </div>
                )}
                <div>
                  <h2 className="text-lg md:text-xl font-display font-bold text-primary-custom leading-tight">
                    {showFullDetails 
                      ? 'Platform Architecture & Details' 
                      : t(`portalModals.${roleKey}.title`, 'About Citizen Portal')}
                  </h2>
                  <p className="text-xs text-muted-custom font-mono mt-0.5">
                    {showFullDetails 
                      ? 'Samvad Setu · SIH 2026 Core Specifications' 
                      : 'Samvad Setu Platform Overview'}
                  </p>
                </div>
              </div>

              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-surface-raised flex items-center justify-center text-muted-custom hover:text-primary-custom transition-colors shrink-0"
                title="Close and return to dashboard"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
              {!showFullDetails ? (
                /* Compact Portal Summary View */
                <div className="p-6 flex flex-col gap-6">
                  {/* Role Overview */}
                  <div className="p-4 rounded-xl bg-surface-raised/40 border border-surface-raised">
                    <span className="text-xs font-mono uppercase tracking-wider text-accent-primary font-bold">
                      Portal Purpose
                    </span>
                    <p className="text-primary-custom/90 leading-relaxed text-sm mt-2">
                      {t(`portalModals.${roleKey}.content`)}
                    </p>
                  </div>

                  {/* Highlights Grid */}
                  <div className="flex flex-col gap-3">
                    <span className="text-xs font-mono uppercase tracking-wider text-muted-custom font-semibold">
                      Key Capabilities
                    </span>
                    <div className="grid grid-cols-1 gap-2.5">
                      {(roleHighlights[roleKey] || roleHighlights.citizen).map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <div 
                            key={idx}
                            className="p-3.5 rounded-lg bg-base/60 border border-surface-raised flex items-start gap-3 hover:border-accent-primary/30 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-surface-raised flex items-center justify-center text-accent-primary shrink-0 mt-0.5">
                              <Icon size={16} />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-primary-custom">{item.title}</h4>
                              <p className="text-xs text-muted-custom mt-0.5 leading-normal">{item.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Learn More Interactive Card */}
                  <div className="p-5 rounded-xl bg-gradient-to-br from-surface-raised/80 to-surface border border-accent-primary/20 flex flex-col gap-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-accent-primary" />
                      <span className="text-sm font-semibold text-primary-custom font-display">
                        Complete Architecture & Engineering
                      </span>
                    </div>
                    <p className="text-xs text-muted-custom leading-relaxed">
                      Deep dive into our 5 core pillars, end-to-end AI triage pipeline, university R&D linkages, and full technology stack without leaving your dashboard.
                    </p>
                    <button 
                      onClick={() => setShowFullDetails(true)}
                      className="mt-1 w-full py-2.5 px-4 rounded-lg bg-accent-primary text-on-accent hover:bg-accent-primary/90 transition-all font-semibold text-xs flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span>Explore Full Platform Details</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                /* Expanded Full Platform Details View */
                <div className="p-6 flex flex-col gap-6">
                  {/* Internal Tab Navigation */}
                  <div className="flex items-center gap-1.5 p-1 bg-base/80 rounded-lg border border-surface-raised overflow-x-auto">
                    {[
                      { id: 'pillars', label: '5 Core Pillars', icon: Layers },
                      { id: 'pipeline', label: 'AI Workflow', icon: Cpu },
                      { id: 'audiences', label: 'Stakeholders', icon: Users },
                      { id: 'tech', label: 'Tech Stack', icon: Code }
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                            isActive
                              ? 'bg-accent-primary text-on-accent shadow-sm'
                              : 'text-muted-custom hover:text-primary-custom hover:bg-surface-raised/50'
                          }`}
                        >
                          <Icon size={14} />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Tab 1: 5 Pillars */}
                  {activeTab === 'pillars' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="flex flex-col gap-3"
                    >
                      <div className="p-3.5 rounded-lg bg-accent-primary/5 border border-accent-primary/20 mb-1">
                        <p className="text-xs text-primary-custom leading-relaxed">
                          <strong>Samvad Setu</strong> converts unaddressed community grievances into structured, fundable engineering research projects and verified CSR actions aligned with NEP 2020.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {pillars.map((pillar, idx) => {
                          const Icon = pillar.icon;
                          return (
                            <div 
                              key={idx}
                              className="p-4 rounded-xl bg-base border border-surface-raised flex items-start gap-3.5 hover:border-surface-raised/80 transition-all"
                            >
                              <div className="w-9 h-9 rounded-lg bg-surface-raised text-accent-secondary flex items-center justify-center shrink-0">
                                <Icon size={18} />
                              </div>
                              <div className="flex-1">
                                <h4 className="text-sm font-bold text-primary-custom">{pillar.title}</h4>
                                <p className="text-xs text-muted-custom mt-1 leading-relaxed">{pillar.desc}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* Tab 2: AI Pipeline & Workflow */}
                  {activeTab === 'pipeline' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="flex flex-col gap-4"
                    >
                      <div className="p-3.5 rounded-lg bg-surface-raised/40 border border-surface-raised text-xs text-muted-custom">
                        <strong className="text-primary-custom">Example Real-world Flow: </strong>
                        Citizen reports &quot;Water pipeline broken for 3 days&quot; in Hindi → AI classifies Category: Water, Severity: High, Dept: Public Works, Confidence: 94% → Automated routing with live SLA tracking.
                      </div>

                      <div className="relative pl-6 border-l-2 border-accent-primary/30 flex flex-col gap-5 py-2">
                        {workflowSteps.map((step) => (
                          <div key={step.num} className="relative flex flex-col gap-1">
                            <div className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-accent-primary text-on-accent text-xs font-bold flex items-center justify-center shadow-sm">
                              {step.num}
                            </div>
                            <h4 className="text-sm font-bold text-primary-custom">{step.title}</h4>
                            <p className="text-xs text-muted-custom leading-relaxed">{step.desc}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Tab 3: Audiences */}
                  {activeTab === 'audiences' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-3"
                    >
                      {audiences.map((aud) => {
                        const Icon = aud.icon;
                        const isCurrentRole = aud.key === roleKey || (roleKey === 'citizen' && aud.key === 'citizens');
                        return (
                          <div 
                            key={aud.key}
                            className={`p-4 rounded-xl bg-base border flex flex-col gap-2.5 transition-all ${
                              isCurrentRole 
                                ? 'border-accent-primary shadow-sm bg-accent-primary/5' 
                                : 'border-surface-raised'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-lg bg-surface-raised flex items-center justify-center ${aud.color}`}>
                                  <Icon size={16} />
                                </div>
                                <h4 className="text-sm font-bold text-primary-custom">{aud.title}</h4>
                              </div>
                              {isCurrentRole && (
                                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-accent-primary/20 text-accent-primary font-bold">
                                  Your Role
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-custom leading-relaxed">{aud.desc}</p>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}

                  {/* Tab 4: Tech Stack */}
                  {activeTab === 'tech' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="flex flex-col gap-3"
                    >
                      <div className="grid grid-cols-1 gap-2.5">
                        {techStack.map((tech, idx) => (
                          <div 
                            key={idx}
                            className="p-3.5 rounded-lg bg-base border border-surface-raised flex flex-col gap-1"
                          >
                            <div className="flex items-center gap-2">
                              <Code size={14} className="text-accent-secondary" />
                              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-accent-primary">
                                {tech.category}
                              </h4>
                            </div>
                            <p className="text-xs text-muted-custom font-mono mt-0.5">{tech.items}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Bar */}
            <div className="p-4 border-t border-surface-raised bg-surface flex items-center justify-between gap-3">
              <span className="text-xs text-muted-custom font-mono">
                {showFullDetails ? 'Viewing Platform Details' : 'Active In-Portal View'}
              </span>

              <div className="flex items-center gap-2">
                {showFullDetails && (
                  <button
                    onClick={() => setShowFullDetails(false)}
                    className="px-3.5 py-2 rounded-lg bg-surface-raised hover:bg-surface-raised/80 text-primary-custom text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <ArrowLeft size={14} />
                    <span>Summary</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-accent-primary text-on-accent text-xs font-semibold hover:bg-accent-primary/90 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <LayoutDashboard size={14} />
                  <span>Return to Dashboard</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

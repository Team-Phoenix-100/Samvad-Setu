import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BadgeCheck, 
  ShieldCheck, 
  Download, 
  ArrowRight, 
  Store, 
  Smartphone, 
  QrCode, 
  CloudOff, 
  Mic, 
  GitMerge, 
  Cpu, 
  EyeOff, 
  Lock,
  X,
  LockKeyhole,
  CheckCircle2,
  FileDigit
} from 'lucide-react';

export default function DownloadApp() {
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 25 }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9,
      transition: { duration: 0.2 }
    }
  };

  return (
    <main className="w-full pt-10 bg-base min-h-screen text-primary-custom relative">
      {/* Fullscreen QR Code Modal */}
      <AnimatePresence>
        {isQrModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
              onClick={() => setIsQrModalOpen(false)}
            />
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative z-10 bg-white p-6 md:p-8 rounded-3xl shadow-2xl max-w-sm w-full flex flex-col items-center"
            >
              <button 
                onClick={() => setIsQrModalOpen(false)}
                className="absolute -top-12 right-0 md:-right-12 w-10 h-10 bg-surface/50 hover:bg-surface text-primary-custom rounded-full flex items-center justify-center transition-colors border border-surface-raised backdrop-blur-sm"
              >
                <X size={24} />
              </button>
              
              <div className="w-full flex items-center justify-center gap-2 mb-6">
                <QrCode size={20} className="text-accent-primary" />
                <span className="font-semibold text-gray-800 text-lg font-display">Scan to Install</span>
              </div>
              
              <div className="w-full aspect-square relative rounded-xl overflow-hidden bg-gray-50 border border-gray-100 p-2">
                <img 
                  alt="Direct APK Download QR Code badge" 
                  className="w-full h-full object-contain" 
                  src="/qr-code.png"
                />
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[3px] bg-accent-secondary opacity-60 blur-[2px] pointer-events-none animate-pulse"></div>
              </div>
              
              <p className="text-gray-500 text-sm mt-6 text-center">
                Open your camera app or Google Lens to scan and download the official Android APK.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col w-full">
        {/* Subtle Ambient Glow Orbs */}
        <div className="relative w-full overflow-hidden">
          <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none bg-accent-primary/10"></div>
          <div className="absolute top-80 right-10 w-[420px] h-[420px] rounded-full blur-[120px] pointer-events-none bg-accent-secondary/10"></div>
          
          <motion.div 
            className="w-full max-w-7xl mx-auto px-6 lg:px-10 py-12"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {/* 1. Breadcrumb & Status Ribbon */}
            <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-4 mb-12">
              <div className="flex flex-wrap items-center gap-4">
                <div className="inline-flex items-center shadow-lg rounded-full gap-2 px-4 py-1.5 bg-surface border border-surface-raised">
                  <span className="w-2 h-2 rounded-full animate-ping bg-accent-primary"></span>
                  <span className="uppercase tracking-widest font-bold text-accent-primary text-xs font-mono">Official Release</span>
                  <span className="font-semibold text-muted-custom text-xs">•</span>
                  <span className="tracking-wider text-primary-custom text-xs font-mono">v1.0.0 (Stable Beta)</span>
                  <span className="font-semibold text-muted-custom text-xs">•</span>
                  <span className="flex items-center gap-1 font-semibold text-accent-secondary text-xs font-mono">
                    <BadgeCheck size={14} /> Prototype Verified
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted-custom text-xs font-mono">
                <span className="inline-block w-2 h-2 rounded-full bg-accent-secondary"></span>
                <span>Samvad-Setu Network</span>
              </div>
            </motion.div>

            {/* 2. Hero Section (Two-Column Desktop Split) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 items-start gap-12 mb-16">
              {/* Left Column: Primary Download Actions & Proposition */}
              <motion.div variants={itemVariants} className="lg:col-span-7 flex flex-col gap-8">
                
                <div className="flex flex-col gap-4 pt-2">
                  <h1 className="tracking-tight text-primary-custom text-4xl lg:text-5xl font-display font-bold leading-tight">
                    Try our Android app that's <span className="text-accent-primary">totally free</span>.
                  </h1>
                  <p className="max-w-2xl text-muted-custom pt-2 text-lg">
                    Empowering citizens to voice grievances, track resolution pipelines in real-time, and connect directly with technical engineering teams across university clusters.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 pt-4">
                  <motion.a 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative flex items-center justify-between rounded-xl transition-all duration-300 shadow-[0_0_24px_rgba(232,163,61,0.25)] hover:shadow-[0_0_36px_rgba(232,163,61,0.45)] cursor-pointer bg-accent-primary p-4 px-6 border border-accent-primary"
                    href="https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME/releases/latest/download/samvad-setu.apk"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-base/30 text-primary-custom">
                        <Download size={28} className="text-white group-hover:translate-y-0.5 transition-transform" />
                      </div>
                      <div className="flex flex-col text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xl">Download APK</span>
                        </div>
                        <span className="text-white/90 text-sm">Direct, secure download for Android</span>
                      </div>
                    </div>
                    <ArrowRight size={24} className="text-white ml-6" />
                  </motion.a>

                  <div className="flex items-center rounded-xl shadow-sm gap-4 p-4 bg-surface border border-surface-raised w-fit">
                    <div className="w-11 h-11 rounded-lg flex items-center justify-center bg-surface-raised text-muted-custom">
                      <Store size={24} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-primary-custom text-lg">Google Play</span>
                      <span className="text-accent-primary font-semibold text-sm">Coming Soon</span>
                    </div>
                  </div>
                </div>

                {/* Simplified App Details */}
                <div className="rounded-xl shadow-inner p-6 bg-surface border border-surface-raised flex flex-col gap-3">
                  <div className="flex items-center gap-3 mb-2">
                    <Smartphone size={24} className="text-accent-primary" />
                    <h3 className="text-xl font-display font-bold text-primary-custom">A Modern React Native Application</h3>
                  </div>
                  <p className="text-muted-custom text-base">
                    Samvad-Setu provides a seamless and responsive mobile experience. The prototype connects directly to our robust cloud infrastructure for live grievance tracking and AI triage.
                  </p>
                </div>

                {/* iOS Coming Soon */}
                <div className="flex items-center gap-4 rounded-xl shadow-sm border p-5 bg-surface border-surface-raised">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-surface-raised text-primary-custom shrink-0">
                    <Smartphone size={24} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-primary-custom text-lg">iOS version is coming soon.</span>
                    <span className="text-muted-custom text-sm mt-1">
                      We know you need it. It is currently under development and will be available later.
                    </span>
                  </div>
                </div>

              </motion.div>

              {/* Right Column: Scan to Install Card */}
              <motion.div variants={itemVariants} className="lg:col-span-5 flex flex-col justify-center">
                <div className="relative rounded-2xl flex flex-col items-center text-center p-8 bg-surface border border-surface-raised elevate-lg">
                  <div className="inline-flex items-center rounded-full gap-2 px-3 py-1 bg-surface-raised mb-4 border border-surface-raised">
                    <QrCode size={16} className="text-accent-primary" />
                    <span className="font-semibold text-primary-custom text-xs">Desktop-to-Mobile Fast Sync</span>
                  </div>
                  <h2 className="text-primary-custom text-3xl font-display font-bold mb-3">
                    Scan to Install on Phone
                  </h2>
                  <p className="max-w-sm text-muted-custom text-sm mb-8">
                    Point your smartphone camera or Google Lens to immediately download and install the prototype APK.
                  </p>
                  
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsQrModalOpen(true)}
                    className="relative rounded-2xl shadow-2xl bg-white p-4 mb-8 border border-surface-raised cursor-pointer group focus:outline-none focus:ring-4 focus:ring-accent-primary/50"
                  >
                    <img alt="Direct APK Download QR Code" className="w-56 h-56 object-contain rounded-lg group-hover:opacity-90 transition-opacity" src="/qr-code.png"/>
                    <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-[2px] opacity-40 blur-[1px] pointer-events-none animate-pulse bg-accent-secondary"></div>
                    
                    <div className="absolute inset-0 bg-black/5 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white/90 backdrop-blur text-gray-800 px-4 py-2 rounded-full font-semibold text-sm shadow-lg flex items-center gap-2">
                        <QrCode size={16} /> Enlarge QR
                      </div>
                    </div>
                  </motion.button>
                  
                  <div className="w-full flex items-center justify-center rounded-xl gap-2 px-4 py-3 bg-base border border-surface-raised">
                    <ShieldCheck size={18} className="text-accent-secondary" />
                    <span className="text-primary-custom text-sm font-semibold">
                      Secure Official Prototype
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* 3. Simple Installation Guide */}
            <motion.div variants={itemVariants} className="w-full flex flex-col gap-8 mb-16 pt-10 border-t border-surface-raised">
              <div className="flex flex-col gap-2 text-center items-center justify-center">
                <span className="uppercase tracking-widest font-semibold text-accent-primary text-xs font-mono">
                  EASY ONBOARDING
                </span>
                <h2 className="tracking-tight text-primary-custom text-3xl font-display font-bold">
                  How to Install the App
                </h2>
                <p className="text-muted-custom text-base max-w-lg mt-2">
                  Follow these simple steps to get Samvad-Setu running on your Android device in under two minutes.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                {[
                  { step: 1, title: 'Download APK', desc: 'Click the download button above or scan the QR code to fetch the application package.' },
                  { step: 2, title: 'Allow Installation', desc: 'If prompted by your device, permit installation from unknown sources in your settings.' },
                  { step: 3, title: 'Launch & Login', desc: 'Open the app, sign in with your citizen or institution credentials, and begin.' }
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center p-6 bg-surface border border-surface-raised rounded-2xl shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-surface-raised text-accent-primary flex items-center justify-center text-xl font-bold font-display mb-4">
                      {item.step}
                    </div>
                    <h3 className="text-lg font-bold text-primary-custom mb-2">{item.title}</h3>
                    <p className="text-muted-custom text-sm leading-relaxed">{item.desc}</p>
                    {/* Placeholder blank area for future screenshots */}
                    <div className="w-full h-40 bg-base border border-surface-raised rounded-lg mt-6 flex items-center justify-center opacity-50">
                      <span className="text-muted-custom text-xs font-mono">Screenshot Placeholder</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* 4. Security & Privacy */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 items-start gap-12 pb-16 pt-10 border-t border-surface-raised">
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-2">
                  <span className="uppercase tracking-wider font-semibold text-accent-secondary text-xs font-mono">
                    PLATFORM INTEGRITY
                  </span>
                  <h2 className="tracking-tight text-primary-custom text-3xl font-display font-bold">
                    Citizen Privacy First
                  </h2>
                  <p className="text-muted-custom text-base pt-2">
                    Samvad-Setu operates with basic privacy principles to ensure your data is safe and your civic reporting is secure.
                  </p>
                </div>
                
                <div className="flex flex-col gap-4">
                  <div className="rounded-xl flex items-start gap-4 p-5 bg-surface border border-surface-raised shadow-sm">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 bg-surface-raised text-accent-secondary">
                      <EyeOff size={24} />
                    </div>
                    <div className="flex flex-col">
                      <h4 className="font-semibold text-primary-custom text-lg">No Commercial Trackers</h4>
                      <p className="pt-1 text-muted-custom text-sm">
                        We do not use advertising identifiers or commercial tracking.
                      </p>
                    </div>
                  </div>
                  <div className="rounded-xl flex items-start gap-4 p-5 bg-surface border border-surface-raised shadow-sm">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 bg-surface-raised text-accent-primary">
                      <Lock size={24} />
                    </div>
                    <div className="flex flex-col">
                      <h4 className="font-semibold text-primary-custom text-lg">Minimal Scoped Permissions</h4>
                      <p className="pt-1 text-muted-custom text-sm">
                        Camera and GPS modules are only used when you explicitly log a grievance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-2">
                  <span className="uppercase tracking-wider font-semibold text-accent-primary text-xs font-mono">
                    TRUST & TRANSPARENCY
                  </span>
                  <h2 className="tracking-tight text-primary-custom text-3xl font-display font-bold">
                    A Platform You Can Trust
                  </h2>
                  <p className="text-muted-custom text-base pt-2">
                    Our prototype provides clear, verifiable channels between citizens and institutions.
                  </p>
                </div>
                
                <div className="flex flex-col gap-4">
                  <div className="rounded-xl flex items-start gap-4 p-5 bg-surface border border-surface-raised shadow-sm">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 bg-surface-raised text-accent-primary">
                      <LockKeyhole size={24} />
                    </div>
                    <div className="flex flex-col">
                      <h4 className="font-semibold text-primary-custom text-lg">End-to-End Security</h4>
                      <p className="pt-1 text-muted-custom text-sm">
                        All citizen reports and media uploads are securely transmitted to our backend architecture.
                      </p>
                    </div>
                  </div>
                  <div className="rounded-xl flex items-start gap-4 p-5 bg-surface border border-surface-raised shadow-sm">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 bg-surface-raised text-accent-secondary">
                      <CheckCircle2 size={24} />
                    </div>
                    <div className="flex flex-col">
                      <h4 className="font-semibold text-primary-custom text-lg">Transparent Tracking</h4>
                      <p className="pt-1 text-muted-custom text-sm">
                        Every issue logged can be tracked live on the public dashboard, providing complete transparency into the resolution process.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

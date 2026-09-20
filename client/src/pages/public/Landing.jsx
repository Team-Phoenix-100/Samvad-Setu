import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, GraduationCap, Building2, ArrowRight, MapPin, Activity, ShieldCheck, WifiOff, Mic } from 'lucide-react';
import SignalDot from '../../components/ui/SignalDot';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import RoleCard from '../../components/ui/RoleCard';
import StatCard from '../../components/ui/StatCard';
import ProcessCard from '../../components/ui/ProcessCard';

export default function Landing() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="bg-base text-primary-custom min-h-screen font-sans selection:bg-[#E8A33D]/30 selection:text-primary-custom flex flex-col">
      
      {/* Background gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#2F9E8F]/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#E8A33D]/5 blur-[120px]" />
      </div>

      <main className="flex-1 w-full relative z-10">
        
        {/* HERO SECTION */}
        <section className="relative px-6 py-20 md:py-32 flex items-center justify-center border-b border-surface-raised overflow-hidden">
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiMxRDMyMzgiLz48L3N2Zz4=')] opacity-30" />
          
          <motion.div 
            className="max-w-4xl mx-auto text-center space-y-8 relative z-10"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="flex justify-center">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-surface/80 backdrop-blur-sm border border-surface-raised elevate-sm">
                <SignalDot status="unresolved" size="sm" />
                <span className="text-xs font-mono font-semibold text-accent-primary uppercase tracking-wider">Citizen Signal Network</span>
              </div>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl md:text-7xl font-bold font-display leading-[1.1] text-primary-custom">
              Every local problem is a <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]">signal waiting to be resolved.</span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-muted-custom text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
              We connect real citizen grievances in Jharkhand directly with university technical teams and industry CSR sponsors to build and fund real-world solutions.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link to="/citizen/submit" className="w-full sm:w-auto">
                <Button variant="primary" className="w-full sm:w-auto text-base px-8 py-3.5 rounded-xl font-bold elevate-lg hover:opacity-90 transition-all group">
                  <span className="flex items-center justify-center gap-2 group-hover:gap-3 transition-all">
                    Report a Problem <ArrowRight size={18} />
                  </span>
                </Button>
              </Link>
              <Link to="/signup" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto text-base px-8 py-3.5 rounded-xl font-bold border-surface-raised hover:bg-surface">
                  Register Institution / Industry
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* THE PROBLEM SECTION */}
        <section className="px-6 py-20 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center space-y-6"
          >
            <h2 className="text-sm font-mono text-accent-urgent uppercase tracking-widest font-bold">The Disconnect</h2>
            <p className="text-2xl md:text-3xl font-display leading-tight text-primary-custom">
              Thousands of real local problems get reported every year—contaminated water, mining-subsidence cracks, failing infrastructure—but there's no channel connecting them to the <span className="text-accent-secondary font-bold">447+ universities and research institutes</span> in Jharkhand who could actually solve them. Until now.
            </p>
          </motion.div>
        </section>

        {/* STATS STRIP */}
        <section className="px-6 pb-20 max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-2 bg-surface/40 backdrop-blur-sm rounded-2xl border border-surface-raised elevate-sm">
            <StatCard title="Problems Reported" value="1,248" colorClass="text-accent-primary" delay={0.1} />
            <StatCard title="Resolved Projects" value="892" colorClass="text-accent-secondary" delay={0.2} />
            <StatCard title="Active HEIs" value="42" colorClass="text-primary-custom" delay={0.3} />
            <StatCard title="Districts Active" value="24" colorClass="text-primary-custom" delay={0.4} />
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="px-6 py-24 bg-surface/20 border-y border-surface-raised">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold font-display">How Samvad Setu Works</h2>
              <p className="text-muted-custom max-w-xl mx-auto">A transparent, end-to-end pipeline from an early warning signal to a funded, deployed solution.</p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 pl-4 sm:pl-0">
              <ProcessCard 
                number="01." 
                title="Citizen Uploads" 
                description="Citizens report issues via photos, voice notes, or text. Offline-first and multilingual."
                delay={0.1}
              />
              <ProcessCard 
                number="02." 
                title="AI Categorizes" 
                description="Our engine routes the problem to the exact domain, assesses urgency, and finds nearby HEIs."
                delay={0.2}
              />
              <ProcessCard 
                number="03." 
                title="University Claims" 
                description="Faculty mentors claim matched problems and assign student teams to design a prototype."
                delay={0.3}
              />
              <ProcessCard 
                number="04." 
                title="Deployed Solution" 
                description="Industry sponsors fund the validated prototypes. The solution is built and deployed locally."
                delay={0.4}
              />
            </div>
          </div>
        </section>

        {/* ROLE CARDS */}
        <section className="px-6 py-24 max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold font-display">Select Your Role Entry</h2>
            <p className="text-muted-custom max-w-xl mx-auto">Join the ecosystem tailored to your specific capabilities.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <RoleCard 
              icon={Users}
              title="I am a Citizen"
              description="Report civic or infrastructure issues with geolocation and track the resolution transparently."
              linkText="Submit Report"
              linkTo="/signup?role=citizen"
              colorClass="text-accent-primary"
              delay={0.1}
            />
            <RoleCard 
              icon={GraduationCap}
              title="I represent a University"
              description="Claim AI-matched problem statements, assemble student teams, and build real prototypes for NEP 2020 credits."
              linkText="Claim Problems"
              linkTo="/signup?role=university"
              colorClass="text-accent-secondary"
              delay={0.2}
            />
            <RoleCard 
              icon={Building2}
              title="I represent Industry / CSR"
              description="Pledge funding, mentorship, or prototyping resources to verified college projects with auto-generated compliance reports."
              linkText="Fund Projects"
              linkTo="/signup?role=industry"
              colorClass="text-accent-primary"
              delay={0.3}
            />
          </div>
        </section>

        {/* MULTILINGUAL & LOW CONNECTIVITY */}
        <section className="px-6 py-24 bg-surface/30 border-y border-surface-raised">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold font-display">Built for every corner of Jharkhand.</h2>
              <p className="text-muted-custom text-lg leading-relaxed">
                We understand that the most critical problems often occur in areas with the lowest connectivity and literacy.
              </p>
              <ul className="space-y-4 pt-2">
                <li className="flex items-start gap-3">
                  <div className="mt-1 p-1.5 bg-surface-raised rounded-md text-accent-secondary"><Mic size={16} /></div>
                  <div>
                    <h4 className="font-bold text-primary-custom">Voice-First Intake</h4>
                    <p className="text-sm text-muted-custom">Report issues by simply speaking in Hindi, Santali, or English.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 p-1.5 bg-surface-raised rounded-md text-accent-primary"><WifiOff size={16} /></div>
                  <div>
                    <h4 className="font-bold text-primary-custom">Offline-First Architecture</h4>
                    <p className="text-sm text-muted-custom">Take a photo and log the issue; the app syncs automatically when you hit a network zone.</p>
                  </div>
                </li>
              </ul>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-square max-w-md mx-auto rounded-full border border-surface-raised bg-surface flex items-center justify-center relative overflow-hidden elevate-lg">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(47,158,143,0.1)_0%,transparent_70%)]" />
                <div className="space-y-6 text-center z-10 p-8">
                   <SignalDot status="unresolved" size="lg" className="mx-auto" />
                   <p className="font-mono text-xs text-accent-primary tracking-widest uppercase">Panchayat Kiosk Ready</p>
                </div>
                {/* Decorative rings */}
                <div className="absolute inset-4 border border-surface-raised/50 rounded-full" />
                <div className="absolute inset-12 border border-surface-raised/30 rounded-full" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* COMPARISON */}
        <section className="px-6 py-24 max-w-4xl mx-auto text-center space-y-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h2 className="text-3xl font-bold font-display">Why Samvad Setu?</h2>
            <p className="text-muted-custom text-lg leading-relaxed">
              SACHET tells you a disaster is coming. Bhuvan shows you where it might happen. Swachhata-MoHUA sends someone to clean up a single-domain issue. 
            </p>
            <p className="text-primary-custom text-xl font-medium pt-4">
              Samvad Setu is the only platform that turns an early warning sign into a funded, expert-led project that prevents the problem from becoming a disaster in the first place.
            </p>
          </motion.div>
        </section>

      </main>
    </div>
  );
}
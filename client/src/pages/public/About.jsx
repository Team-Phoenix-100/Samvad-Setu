import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Users, Building2, Briefcase, ShieldCheck, 
  Map, Activity, Code, Database, Globe, Network, Cpu, ArrowRight 
} from 'lucide-react';

export default function About() {
  const { t } = useTranslation('about');

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <main className="w-full bg-base min-h-screen text-primary-custom overflow-hidden">
      {/* Hero Section */}
      <section className="relative w-full pt-20 pb-16 px-6 lg:px-10 flex flex-col items-center text-center">
        <div className="absolute top-10 left-1/4 w-[400px] h-[400px] rounded-full blur-[120px] bg-accent-primary/10 pointer-events-none"></div>
        <div className="absolute bottom-10 right-1/4 w-[300px] h-[300px] rounded-full blur-[100px] bg-accent-secondary/10 pointer-events-none"></div>
        
        <motion.div 
          className="relative z-10 max-w-4xl flex flex-col items-center gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="px-4 py-1.5 rounded-full bg-surface-raised border border-surface-raised text-accent-primary text-sm font-bold tracking-widest uppercase font-mono">
            {t('hero.tagline')}
          </span>
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight">
            {t('hero.title')}
          </h1>
          <p className="text-xl text-muted-custom mt-4 leading-relaxed max-w-3xl">
            {t('hero.description')}
          </p>
        </motion.div>
      </section>

      {/* The Problem */}
      <section className="w-full py-16 px-6 lg:px-10 bg-surface border-y border-surface-raised">
        <motion.div 
          className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12 items-start"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <motion.div variants={itemVariants} className="md:w-1/3">
            <h2 className="text-3xl font-display font-bold text-primary-custom">{t('problem.title')}</h2>
            <div className="w-20 h-1 bg-accent-urgent mt-4 rounded-full"></div>
          </motion.div>
          <motion.div variants={itemVariants} className="md:w-2/3 flex flex-col gap-6 text-lg text-muted-custom">
            <p>{t('problem.p1')}</p>
            <p>{t('problem.p2')}</p>
            <p className="font-semibold text-primary-custom">{t('problem.p3')}</p>
          </motion.div>
        </motion.div>
      </section>

      {/* Our Solution (5-card grid) */}
      <section className="w-full py-20 px-6 lg:px-10">
        <motion.div 
          className="max-w-7xl mx-auto flex flex-col gap-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <motion.h2 variants={itemVariants} className="text-4xl font-display font-bold text-center">
            {t('solution.title')}
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {t('solution.pillars', { returnObjects: true }).map((pillar, idx) => (
              <motion.div 
                key={idx} 
                variants={itemVariants} 
                className="card-premium p-8 flex flex-col gap-4 elevate-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-surface-raised text-accent-secondary flex items-center justify-center">
                  {[<Users />, <Map />, <Cpu />, <Briefcase />, <Activity />][idx % 5]}
                </div>
                <h3 className="text-xl font-bold text-primary-custom">{pillar.title}</h3>
                <p className="text-muted-custom leading-relaxed">{pillar.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* How It Works (Flow) */}
      <section className="w-full py-20 px-6 lg:px-10 bg-surface border-y border-surface-raised">
        <motion.div 
          className="max-w-7xl mx-auto flex flex-col gap-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <motion.h2 variants={itemVariants} className="text-3xl font-display font-bold text-center">
            {t('howItWorks.title')}
          </motion.h2>
          
          {/* Horizontal Step Diagram */}
          <div className="flex flex-col lg:flex-row items-stretch justify-between gap-4 mt-8">
            {t('howItWorks.steps', { returnObjects: true }).map((step, idx) => (
              <React.Fragment key={idx}>
                <motion.div variants={itemVariants} className="flex-1 card-premium p-5 text-center flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent-primary text-on-accent font-bold flex items-center justify-center">
                    {idx + 1}
                  </div>
                  <p className="text-sm font-medium">{step}</p>
                </motion.div>
                {idx < 4 && (
                  <div className="hidden lg:flex items-center justify-center text-muted-custom">
                    <ArrowRight size={24} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          <motion.div variants={itemVariants} className="mt-6 p-6 rounded-2xl bg-surface-raised border border-border-color border-l-4 border-l-accent-secondary">
            <p className="text-base text-muted-custom font-mono">
              <strong className="text-primary-custom font-sans">Example Flow: </strong> 
              {t('howItWorks.example')}
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Pipelines */}
      <section className="w-full py-20 px-6 lg:px-10">
        <motion.div 
          className="max-w-7xl mx-auto flex flex-col gap-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <motion.h2 variants={itemVariants} className="text-3xl font-display font-bold text-center">
            {t('pipelines.title')}
          </motion.h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div variants={itemVariants} className="card-premium p-8 flex flex-col gap-6 border-t-4 border-t-accent-secondary">
              <h3 className="text-2xl font-bold flex items-center gap-3">
                <Network className="text-accent-secondary" /> {t('pipelines.rnd.title')}
              </h3>
              <div className="flex flex-col gap-3">
                {t('pipelines.rnd.flow').split(' → ').map((step, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-muted-custom">
                    <div className="w-2 h-2 rounded-full bg-accent-secondary shrink-0"></div>
                    <span className="text-sm font-medium">{step}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="card-premium p-8 flex flex-col gap-6 border-t-4 border-t-[#9B4F96]">
              <h3 className="text-2xl font-bold flex items-center gap-3">
                <Briefcase className="text-[#9B4F96]" /> {t('pipelines.csr.title')}
              </h3>
              <div className="flex flex-col gap-3">
                {t('pipelines.csr.flow').split(' → ').map((step, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-muted-custom">
                    <div className="w-2 h-2 rounded-full bg-[#9B4F96] shrink-0"></div>
                    <span className="text-sm font-medium">{step}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* 4 Audiences */}
      <section className="w-full py-20 px-6 lg:px-10 bg-surface border-y border-surface-raised">
        <motion.div 
          className="max-w-7xl mx-auto flex flex-col gap-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <motion.h2 variants={itemVariants} className="text-3xl font-display font-bold text-center">
            {t('audiences.title')}
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {t('audiences.cards', { returnObjects: true }).map((card, idx) => {
              const icons = [<Users />, <Building2 />, <Briefcase />, <ShieldCheck />];
              const colors = ['text-accent-secondary', 'text-accent-primary', 'text-[#9B4F96]', 'text-accent-urgent'];
              const borders = ['border-l-accent-secondary', 'border-l-accent-primary', 'border-l-[#9B4F96]', 'border-l-accent-urgent'];
              return (
                <motion.div key={idx} variants={itemVariants} className={`card-premium p-6 flex items-start gap-4 border-l-4 ${borders[idx]}`}>
                  <div className={`w-12 h-12 shrink-0 rounded-lg bg-surface-raised flex items-center justify-center ${colors[idx]}`}>
                    {icons[idx]}
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-bold text-primary-custom">{card.title}</h3>
                    <p className="text-muted-custom">{card.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Tech Stack */}
      <section className="w-full py-20 px-6 lg:px-10">
        <motion.div 
          className="max-w-7xl mx-auto flex flex-col gap-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <motion.h2 variants={itemVariants} className="text-3xl font-display font-bold text-center">
            {t('techStack.title')}
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {t('techStack.categories', { returnObjects: true }).map((cat, idx) => (
              <motion.div key={idx} variants={itemVariants} className="card-premium p-5 flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-2">
                  <Code size={18} className="text-accent-secondary" />
                  <h4 className="font-bold text-primary-custom uppercase tracking-wider text-xs font-mono">{cat.name}</h4>
                </div>
                <p className="text-sm text-muted-custom">{cat.items}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Comparison Table */}
      <section className="w-full py-20 px-6 lg:px-10 bg-surface border-y border-surface-raised">
        <motion.div 
          className="max-w-4xl mx-auto flex flex-col gap-8 text-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <motion.h2 variants={itemVariants} className="text-3xl font-display font-bold">
            {t('comparison.title')}
          </motion.h2>
          <motion.div variants={itemVariants} className="card-premium p-8 text-left border border-accent-primary/50 shadow-[0_0_20px_rgba(232,163,61,0.1)]">
            <p className="text-lg text-primary-custom leading-relaxed">
              {t('comparison.desc')}
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Impact & Team */}
      <section className="w-full py-20 px-6 lg:px-10">
        <motion.div 
          className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {/* Impact */}
          <div className="flex flex-col gap-8">
            <motion.h2 variants={itemVariants} className="text-3xl font-display font-bold">
              {t('impact.title')}
            </motion.h2>
            <div className="flex flex-col gap-4">
              {t('impact.items', { returnObjects: true }).map((item, idx) => (
                <motion.div key={idx} variants={itemVariants} className="flex gap-4 items-start">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-accent-secondary/20 text-accent-secondary flex items-center justify-center font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-primary-custom text-lg">{item.title}</h4>
                    <p className="text-muted-custom">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Team */}
          <div className="flex flex-col gap-8">
            <motion.h2 variants={itemVariants} className="text-3xl font-display font-bold">
              {t('team.title')}
            </motion.h2>
            <motion.div variants={itemVariants} className="card-premium p-8 bg-gradient-to-br from-surface to-surface-raised flex flex-col gap-4">
              <h3 className="text-xl font-bold text-accent-primary">{t('team.subtitle')}</h3>
              <p className="text-muted-custom leading-relaxed">
                {t('team.details')}
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Footer CTA */}
      <footer className="w-full py-16 px-6 bg-surface border-t border-surface-raised text-center flex flex-col items-center justify-center gap-6">
        <p className="max-w-2xl text-muted-custom text-sm">
          {t('footer.status')}
        </p>
        <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent-primary text-on-accent font-bold hover:bg-accent-primary/90 transition-colors shadow-lg">
          {t('footer.cta')} <ArrowRight size={20} />
        </Link>
      </footer>
    </main>
  );
}

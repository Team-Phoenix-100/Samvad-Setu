import React from 'react';
import { motion, useInView } from 'framer-motion';

export default function ProcessCard({ number, title, description, delay = 0 }) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
      transition={{ duration: 0.5, delay }}
      className="space-y-3 relative"
    >
      <div className="absolute -left-4 top-0 w-1 h-full bg-surface-raised rounded-full hidden sm:block overflow-hidden">
        <motion.div 
          initial={{ height: 0 }}
          animate={isInView ? { height: '100%' } : { height: 0 }}
          transition={{ duration: 0.8, delay: delay + 0.2 }}
          className="w-full bg-[var(--accent-primary)]"
        />
      </div>
      <span className="font-mono text-sm font-bold text-accent-primary block">{number}</span>
      <h4 className="font-bold font-display text-lg text-primary-custom">{title}</h4>
      <p className="text-sm text-muted-custom leading-relaxed">{description}</p>
    </motion.div>
  );
}

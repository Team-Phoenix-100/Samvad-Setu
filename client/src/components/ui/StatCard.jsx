import React, { useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';

export default function StatCard({ title, value, colorClass, delay = 0 }) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, delay }}
      className="space-y-1 text-center md:text-left p-4"
    >
      <p className="text-xs font-mono text-muted-custom uppercase tracking-wider">{title}</p>
      <p className={`text-4xl font-bold font-display ${colorClass}`}>
        {value}
      </p>
    </motion.div>
  );
}

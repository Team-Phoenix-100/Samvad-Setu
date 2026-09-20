import React from 'react';

export default function Badge({ status }) {
  const styles = {
    new: 'bg-[#E8A33D]/15 text-accent-primary border-[#E8A33D]/30',
    routed: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    'in-progress': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    resolved: 'bg-[#2F9E8F]/15 text-accent-secondary border-[#2F9E8F]/30',
    urgent: 'bg-[#C1443B]/15 text-accent-urgent border-[#C1443B]/30',
  };

  const label = status?.replace('-', ' ').toUpperCase() || 'NEW';

  return (
    <span className={`px-2.5 py-1 text-xs font-mono font-medium rounded-full border ${styles[status] || styles.new}`}>
      {label}
    </span>
  );
}
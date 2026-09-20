import React from 'react';
import { Link } from 'react-router-dom';
import Card from './Card';

export default function RoleCard({ icon: Icon, title, description, linkText, linkTo, colorClass, borderHoverClass, delay }) {
  return (
    <Card delay={delay} variant="solid" className="p-6 group">
      <div className="space-y-4">
        <div className={`p-3 bg-surface-raised w-fit rounded-lg ${colorClass} transition-transform group-hover:scale-110`}>
          <Icon size={24} />
        </div>
        <h3 className="text-xl font-bold font-display text-primary-custom">{title}</h3>
        <p className="text-sm text-muted-custom leading-relaxed">{description}</p>
        <Link to={linkTo} className={`inline-block text-sm font-semibold ${colorClass} hover:underline`}>
          {linkText} &rarr;
        </Link>
      </div>
    </Card>
  );
}

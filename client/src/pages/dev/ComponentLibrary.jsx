import React from 'react';
import SignalDot from '../../components/ui/SignalDot';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function ComponentLibrary() {
  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto bg-base text-primary-custom">
      <h1 className="text-3xl font-bold border-b border-surface-raised pb-4">
        SICP Design System Preview
      </h1>

      {/* Signal Dot Demonstration */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-accent-primary">0.1 Signal Dot Motif</h2>
        <div className="flex gap-6 items-center p-4 bg-surface rounded-lg border border-surface-raised">
          <div className="flex items-center gap-2">
            <SignalDot status="unresolved" />
            <span className="text-sm">Unresolved / Pulsing</span>
          </div>
          <div className="flex items-center gap-2">
            <SignalDot status="resolved" />
            <span className="text-sm">Resolved</span>
          </div>
        </div>
      </section>

      {/* Status Badges */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-accent-primary">Status Badges</h2>
        <div className="flex gap-3 p-4 bg-surface rounded-lg border border-surface-raised">
          <Badge status="new" />
          <Badge status="routed" />
          <Badge status="in-progress" />
          <Badge status="resolved" />
          <Badge status="urgent" />
        </div>
      </section>

      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-accent-primary">Buttons</h2>
        <div className="flex gap-4 p-4 bg-surface rounded-lg border border-surface-raised">
          <Button variant="primary">Primary CTA</Button>
          <Button variant="secondary">Secondary Action</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="danger">Urgent Action</Button>
        </div>
      </section>
    </div>
  );
}
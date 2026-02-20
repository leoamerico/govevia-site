import { ReactNode } from 'react';

interface DecisionBadgeProps {
  children: ReactNode;
}

export function DecisionBadge({ children }: DecisionBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-950/50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-300">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
      {children}
    </span>
  );
}

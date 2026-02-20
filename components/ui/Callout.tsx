import { ReactNode } from 'react';

type CalloutType = 'info' | 'decision';

interface CalloutProps {
  type: CalloutType;
  children: ReactNode;
}

const styles: Record<CalloutType, { wrapper: string; icon: string }> = {
  info: {
    wrapper: 'border-l-4 border-blue-500 bg-blue-950/40 text-blue-100',
    icon: 'ℹ',
  },
  decision: {
    wrapper: 'border-l-4 border-amber-500 bg-amber-950/40 text-amber-100',
    icon: '⚖',
  },
};

export function Callout({ type, children }: CalloutProps) {
  const { wrapper, icon } = styles[type];
  return (
    <div className={`my-6 flex gap-3 rounded-r-lg p-4 text-sm leading-relaxed ${wrapper}`}>
      <span className="mt-0.5 shrink-0 text-base" aria-hidden="true">{icon}</span>
      <div>{children}</div>
    </div>
  );
}

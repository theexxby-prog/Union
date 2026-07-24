// The ONLY pill-shaped status in the app. Exactly four states — a closed set
// (docs/02). Nothing else renders a status pill.
import type { StatusState } from '@/data/types';

const STATES: Record<StatusState, string> = {
  good: 'text-good-fg bg-good-bg',
  needsYou: 'text-need-fg bg-need-bg',
  action: 'text-act-fg bg-act-bg',
  neutral: 'text-neu-fg bg-neu-bg',
};

export default function StatusPill({
  state,
  children,
}: {
  state: StatusState;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-[10px] py-[3px] text-[11px] font-semibold ${STATES[state]}`}
    >
      {children}
    </span>
  );
}

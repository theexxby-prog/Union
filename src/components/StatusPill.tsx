// The ONLY pill-shaped status in the app. Exactly four states — a closed set
// (docs/02). Nothing else renders a status pill.
import type { StatusState } from '@/data/types';

const STATES: Record<StatusState, string> = {
  good: 'text-good-fg bg-good-bg',
  needsYou: 'text-need-fg bg-need-bg',
  action: 'text-act-fg bg-act-bg',
  neutral: 'text-neu-fg bg-neu-bg',
};

/** Text-only colours for the quiet variant — same closed set, no chip. */
const QUIET: Record<StatusState, string> = {
  good: 'text-good-fg',
  needsYou: 'text-need-fg',
  action: 'text-act-fg',
  neutral: 'text-muted',
};

export default function StatusPill({
  state,
  quiet = false,
  children,
}: {
  state: StatusState;
  /** Drops the chip and keeps the colour. For the EXPECTED state in a dense
   *  table: five identical "Delivered" chips make the one exception harder to
   *  find, not easier. The exception keeps its chip and wins the column. */
  quiet?: boolean;
  children: React.ReactNode;
}) {
  if (quiet) {
    return <span className={`whitespace-nowrap text-[13.5px] ${QUIET[state]}`}>{children}</span>;
  }
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-[13px] py-[5px] text-[12.5px] font-semibold ${STATES[state]}`}
    >
      {children}
    </span>
  );
}

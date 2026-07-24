// Shared campaign presentation helpers (used by Leads + Overview).
import { int, pct } from '@/data/format';
import type { Campaign, StatusState } from '@/data/types';

/** Client-facing campaign status → one of the four pill states + its label. */
export const campaignStatusMeta: Record<Campaign['status'], { state: StatusState; label: string }> = {
  active: { state: 'neutral', label: 'Active' },
  completed: { state: 'good', label: 'Completed' },
  pendingApproval: { state: 'needsYou', label: 'Awaiting approval' },
};

/** Effective status once session-local approvals are applied (demo interaction). */
export const effectiveStatus = (c: Campaign, approved: boolean): Campaign['status'] =>
  c.status === 'pendingApproval' && approved ? 'active' : c.status;

/** Accept rate for a single campaign; an em dash before any leads are delivered. */
export const campaignAccept = (c: Campaign): string =>
  c.delivered > 0 ? pct(c.accepted, c.delivered) : '—';

/** "Monday & Thursday · 34/drop" */
export const cadenceLine = (c: Campaign): string =>
  `${c.deliveryDays.join(' & ')} · ${int(c.leadsPerDelivery)}/drop`;

// Shared campaign presentation helpers (used by Leads + Overview).
import { int, pct } from '@/data/format';
import type { Campaign, DraftCampaign, StatusState } from '@/data/types';

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

/** A campaign created in ops, shaped for the client-facing rows.
 *
 *  It carries nothing yet: no leads accepted, none delivered, no drops. That is
 *  the point — a pending campaign contributes to no programme total until the
 *  client approves it, which is why `leadsSummary` is deliberately untouched. */
export const draftToCampaign = (d: DraftCampaign): Campaign => ({
  id: d.id,
  name: d.name,
  geo: d.geo,
  accepted: 0,
  target: d.target,
  delivered: 0,
  status: 'pendingApproval',
  budget: d.budget,
  startDate: d.startDate,
  endDate: d.endDate,
  deliveryDays: d.cadence.split(' & '),
  leadsPerDelivery: d.perDrop,
  schedule: [],
});

/** Every campaign the client should see: the fixtures, plus anything ops has
 *  created for them this session. */
export const campaignsWithDrafts = (
  accountId: string,
  campaigns: Campaign[],
  drafts: readonly DraftCampaign[],
): Campaign[] => [
  ...campaigns,
  ...drafts.filter((d) => d.accountId === accountId).map(draftToCampaign),
];

// Union — domain types.
// The card grammar (docs/01) means every service answers the same four questions
// in the same shape. The types below encode that, plus the workflow-shaped
// objects (documents, invoices) that are deliberately NOT campaign-shaped.

export type ServiceId = 'idata' | 'cleanrich' | 'programmatic' | 'leads';

/** The closed set of four status states (docs/02). Never invent a fifth. */
export type StatusState = 'good' | 'needsYou' | 'action' | 'neutral';

/** Which top-level tab a screen sits under. */
export type ScreenKey =
  | 'overview'
  | 'data'
  | 'media'
  | 'leads'
  | 'documents'
  | 'invoices'
  | 'support';

export interface HeroAction {
  label: string;
  /** Exactly one 'cta' (red) per hero, and only when there is something to act on. */
  kind: 'cta' | 'pill';
}

export interface Hero {
  eyebrow: string;
  headline: string;
  subhead: string;
  actions: HeroAction[];
}

/** A service as rendered on the Overview card and Data screen. */
export interface Service {
  id: ServiceId;
  name: string;
  /** e.g. 'records delivered' — completes "of {target} {unit}". */
  unit: string;
  received: number;
  target: number;
  /** Overrides the big number when the unit is not the pacing basis (e.g. '2.1M'). */
  headline?: string;
  /** Replaces "of {target} {unit}" when spend, not volume, is the basis. */
  subline?: string;
  /** Pre-formatted, e.g. "Field fill 94% · Match 71%". Single source, no drift. */
  qualityLine: string;
  /** When present, the status pill replaces the percentage in the card's top-right. */
  status?: StatusState;
  statusLabel?: string;
  /** Leads-only: total sent (vs `received`, which is billable). */
  delivered?: number;
  /** Leads-only. */
  costPerLead?: number;
}

export interface MetricTile {
  label: string;
  value: string;
  /** Renders in the positive/teal colour (e.g. accept rate). */
  positive?: boolean;
}

/** Client-facing campaign state. Internal pipeline stages never surface (docs/02). */
export type CampaignStatus = 'active' | 'completed' | 'pendingApproval';

/** One dated lead drop on a campaign's delivery cadence. */
export interface DeliveryDrop {
  /** Display date, e.g. '20 Jan'. */
  date: string;
  /** Sort key (e.g. 20260120) — deterministic ordering without Date parsing. */
  sortKey: number;
  leads: number;
  status: 'delivered' | 'upcoming';
}

/** A drop merged across all of an account's campaigns, for the Leads schedule view. */
export interface DeliveryTimelineEntry {
  date: string;
  sortKey: number;
  campaign: string;
  geo: string;
  leads: number;
  status: 'delivered' | 'upcoming';
}

export interface Campaign {
  id: string;
  name: string;
  geo: string;
  accepted: number;
  target: number;
  delivered: number;
  status: CampaignStatus;
  /** Contracted budget in whole dollars. */
  budget: number;
  startDate: string; // 'Jan 15, 2026'
  endDate: string;
  /** Cadence: which weekdays leads land, and how many per drop. */
  deliveryDays: string[]; // ['Monday', 'Thursday']
  leadsPerDelivery: number;
  /** Dated drops; delivered drops sum to `delivered` (enforced by the verifier). */
  schedule: DeliveryDrop[];
}

export interface Lead {
  id: string;
  name: string;
  title: string;
  company: string;
  campaignId: string;
  date: string;
  status: 'accepted' | 'review';
}

export interface Batch {
  id: string;
  serviceId: 'idata' | 'cleanrich';
  name: string;
  records: number;
  date: string;
  /** 'good' = Delivered (counts toward received) · 'neutral' = Scheduled (future). */
  status: StatusState;
  statusLabel: string;
}

export type JobCardType = 'client_signature' | 'internal_only' | 'msa_covered';

export const PHASES = ['Scoped', 'Verified', 'Confirmed', 'Signature', 'Signed'] as const;
export type PhaseIndex = 0 | 1 | 2 | 3 | 4;

export interface DocumentRecord {
  id: string;
  title: string;
  kind: string;
  /** Secondary line on the row, e.g. 'Contract · expires Mar 2027'. */
  kindDetail?: string;
  type: JobCardType;
  value: number | null;
  date: string;
  phase: PhaseIndex;
  scopeSummary?: string;
}

export interface InvoiceLine {
  serviceId: ServiceId;
  description: string;
  basis: string;
  amount: number;
}

export interface Invoice {
  id: string;
  period: string;
  issued: string;
  due: string;
  terms: string;
  status: 'open' | 'overdue' | 'paid';
  /** Total is summed from lines, never stored. */
  lines: InvoiceLine[];
}

export interface Ticket {
  id: string;
  subject: string;
  opened: string;
  status: StatusState;
  statusLabel: string;
}

export interface Contact {
  name: string;
  role: string;
}

export interface TeamMember {
  name: string;
  email: string;
  role: string;
}

export interface Placement {
  name: string;
  impressions: number;
  ctr: string;
}

export interface MediaData {
  impressions: number;
  spend: number;
  budget: number;
  metrics: MetricTile[];
  /** 12 weekly bars as percentage heights; the last is in-progress. */
  weeklyBars: number[];
  placements: Placement[];
}

/** Derived leads figures, computed once from campaigns / the leads service. */
export interface LeadsSummary {
  billable: number;
  delivered: number;
  target: number;
  acceptRate: string;
  costPerLead: number;
}

export interface Account {
  id: string;
  name: string;
  descriptor: string;
  entitlements: ServiceId[];
  user: { name: string; initials: string };

  /** How the Overview screen renders: a services grid, or a campaigns list. */
  overviewKind: 'services' | 'campaigns';

  /** Per-screen hero content. Headlines carry the one derived number that matters. */
  heroes: Partial<Record<ScreenKey, Hero>>;

  /** Overview: the service cards (leads synthesised from LeadsSummary). */
  services: Service[];
  /** Overview (campaigns kind): the metric strip. */
  overviewMetrics?: MetricTile[];
  /** Leads screen metric strip. */
  leadsMetrics?: MetricTile[];
  leadsSummary?: LeadsSummary;

  campaigns: Campaign[];
  /** Derived: every campaign's drops merged and sorted, for the Leads schedule. */
  deliveryTimeline: DeliveryTimelineEntry[];
  leads: Lead[];
  batches: Batch[];
  media?: MediaData;
  documents: DocumentRecord[];
  invoices: Invoice[];
  tickets: Ticket[];
  contacts: Contact[];
  team: TeamMember[];

  /** One-line upsell shown at the bottom of Overview when services are locked. */
  lockedNote?: string;

  /** Derived money figures. */
  invested: number;
  dueNow: number;
}

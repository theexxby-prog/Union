// Union — domain types.
// The card grammar (docs/01) means every service answers the same four questions
// in the same shape. The types below encode that, plus the workflow-shaped
// objects (documents, invoices) that are deliberately NOT campaign-shaped.

export type ServiceId = 'idata' | 'cleanrich' | 'programmatic' | 'leads' | 'fa' | 'research';

/** The closed set of four status states (docs/02). Never invent a fifth. */
export type StatusState = 'good' | 'needsYou' | 'action' | 'neutral';

/** Which top-level tab a screen sits under. */
export type ScreenKey =
  | 'overview'
  | 'data'
  | 'media'
  | 'leads'
  | 'finance'
  | 'research'
  | 'documents'
  | 'invoices'
  | 'support';

export interface HeroAction {
  label: string;
  /** Exactly one 'cta' (red) per hero, and only when there is something to act on. */
  kind: 'cta' | 'pill';
  /** Route segment under /:accountId (may carry a query, e.g. 'leads?review=1').
   *  Linked chips render with a chevron affix; plain chips stay static text. */
  to?: string;
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
  /** The one tile the screen is about — takes a tinted ground and a larger
   *  number so the strip has a rank instead of four equal shouts. */
  primary?: boolean;
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
  campaignId: string;
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
  /** Sort key (e.g. 20260702) — the timeline is chronological across services,
   *  so it cannot rely on the fixture's service-grouped array order. */
  sortKey: number;
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
  /** Most recent message on the thread, shown when the row is expanded. */
  lastMessage?: string;
}

export interface Contact {
  name: string;
  role: string;
}

/** A Finance & Accounting workstream (AP, AR, close, cleanup — not campaign-shaped). */
export interface FaWorkstream {
  id: string;
  name: string;
  detail: string;
  status: StatusState;
  statusLabel: string;
}

export const RESEARCH_STAGES = ['Scoped', 'Fieldwork', 'Analysis', 'Report'] as const;

/** A market-research study; progresses through RESEARCH_STAGES. */
export interface ResearchStudy {
  id: string;
  name: string;
  geo: string;
  method: string;
  /** Index into RESEARCH_STAGES; the final stage means the report is delivered. */
  stage: 0 | 1 | 2 | 3;
  detail: string;
  due: string;
}

export interface TeamMember {
  name: string;
  email: string;
  role: string;
}

/* ---------------------------------------------------------------------------
   Programmatic media — shaped to the delivery API that will eventually back it
   (see docs/06). The reporting endpoints return daily rows by channel, account
   engagement, and asset performance, so the fixtures mirror those shapes: when
   the live integration lands it is an adapter swap, not a screen rewrite.
   --------------------------------------------------------------------------- */

/** One day of delivery. Mirrors the daily spend report, aggregated per day. */
export interface DailyDelivery {
  date: string; // '12 Jul'
  sortKey: number; // 20260712 — deterministic ordering without Date parsing
  impressions: number;
  spend: number;
}

/** Delivery by ad channel. Impressions and share only — rates stay internal. */
export interface MediaChannel {
  name: string;
  impressions: number;
}

export type EngagementLevel = 'high' | 'medium' | 'low';

/** A target account that the media reached, and how warm it is. */
export interface EngagedAccount {
  name: string;
  industry: string;
  impressions: number;
  level: EngagementLevel;
  lastActivity: string;
  /** True when this account has since produced a lead — proves the chain. */
  becameLead?: boolean;
}

/** Creative performance, from the asset analytics report. */
export interface CreativeAsset {
  name: string;
  format: string;
  impressions: number;
  engagementRate: string;
}

export interface MediaData {
  /** Derived from `daily` — never stored twice. */
  impressions: number;
  /** Client-facing media investment to date (what DBSL bills, not raw rates). */
  investment: number;
  budget: number;
  /** Pre-formatted; confirm the source metric with the media partner. */
  viewability: string;
  accountsReached: number;
  accountsEngaged: number;
  flightStart: string;
  flightEnd: string;
  pacing: { state: StatusState; label: string };
  daily: DailyDelivery[];
  channels: MediaChannel[];
  engagedAccounts: EngagedAccount[];
  assets: CreativeAsset[];
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
  /** Leads currently awaiting client review (also referenced by the leads hero copy). */
  leadsInReview?: number;

  campaigns: Campaign[];
  /** Derived: every campaign's drops merged and sorted, for the Leads schedule. */
  deliveryTimeline: DeliveryTimelineEntry[];
  leads: Lead[];
  batches: Batch[];
  media?: MediaData;
  faWorkstreams?: FaWorkstream[];
  studies?: ResearchStudy[];
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

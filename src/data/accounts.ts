// Union — fixtures. THE single source of truth for every number in the app.
//
// Hard rule 4 (CLAUDE.md): no component contains a literal figure. Three accounts
// across seven screens stay numerically consistent only because everything derives
// from here. Store the inputs; compute the outputs; round only at render (format.ts).
//
// Reconciliation is enforced by scripts/check-consistency.ts (run in `npm run verify`).

import { int, money, pct } from './format';
import type {
  Account,
  Campaign,
  DailyDelivery,
  DeliveryDrop,
  DeliveryTimelineEntry,
  Invoice,
  LeadsSummary,
  MediaChannel,
  MediaData,
  Service,
  StatusState,
} from './types';

/** Display names in one place, per docs/04 — rename an account in a single edit. */
export const ACCOUNT_NAMES = {
  acme: 'Acme Corp',
  northwind: 'Northwind Trading',
  calderwood: 'Calderwood Group',
  vantage: 'Vantage Analytics',
  harbor: 'Harbor Point Group',
} as const;

// ---------------------------------------------------------------------------
// Derivation helpers
// ---------------------------------------------------------------------------

const sum = (ns: number[]): number => ns.reduce((a, b) => a + b, 0);

/** Invoice total is summed from its lines — never stored (docs/04). */
export const invoiceTotal = (inv: Invoice): number => sum(inv.lines.map((l) => l.amount));

/** Invested to date = sum of all invoice totals. */
const investedOf = (invoices: Invoice[]): number => sum(invoices.map(invoiceTotal));

/** Amount currently payable = sum of open/overdue invoice totals. */
const dueOf = (invoices: Invoice[]): number =>
  sum(invoices.filter((i) => i.status !== 'paid').map(invoiceTotal));

/** Split a total across weights so the parts sum to the total exactly.
 *  Used for media delivery: daily and channel rows must reconcile to the
 *  headline impression and investment figures with no rounding drift. */
const distribute = (total: number, weights: number[]): number[] => {
  const totalWeight = sum(weights);
  const parts = weights.map((w) => Math.floor((total * w) / totalWeight));
  let remainder = total - sum(parts);
  for (let i = 0; remainder > 0; i = (i + 1) % parts.length, remainder--) parts[i] += 1;
  return parts;
};

/* ---------------------------------------------------------------------------
   Programmatic media fixture builder.

   Channel names are shown to the client verbatim — clients expect to know which
   platforms carry their spend, and hiding it reads as evasive. The one exception
   is the display network, which is labelled generically rather than by supplier.
   Channel rows carry impressions only: mix is client-facing, rates are not.
   --------------------------------------------------------------------------- */

/** 1–28 July 2026. Weekday/weekend shape with a ramp as the flight scales. */
const MEDIA_DAY_WEIGHTS = [
  92, 95, 88, 52, 48, 98, 102, 105, 99, 94, 55, 50, 108, 112,
  115, 110, 104, 58, 54, 118, 122, 125, 120, 114, 62, 58, 128, 130,
];
const MEDIA_MONTH = 'Jul';
const MEDIA_CHANNELS = [
  { name: 'LinkedIn', weight: 28 },
  { name: 'Programmatic display network', weight: 26 },
  { name: 'Meta', weight: 20 },
  { name: 'Google', weight: 16 },
  { name: 'Connected TV', weight: 10 },
];

function buildMedia(impressions: number, investment: number, budget: number): MediaData {
  const dailyImpressions = distribute(impressions, MEDIA_DAY_WEIGHTS);
  const dailySpend = distribute(investment, MEDIA_DAY_WEIGHTS);
  const daily: DailyDelivery[] = MEDIA_DAY_WEIGHTS.map((_, i) => ({
    date: `${i + 1} ${MEDIA_MONTH}`,
    sortKey: 20260700 + i + 1,
    impressions: dailyImpressions[i],
    spend: dailySpend[i],
  }));

  const channelImpressions = distribute(impressions, MEDIA_CHANNELS.map((c) => c.weight));
  const channels: MediaChannel[] = MEDIA_CHANNELS.map((c, i) => ({
    name: c.name,
    impressions: channelImpressions[i],
  }));

  return {
    impressions,
    investment,
    budget,
    viewability: '68%',
    accountsReached: 31200,
    accountsEngaged: 1840,
    flightStart: '1 Jul 2026',
    flightEnd: '30 Sep 2026',
    pacing: { state: 'good', label: 'On pace' },
    daily,
    channels,
    // Accounts the media reached. Those marked becameLead later appear in the
    // leads table — the join that proves the chain end to end.
    engagedAccounts: [
      { name: 'Halden Logistics', industry: 'Transport & logistics', impressions: 8420, level: 'high', lastActivity: '22 Jul', becameLead: true },
      { name: 'Meridian Health', industry: 'Healthcare', impressions: 7260, level: 'high', lastActivity: '21 Jul', becameLead: true },
      { name: 'Corvus Retail Group', industry: 'Retail', impressions: 6890, level: 'high', lastActivity: '22 Jul', becameLead: true },
      { name: 'Ardent Systems', industry: 'Technology', impressions: 5940, level: 'medium', lastActivity: '20 Jul' },
      { name: 'Brightwater Utilities', industry: 'Energy & utilities', impressions: 5310, level: 'medium', lastActivity: '19 Jul' },
      { name: 'Kestrel Analytics', industry: 'Technology', impressions: 4780, level: 'medium', lastActivity: '18 Jul' },
      { name: 'Talligo Foods', industry: 'Manufacturing', impressions: 3960, level: 'low', lastActivity: '16 Jul' },
    ],
    assets: [
      { name: 'Cloud security — buyer guide', format: 'Display 300×250', impressions: 684200, engagementRate: '0.41%' },
      { name: 'Zero-trust webinar promo', format: 'Display 728×90', impressions: 512700, engagementRate: '0.37%' },
      { name: 'Platform overview — 30s', format: 'Video / CTV', impressions: 421900, engagementRate: '0.29%' },
      { name: 'Infrastructure benchmark', format: 'Native', impressions: 318400, engagementRate: '0.31%' },
      { name: 'Customer story — Halden', format: 'Display 160×600', impressions: 211100, engagementRate: '0.22%' },
    ],
  };
}

/** Concise delivery-drop constructor. */
const drop = (
  date: string,
  sortKey: number,
  leads: number,
  status: DeliveryDrop['status'],
): DeliveryDrop => ({ date, sortKey, leads, status });

/** Merge every campaign's drops into one date-sorted timeline for the Leads view. */
const buildTimeline = (campaigns: Campaign[]): DeliveryTimelineEntry[] =>
  campaigns
    .flatMap((c) =>
      c.schedule.map((d) => ({
        date: d.date,
        sortKey: d.sortKey,
        campaignId: c.id,
        campaign: c.name,
        geo: c.geo,
        leads: d.leads,
        status: d.status,
      })),
    )
    .sort((a, b) => a.sortKey - b.sortKey);

/** Leads figures, computed once from campaigns. */
const leadsFromCampaigns = (campaigns: Campaign[], costPerLead: number): LeadsSummary => {
  const billable = sum(campaigns.map((c) => c.accepted));
  const delivered = sum(campaigns.map((c) => c.delivered));
  const target = sum(campaigns.map((c) => c.target));
  return { billable, delivered, target, acceptRate: pct(billable, delivered), costPerLead };
};

/** Synthesise the Overview leads card from the derived summary.
 *  Pass a status only when the leads need attention; otherwise the card shows pace %. */
const leadsCard = (s: LeadsSummary, status?: StatusState, statusLabel?: string): Service => ({
  id: 'leads',
  name: 'Lead generation',
  unit: 'billable leads',
  received: s.billable,
  target: s.target,
  qualityLine: `${int(s.delivered)} delivered · Accept ${s.acceptRate}`,
  ...(status ? { status, statusLabel } : {}),
  delivered: s.delivered,
  costPerLead: s.costPerLead,
});

const leadsMetrics = (s: LeadsSummary) => [
  { label: 'Delivered', value: int(s.delivered) },
  { label: 'Billable', value: int(s.billable) },
  { label: 'Accept rate', value: s.acceptRate, positive: true },
  { label: 'Cost per lead', value: money(s.costPerLead) },
];

// ===========================================================================
// Account 1 — Acme Corp · full programme (all four services)
// ===========================================================================

function buildAcme(): Account {
  const cpl = 45;

  const campaigns: Campaign[] = [
    {
      id: 'cs', name: 'Cloud security', geo: 'NAM', accepted: 41, target: 210, delivered: 68,
      status: 'active', budget: 42000, startDate: 'Jan 15, 2026', endDate: 'Apr 15, 2026',
      deliveryDays: ['Monday', 'Thursday'], leadsPerDelivery: 34,
      schedule: [
        drop('20 Jan', 20260120, 34, 'delivered'),
        drop('23 Jan', 20260123, 34, 'delivered'),
        drop('17 Mar', 20260317, 34, 'upcoming'),
        drop('20 Mar', 20260320, 34, 'upcoming'),
      ],
    },
    {
      id: 'dp', name: 'Data platform guide', geo: 'EMEA', accepted: 34, target: 180, delivered: 61,
      status: 'active', budget: 30000, startDate: 'Feb 1, 2026', endDate: 'May 15, 2026',
      deliveryDays: ['Tuesday'], leadsPerDelivery: 31,
      schedule: [
        drop('21 Jan', 20260121, 31, 'delivered'),
        drop('4 Feb', 20260204, 30, 'delivered'),
        drop('18 Mar', 20260318, 30, 'upcoming'),
      ],
    },
    {
      id: 'is', name: 'Infrastructure survey', geo: 'APAC', accepted: 21, target: 110, delivered: 36,
      status: 'active', budget: 18000, startDate: 'Feb 10, 2026', endDate: 'May 31, 2026',
      deliveryDays: ['Wednesday'], leadsPerDelivery: 18,
      schedule: [
        drop('22 Jan', 20260122, 18, 'delivered'),
        drop('5 Feb', 20260205, 18, 'delivered'),
        drop('19 Mar', 20260319, 18, 'upcoming'),
      ],
    },
  ];
  const leads = leadsFromCampaigns(campaigns, cpl); // billable 96 · delivered 165 · target 500
  const leadsInReview = 12;

  const invoices: Invoice[] = [
    {
      id: 'INV-0174',
      period: 'June 2026',
      issued: '1 Jun',
      due: '20 Jun',
      terms: 'Net 20',
      status: 'paid',
      lines: [
        { serviceId: 'idata', description: 'iData · records delivered', basis: '11,800 records at $0.42', amount: 4956 },
        { serviceId: 'cleanrich', description: 'CleanRich · records processed', basis: '17,600 records at $0.11', amount: 1936 },
        { serviceId: 'programmatic', description: 'Programmatic · media spend', basis: '760,000 impressions', amount: 9068 },
        { serviceId: 'leads', description: 'Lead generation · billable leads', basis: '48 billable of 82 delivered, at $45', amount: 2160 },
      ],
    },
    {
      id: 'INV-0181',
      period: 'July 2026',
      issued: '1 Jul',
      due: '21 Jul',
      terms: 'Net 20',
      status: 'paid',
      lines: [
        { serviceId: 'idata', description: 'iData · records delivered', basis: '13,100 records at $0.42', amount: 5502 },
        { serviceId: 'cleanrich', description: 'CleanRich · records processed', basis: '19,400 records at $0.11', amount: 2134 },
        { serviceId: 'programmatic', description: 'Programmatic · media spend', basis: '970,000 impressions', amount: 11524 },
        { serviceId: 'leads', description: 'Lead generation · billable leads', basis: '60 billable of 98 delivered, at $45', amount: 2700 },
      ],
    },
    {
      id: 'INV-0192',
      period: 'August 2026',
      issued: '1 Aug',
      due: '20 Aug',
      terms: 'Net 20',
      status: 'overdue',
      lines: [
        { serviceId: 'idata', description: 'iData · records delivered', basis: '12,400 records at $0.42', amount: 5208 },
        { serviceId: 'cleanrich', description: 'CleanRich · records processed', basis: '18,900 records at $0.11', amount: 2079 },
        { serviceId: 'programmatic', description: 'Programmatic · media spend', basis: '742,000 impressions', amount: 8793 },
        { serviceId: 'leads', description: 'Lead generation · billable leads', basis: '52 billable of 89 delivered, at $45', amount: 2340 },
      ],
    },
  ];

  const invested = investedOf(invoices); // 58,400
  const dueNow = dueOf(invoices); // 18,420
  const impressions = 2148300;
  const spend = 41200;
  const budget = 80000;

  const services: Service[] = [
    {
      id: 'idata',
      name: 'iData',
      unit: 'records delivered',
      received: 38400,
      target: 50000,
      qualityLine: 'Field fill 94% · Match 71%',
    },
    {
      id: 'cleanrich',
      name: 'CleanRich',
      unit: 'records processed',
      received: 47200,
      target: 50000,
      qualityLine: 'Corrected 12% · Deduped 6%',
    },
    {
      id: 'programmatic',
      name: 'Programmatic',
      unit: 'budget spent',
      received: spend,
      target: budget,
      headline: '2.1M',
      subline: `${money(spend)} of ${money(budget)} spent`,
      qualityLine: 'Viewability 68% · CTR 0.34%',
    },
    leadsCard(leads, 'action', 'Behind pace'),
  ];

  return {
    id: 'acme',
    name: ACCOUNT_NAMES.acme,
    descriptor: 'Full programme — data, media, leads',
    entitlements: ['idata', 'cleanrich', 'programmatic', 'leads'],
    user: { name: 'John Carter', initials: 'JC' },
    overviewKind: 'services',
    services,
    leadsSummary: leads,
    leadsMetrics: leadsMetrics(leads),
    leadsInReview,
    campaigns,
    deliveryTimeline: buildTimeline(campaigns),
    leads: [
      { id: 'l1', name: 'Marcus Reeve', title: 'VP Infrastructure', company: 'Halden Logistics', campaignId: 'cs', date: '22 Jul', status: 'accepted' },
      { id: 'l2', name: 'Priya Nandakumar', title: 'Head of Data', company: 'Corvus Retail Group', campaignId: 'dp', date: '22 Jul', status: 'accepted' },
      { id: 'l3', name: 'Daniel Okonjo', title: 'IT Director', company: 'Meridian Health', campaignId: 'cs', date: '21 Jul', status: 'review' },
      { id: 'l4', name: 'Sofia Bergqvist', title: 'CTO', company: 'Nordvik Manufacturing', campaignId: 'is', date: '21 Jul', status: 'review' },
      { id: 'l5', name: 'Tom Alderidge', title: 'Ops Manager', company: 'Fenwick Supply', campaignId: 'dp', date: '20 Jul', status: 'accepted' },
    ],
    batches: [
      { id: 'b1', serviceId: 'idata', name: 'Account universe — batch 1', records: 20000, date: '2 Jul', status: 'good', statusLabel: 'Delivered' },
      { id: 'b2', serviceId: 'idata', name: 'Account universe — batch 2', records: 18400, date: '18 Jul', status: 'good', statusLabel: 'Delivered' },
      { id: 'b3', serviceId: 'idata', name: 'Account universe — batch 3', records: 11600, date: '1 Aug', status: 'neutral', statusLabel: 'Scheduled' },
      { id: 'b4', serviceId: 'cleanrich', name: 'Enrichment pass — batch 1', records: 25000, date: '5 Jul', status: 'good', statusLabel: 'Delivered' },
      { id: 'b5', serviceId: 'cleanrich', name: 'Enrichment pass — batch 2', records: 22200, date: '19 Jul', status: 'good', statusLabel: 'Delivered' },
    ],
    media: buildMedia(impressions, spend, budget),
    documents: [
      { id: 'JC-2841', title: 'Cloud security, NAM', kind: 'Job card', type: 'client_signature', value: 8100, date: '18 Jul', phase: 3, scopeSummary: '180 leads at $45 · $8,100 · scope agreed 18 July' },
      { id: 'JC-2798', title: 'Data platform guide, EMEA', kind: 'Job card', type: 'client_signature', value: 6300, date: '2 Jul', phase: 4 },
      { id: 'JC-2765', title: 'Audience build, global', kind: 'Job card', type: 'msa_covered', value: 21000, date: '14 Jun', phase: 4 },
      { id: 'MSA', title: 'Master services agreement', kind: 'Contract', kindDetail: 'Contract · expires Mar 2027', type: 'msa_covered', value: null, date: '3 Mar', phase: 4 },
    ],
    invoices,
    tickets: [
      { id: 't1', subject: 'Update billing contact email', opened: '20 Jul', status: 'neutral', statusLabel: 'In progress', lastMessage: 'DBSL · We have the new address on file and are updating the invoicing profile. No action needed from you.' },
      { id: 't2', subject: 'Clarify programmatic viewability methodology', opened: '15 Jul', status: 'good', statusLabel: 'Resolved', lastMessage: 'DBSL · Viewability follows the MRC standard measured by our verification partner. A one-page summary is attached to this thread.' },
      { id: 't3', subject: 'Request additional lead fields', opened: '12 Jul', status: 'needsYou', statusLabel: 'Awaiting your reply', lastMessage: 'DBSL · We can add two custom fields to the delivery template. Please confirm the exact field names you want and we will enable them on the next drop.' },
    ],
    contacts: [
      { name: 'Sarah Whitfield', role: 'Account manager' },
      { name: 'Marcus Cole', role: 'Campaign manager' },
    ],
    team: [
      { name: 'John Carter', email: 'john.carter@acmecorp.example', role: 'Owner' },
      { name: 'Rebecca Lyle', email: 'rebecca.lyle@acmecorp.example', role: 'Billing' },
      { name: 'Sam Okafor', email: 'sam.okafor@acmecorp.example', role: 'Campaign viewer' },
    ],
    lockedNote: 'Finance & Accounting and B2B market research are available on your account.',
    invested,
    dueNow,
    heroes: {
      overview: {
        eyebrow: 'Your programme · Q3 2026',
        headline: `${money(invested)} invested, tracking to plan`,
        subhead: 'Four services running. Lead generation is behind pace.',
        actions: [
          { label: 'View report', kind: 'cta', to: 'report' },
          { label: '2 invoices open', kind: 'pill', to: 'invoices' },
          { label: '1 signature due', kind: 'pill', to: 'documents' },
        ],
      },
      data: {
        eyebrow: 'Data services · Q3 2026',
        headline: `${int(38400 + 47200)} records delivered across two services`,
        subhead: 'iData and CleanRich running against your account universe.',
        actions: [
          { label: 'Download data report', kind: 'cta', to: 'report' },
          { label: '4 batches delivered', kind: 'pill' },
        ],
      },
      media: {
        eyebrow: 'Programmatic · Q3 2026',
        headline: `${int(impressions)} impressions delivered`,
        subhead: `${money(spend)} of ${money(budget)} invested, flight ${pct(spend, budget)} complete and on pace.`,
        actions: [
          { label: 'View media report', kind: 'cta', to: 'report' },
          { label: '1,840 accounts engaged', kind: 'pill' },
        ],
      },
      leads: {
        eyebrow: 'Lead generation · Q3 2026',
        headline: `${int(leads.billable)} billable leads of ${int(leads.target)}`,
        subhead: `${int(leads.delivered)} delivered to date. ${leadsInReview} are awaiting your review and may change this count.`,
        actions: [
          { label: `Review ${leadsInReview} leads`, kind: 'cta', to: 'leads?review=1' },
          { label: 'Download CSV', kind: 'pill' },
          { label: 'Push to Salesforce', kind: 'pill' },
        ],
      },
      documents: {
        eyebrow: 'Documents',
        headline: 'One document needs your signature',
        subhead: 'Everything else on your account is signed and current.',
        actions: [
          { label: 'Sign JC-2841', kind: 'cta' },
          { label: 'Download archive', kind: 'pill' },
        ],
      },
      invoices: {
        eyebrow: 'Accounts payable',
        headline: `${money(dueNow)} due`,
        subhead: 'One invoice overdue by four days. Next invoice issues 1 September.',
        actions: [
          { label: 'Pay invoice', kind: 'cta' },
          { label: 'Download PDF', kind: 'pill' },
          { label: 'Payment history', kind: 'pill' },
        ],
      },
      support: {
        eyebrow: 'Support',
        headline: 'How can we help?',
        subhead: 'Your DBSL team typically replies within one business day.',
        actions: [
          { label: 'Raise a request', kind: 'cta' },
          { label: 'View past requests', kind: 'pill' },
        ],
      },
    },
  };
}

// ===========================================================================
// Account 2 — Northwind Trading · content syndication only (leads only)
// ===========================================================================

function buildNorthwind(): Account {
  const cpl = 45;
  const campaigns: Campaign[] = [
    {
      id: 'cs', name: 'Cloud security whitepaper', geo: 'NAM', accepted: 148, target: 180, delivered: 214,
      status: 'active', budget: 8100, startDate: 'Jan 5, 2026', endDate: 'Mar 31, 2026',
      deliveryDays: ['Monday', 'Thursday'], leadsPerDelivery: 54,
      schedule: [
        drop('6 Jan', 20260106, 54, 'delivered'),
        drop('9 Jan', 20260109, 54, 'delivered'),
        drop('13 Jan', 20260113, 53, 'delivered'),
        drop('16 Jan', 20260116, 53, 'delivered'),
        drop('16 Mar', 20260316, 54, 'upcoming'),
      ],
    },
    {
      id: 'dp', name: 'Data platform buyers guide', geo: 'EMEA', accepted: 109, target: 140, delivered: 168,
      status: 'active', budget: 6300, startDate: 'Jan 7, 2026', endDate: 'Apr 15, 2026',
      deliveryDays: ['Wednesday'], leadsPerDelivery: 56,
      schedule: [
        drop('7 Jan', 20260107, 56, 'delivered'),
        drop('21 Jan', 20260121, 56, 'delivered'),
        drop('4 Feb', 20260204, 56, 'delivered'),
        drop('18 Mar', 20260318, 56, 'upcoming'),
      ],
    },
    {
      id: 'is', name: 'Infrastructure survey', geo: 'APAC', accepted: 55, target: 80, delivered: 91,
      status: 'active', budget: 3600, startDate: 'Jan 9, 2026', endDate: 'Apr 30, 2026',
      deliveryDays: ['Friday'], leadsPerDelivery: 46,
      schedule: [
        drop('9 Jan', 20260109, 46, 'delivered'),
        drop('23 Jan', 20260123, 45, 'delivered'),
        drop('20 Mar', 20260320, 45, 'upcoming'),
      ],
    },
  ];
  const leads = leadsFromCampaigns(campaigns, cpl); // billable 312 · delivered 473 · target 400
  const leadsInReview = 9;

  const invoices: Invoice[] = [
    {
      id: 'INV-N118',
      period: 'Q3 2026',
      issued: '1 Jul',
      due: '21 Jul',
      terms: 'Net 20',
      status: 'paid',
      lines: [
        { serviceId: 'leads', description: 'Lead generation · billable leads', basis: '312 billable of 473 delivered, at $45', amount: 14040 },
      ],
    },
  ];
  const invested = investedOf(invoices); // 14,040
  const dueNow = dueOf(invoices); // 0

  return {
    id: 'northwind',
    name: ACCOUNT_NAMES.northwind,
    descriptor: 'Content syndication',
    entitlements: ['leads'],
    user: { name: 'Rachel Stone', initials: 'RS' },
    overviewKind: 'campaigns',
    services: [],
    leadsSummary: leads,
    leadsMetrics: leadsMetrics(leads),
    overviewMetrics: [
      { label: 'Accept rate', value: leads.acceptRate, positive: true },
      { label: 'Cost per lead', value: money(cpl) },
      { label: 'Days remaining', value: '50' },
    ],
    leadsInReview,
    campaigns,
    deliveryTimeline: buildTimeline(campaigns),
    leads: [
      { id: 'l1', name: 'Helena Frost', title: 'Procurement Lead', company: 'Aldwych Systems', campaignId: 'cs', date: '22 Jul', status: 'accepted' },
      { id: 'l2', name: 'Rafael Mendez', title: 'Network Architect', company: 'Sierra Freight', campaignId: 'is', date: '21 Jul', status: 'accepted' },
      { id: 'l3', name: 'Yuki Tanaka', title: 'Data Manager', company: 'Kestrel Analytics', campaignId: 'dp', date: '21 Jul', status: 'review' },
      { id: 'l4', name: 'Omar Haddad', title: 'Head of IT', company: 'Brightwater Utilities', campaignId: 'cs', date: '20 Jul', status: 'accepted' },
      { id: 'l5', name: 'Grace Mbeki', title: 'Systems Lead', company: 'Talligo Foods', campaignId: 'is', date: '19 Jul', status: 'review' },
    ],
    batches: [],
    documents: [
      { id: 'JC-3120', title: 'Cloud security whitepaper, NAM', kind: 'Job card', type: 'client_signature', value: 8100, date: '24 Jun', phase: 4 },
      { id: 'JC-3088', title: 'Data platform buyers guide, EMEA', kind: 'Job card', type: 'client_signature', value: 6300, date: '11 Jun', phase: 4 },
      { id: 'JC-3054', title: 'Infrastructure survey, APAC', kind: 'Job card', type: 'msa_covered', value: 3600, date: '2 Jun', phase: 4 },
      { id: 'MSA', title: 'Master services agreement', kind: 'Contract', kindDetail: 'Contract · expires Jan 2027', type: 'msa_covered', value: null, date: '15 Jan', phase: 4 },
    ],
    invoices,
    tickets: [
      { id: 't1', subject: 'Question about lead delivery pacing', opened: '18 Jul', status: 'good', statusLabel: 'Resolved', lastMessage: 'DBSL · Pacing is on track to complete by 12 September. The APAC survey closes last; everything else lands earlier.' },
      { id: 't2', subject: 'Request weekly delivery report', opened: '10 Jul', status: 'neutral', statusLabel: 'In progress', lastMessage: 'DBSL · A weekly summary is being set up for Monday mornings to your team address. First one arrives next week.' },
    ],
    contacts: [
      { name: 'Elena Marsh', role: 'Account manager' },
      { name: 'David Osei', role: 'Campaign manager' },
    ],
    team: [
      { name: 'Rachel Stone', email: 'rachel.stone@northwind.example', role: 'Owner' },
      { name: 'Peter Vaughn', email: 'peter.vaughn@northwind.example', role: 'Billing' },
    ],
    lockedNote: 'Programmatic and audience data are available on your account.',
    invested,
    dueNow,
    heroes: {
      overview: {
        eyebrow: 'Content syndication · Q3 2026',
        headline: `${int(leads.billable)} of ${int(leads.target)} leads accepted`,
        subhead: 'On pace to complete by 12 September.',
        actions: [
          { label: 'Download leads', kind: 'cta' },
          { label: '3 campaigns live', kind: 'pill', to: 'leads' },
          { label: 'All invoices settled', kind: 'pill', to: 'invoices' },
        ],
      },
      leads: {
        eyebrow: 'Lead generation · Q3 2026',
        headline: `${int(leads.billable)} billable leads of ${int(leads.target)}`,
        subhead: `${int(leads.delivered)} delivered to date. ${leadsInReview} are awaiting your review and may change this count.`,
        actions: [
          { label: `Review ${leadsInReview} leads`, kind: 'cta', to: 'leads?review=1' },
          { label: 'Download CSV', kind: 'pill' },
          { label: 'Push to HubSpot', kind: 'pill' },
        ],
      },
      documents: {
        eyebrow: 'Documents',
        headline: 'All documents are signed and current',
        subhead: 'Nothing needs your signature right now.',
        actions: [{ label: 'Download archive', kind: 'pill' }],
      },
      invoices: {
        eyebrow: 'Accounts payable',
        headline: 'No payment due',
        subhead: 'Your account is settled. INV-N118 was paid on 21 July.',
        actions: [
          { label: 'Payment history', kind: 'pill' },
          { label: 'Download PDF', kind: 'pill' },
        ],
      },
      support: {
        eyebrow: 'Support',
        headline: 'How can we help?',
        subhead: 'Your DBSL team typically replies within one business day.',
        actions: [
          { label: 'Raise a request', kind: 'cta' },
          { label: 'View past requests', kind: 'pill' },
        ],
      },
    },
  };
}

// ===========================================================================
// Account 3 — Calderwood Group · data only (iData + CleanRich). No campaigns.
// ===========================================================================

function buildCalderwood(): Account {
  const invoices: Invoice[] = [
    {
      id: 'INV-D021',
      period: 'June 2026',
      issued: '12 Jun',
      due: '2 Jul',
      terms: 'Net 20',
      status: 'paid',
      lines: [
        { serviceId: 'idata', description: 'iData · records delivered', basis: '12,000 records at $0.42', amount: 5040 },
        { serviceId: 'cleanrich', description: 'CleanRich · records processed', basis: '14,500 records at $0.11', amount: 1595 },
      ],
    },
    {
      id: 'INV-D034',
      period: 'July 2026',
      issued: '15 Jul',
      due: '4 Aug',
      terms: 'Net 20',
      status: 'open',
      lines: [
        { serviceId: 'idata', description: 'iData · records delivered', basis: '12,000 records at $0.42', amount: 5040 },
        { serviceId: 'cleanrich', description: 'CleanRich · records processed', basis: '14,000 records at $0.11', amount: 1540 },
      ],
    },
  ];
  const invested = investedOf(invoices); // 13,215
  const dueNow = dueOf(invoices); // 6,580

  const services: Service[] = [
    { id: 'idata', name: 'iData', unit: 'records delivered', received: 24000, target: 30000, qualityLine: 'Field fill 91% · Match 68%' },
    { id: 'cleanrich', name: 'CleanRich', unit: 'records processed', received: 28500, target: 30000, qualityLine: 'Corrected 15% · Deduped 9%' },
    // Onboarded this quarter; billed quarterly — first F&A invoice issues 1 Sep,
    // so the invested/due figures are untouched.
    { id: 'fa', name: 'Finance & Accounting', unit: 'invoices processed', received: 1240, target: 1800, qualityLine: 'Accuracy 99.2% · Turnaround 1.8d' },
  ];
  // Records figure is the two data services only — F&A counts invoices, not records.
  const recordsDelivered = sum(
    services.filter((s) => s.id === 'idata' || s.id === 'cleanrich').map((s) => s.received),
  ); // 52,500

  return {
    id: 'calderwood',
    name: ACCOUNT_NAMES.calderwood,
    descriptor: 'Data & finance services',
    entitlements: ['idata', 'cleanrich', 'fa'],
    user: { name: 'Alan Weir', initials: 'AW' },
    overviewKind: 'services',
    services,
    campaigns: [],
    deliveryTimeline: [],
    leads: [],
    batches: [
      { id: 'b1', serviceId: 'idata', name: 'Q3 universe build — batch 1', records: 12000, date: '10 Jul', status: 'good', statusLabel: 'Delivered' },
      { id: 'b2', serviceId: 'idata', name: 'Q3 universe build — batch 2', records: 12000, date: '24 Jul', status: 'good', statusLabel: 'Delivered' },
      { id: 'b3', serviceId: 'idata', name: 'Q3 universe build — batch 3', records: 6000, date: '4 Aug', status: 'neutral', statusLabel: 'Scheduled' },
      { id: 'b4', serviceId: 'cleanrich', name: 'Enrichment pass — batch 1', records: 14500, date: '12 Jul', status: 'good', statusLabel: 'Delivered' },
      { id: 'b5', serviceId: 'cleanrich', name: 'Enrichment pass — batch 2', records: 14000, date: '24 Jul', status: 'good', statusLabel: 'Delivered' },
    ],
    faWorkstreams: [
      { id: 'f1', name: 'AP invoice processing', detail: '1,240 invoices processed this quarter · 3-way match', status: 'neutral', statusLabel: 'Active' },
      { id: 'f2', name: 'AR & collections support', detail: 'Ledger current · next statement run 1 August', status: 'good', statusLabel: 'Current' },
      { id: 'f3', name: 'Month-end close — July', detail: 'Draft close pack ready for your review', status: 'needsYou', statusLabel: 'Your sign-off' },
      { id: 'f4', name: 'Vendor master cleanup', detail: 'Duplicates merged and banking details verified', status: 'good', statusLabel: 'Completed' },
    ],
    documents: [
      { id: 'JD-4012', title: 'Q4 data build scope, global', kind: 'Job card', type: 'client_signature', value: 12600, date: '20 Jul', phase: 3, scopeSummary: '30,000 records at $0.42 · $12,600 · scope agreed 20 July' },
      { id: 'JD-3980', title: 'Q3 data build, global', kind: 'Job card', type: 'client_signature', value: 12600, date: '1 Jun', phase: 4 },
      { id: 'MSA', title: 'Master services agreement', kind: 'Contract', kindDetail: 'Contract · expires Feb 2027', type: 'msa_covered', value: null, date: '20 Feb', phase: 4 },
    ],
    invoices,
    tickets: [
      { id: 't1', subject: 'Confirm field mapping for batch 3', opened: '21 Jul', status: 'needsYou', statusLabel: 'Awaiting your reply', lastMessage: 'DBSL · Batch 3 is scheduled for 4 August. Please confirm the two custom field mappings so enrichment can run without a hold.' },
      { id: 't2', subject: 'Request match-rate breakdown by region', opened: '14 Jul', status: 'good', statusLabel: 'Resolved', lastMessage: 'DBSL · Regional match-rate breakdown has been added to your data report. NAM and EMEA are broken out separately.' },
    ],
    contacts: [
      { name: 'Nadia Okafor', role: 'Account manager' },
      { name: 'Tom Bright', role: 'Data delivery lead' },
    ],
    team: [
      { name: 'Alan Weir', email: 'alan.weir@calderwood.example', role: 'Owner' },
      { name: 'Claire Dunmore', email: 'claire.dunmore@calderwood.example', role: 'Billing' },
    ],
    lockedNote: 'Programmatic and lead generation are available on your account.',
    invested,
    dueNow,
    heroes: {
      overview: {
        eyebrow: 'Data services · Q3 2026',
        headline: `${int(recordsDelivered)} records delivered`,
        subhead: 'Two data services running. Next batch drops 4 August.',
        actions: [
          { label: 'View data report', kind: 'cta', to: 'report' },
          { label: '1 invoice open', kind: 'pill', to: 'invoices' },
          { label: 'Next batch 4 Aug', kind: 'pill', to: 'data' },
        ],
      },
      data: {
        eyebrow: 'Data services · Q3 2026',
        headline: `${int(recordsDelivered)} records delivered across two services`,
        subhead: 'iData and CleanRich running against your target universe.',
        actions: [
          { label: 'Download data report', kind: 'cta', to: 'report' },
          { label: '4 batches delivered', kind: 'pill' },
        ],
      },
      finance: {
        eyebrow: 'Finance & Accounting · Q3 2026',
        headline: 'One close pack needs your sign-off',
        subhead: 'Four workstreams running at 99.2% accuracy. First F&A invoice issues 1 September.',
        actions: [
          { label: 'Review July close', kind: 'cta' },
          { label: 'Download F&A report', kind: 'pill', to: 'report' },
        ],
      },
      documents: {
        eyebrow: 'Documents',
        headline: 'One document needs your signature',
        subhead: 'Everything else on your account is signed and current.',
        actions: [
          { label: 'Sign JD-4012', kind: 'cta' },
          { label: 'Download archive', kind: 'pill' },
        ],
      },
      invoices: {
        eyebrow: 'Accounts payable',
        headline: `${money(dueNow)} due`,
        subhead: 'Issued 15 July, due 4 August. Net 20 terms.',
        actions: [
          { label: 'Pay invoice', kind: 'cta' },
          { label: 'Download PDF', kind: 'pill' },
          { label: 'Payment history', kind: 'pill' },
        ],
      },
      support: {
        eyebrow: 'Support',
        headline: 'How can we help?',
        subhead: 'Your DBSL team typically replies within one business day.',
        actions: [
          { label: 'Raise a request', kind: 'cta' },
          { label: 'View past requests', kind: 'pill' },
        ],
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

// ===========================================================================
// Account 4 — Vantage Analytics · content syndication (leads only, richer cadence)
// ===========================================================================

function buildVantage(): Account {
  const cpl = 45;
  const campaigns: Campaign[] = [
    {
      id: 'ci', name: 'Cloud infrastructure guide', geo: 'NAM', accepted: 132, target: 200, delivered: 190,
      status: 'active', budget: 9000, startDate: 'Jan 12, 2026', endDate: 'Apr 12, 2026',
      deliveryDays: ['Monday', 'Thursday'], leadsPerDelivery: 48,
      schedule: [
        drop('19 Jan', 20260119, 48, 'delivered'),
        drop('22 Jan', 20260122, 48, 'delivered'),
        drop('26 Jan', 20260126, 47, 'delivered'),
        drop('29 Jan', 20260129, 47, 'delivered'),
        drop('16 Mar', 20260316, 48, 'upcoming'),
      ],
    },
    {
      id: 'db', name: 'DevOps benchmark report', geo: 'EMEA', accepted: 88, target: 150, delivered: 121,
      status: 'active', budget: 6750, startDate: 'Jan 20, 2026', endDate: 'May 1, 2026',
      deliveryDays: ['Tuesday'], leadsPerDelivery: 40,
      schedule: [
        drop('20 Jan', 20260120, 41, 'delivered'),
        drop('3 Feb', 20260203, 40, 'delivered'),
        drop('17 Feb', 20260217, 40, 'delivered'),
        drop('17 Mar', 20260317, 40, 'upcoming'),
      ],
    },
    {
      id: 'zt', name: 'Zero-trust security survey', geo: 'APAC', accepted: 61, target: 90, delivered: 84,
      status: 'active', budget: 4050, startDate: 'Jan 21, 2026', endDate: 'Apr 21, 2026',
      deliveryDays: ['Wednesday'], leadsPerDelivery: 28,
      schedule: [
        drop('21 Jan', 20260121, 28, 'delivered'),
        drop('4 Feb', 20260204, 28, 'delivered'),
        drop('18 Feb', 20260218, 28, 'delivered'),
        drop('18 Mar', 20260318, 28, 'upcoming'),
      ],
    },
    {
      id: 'ai', name: 'AI operations leaders', geo: 'NAM', accepted: 0, target: 120, delivered: 0,
      status: 'pendingApproval', budget: 5400, startDate: 'Apr 1, 2026', endDate: 'Jun 30, 2026',
      deliveryDays: ['Monday'], leadsPerDelivery: 30,
      // All upcoming — surfaces on the schedule only once the client approves the campaign.
      schedule: [
        drop('6 Apr', 20260406, 30, 'upcoming'),
        drop('20 Apr', 20260420, 30, 'upcoming'),
        drop('4 May', 20260504, 30, 'upcoming'),
        drop('18 May', 20260518, 30, 'upcoming'),
      ],
    },
  ];
  const leads = leadsFromCampaigns(campaigns, cpl); // billable 281 · delivered 395 · target 560
  const leadsInReview = 14;

  const invoices: Invoice[] = [
    {
      id: 'INV-V204', period: 'Q2 2026', issued: '1 Jun', due: '21 Jun', terms: 'Net 20', status: 'paid',
      lines: [
        { serviceId: 'leads', description: 'Lead generation · billable leads', basis: '170 billable of 240 delivered, at $45', amount: 7650 },
      ],
    },
    {
      id: 'INV-V211', period: 'Q3 2026', issued: '1 Jul', due: '21 Jul', terms: 'Net 20', status: 'open',
      lines: [
        { serviceId: 'leads', description: 'Lead generation · billable leads', basis: '111 billable of 155 delivered, at $45', amount: 4995 },
      ],
    },
  ];
  const invested = investedOf(invoices); // 12,645
  const dueNow = dueOf(invoices); // 4,995

  return {
    id: 'vantage',
    name: ACCOUNT_NAMES.vantage,
    descriptor: 'Content syndication',
    entitlements: ['leads'],
    user: { name: 'Priya Anand', initials: 'PA' },
    overviewKind: 'campaigns',
    services: [],
    leadsSummary: leads,
    leadsMetrics: leadsMetrics(leads),
    overviewMetrics: [
      { label: 'Accept rate', value: leads.acceptRate, positive: true },
      { label: 'Cost per lead', value: money(cpl) },
      { label: 'Days remaining', value: '68' },
    ],
    leadsInReview,
    campaigns,
    deliveryTimeline: buildTimeline(campaigns),
    leads: [
      { id: 'l1', name: 'Nadia Chowdhury', title: 'VP Engineering', company: 'Lumen Freight', campaignId: 'ci', date: '22 Jul', status: 'accepted' },
      { id: 'l2', name: 'Erik Lindqvist', title: 'Platform Lead', company: 'Aurora Retail', campaignId: 'db', date: '22 Jul', status: 'accepted' },
      { id: 'l3', name: 'Ravi Menon', title: 'Security Director', company: 'Copperline Energy', campaignId: 'zt', date: '21 Jul', status: 'review' },
      { id: 'l4', name: 'Chloe Fontaine', title: 'Head of DevOps', company: 'Marisol Foods', campaignId: 'ci', date: '21 Jul', status: 'accepted' },
      { id: 'l5', name: 'Andre Silva', title: 'IT Manager', company: 'Beacon Health Systems', campaignId: 'db', date: '20 Jul', status: 'review' },
    ],
    batches: [],
    documents: [
      { id: 'JV-4210', title: 'AI operations leaders, NAM', kind: 'Job card', type: 'client_signature', value: 5400, date: '20 Jul', phase: 3, scopeSummary: '120 leads at $45 · $5,400 · scope agreed 20 July' },
      { id: 'JV-4188', title: 'Cloud infrastructure guide, NAM', kind: 'Job card', type: 'client_signature', value: 9000, date: '2 Jul', phase: 4 },
      { id: 'JV-4155', title: 'DevOps benchmark report, EMEA', kind: 'Job card', type: 'msa_covered', value: 6750, date: '18 Jun', phase: 4 },
      { id: 'MSA', title: 'Master services agreement', kind: 'Contract', kindDetail: 'Contract · expires Jan 2027', type: 'msa_covered', value: null, date: '10 Jan', phase: 4 },
    ],
    invoices,
    tickets: [
      { id: 't1', subject: 'Approve Q2 AI operations campaign scope', opened: '20 Jul', status: 'needsYou', statusLabel: 'Awaiting your reply', lastMessage: 'DBSL · The scope document JV-4210 is ready for signature. Once approved, delivery starts the first Monday of April.' },
      { id: 't2', subject: 'Add ABM account list to Cloud infrastructure', opened: '14 Jul', status: 'neutral', statusLabel: 'In progress', lastMessage: 'DBSL · Your account list has been received and is being matched against the campaign audience. Matching completes this week.' },
    ],
    contacts: [
      { name: 'Laura Beckett', role: 'Account manager' },
      { name: 'Sanjay Rao', role: 'Campaign manager' },
    ],
    team: [
      { name: 'Priya Anand', email: 'priya.anand@vantage.example', role: 'Owner' },
      { name: 'Greg Holloway', email: 'greg.holloway@vantage.example', role: 'Billing' },
    ],
    lockedNote: 'Programmatic and audience data are available on your account.',
    invested,
    dueNow,
    heroes: {
      overview: {
        eyebrow: 'Content syndication · Q3 2026',
        headline: `${int(leads.billable)} of ${int(leads.target)} leads accepted`,
        subhead: 'Three campaigns delivering; one is awaiting your approval.',
        actions: [
          { label: 'Download leads', kind: 'cta' },
          { label: '4 campaigns', kind: 'pill', to: 'leads' },
          { label: '1 awaiting approval', kind: 'pill', to: 'documents' },
        ],
      },
      leads: {
        eyebrow: 'Lead generation · Q3 2026',
        headline: `${int(leads.billable)} billable leads of ${int(leads.target)}`,
        subhead: `${int(leads.delivered)} delivered to date. ${leadsInReview} are awaiting your review and may change this count.`,
        actions: [
          { label: `Review ${leadsInReview} leads`, kind: 'cta', to: 'leads?review=1' },
          { label: 'Download CSV', kind: 'pill' },
          { label: 'Push to Salesforce', kind: 'pill' },
        ],
      },
      documents: {
        eyebrow: 'Documents',
        headline: 'One document needs your signature',
        subhead: 'Everything else on your account is signed and current.',
        actions: [
          { label: 'Sign JV-4210', kind: 'cta' },
          { label: 'Download archive', kind: 'pill' },
        ],
      },
      invoices: {
        eyebrow: 'Accounts payable',
        headline: `${money(dueNow)} due`,
        subhead: 'One invoice open, due 21 July. Net 20 terms.',
        actions: [
          { label: 'Pay invoice', kind: 'cta' },
          { label: 'Download PDF', kind: 'pill' },
          { label: 'Payment history', kind: 'pill' },
        ],
      },
      support: {
        eyebrow: 'Support',
        headline: 'How can we help?',
        subhead: 'Your DBSL team typically replies within one business day.',
        actions: [
          { label: 'Raise a request', kind: 'cta' },
          { label: 'View past requests', kind: 'pill' },
        ],
      },
    },
  };
}

// ===========================================================================
// Account 5 — Harbor Point Group · data + content syndication (leads + data)
// ===========================================================================

function buildHarbor(): Account {
  const cpl = 45;
  const campaigns: Campaign[] = [
    {
      id: 'mi', name: 'Manufacturing IT buyers', geo: 'NAM', accepted: 96, target: 160, delivered: 138,
      status: 'active', budget: 7200, startDate: 'Jan 18, 2026', endDate: 'Apr 30, 2026',
      deliveryDays: ['Monday', 'Thursday'], leadsPerDelivery: 35,
      schedule: [
        drop('19 Jan', 20260119, 35, 'delivered'),
        drop('22 Jan', 20260122, 35, 'delivered'),
        drop('26 Jan', 20260126, 34, 'delivered'),
        drop('29 Jan', 20260129, 34, 'delivered'),
        drop('16 Mar', 20260316, 35, 'upcoming'),
      ],
    },
    {
      id: 'ia', name: 'Industrial automation leads', geo: 'EMEA', accepted: 54, target: 100, delivered: 79,
      status: 'active', budget: 4500, startDate: 'Feb 1, 2026', endDate: 'May 15, 2026',
      deliveryDays: ['Wednesday'], leadsPerDelivery: 26,
      schedule: [
        drop('21 Jan', 20260121, 27, 'delivered'),
        drop('4 Feb', 20260204, 26, 'delivered'),
        drop('18 Feb', 20260218, 26, 'delivered'),
        drop('18 Mar', 20260318, 26, 'upcoming'),
      ],
    },
  ];
  const leads = leadsFromCampaigns(campaigns, cpl); // billable 150 · delivered 217 · target 260
  const leadsInReview = 7;

  const invoices: Invoice[] = [
    {
      id: 'INV-H301', period: 'June 2026', issued: '12 Jun', due: '2 Jul', terms: 'Net 20', status: 'paid',
      lines: [
        { serviceId: 'idata', description: 'iData · records delivered', basis: '10,000 records at $0.42', amount: 4200 },
        { serviceId: 'cleanrich', description: 'CleanRich · records processed', basis: '11,000 records at $0.11', amount: 1210 },
        { serviceId: 'leads', description: 'Lead generation · billable leads', basis: '80 billable of 116 delivered, at $45', amount: 3600 },
      ],
    },
    {
      id: 'INV-H312', period: 'July 2026', issued: '10 Jul', due: '30 Jul', terms: 'Net 20', status: 'open',
      lines: [
        { serviceId: 'idata', description: 'iData · records delivered', basis: '8,000 records at $0.42', amount: 3360 },
        { serviceId: 'cleanrich', description: 'CleanRich · records processed', basis: '10,000 records at $0.11', amount: 1100 },
        { serviceId: 'leads', description: 'Lead generation · billable leads', basis: '70 billable of 101 delivered, at $45', amount: 3150 },
      ],
    },
  ];
  const invested = investedOf(invoices); // 16,620
  const dueNow = dueOf(invoices); // 7,610

  const services: Service[] = [
    { id: 'idata', name: 'iData', unit: 'records delivered', received: 18000, target: 24000, qualityLine: 'Field fill 90% · Match 66%' },
    { id: 'cleanrich', name: 'CleanRich', unit: 'records processed', received: 21000, target: 24000, qualityLine: 'Corrected 14% · Deduped 8%' },
    leadsCard(leads),
    // Billed quarterly — first research invoice issues 1 Sep; money math untouched.
    { id: 'research', name: 'B2B Market Research', unit: 'studies delivered', received: 2, target: 3, qualityLine: '640 respondents · 87% completion' },
  ];

  return {
    id: 'harbor',
    name: ACCOUNT_NAMES.harbor,
    descriptor: 'Data, syndication & research',
    entitlements: ['idata', 'cleanrich', 'leads', 'research'],
    user: { name: 'Nina Alvarez', initials: 'NA' },
    overviewKind: 'services',
    services,
    leadsSummary: leads,
    leadsMetrics: leadsMetrics(leads),
    leadsInReview,
    campaigns,
    deliveryTimeline: buildTimeline(campaigns),
    leads: [
      { id: 'l1', name: 'Gordon Fraser', title: 'Plant IT Lead', company: 'Ironside Components', campaignId: 'mi', date: '22 Jul', status: 'accepted' },
      { id: 'l2', name: 'Mei Ling Tan', title: 'Automation Engineer', company: 'Delta Works', campaignId: 'ia', date: '22 Jul', status: 'accepted' },
      { id: 'l3', name: 'Paulo Cardoso', title: 'Operations Director', company: 'Veranova Steel', campaignId: 'mi', date: '21 Jul', status: 'review' },
      { id: 'l4', name: 'Ingrid Halvorsen', title: 'Head of Engineering', company: 'Nordkraft Industrial', campaignId: 'ia', date: '20 Jul', status: 'accepted' },
      { id: 'l5', name: 'Dev Sharma', title: 'IT Procurement', company: 'Cascade Manufacturing', campaignId: 'mi', date: '19 Jul', status: 'review' },
    ],
    batches: [
      { id: 'b1', serviceId: 'idata', name: 'Account universe — batch 1', records: 9000, date: '8 Jul', status: 'good', statusLabel: 'Delivered' },
      { id: 'b2', serviceId: 'idata', name: 'Account universe — batch 2', records: 9000, date: '22 Jul', status: 'good', statusLabel: 'Delivered' },
      { id: 'b3', serviceId: 'idata', name: 'Account universe — batch 3', records: 6000, date: '5 Aug', status: 'neutral', statusLabel: 'Scheduled' },
      { id: 'b4', serviceId: 'cleanrich', name: 'Enrichment pass — batch 1', records: 11000, date: '10 Jul', status: 'good', statusLabel: 'Delivered' },
      { id: 'b5', serviceId: 'cleanrich', name: 'Enrichment pass — batch 2', records: 10000, date: '24 Jul', status: 'good', statusLabel: 'Delivered' },
    ],
    studies: [
      { id: 's1', name: 'Manufacturing buyer sentiment', geo: 'NAM', method: 'Online survey · n=320', stage: 3, detail: '320 respondents · 91% completion', due: 'Delivered 30 Jun' },
      { id: 's2', name: 'Industrial automation adoption', geo: 'EMEA', method: 'CATI interviews · n=200', stage: 3, detail: '200 respondents · 88% completion', due: 'Delivered 15 Jul' },
      { id: 's3', name: 'Plant digitisation outlook', geo: 'Global', method: 'Mixed mode · n=300 target', stage: 1, detail: '120 of 300 respondents to date', due: 'Report due 12 Sep' },
    ],
    documents: [
      { id: 'JH-5120', title: 'Manufacturing IT buyers, NAM', kind: 'Job card', type: 'client_signature', value: 7200, date: '18 Jul', phase: 4 },
      { id: 'JH-5088', title: 'Q3 data build, global', kind: 'Job card', type: 'client_signature', value: 9000, date: '3 Jul', phase: 4 },
      { id: 'JH-5044', title: 'Industrial automation, EMEA', kind: 'Job card', type: 'msa_covered', value: 4500, date: '20 Jun', phase: 4 },
      { id: 'MSA', title: 'Master services agreement', kind: 'Contract', kindDetail: 'Contract · expires Feb 2027', type: 'msa_covered', value: null, date: '5 Feb', phase: 4 },
    ],
    invoices,
    tickets: [
      { id: 't1', subject: 'Confirm target industries for batch 3', opened: '21 Jul', status: 'needsYou', statusLabel: 'Awaiting your reply', lastMessage: 'DBSL · Batch 3 targets are drafted from your current universe. Please confirm the two additional industries before 1 August.' },
      { id: 't2', subject: 'Weekly delivery report cadence', opened: '13 Jul', status: 'good', statusLabel: 'Resolved', lastMessage: 'DBSL · Weekly reports now go out every Friday afternoon covering both data batches and lead drops.' },
    ],
    contacts: [
      { name: 'Owen Pryce', role: 'Account manager' },
      { name: 'Fatima Noor', role: 'Campaign manager' },
    ],
    team: [
      { name: 'Nina Alvarez', email: 'nina.alvarez@harborpoint.example', role: 'Owner' },
      { name: 'Ben Whitaker', email: 'ben.whitaker@harborpoint.example', role: 'Billing' },
    ],
    lockedNote: 'Programmatic advertising is available on your account.',
    invested,
    dueNow,
    heroes: {
      overview: {
        eyebrow: 'Data & syndication · Q3 2026',
        headline: `${money(invested)} invested, tracking to plan`,
        subhead: 'Data services and lead generation running together.',
        actions: [
          { label: 'View report', kind: 'cta', to: 'report' },
          { label: '1 invoice open', kind: 'pill', to: 'invoices' },
          { label: '2 campaigns live', kind: 'pill', to: 'leads' },
        ],
      },
      data: {
        eyebrow: 'Data services · Q3 2026',
        headline: `${int(18000 + 21000)} records delivered across two services`,
        subhead: 'iData and CleanRich feeding your syndication campaigns.',
        actions: [
          { label: 'Download data report', kind: 'cta', to: 'report' },
          { label: '4 batches delivered', kind: 'pill' },
        ],
      },
      leads: {
        eyebrow: 'Lead generation · Q3 2026',
        headline: `${int(leads.billable)} billable leads of ${int(leads.target)}`,
        subhead: `${int(leads.delivered)} delivered to date. ${leadsInReview} are awaiting your review and may change this count.`,
        actions: [
          { label: `Review ${leadsInReview} leads`, kind: 'cta', to: 'leads?review=1' },
          { label: 'Download CSV', kind: 'pill' },
          { label: 'Push to HubSpot', kind: 'pill' },
        ],
      },
      research: {
        eyebrow: 'B2B Market Research · Q3 2026',
        headline: 'Two of three studies delivered',
        subhead: 'Plant digitisation outlook is in field. Billed quarterly — next invoice 1 September.',
        actions: [
          { label: 'Download latest report', kind: 'cta' },
          { label: 'View programme report', kind: 'pill', to: 'report' },
        ],
      },
      documents: {
        eyebrow: 'Documents',
        headline: 'All documents are signed and current',
        subhead: 'Nothing needs your signature right now.',
        actions: [{ label: 'Download archive', kind: 'pill' }],
      },
      invoices: {
        eyebrow: 'Accounts payable',
        headline: `${money(dueNow)} due`,
        subhead: 'One invoice open, due 30 July. Net 20 terms.',
        actions: [
          { label: 'Pay invoice', kind: 'cta' },
          { label: 'Download PDF', kind: 'pill' },
          { label: 'Payment history', kind: 'pill' },
        ],
      },
      support: {
        eyebrow: 'Support',
        headline: 'How can we help?',
        subhead: 'Your DBSL team typically replies within one business day.',
        actions: [
          { label: 'Raise a request', kind: 'cta' },
          { label: 'View past requests', kind: 'pill' },
        ],
      },
    },
  };
}

export const accounts: Account[] = [
  buildAcme(),
  buildNorthwind(),
  buildCalderwood(),
  buildVantage(),
  buildHarbor(),
];

export const getAccount = (id: string | undefined): Account | undefined =>
  accounts.find((a) => a.id === id);

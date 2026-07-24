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
  Invoice,
  LeadsSummary,
  Service,
} from './types';

/** Display names in one place, per docs/04 — rename an account in a single edit. */
export const ACCOUNT_NAMES = {
  acme: 'Acme Corp',
  northwind: 'Northwind Trading',
  calderwood: 'Calderwood Group',
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

/** Leads figures, computed once from campaigns. */
const leadsFromCampaigns = (campaigns: Campaign[], costPerLead: number): LeadsSummary => {
  const billable = sum(campaigns.map((c) => c.accepted));
  const delivered = sum(campaigns.map((c) => c.delivered));
  const target = sum(campaigns.map((c) => c.target));
  return { billable, delivered, target, acceptRate: pct(billable, delivered), costPerLead };
};

/** Synthesise the Overview leads card from the derived summary. */
const leadsCard = (s: LeadsSummary): Service => ({
  id: 'leads',
  name: 'Lead generation',
  unit: 'billable leads',
  received: s.billable,
  target: s.target,
  qualityLine: `${int(s.delivered)} delivered · Accept ${s.acceptRate}`,
  status: 'action',
  statusLabel: 'Behind pace',
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
    { id: 'cs', name: 'Cloud security', geo: 'NAM', accepted: 41, target: 210, delivered: 68 },
    { id: 'dp', name: 'Data platform guide', geo: 'EMEA', accepted: 34, target: 180, delivered: 61 },
    { id: 'is', name: 'Infrastructure survey', geo: 'APAC', accepted: 21, target: 110, delivered: 36 },
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
    leadsCard(leads),
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
    campaigns,
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
    media: {
      impressions,
      spend,
      budget,
      metrics: [
        { label: 'Viewability', value: '68%' },
        { label: 'CTR', value: '0.34%' },
        { label: 'Accounts reached', value: '31.2k' },
        { label: 'Brand safe', value: '99.4%', positive: true },
      ],
      weeklyBars: [38, 52, 47, 66, 71, 58, 80, 74, 91, 86, 100, 64],
      placements: [
        { name: 'Enterprise technology sites', impressions: 612400, ctr: '0.41%' },
        { name: 'Cloud & infrastructure', impressions: 498100, ctr: '0.37%' },
        { name: 'IT decision-maker network', impressions: 421900, ctr: '0.29%' },
        { name: 'Business & finance', impressions: 342500, ctr: '0.31%' },
        { name: 'Manufacturing & logistics', impressions: 273400, ctr: '0.22%' },
      ],
    },
    documents: [
      { id: 'JC-2841', title: 'Cloud security, NAM', kind: 'Job card', type: 'client_signature', value: 8100, date: '18 Jul', phase: 3, scopeSummary: '180 leads at $45 · $8,100 · scope agreed 18 July' },
      { id: 'JC-2798', title: 'Data platform guide, EMEA', kind: 'Job card', type: 'client_signature', value: 6300, date: '2 Jul', phase: 4 },
      { id: 'JC-2765', title: 'Audience build, global', kind: 'Job card', type: 'msa_covered', value: 21000, date: '14 Jun', phase: 4 },
      { id: 'MSA', title: 'Master services agreement', kind: 'Contract', kindDetail: 'Contract · expires Mar 2027', type: 'msa_covered', value: null, date: '3 Mar', phase: 4 },
    ],
    invoices,
    tickets: [
      { id: 't1', subject: 'Update billing contact email', opened: '20 Jul', status: 'neutral', statusLabel: 'In progress' },
      { id: 't2', subject: 'Clarify programmatic viewability methodology', opened: '15 Jul', status: 'good', statusLabel: 'Resolved' },
      { id: 't3', subject: 'Request additional lead fields', opened: '12 Jul', status: 'needsYou', statusLabel: 'Awaiting your reply' },
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
    invested,
    dueNow,
    heroes: {
      overview: {
        eyebrow: 'Your programme · Q3 2026',
        headline: `${money(invested)} invested, tracking to plan`,
        subhead: 'Four services running. Lead generation is behind pace.',
        actions: [
          { label: 'View report', kind: 'cta' },
          { label: '2 invoices open', kind: 'pill' },
          { label: '1 signature due', kind: 'pill' },
        ],
      },
      data: {
        eyebrow: 'Data services · Q3 2026',
        headline: `${int(38400 + 47200)} records delivered across two services`,
        subhead: 'iData and CleanRich running against your account universe.',
        actions: [
          { label: 'Download data report', kind: 'cta' },
          { label: '4 batches delivered', kind: 'pill' },
        ],
      },
      media: {
        eyebrow: 'Programmatic · Q3 2026',
        headline: `${int(impressions)} impressions`,
        subhead: `${money(spend)} of ${money(budget)} spent, flight ${pct(spend, budget)} complete.`,
        actions: [
          { label: 'View media report', kind: 'cta' },
          { label: 'Brand safe 99.4%', kind: 'pill' },
        ],
      },
      leads: {
        eyebrow: 'Lead generation · Q3 2026',
        headline: `${int(leads.billable)} billable leads of ${int(leads.target)}`,
        subhead: `${int(leads.delivered)} delivered to date. ${leadsInReview} are awaiting your review and may change this count.`,
        actions: [
          { label: `Review ${leadsInReview} leads`, kind: 'cta' },
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
    { id: 'cs', name: 'Cloud security whitepaper', geo: 'NAM', accepted: 148, target: 180, delivered: 214 },
    { id: 'dp', name: 'Data platform buyers guide', geo: 'EMEA', accepted: 109, target: 140, delivered: 168 },
    { id: 'is', name: 'Infrastructure survey', geo: 'APAC', accepted: 55, target: 80, delivered: 91 },
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
    campaigns,
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
      { id: 't1', subject: 'Question about lead delivery pacing', opened: '18 Jul', status: 'good', statusLabel: 'Resolved' },
      { id: 't2', subject: 'Request weekly delivery report', opened: '10 Jul', status: 'neutral', statusLabel: 'In progress' },
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
          { label: '3 campaigns live', kind: 'pill' },
          { label: 'All invoices settled', kind: 'pill' },
        ],
      },
      leads: {
        eyebrow: 'Lead generation · Q3 2026',
        headline: `${int(leads.billable)} billable leads of ${int(leads.target)}`,
        subhead: `${int(leads.delivered)} delivered to date. ${leadsInReview} are awaiting your review and may change this count.`,
        actions: [
          { label: `Review ${leadsInReview} leads`, kind: 'cta' },
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
  ];
  const recordsDelivered = sum(services.map((s) => s.received)); // 52,500

  return {
    id: 'calderwood',
    name: ACCOUNT_NAMES.calderwood,
    descriptor: 'Data services',
    entitlements: ['idata', 'cleanrich'],
    user: { name: 'Alan Weir', initials: 'AW' },
    overviewKind: 'services',
    services,
    campaigns: [],
    leads: [],
    batches: [
      { id: 'b1', serviceId: 'idata', name: 'Q3 universe build — batch 1', records: 12000, date: '10 Jul', status: 'good', statusLabel: 'Delivered' },
      { id: 'b2', serviceId: 'idata', name: 'Q3 universe build — batch 2', records: 12000, date: '24 Jul', status: 'good', statusLabel: 'Delivered' },
      { id: 'b3', serviceId: 'idata', name: 'Q3 universe build — batch 3', records: 6000, date: '4 Aug', status: 'neutral', statusLabel: 'Scheduled' },
      { id: 'b4', serviceId: 'cleanrich', name: 'Enrichment pass — batch 1', records: 14500, date: '12 Jul', status: 'good', statusLabel: 'Delivered' },
      { id: 'b5', serviceId: 'cleanrich', name: 'Enrichment pass — batch 2', records: 14000, date: '24 Jul', status: 'good', statusLabel: 'Delivered' },
    ],
    documents: [
      { id: 'JD-4012', title: 'Q4 data build scope, global', kind: 'Job card', type: 'client_signature', value: 12600, date: '20 Jul', phase: 3, scopeSummary: '30,000 records at $0.42 · $12,600 · scope agreed 20 July' },
      { id: 'JD-3980', title: 'Q3 data build, global', kind: 'Job card', type: 'client_signature', value: 12600, date: '1 Jun', phase: 4 },
      { id: 'MSA', title: 'Master services agreement', kind: 'Contract', kindDetail: 'Contract · expires Feb 2027', type: 'msa_covered', value: null, date: '20 Feb', phase: 4 },
    ],
    invoices,
    tickets: [
      { id: 't1', subject: 'Confirm field mapping for batch 3', opened: '21 Jul', status: 'needsYou', statusLabel: 'Awaiting your reply' },
      { id: 't2', subject: 'Request match-rate breakdown by region', opened: '14 Jul', status: 'good', statusLabel: 'Resolved' },
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
          { label: 'View data report', kind: 'cta' },
          { label: '1 invoice open', kind: 'pill' },
          { label: 'Next batch 4 Aug', kind: 'pill' },
        ],
      },
      data: {
        eyebrow: 'Data services · Q3 2026',
        headline: `${int(recordsDelivered)} records delivered across two services`,
        subhead: 'iData and CleanRich running against your target universe.',
        actions: [
          { label: 'Download data report', kind: 'cta' },
          { label: '4 batches delivered', kind: 'pill' },
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

export const accounts: Account[] = [buildAcme(), buildNorthwind(), buildCalderwood()];

export const getAccount = (id: string | undefined): Account | undefined =>
  accounts.find((a) => a.id === id);

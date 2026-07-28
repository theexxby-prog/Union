// Ops fixtures and the cross-account derivations the internal screens need.
//
// The client app is account-shaped: one account at a time, everything scoped to
// it. Ops is the transverse view — every campaign across every client. That is a
// DERIVATION of the same fixtures, never a second copy, so hard rule 4 holds and
// the two sides can never disagree. `npm run verify` asserts it.
//
// Roles and permissions are ported from the platform Union succeeds; the names
// are fictional. Client-facing roles reuse the DBSL contacts the client already
// sees on their Support screen, so the campaign manager in ops is the same
// person the client is told to call.

import { accounts } from './accounts';
import type { Account, Campaign, OpsRoleId, OpsUser } from './types';

/* ---------------------------------------------------------------------------
   The demo users — one per role.
   --------------------------------------------------------------------------- */

/** Accounts whose Support screen lists this person in this role. Derived, so an
 *  ops user's client list can never drift from what the client is shown. */
const accountsContacting = (name: string): string[] =>
  accounts.filter((a) => a.contacts.some((c) => c.name === name)).map((a) => a.id);

const initialsOf = (name: string): string =>
  name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('');

interface OpsUserSeed {
  id: OpsRoleId;
  name: string;
  roleLabel: string;
  detail: string;
  /** True when the role appears on client-facing Support cards; assignment is
   *  then derived from those contacts rather than declared here. */
  clientFacing: boolean;
}

const OPS_SEEDS: OpsUserSeed[] = [
  {
    id: 'ops_manager',
    name: 'Anil Raghavan',
    roleLabel: 'Operations manager',
    detail: 'Runs delivery across every client. Full access.',
    clientFacing: false,
  },
  {
    id: 'campaign_manager',
    name: 'Marcus Cole',
    roleLabel: 'Campaign manager',
    detail: 'Owns delivery for assigned clients — approvals, lead uploads, pacing.',
    clientFacing: true,
  },
  {
    id: 'campaign_backup',
    name: 'David Osei',
    roleLabel: 'Campaign manager (backup)',
    detail: 'Covers assigned clients when the campaign manager is away.',
    clientFacing: true,
  },
  {
    id: 'account_manager',
    name: 'Sarah Whitfield',
    roleLabel: 'Account manager',
    detail: 'Sales side — brings in the scope and confirms job cards.',
    clientFacing: true,
  },
  {
    id: 'accounts',
    name: 'Claire Dunn',
    roleLabel: 'Finance',
    detail: 'Validates invoice amounts before anything is sent to a client.',
    clientFacing: false,
  },
];

export const opsUsers: OpsUser[] = OPS_SEEDS.map((s) => ({
  id: s.id,
  name: s.name,
  initials: initialsOf(s.name),
  roleLabel: s.roleLabel,
  detail: s.detail,
  // Non-client-facing roles see everything; an empty list means "all accounts".
  assignedAccountIds: s.clientFacing ? accountsContacting(s.name) : [],
}));

export const getOpsUser = (id: string): OpsUser | undefined =>
  opsUsers.find((u) => u.id === id);

/** The accounts an ops user works on. Empty assignment = the whole book. */
export const accountsFor = (user: OpsUser): Account[] =>
  user.assignedAccountIds.length === 0
    ? accounts
    : accounts.filter((a) => user.assignedAccountIds.includes(a.id));

/* ---------------------------------------------------------------------------
   Cross-account derivations.
   --------------------------------------------------------------------------- */

/** A campaign with its client attached — the row shape every ops list uses. */
export interface OpsCampaign extends Campaign {
  accountId: string;
  accountName: string;
}

export const campaignsAcross = (list: Account[]): OpsCampaign[] =>
  list.flatMap((a) =>
    a.campaigns.map((c) => ({ ...c, accountId: a.id, accountName: a.name })),
  );

const sum = (ns: number[]): number => ns.reduce((a, b) => a + b, 0);

/** The roll-up behind the ops overview. Every figure is a sum of the same
 *  fixtures the client screens read, which is what makes the two reconcile. */
export interface OpsTotals {
  accounts: number;
  campaigns: number;
  activeCampaigns: number;
  pendingApproval: number;
  accepted: number;
  delivered: number;
  target: number;
  budget: number;
  invested: number;
  dueNow: number;
  leadsInReview: number;
}

export const opsTotals = (list: Account[]): OpsTotals => {
  const camps = campaignsAcross(list);
  return {
    accounts: list.length,
    campaigns: camps.length,
    activeCampaigns: camps.filter((c) => c.status === 'active').length,
    pendingApproval: camps.filter((c) => c.status === 'pendingApproval').length,
    accepted: sum(camps.map((c) => c.accepted)),
    delivered: sum(camps.map((c) => c.delivered)),
    target: sum(camps.map((c) => c.target)),
    budget: sum(camps.map((c) => c.budget)),
    invested: sum(list.map((a) => a.invested)),
    dueNow: sum(list.map((a) => a.dueNow)),
    leadsInReview: sum(list.map((a) => a.leadsInReview ?? 0)),
  };
};

/** Per-client roll-up for the ops book-of-business table. */
export interface OpsAccountRow {
  id: string;
  name: string;
  descriptor: string;
  services: number;
  campaigns: number;
  accepted: number;
  target: number;
  invested: number;
  dueNow: number;
  needsAttention: number;
}

export const opsAccountRows = (list: Account[]): OpsAccountRow[] =>
  list.map((a) => ({
    id: a.id,
    name: a.name,
    descriptor: a.descriptor,
    services: a.entitlements.length,
    campaigns: a.campaigns.length,
    accepted: sum(a.campaigns.map((c) => c.accepted)),
    target: sum(a.campaigns.map((c) => c.target)),
    invested: a.invested,
    dueNow: a.dueNow,
    needsAttention: (a.leadsInReview ?? 0) > 0 ? 1 : 0,
  }));

// Ops navigation and permissions.
//
// Two separate ideas, deliberately kept apart:
//   · PERMISSION — this role is not allowed here. The destination is hidden.
//   · NOT BUILT YET — allowed, but the screen does not exist. Shown with a lock,
//     the same device the client side uses for unentitled services, so the ops
//     roadmap is legible in the nav rather than hidden.
import type { OpsRoleId, OpsScreenKey, OpsUser } from '@/data/types';

export interface OpsTabDef {
  key: OpsScreenKey;
  label: string;
  /** Path segment under /ops/:roleId. Empty string = the overview index. */
  segment: string;
  /** Roles allowed here. */
  roles: OpsRoleId[];
  /** False while the screen is still to be built — renders locked. */
  built: boolean;
}

const ALL: OpsRoleId[] = [
  'ops_manager',
  'campaign_manager',
  'campaign_backup',
  'account_manager',
  'accounts',
];
const DELIVERY: OpsRoleId[] = ['ops_manager', 'campaign_manager', 'campaign_backup'];

export const OPS_TABS: OpsTabDef[] = [
  { key: 'overview', label: 'Overview', segment: '', roles: DELIVERY, built: true },
  {
    // Finance is a deliberate addition to what the platform we succeed grants
    // here: they bill against contracted campaigns, so read-only visibility of
    // what is contracted belongs with them. Editing stays gated.
    key: 'campaigns',
    label: 'Campaigns',
    segment: 'campaigns',
    roles: [...DELIVERY, 'account_manager', 'accounts'],
    built: true,
  },
  { key: 'approvals', label: 'Approvals', segment: 'approvals', roles: DELIVERY, built: false },
  {
    key: 'leads',
    label: 'Leads',
    segment: 'leads',
    roles: ['ops_manager', 'campaign_manager'],
    built: false,
  },
  { key: 'jobcards', label: 'Job cards', segment: 'jobcards', roles: ALL, built: false },
  {
    key: 'invoices',
    label: 'Invoices',
    segment: 'invoices',
    roles: ['ops_manager', 'campaign_manager', 'account_manager', 'accounts'],
    built: false,
  },
  { key: 'admin', label: 'Admin', segment: 'admin', roles: ['ops_manager'], built: false },
];

/** Destinations this role may reach at all — built or not. */
export const opsTabsFor = (user: OpsUser): OpsTabDef[] =>
  OPS_TABS.filter((t) => t.roles.includes(user.id));

export const opsPath = (roleId: string, segment: string): string =>
  segment ? `/ops/${roleId}/${segment}` : `/ops/${roleId}`;

/** First path segment under /ops/:roleId ('' = overview). */
export const opsSegment = (pathname: string): string => {
  const parts = pathname.split('/').filter(Boolean); // ['ops', roleId, seg?]
  return parts.length > 2 ? parts[2] : '';
};

/* ---- Permissions — ported verbatim from the platform Union succeeds -------- */

export const canEditCampaigns = (u: OpsUser): boolean =>
  u.id === 'ops_manager' || u.id === 'campaign_manager';

export const canUploadLeads = (u: OpsUser): boolean =>
  u.id === 'ops_manager' || u.id === 'campaign_manager';

export const canManageTeam = (u: OpsUser): boolean => u.id === 'ops_manager';

export const canUploadScopeDump = (u: OpsUser): boolean => u.id === 'account_manager';

export const canConfirmJobCards = (u: OpsUser): boolean =>
  ['account_manager', 'campaign_manager', 'campaign_backup'].includes(u.id);

export const canValidateInvoices = (u: OpsUser): boolean => u.id === 'accounts';

/** Where a role lands when it is switched to: keep the current destination when
 *  the new role can reach it, otherwise its first available one. */
export const opsSwitchTarget = (target: OpsUser, pathname: string): string => {
  const seg = opsSegment(pathname);
  const tabs = opsTabsFor(target);
  const here = tabs.find((t) => t.segment === seg && t.built);
  if (here) return opsPath(target.id, here.segment);
  const first = tabs.find((t) => t.built);
  return opsPath(target.id, first ? first.segment : '');
};

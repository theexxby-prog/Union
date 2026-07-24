// Tab model + entitlement gating. Seven top-level tabs is the ceiling (docs/03).
import type { Account, ScreenKey, ServiceId } from '@/data/types';

export interface TabDef {
  key: ScreenKey;
  label: string;
  /** Path segment under /:accountId. Empty string = the overview index. */
  segment: string;
  /** Service entitlements that unlock this tab. Undefined = always available. */
  needs?: ServiceId[];
}

export const TABS: TabDef[] = [
  { key: 'overview', label: 'Overview', segment: '' },
  { key: 'data', label: 'Data', segment: 'data', needs: ['idata', 'cleanrich'] },
  { key: 'media', label: 'Media', segment: 'media', needs: ['programmatic'] },
  { key: 'leads', label: 'Leads', segment: 'leads', needs: ['leads'] },
  { key: 'documents', label: 'Documents', segment: 'documents' },
  { key: 'invoices', label: 'Invoices', segment: 'invoices' },
  { key: 'support', label: 'Support', segment: 'support' },
];

/** A service tab is entitled when the account holds at least one of its services. */
export const isEntitled = (tab: TabDef, account: Account): boolean =>
  !tab.needs || tab.needs.some((s) => account.entitlements.includes(s));

export const hasService = (account: Account, ...ids: ServiceId[]): boolean =>
  ids.some((id) => account.entitlements.includes(id));

export const path = (accountId: string, segment: string): string =>
  segment ? `/${accountId}/${segment}` : `/${accountId}`;

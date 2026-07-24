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
  { key: 'finance', label: 'F&A', segment: 'finance', needs: ['fa'] },
  { key: 'research', label: 'Research', segment: 'research', needs: ['research'] },
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

/** First path segment under /:accountId for a location pathname ('' = overview). */
export const currentSegment = (pathname: string): string => {
  const parts = pathname.split('/').filter(Boolean);
  return parts.length > 1 ? parts[1] : '';
};

/** Segments reachable on any account regardless of entitlements. */
const ALWAYS_AVAILABLE = new Set(['documents', 'invoices', 'support', 'account', 'report', '']);

/** Where to land when switching to another account: keep the current tab if the
 *  target account can see it, otherwise fall back to its Overview. */
export const switchTarget = (targetId: string, pathname: string, target: Account): string => {
  const seg = currentSegment(pathname);
  if (ALWAYS_AVAILABLE.has(seg)) return path(targetId, seg);
  const tab = TABS.find((t) => t.segment === seg);
  if (tab && isEntitled(tab, target)) return path(targetId, seg);
  return path(targetId, '');
};

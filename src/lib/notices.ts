// Account notices — derived entirely from fixtures, never stored. Feeds the
// notification bell and the Overview "Needs your attention" strip, so the two
// always agree.
import { invoiceTotal } from '@/data/accounts';
import { int, money } from '@/data/format';
import type { Account, StatusState } from '@/data/types';

/** What kind of thing needs the client — drives the leading icon on the
 *  attention strip, so the list can be parsed without reading every row. */
export type NoticeKind = 'document' | 'invoice' | 'campaign' | 'lead' | 'support';

export interface Notice {
  id: string;
  label: string;
  /** Route segment under /:accountId (may carry a query). Empty = Overview. */
  segment: string;
  state: StatusState;
  kind: NoticeKind;
}

export function noticesFor(account: Account): Notice[] {
  const out: Notice[] = [];

  for (const d of account.documents) {
    if (d.type === 'client_signature' && d.phase < 4) {
      out.push({
        id: `doc-${d.id}`,
        label: `${d.id} is awaiting your signature`,
        segment: 'documents',
        state: 'action',
        kind: 'document',
      });
    }
  }

  for (const inv of account.invoices) {
    if (inv.status === 'overdue') {
      out.push({
        id: `inv-${inv.id}`,
        label: `${inv.id} is overdue — ${money(invoiceTotal(inv))} due`,
        segment: 'invoices',
        state: 'action',
        kind: 'invoice',
      });
    } else if (inv.status === 'open') {
      out.push({
        id: `inv-${inv.id}`,
        label: `${inv.id} is open — due ${inv.due}`,
        segment: 'invoices',
        state: 'needsYou',
        kind: 'invoice',
      });
    }
  }

  for (const c of account.campaigns) {
    if (c.status === 'pendingApproval') {
      out.push({
        id: `camp-${c.id}`,
        label: `${c.name} is awaiting your approval`,
        segment: '',
        state: 'needsYou',
        kind: 'campaign',
      });
    }
  }

  if (account.leadsInReview) {
    out.push({
      id: 'leads-review',
      label: `${int(account.leadsInReview)} leads are awaiting your review`,
      segment: 'leads?review=1',
      state: 'needsYou',
      kind: 'lead',
    });
  }

  for (const t of account.tickets) {
    if (t.status === 'needsYou') {
      out.push({
        id: `ticket-${t.id}`,
        label: `Support · ${t.subject}`,
        segment: 'support',
        state: 'needsYou',
        kind: 'support',
      });
    }
  }

  // Action items first — red means act.
  return out.sort((a, b) => (a.state === 'action' ? 0 : 1) - (b.state === 'action' ? 0 : 1));
}

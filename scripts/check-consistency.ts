// Reconciliation gate. Enforces docs/04 "Consistency checks to run before finishing".
// Bundled + run by scripts/verify.sh (npm run verify). Exits non-zero on any failure.

import { accounts, getAccount, invoiceTotal } from '../src/data/accounts';
import { pctValue } from '../src/data/format';
import type { Account, ServiceId } from '../src/data/types';

let failures = 0;
const check = (name: string, pass: boolean, detail = ''): void => {
  const mark = pass ? '  ok ' : 'FAIL ';
  if (!pass) failures++;
  console.log(`${mark} ${name}${detail ? ` — ${detail}` : ''}`);
};

const sum = (ns: number[]): number => ns.reduce((a, b) => a + b, 0);

// --- Anchors: the exact figures docs/04 says must appear. Catches line-item drift.
const ANCHORS: Record<string, { invested: number; dueNow: number }> = {
  acme: { invested: 58400, dueNow: 18420 },
  northwind: { invested: 14040, dueNow: 0 },
  calderwood: { invested: 13215, dueNow: 6580 },
};

for (const acc of accounts) {
  console.log(`\n=== ${acc.name} (${acc.id}) ===`);

  // Each invoice total == sum of its line amounts (and no empty invoices).
  for (const inv of acc.invoices) {
    check(`${inv.id} total = sum(lines)`, inv.lines.length > 0 && invoiceTotal(inv) === sum(inv.lines.map((l) => l.amount)), `${invoiceTotal(inv)}`);
  }

  // Invested = sum of all invoice totals, and matches the doc anchor.
  const investedCalc = sum(acc.invoices.map(invoiceTotal));
  check('invested = sum(invoice totals)', acc.invested === investedCalc, `${acc.invested}`);
  check('invested matches docs/04 anchor', acc.invested === ANCHORS[acc.id].invested, `${acc.invested} vs ${ANCHORS[acc.id].invested}`);

  // Due now = sum of open/overdue invoice totals, and matches the doc anchor.
  const dueCalc = sum(acc.invoices.filter((i) => i.status !== 'paid').map(invoiceTotal));
  check('dueNow = sum(open/overdue totals)', acc.dueNow === dueCalc, `${acc.dueNow}`);
  check('dueNow matches docs/04 anchor', acc.dueNow === ANCHORS[acc.id].dueNow, `${acc.dueNow} vs ${ANCHORS[acc.id].dueNow}`);

  // Leads: campaign accepted totals == leads billable; delivered/target reconcile.
  if (acc.leadsSummary) {
    const ls = acc.leadsSummary;
    check('leads billable = sum(campaign accepted)', ls.billable === sum(acc.campaigns.map((c) => c.accepted)), `${ls.billable}`);
    check('leads delivered = sum(campaign delivered)', ls.delivered === sum(acc.campaigns.map((c) => c.delivered)), `${ls.delivered}`);
    check('leads target = sum(campaign target)', ls.target === sum(acc.campaigns.map((c) => c.target)), `${ls.target}`);
    check('accept rate = round(billable/delivered)', ls.acceptRate === `${pctValue(ls.billable, ls.delivered)}%`, ls.acceptRate);
  }

  // Batches: delivered record counts per service == that service's received figure.
  for (const sid of ['idata', 'cleanrich'] as const) {
    const svc = acc.services.find((s) => s.id === sid);
    if (!svc) continue;
    const delivered = sum(acc.batches.filter((b) => b.serviceId === sid && b.status === 'good').map((b) => b.records));
    check(`${sid} delivered batches = received (${svc.received})`, delivered === svc.received, `${delivered}`);
  }

  // Media placements sum to the impression total.
  if (acc.media) {
    check('placements sum = impressions', sum(acc.media.placements.map((p) => p.impressions)) === acc.media.impressions, `${acc.media.impressions}`);
    check('weekly bars count = 12', acc.media.weeklyBars.length === 12);
  }

  // Every invoice line references an entitled service.
  const entitled = new Set<ServiceId>(acc.entitlements);
  const strayLine = acc.invoices.flatMap((i) => i.lines).find((l) => !entitled.has(l.serviceId));
  check('invoice lines only bill entitled services', strayLine === undefined, strayLine?.description ?? '');

  // Hero headlines carry the derived figure (spot check the money ones).
  const invHero = acc.heroes.invoices;
  if (invHero) {
    const expected = acc.dueNow === 0 ? 'No payment due' : `$${acc.dueNow.toLocaleString('en-US')} due`;
    check('invoices hero headline reflects dueNow', invHero.headline === expected, invHero.headline);
  }

  // Exactly one red CTA per hero, and none when nothing is actionable
  // (dueNow 0 invoices hero, all-signed documents hero).
  for (const [key, hero] of Object.entries(acc.heroes)) {
    if (!hero) continue;
    const ctas = hero.actions.filter((a) => a.kind === 'cta').length;
    check(`${key} hero has at most one red CTA`, ctas <= 1, `${ctas}`);
  }
}

// getAccount smoke test.
check('\ngetAccount("acme") resolves', getAccount('acme')?.name === 'Acme Corp');
check('getAccount("nope") is undefined', getAccount('nope') === undefined);

// Programmatic pacing spot check (docs/03 · reference shows 52%).
const acme = getAccount('acme') as Account;
const prog = acme.services.find((s) => s.id === 'programmatic')!;
check('programmatic pace = 52%', pctValue(prog.received, prog.target) === 52, `${pctValue(prog.received, prog.target)}%`);

console.log(`\n${failures === 0 ? 'ALL CHECKS PASSED' : `${failures} CHECK(S) FAILED`}`);
process.exit(failures === 0 ? 0 : 1);

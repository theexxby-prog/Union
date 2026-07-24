// Invoices — one bill, one line per service. The line basis is where billable-vs-
// delivered appears in commercial form. The total row carries the only non-hairline
// rule in the product, used once to close the invoice (docs/03).
import { useAccount } from '@/components/AppLayout';
import StatusPill from '@/components/StatusPill';
import { Eyebrow, EmptyLine, Hero } from '@/components/ui';
import { invoiceTotal } from '@/data/accounts';
import { money } from '@/data/format';
import type { Invoice } from '@/data/types';

function currentPill(status: Invoice['status']) {
  if (status === 'overdue') return <StatusPill state="action">Overdue</StatusPill>;
  if (status === 'open') return <StatusPill state="needsYou">Awaiting payment</StatusPill>;
  return <StatusPill state="good">Paid</StatusPill>;
}

const historyTone: Record<Invoice['status'], string> = {
  paid: 'text-positive',
  overdue: 'text-cta',
  open: 'text-need-fg',
};
const historyLabel: Record<Invoice['status'], string> = {
  paid: 'Paid',
  overdue: 'Overdue',
  open: 'Open',
};

export default function Invoices() {
  const account = useAccount();

  // The bill in focus: the open/overdue one, else the most recent.
  const current =
    account.invoices.find((i) => i.status !== 'paid') ?? account.invoices[account.invoices.length - 1];
  const history = account.invoices.filter((i) => i.id !== current.id).reverse();
  const total = invoiceTotal(current);
  const totalLabel = current.status === 'paid' ? 'Total' : 'Total due';

  return (
    <>
      <Hero hero={account.heroes.invoices!} />

      <div className="mb-[2px] flex items-center justify-between">
        <Eyebrow>
          {current.id} · {current.period}
        </Eyebrow>
        {currentPill(current.status)}
      </div>
      <p className="mb-[4px] mt-[8px] text-[12px] text-muted">
        Issued {current.issued} · Due {current.due} · {current.terms}
      </p>

      <div className="mb-[30px]">
        {current.lines.map((line) => (
          <div key={line.serviceId + line.amount} className="flex items-center border-t border-hairline py-[13px]">
            <div className="min-w-0 flex-1">
              <p className="text-[13px] text-strong">{line.description}</p>
              <p className="mt-[3px] text-[12px] text-muted">{line.basis}</p>
            </div>
            <span className="text-[13px] font-medium text-strong">{money(line.amount)}</span>
          </div>
        ))}
        <div className="flex items-center border-t border-strong pt-[16px]">
          <span className="flex-1 text-[13px] font-medium text-strong">{totalLabel}</span>
          <span className="font-display text-[23px] font-bold text-strong">{money(total)}</span>
        </div>
      </div>

      <Eyebrow className="mb-[2px]">History</Eyebrow>
      <div>
        {history.length === 0 ? (
          <EmptyLine>Settled invoices will appear here as they are paid.</EmptyLine>
        ) : (
          history.map((inv) => (
            <div key={inv.id} className="flex items-center border-t border-hairline py-[13px]">
              <span className="flex-1 text-[12.5px] text-secondary">
                {inv.id} · {inv.period}
              </span>
              <span className="w-[110px] text-right text-[12.5px] text-strong">{money(invoiceTotal(inv))}</span>
              <span className={`w-[80px] text-right text-[12.5px] ${historyTone[inv.status]}`}>
                {historyLabel[inv.status]}
              </span>
            </div>
          ))
        )}
      </div>
    </>
  );
}

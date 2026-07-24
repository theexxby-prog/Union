// Invoices — one bill, one line per service. The line basis is where billable-vs-
// delivered appears in commercial form. The total row carries the only non-hairline
// rule in the product, used once to close the invoice (docs/03). History rows
// expand to their line items; billing history renders as pace bars.
import { useState } from 'react';
import { IconChevronDown } from '@tabler/icons-react';
import { useAccount } from '@/components/AppLayout';
import StatusPill from '@/components/StatusPill';
import { Eyebrow, EmptyLine, Hero, PaceBars, Panel } from '@/components/ui';
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

/** 'June 2026' → 'Jun' · 'Q3 2026' → 'Q3' — a short axis label for the bars. */
const shortPeriod = (period: string): string => {
  const head = period.split(' ')[0];
  return head.length > 3 ? head.slice(0, 3) : head;
};

function InvoiceLines({ inv }: { inv: Invoice }) {
  const total = invoiceTotal(inv);
  return (
    <>
      {inv.lines.map((line) => (
        <div key={line.serviceId + line.amount} className="flex items-center border-t border-hairline py-[12px]">
          <div className="min-w-0 flex-1">
            <p className="text-[13px] text-strong">{line.description}</p>
            <p className="mt-[3px] text-[12px] text-muted">{line.basis}</p>
          </div>
          <span className="text-[13px] font-medium text-strong">{money(line.amount)}</span>
        </div>
      ))}
      <div className="flex items-center border-t border-strong pt-[16px]">
        <span className="flex-1 text-[13px] font-medium text-strong">
          {inv.status === 'paid' ? 'Total' : 'Total due'}
        </span>
        <span className="font-display text-[23px] font-bold text-strong">{money(total)}</span>
      </div>
    </>
  );
}

export default function Invoices() {
  const account = useAccount();
  const [expanded, setExpanded] = useState<string | null>(null);

  // The bill in focus: the open/overdue one, else the most recent.
  const current =
    account.invoices.find((i) => i.status !== 'paid') ?? account.invoices[account.invoices.length - 1];
  const history = account.invoices.filter((i) => i.id !== current.id).reverse();
  const maxTotal = Math.max(...account.invoices.map(invoiceTotal));

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
        Issued {current.issued} ·{' '}
        <span className={current.status === 'overdue' ? 'font-semibold text-cta' : undefined}>
          Due {current.due}
        </span>{' '}
        · {current.terms}
      </p>

      <div className="mb-[24px]">
        <InvoiceLines inv={current} />
      </div>

      {account.invoices.length > 1 && (
        <>
          <Eyebrow className="mb-[12px]">Billing history</Eyebrow>
          <Panel className="mb-[6px] max-w-[400px]">
            <PaceBars
              height={64}
              bars={account.invoices.map((inv) => ({
                height: (invoiceTotal(inv) / maxTotal) * 100,
                muted: inv.status !== 'paid',
                title: `${inv.id} · ${inv.period} · ${money(invoiceTotal(inv))}`,
              }))}
            />
            <div className="mt-[6px] flex gap-[6px]">
              {account.invoices.map((inv) => (
                <span key={inv.id} className="flex-1 text-center text-[11px] text-muted">
                  {shortPeriod(inv.period)}
                </span>
              ))}
            </div>
          </Panel>
        </>
      )}

      <Eyebrow className="mb-[2px] mt-[24px]">History</Eyebrow>
      <div>
        {history.length === 0 ? (
          <EmptyLine>Settled invoices will appear here as they are paid.</EmptyLine>
        ) : (
          history.map((inv) => {
            const isOpen = expanded === inv.id;
            return (
              <div key={inv.id} className="border-t border-hairline">
                <button
                  onClick={() => setExpanded(isOpen ? null : inv.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center py-[12px] text-left transition-colors duration-150 ease-standard hover:bg-[#fafbfd]"
                  title="Show line items"
                >
                  <span className="flex min-w-0 flex-1 items-center gap-[6px] text-[12.5px] text-secondary">
                    {inv.id} · {inv.period}
                    <IconChevronDown
                      size={12}
                      stroke={2}
                      className={`text-muted transition-transform duration-150 ease-standard ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </span>
                  <span className="w-[110px] text-right text-[12.5px] text-strong">{money(invoiceTotal(inv))}</span>
                  <span className={`w-[80px] text-right text-[12.5px] ${historyTone[inv.status]}`}>
                    {historyLabel[inv.status]}
                  </span>
                </button>
                {isOpen && (
                  <div className="mb-[16px] rounded-card border border-hairline bg-[#fafbfd] px-[16px] pb-[16px] pt-[2px]">
                    <p className="mb-[2px] mt-[10px] text-[11.5px] text-muted">
                      Issued {inv.issued} · Due {inv.due} · {inv.terms}
                    </p>
                    <InvoiceLines inv={inv} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

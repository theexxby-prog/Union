// Invoices — one bill, one line per service. The line basis is where billable-vs-
// delivered appears in commercial form. The total row carries the only non-hairline
// rule in the product, used once to close the invoice (docs/03). History rows
// expand to their line items. The side panel answers "where does the money go",
// which nothing else in the product does — a bar per invoice period only restated
// the History table underneath it, three near-equal columns saying nothing.
import { useState } from 'react';
import { IconChevronDown } from '@tabler/icons-react';
import { useAccount } from '@/components/AppLayout';
import StatusPill from '@/components/StatusPill';
import { Cols, EmptyLine, Hero, ProgressRule, Row, Section } from '@/components/ui';
import { invoiceTotal } from '@/data/accounts';
import { money, pctValue } from '@/data/format';
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

/** Total billed per service across every invoice, largest first. Reconciles to
 *  `invested` by construction — the same line amounts, summed a different way.
 *  The service name is the head of the line description ("iData · records
 *  delivered"), so it can never drift from what the invoice itself says. */
function spendByService(invoices: Invoice[]): { name: string; amount: number }[] {
  const totals = new Map<string, { name: string; amount: number }>();
  for (const inv of invoices) {
    for (const line of inv.lines) {
      const name = line.description.split(' · ')[0];
      const at = totals.get(line.serviceId);
      if (at) at.amount += line.amount;
      else totals.set(line.serviceId, { name, amount: line.amount });
    }
  }
  return [...totals.values()].sort((a, b) => b.amount - a.amount);
}

function InvoiceLines({ inv }: { inv: Invoice }) {
  const total = invoiceTotal(inv);
  return (
    <>
      {inv.lines.map((line) => (
        <Row key={line.serviceId + line.amount} className="first:border-t-0">
          <div className="min-w-0 flex-1">
            <p className="text-[15.5px] text-strong">{line.description}</p>
            <p className="mt-[4px] text-[14px] text-muted">{line.basis}</p>
          </div>
          <span className="text-[16px] font-medium text-strong">{money(line.amount)}</span>
        </Row>
      ))}
      <div className="mt-[6px] flex items-center border-t border-strong pt-[18px]">
        <span className="flex-1 text-[16px] font-medium text-strong">
          {inv.status === 'paid' ? 'Total' : 'Total due'}
        </span>
        <span className="font-display text-[34px] font-bold text-strong">{money(total)}</span>
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
  const multiple = account.invoices.length > 1;

  const byService = spendByService(account.invoices);
  const topService = byService[0];
  const paid = account.invested - account.dueNow;

  const currentSection = (
    <Section
      title={`${current.id} · ${current.period}`}
      className="mb-0 lg:mb-0"
     
      right={currentPill(current.status)}
    >
      <p className="mb-[18px] mt-0 text-[14.5px] text-muted">
        Issued {current.issued} ·{' '}
        <span className={current.status === 'overdue' ? 'font-semibold text-cta' : undefined}>
          Due {current.due}
        </span>{' '}
        · {current.terms}
      </p>
      <InvoiceLines inv={current} />
    </Section>
  );

  return (
    <>
      <Hero hero={account.heroes.invoices!} />

      {multiple ? (
        <Cols className="mb-[28px]">
          <div className="lg:col-span-2">{currentSection}</div>
          <Section title="Where your spend goes" className="mb-0 lg:mb-0">
            <p className="font-display text-[34px] font-bold leading-none text-strong">
              {money(account.invested)}
            </p>
            <p className="mt-[8px] text-[14px] text-muted">
              billed across {account.invoices.length} invoices
            </p>
            <div className="mt-[16px] flex items-center gap-[16px] border-t border-hairline pt-[16px] text-[14.5px]">
              <span className="flex-1 text-secondary">
                <span className="text-positive">{money(paid)}</span> paid
              </span>
              {account.dueNow > 0 && (
                <span className="text-secondary">
                  <span className="font-semibold text-cta">{money(account.dueNow)}</span> outstanding
                </span>
              )}
            </div>

            <div className="mt-[6px]">
              {byService.map((sv) => (
                <div key={sv.name} className="border-t border-hairline py-[14px]">
                  <div className="flex items-baseline justify-between gap-[12px]">
                    <span className="min-w-0 truncate text-[14.5px] text-strong">{sv.name}</span>
                    <span className="text-[14.5px] tabular-nums text-secondary">{money(sv.amount)}</span>
                  </div>
                  <div className="mt-[10px] flex items-center gap-[12px]">
                    <span className="flex-1">
                      {/* Bar is share of the LARGEST service, so the shape is
                          readable; the number beside it is share of total. */}
                      <ProgressRule value={pctValue(sv.amount, topService.amount)} />
                    </span>
                    <span className="w-[42px] text-right text-[13.5px] tabular-nums text-muted">
                      {pctValue(sv.amount, account.invested)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </Cols>
      ) : (
        <div className="mb-[28px]">{currentSection}</div>
      )}

      <Section title="History">
        {history.length === 0 ? (
          <EmptyLine>Settled invoices will appear here as they are paid.</EmptyLine>
        ) : (
          history.map((inv) => {
            const isOpen = expanded === inv.id;
            return (
              <div key={inv.id} className="-mx-[26px] border-t border-hairline first:border-t-0">
                <button
                  onClick={() => setExpanded(isOpen ? null : inv.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center px-[26px] py-[16px] text-left transition-colors duration-150 ease-standard hover:bg-row-hover"
                  title="Show line items"
                >
                  <span className="flex min-w-0 flex-1 items-center gap-[7px] text-[15.5px] text-strong">
                    {inv.id} · {inv.period}
                    <IconChevronDown
                      size={14}
                      stroke={2}
                      className={`text-muted transition-transform duration-150 ease-standard ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </span>
                  <span className="w-[140px] text-right text-[15px] text-strong">{money(invoiceTotal(inv))}</span>
                  <span className={`w-[100px] text-right text-[14.5px] ${historyTone[inv.status]}`}>
                    {historyLabel[inv.status]}
                  </span>
                </button>
                {isOpen && (
                  <div className="mx-[26px] mb-[16px] rounded-card border border-hairline bg-page px-[26px] pb-[20px] pt-[6px]">
                    <p className="mb-[4px] mt-[12px] text-[14px] text-muted">
                      Issued {inv.issued} · Due {inv.due} · {inv.terms}
                    </p>
                    <InvoiceLines inv={inv} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </Section>
    </>
  );
}

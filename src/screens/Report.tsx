// Programme report — a hero-less, print-friendly composition of everything the
// account runs. Every "View report" action lands here; a report is always OF
// something (docs/03), so it only renders the sections the account is entitled to.
import { Link } from 'react-router-dom';
import { IconArrowLeft, IconPrinter } from '@tabler/icons-react';
import { useAccount } from '@/components/AppLayout';
import StatusPill from '@/components/StatusPill';
import { Eyebrow, MetricStrip, Row, Section, ServiceCard, TableHead } from '@/components/ui';
import { invoiceTotal } from '@/data/accounts';
import { int, money, pctValue } from '@/data/format';
import { campaignAccept, cadenceLine } from '@/lib/campaign';
import { hasService, path } from '@/lib/nav';

export default function Report() {
  const account = useAccount();
  const dataServices = account.services.filter((s) => s.id === 'idata' || s.id === 'cleanrich');

  return (
    <>
      <div className="mb-[16px] flex items-center justify-between print:hidden">
        <Link
          to={path(account.id, '')}
          className="inline-flex items-center gap-[7px] text-[14.5px] !text-muted hover:!text-accent"
        >
          <IconArrowLeft size={15} stroke={2} />
          Overview
        </Link>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-[7px] rounded-full border border-hairline bg-white px-[16px] py-[8px] text-[14px] text-body transition-colors duration-150 ease-standard hover:bg-page"
        >
          <IconPrinter size={15} stroke={2} className="text-muted" />
          Print report
        </button>
      </div>

      <section className="mb-[28px] rounded-[18px] border border-hairline bg-white px-[34px] py-[30px]">
        <Eyebrow tone="blue">Programme report · Q3 2026 to date</Eyebrow>
        <h1 className="font-display mt-[12px] text-[40px] font-bold leading-[1.12] text-strong">
          {account.name}
        </h1>
        <p className="mb-0 mt-[10px] text-[16px] text-secondary">
          {account.descriptor} · Prepared by Datamatics Business Solutions
        </p>
      </section>

      <Section title="Commercial summary" bare>
        <MetricStrip
          metrics={[
            { label: 'Invested to date', value: money(account.invested) },
            { label: 'Currently due', value: account.dueNow > 0 ? money(account.dueNow) : '—' },
            { label: 'Services running', value: int(account.entitlements.length) },
            { label: 'Invoices to date', value: int(account.invoices.length) },
          ]}
        />
      </Section>

      {account.services.length > 0 && (
        <Section title="Services" bare>
          <div
            className="grid gap-px overflow-hidden rounded-[16px] border border-hairline bg-hairline"
            style={{ gridTemplateColumns: `repeat(${Math.min(account.services.length, 4)}, minmax(0, 1fr))` }}
          >
            {account.services.map((s) => (
              <ServiceCard key={s.id} s={s} />
            ))}
          </div>
        </Section>
      )}

      {hasService(account, 'leads') && account.campaigns.length > 0 && (
        <Section title="Lead generation · campaigns">
          <TableHead>
            <Eyebrow className="flex-1">Campaign</Eyebrow>
            <Eyebrow className="w-[120px] text-right">Budget</Eyebrow>
            <Eyebrow className="w-[80px] text-right">Pace</Eyebrow>
          </TableHead>
          {account.campaigns.map((c) => (
            <Row key={c.id} className="gap-[16px]">
              <div className="min-w-0 flex-1">
                <p className="text-[15.5px] text-strong">
                  {c.name} · {c.geo}
                </p>
                <p className="mt-[4px] text-[14px] text-muted">
                  {int(c.accepted)} of {int(c.target)} accepted · {int(c.delivered)} delivered ·{' '}
                  {campaignAccept(c)} accept · {cadenceLine(c)}
                </p>
              </div>
              <span className="w-[120px] text-right text-[14.5px] text-secondary">{money(c.budget)}</span>
              <span className="w-[80px] text-right text-[14.5px] text-secondary">
                {pctValue(c.accepted, c.target)}%
              </span>
            </Row>
          ))}
        </Section>
      )}

      {hasService(account, 'programmatic') && account.media && (
        <Section title="Programmatic" bare>
          <MetricStrip
            metrics={[
              { label: 'Impressions', value: int(account.media.impressions) },
              { label: 'Media investment', value: money(account.media.investment) },
              { label: 'Accounts engaged', value: int(account.media.accountsEngaged) },
              { label: 'Flight complete', value: `${pctValue(account.media.investment, account.media.budget)}%` },
            ]}
          />
        </Section>
      )}

      {dataServices.length > 0 && account.batches.length > 0 && (
        <Section title="Data · batch deliveries">
          <TableHead>
            <Eyebrow className="flex-1">Batch</Eyebrow>
            <Eyebrow className="w-[130px] text-right">Records</Eyebrow>
            <Eyebrow className="w-[100px] pl-[20px]">Date</Eyebrow>
            <Eyebrow className="w-[140px] text-right">Status</Eyebrow>
          </TableHead>
          {account.batches.map((b) => (
            <Row key={b.id}>
              <span className="min-w-0 flex-1 text-[15.5px] text-strong">{b.name}</span>
              <span className="w-[130px] text-right text-[14.5px] text-secondary">{int(b.records)}</span>
              <span className="w-[100px] pl-[20px] text-[14.5px] text-muted">{b.date}</span>
              <span className="w-[140px] text-right">
                <StatusPill state={b.status}>{b.statusLabel}</StatusPill>
              </span>
            </Row>
          ))}
        </Section>
      )}

      <Section title="Invoices">
        <TableHead>
          <Eyebrow className="flex-1">Invoice</Eyebrow>
          <Eyebrow className="w-[130px] text-right">Total</Eyebrow>
          <Eyebrow className="w-[140px] text-right">Status</Eyebrow>
        </TableHead>
        {account.invoices.map((inv) => (
          <Row key={inv.id}>
            <span className="min-w-0 flex-1 text-[15.5px] text-secondary">
              {inv.id} · {inv.period}
            </span>
            <span className="w-[130px] text-right text-[15px] text-strong">{money(invoiceTotal(inv))}</span>
            <span className="w-[140px] text-right">
              {inv.status === 'paid' ? (
                <StatusPill state="good">Paid</StatusPill>
              ) : inv.status === 'overdue' ? (
                <StatusPill state="action">Overdue</StatusPill>
              ) : (
                <StatusPill state="needsYou">Open</StatusPill>
              )}
            </span>
          </Row>
        ))}
      </Section>
    </>
  );
}

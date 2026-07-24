// Programme report — a hero-less, print-friendly composition of everything the
// account runs. Every "View report" action lands here; a report is always OF
// something (docs/03), so it only renders the sections the account is entitled to.
import { Link } from 'react-router-dom';
import { IconArrowLeft, IconPrinter } from '@tabler/icons-react';
import { useAccount } from '@/components/AppLayout';
import StatusPill from '@/components/StatusPill';
import { Eyebrow, MetricStrip, ServiceCard } from '@/components/ui';
import { invoiceTotal } from '@/data/accounts';
import { int, money, pctValue } from '@/data/format';
import { campaignAccept, cadenceLine } from '@/lib/campaign';
import { hasService, path } from '@/lib/nav';

export default function Report() {
  const account = useAccount();
  const dataServices = account.services.filter((s) => s.id === 'idata' || s.id === 'cleanrich');

  return (
    <>
      <div className="mb-[4px] flex items-center justify-between print:hidden">
        <Link
          to={path(account.id, '')}
          className="inline-flex items-center gap-[6px] text-[12.5px] !text-muted hover:!text-accent"
        >
          <IconArrowLeft size={14} stroke={2} />
          Overview
        </Link>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-[6px] rounded-full border border-hairline bg-white px-[13px] py-[6px] text-[12px] text-body transition-colors duration-150 ease-standard hover:bg-page"
        >
          <IconPrinter size={13} stroke={2} className="text-muted" />
          Print report
        </button>
      </div>

      <Eyebrow tone="blue" className="mt-[12px]">
        Programme report · Q3 2026 to date
      </Eyebrow>
      <h1 className="font-display mt-[8px] text-[25px] font-bold leading-[1.15] text-strong">
        {account.name}
      </h1>
      <p className="mb-[26px] mt-[6px] text-[12.5px] text-secondary">
        {account.descriptor} · Prepared by Datamatics Business Solutions
      </p>

      <Eyebrow className="mb-[12px]">Commercial summary</Eyebrow>
      <div className="mb-[30px]">
        <MetricStrip
          metrics={[
            { label: 'Invested to date', value: money(account.invested) },
            { label: 'Currently due', value: account.dueNow > 0 ? money(account.dueNow) : '—' },
            { label: 'Services running', value: int(account.entitlements.length) },
            { label: 'Invoices to date', value: int(account.invoices.length) },
          ]}
        />
      </div>

      {account.services.length > 0 && (
        <>
          <Eyebrow className="mb-[12px]">Services</Eyebrow>
          <div
            className="mb-[30px] grid gap-px overflow-hidden rounded-card border border-hairline bg-hairline"
            style={{ gridTemplateColumns: `repeat(${Math.min(account.services.length, 4)}, minmax(0, 1fr))` }}
          >
            {account.services.map((s) => (
              <ServiceCard key={s.id} s={s} />
            ))}
          </div>
        </>
      )}

      {hasService(account, 'leads') && account.campaigns.length > 0 && (
        <>
          <Eyebrow className="mb-[2px]">Lead generation · campaigns</Eyebrow>
          <div className="mb-[30px]">
            {account.campaigns.map((c) => (
              <div key={c.id} className="flex items-center gap-[14px] border-t border-hairline py-[12px]">
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-strong">
                    {c.name} · {c.geo}
                  </p>
                  <p className="mt-[3px] text-[12px] text-muted">
                    {int(c.accepted)} of {int(c.target)} accepted · {int(c.delivered)} delivered ·{' '}
                    {campaignAccept(c)} accept · {cadenceLine(c)}
                  </p>
                </div>
                <span className="w-[90px] text-right text-[12.5px] text-secondary">{money(c.budget)}</span>
                <span className="w-[60px] text-right text-[12.5px] text-secondary">
                  {pctValue(c.accepted, c.target)}%
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {hasService(account, 'programmatic') && account.media && (
        <>
          <Eyebrow className="mb-[12px]">Programmatic</Eyebrow>
          <div className="mb-[30px]">
            <MetricStrip
              metrics={[
                { label: 'Impressions', value: int(account.media.impressions) },
                { label: 'Spend', value: money(account.media.spend) },
                { label: 'Budget', value: money(account.media.budget) },
                { label: 'Flight complete', value: `${pctValue(account.media.spend, account.media.budget)}%` },
              ]}
            />
          </div>
        </>
      )}

      {dataServices.length > 0 && account.batches.length > 0 && (
        <>
          <Eyebrow className="mb-[2px]">Data · batch deliveries</Eyebrow>
          <div className="mb-[30px]">
            {account.batches.map((b) => (
              <div key={b.id} className="flex items-center border-t border-hairline py-[12px]">
                <span className="min-w-0 flex-1 text-[13px] text-strong">{b.name}</span>
                <span className="w-[110px] text-right text-[12.5px] text-secondary">{int(b.records)}</span>
                <span className="w-[80px] pl-[16px] text-[12.5px] text-muted">{b.date}</span>
                <span className="w-[110px] text-right">
                  <StatusPill state={b.status}>{b.statusLabel}</StatusPill>
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      <Eyebrow className="mb-[2px]">Invoices</Eyebrow>
      <div>
        {account.invoices.map((inv) => (
          <div key={inv.id} className="flex items-center border-t border-hairline py-[12px]">
            <span className="min-w-0 flex-1 text-[12.5px] text-secondary">
              {inv.id} · {inv.period}
            </span>
            <span className="w-[110px] text-right text-[12.5px] text-strong">{money(invoiceTotal(inv))}</span>
            <span className="w-[110px] text-right">
              {inv.status === 'paid' ? (
                <StatusPill state="good">Paid</StatusPill>
              ) : inv.status === 'overdue' ? (
                <StatusPill state="action">Overdue</StatusPill>
              ) : (
                <StatusPill state="needsYou">Open</StatusPill>
              )}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

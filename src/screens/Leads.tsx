// Leads — the data-table screen. Billable and delivered are both visible and clearly
// distinguished (docs/01). Enriched with a campaigns breakdown and the delivery
// cadence: which drops have landed and what's next.
import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { IconChevronDown } from '@tabler/icons-react';
import { useAccount } from '@/components/AppLayout';
import StatusPill from '@/components/StatusPill';
import { Eyebrow, EmptyLine, Hero, MetricStrip, PaceBars, ProgressRule } from '@/components/ui';
import { int, money, pctValue } from '@/data/format';
import { campaignAccept, cadenceLine, campaignStatusMeta } from '@/lib/campaign';
import { hasService, path } from '@/lib/nav';
import type { Campaign, Lead } from '@/data/types';

function LeadStatus({ status }: { status: Lead['status'] }) {
  return status === 'accepted' ? (
    <StatusPill state="good">Accepted</StatusPill>
  ) : (
    <StatusPill state="needsYou">Your review</StatusPill>
  );
}

function CampaignRow({ c }: { c: Campaign }) {
  const pace = pctValue(c.accepted, c.target);
  const accept = campaignAccept(c);
  const status = campaignStatusMeta[c.status];
  const cadence = cadenceLine(c);
  return (
    <div className="border-t border-hairline py-[14px]">
      <div className="flex items-start justify-between gap-[12px]">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-strong">
            {c.name} · {c.geo}
          </p>
          <p className="mt-[3px] text-[12px] text-muted">
            {int(c.accepted)} of {int(c.target)} accepted · {int(c.delivered)} delivered · {accept} accept
          </p>
        </div>
        <StatusPill state={status.state}>{status.label}</StatusPill>
      </div>
      <div className="mt-[10px] flex items-center gap-[12px]">
        <span className="flex-1">
          <ProgressRule value={pace} />
        </span>
        <span className="w-[40px] text-right text-[12px] text-secondary">{pace}%</span>
      </div>
      <p className="mt-[8px] text-[11.5px] text-muted">
        {money(c.budget)} · {c.startDate} – {c.endDate} · {cadence}
      </p>
    </div>
  );
}

function DeliverySchedule() {
  const account = useAccount();
  const timeline = account.deliveryTimeline;
  if (timeline.length === 0) return null;

  const maxLeads = Math.max(...timeline.map((d) => d.leads));
  const upcoming = timeline.filter((d) => d.status === 'upcoming');

  return (
    <div className="mb-[30px]">
      <Eyebrow className="mb-[14px]">Delivery schedule</Eyebrow>
      <PaceBars bars={timeline.map((d) => ({ height: (d.leads / maxLeads) * 100, muted: d.status === 'upcoming' }))} />
      <div className="mt-[10px] flex gap-[16px] text-[11.5px] text-muted">
        <span className="flex items-center gap-[6px]">
          <span className="inline-block h-[8px] w-[8px] rounded-[2px] bg-accent" /> Delivered
        </span>
        <span className="flex items-center gap-[6px]">
          <span className="inline-block h-[8px] w-[8px] rounded-[2px] bg-[#dde4ee]" /> Upcoming
        </span>
      </div>

      <p className="mb-[2px] mt-[18px] text-[11.5px] font-medium text-secondary">Next drops</p>
      {upcoming.length === 0 ? (
        <EmptyLine>All scheduled drops have been delivered.</EmptyLine>
      ) : (
        upcoming.map((d, i) => (
          <div key={i} className="flex items-center border-t border-hairline py-[11px]">
            <span className="w-[70px] text-[12.5px] text-muted">{d.date}</span>
            <span className="min-w-0 flex-1 text-[12.5px] text-strong">
              {d.campaign} · {d.geo}
            </span>
            <span className="w-[70px] text-right text-[12.5px] text-secondary">{int(d.leads)}</span>
            <span className="w-[100px] text-right">
              <StatusPill state="neutral">Upcoming</StatusPill>
            </span>
          </div>
        ))
      )}
    </div>
  );
}

export default function Leads() {
  const account = useAccount();
  const [filter, setFilter] = useState<string>('all');
  const [open, setOpen] = useState(false);

  const campaignName = useMemo(
    () => new Map(account.campaigns.map((c) => [c.id, c.name])),
    [account.campaigns],
  );

  // Locked service reached by direct URL → back to Overview.
  if (!hasService(account, 'leads')) return <Navigate to={path(account.id, '')} replace />;

  const rows = filter === 'all' ? account.leads : account.leads.filter((l) => l.campaignId === filter);
  const filterLabel = filter === 'all' ? 'All campaigns' : (campaignName.get(filter) ?? 'All campaigns');

  return (
    <>
      <Hero hero={account.heroes.leads!} />

      {account.leadsMetrics && (
        <div className="mb-[28px]">
          <MetricStrip metrics={account.leadsMetrics} />
        </div>
      )}

      <Eyebrow className="mb-[2px]">Campaigns</Eyebrow>
      <div className="mb-[30px]">
        {account.campaigns.map((c) => (
          <CampaignRow key={c.id} c={c} />
        ))}
      </div>

      <DeliverySchedule />

      <div className="mb-[8px] flex items-center justify-between">
        <Eyebrow>Recent leads</Eyebrow>
        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            className="flex items-center gap-[6px] rounded-full border border-hairline px-[13px] py-[6px] text-[12px] text-body transition-colors duration-150 ease-standard hover:bg-page"
          >
            {filterLabel}
            <IconChevronDown size={11} className="text-muted" stroke={2} />
          </button>
          {open && (
            <ul className="absolute right-0 z-10 mt-[6px] w-[240px] overflow-hidden rounded-card border border-hairline bg-white py-[4px] shadow-[0_8px_24px_rgba(7,17,31,0.10)]">
              {[{ id: 'all', name: 'All campaigns' }, ...account.campaigns].map((c) => (
                <li key={c.id}>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setFilter(c.id);
                      setOpen(false);
                    }}
                    className={`block w-full px-[15px] py-[8px] text-left text-[12.5px] transition-colors duration-150 ease-standard hover:bg-page ${
                      c.id === filter ? 'text-strong' : 'text-secondary'
                    }`}
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center py-[13px]">
          <Eyebrow className="flex-1">Contact</Eyebrow>
          <Eyebrow className="w-[200px]">Campaign</Eyebrow>
          <Eyebrow className="w-[80px]">Date</Eyebrow>
          <Eyebrow className="w-[110px] text-right">Status</Eyebrow>
        </div>
        {rows.map((l) => (
          <div key={l.id} className="flex items-center border-t border-hairline py-[13px]">
            <div className="min-w-0 flex-1">
              <p className="text-[13px] text-strong">{l.name}</p>
              <p className="mt-[3px] text-[12px] text-muted">
                {l.title} · {l.company}
              </p>
            </div>
            <span className="w-[200px] text-[12.5px] text-secondary">{campaignName.get(l.campaignId)}</span>
            <span className="w-[80px] text-[12.5px] text-muted">{l.date}</span>
            <span className="w-[110px] text-right">
              <LeadStatus status={l.status} />
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

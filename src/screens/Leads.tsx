// Leads — the data-table screen. Billable and delivered are both visible and
// clearly distinguished (docs/01). Campaigns carry their commercial fields and
// cadence; the delivery schedule shows landed and upcoming drops; leads awaiting
// review can be accepted in place, and the metrics recompute live.
import { useMemo, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { useAccount } from '@/components/AppLayout';
import StatusPill from '@/components/StatusPill';
import { Eyebrow, EmptyLine, Hero, MetricStrip, PaceBars, Panel, ProgressRule } from '@/components/ui';
import { int, money, pct, pctValue } from '@/data/format';
import { campaignAccept, cadenceLine, campaignStatusMeta, effectiveStatus } from '@/lib/campaign';
import { demoKey, useDemoState } from '@/lib/demo-state';
import { hasService, path } from '@/lib/nav';
import type { Campaign, Lead, MetricTile } from '@/data/types';

function CampaignRow({ c, accountId, approved }: { c: Campaign; accountId: string; approved: boolean }) {
  const pace = pctValue(c.accepted, c.target);
  const status = campaignStatusMeta[effectiveStatus(c, approved)];
  const pending = effectiveStatus(c, approved) === 'pendingApproval';
  return (
    <div className="border-t border-hairline py-[14px]">
      <div className="flex items-start justify-between gap-[12px]">
        <div className="min-w-0 flex-1">
          <Link
            to={path(accountId, `leads/${c.id}`)}
            className="group inline-flex items-center gap-[4px] text-[13px] !text-strong hover:!text-accent"
          >
            {c.name} · {c.geo}
            <IconChevronRight
              size={13}
              stroke={2}
              className="text-muted transition-transform duration-150 ease-standard group-hover:translate-x-[2px] group-hover:text-accent"
            />
          </Link>
          <p className="mt-[3px] text-[12px] text-muted">
            {int(c.accepted)} of {int(c.target)} accepted · {int(c.delivered)} delivered · {campaignAccept(c)} accept
          </p>
        </div>
        <div className="flex items-center gap-[8px]">
          {pending && (
            <Link
              to={path(accountId, 'documents')}
              className="rounded-full border border-hairline bg-white px-[12px] py-[5px] text-[11.5px] !text-accent transition-colors duration-150 ease-standard hover:bg-page"
            >
              Review scope
            </Link>
          )}
          <StatusPill state={status.state}>{status.label}</StatusPill>
        </div>
      </div>
      <div className="mt-[10px] flex items-center gap-[10px]">
        <span className="flex-1">
          <ProgressRule value={pace} />
        </span>
        <span className="text-[12px] text-secondary">{pace}%</span>
      </div>
      <p className="mt-[8px] text-[11.5px] text-muted">
        {money(c.budget)} · {c.startDate} – {c.endDate} · {cadenceLine(c)}
      </p>
    </div>
  );
}

function DeliverySchedule({ filter }: { filter: string }) {
  const account = useAccount();
  const { approvedCampaigns } = useDemoState();

  const statusOf = useMemo(
    () => new Map(account.campaigns.map((c) => [c.id, c.status])),
    [account.campaigns],
  );

  // Unapproved campaigns' drops stay hidden until the client approves them.
  const timeline = account.deliveryTimeline.filter((d) => {
    if (filter !== 'all' && d.campaignId !== filter) return false;
    if (statusOf.get(d.campaignId) === 'pendingApproval' && !approvedCampaigns.has(demoKey(account.id, d.campaignId)))
      return false;
    return true;
  });
  if (timeline.length === 0) return null;

  const maxLeads = Math.max(...timeline.map((d) => d.leads));
  const upcoming = timeline.filter((d) => d.status === 'upcoming');

  return (
    <div className="mb-[24px]">
      <Eyebrow className="mb-[12px]">Delivery schedule</Eyebrow>
      <Panel>
        <PaceBars
          bars={timeline.map((d) => ({
            height: (d.leads / maxLeads) * 100,
            muted: d.status === 'upcoming',
            title: `${d.date} · ${d.campaign} · ${int(d.leads)} leads`,
          }))}
        />
        <div className="mt-[8px] flex justify-between text-[11.5px] text-muted">
          <span>{timeline[0].date}</span>
          <span>{timeline[timeline.length - 1].date}</span>
        </div>
        <div className="mt-[8px] flex gap-[16px] text-[11.5px] text-muted">
          <span className="flex items-center gap-[6px]">
            <span className="inline-block h-[8px] w-[8px] rounded-[2px] bg-accent" /> Delivered
          </span>
          <span className="flex items-center gap-[6px]">
            <span className="inline-block h-[8px] w-[8px] rounded-[2px] bg-[#dde4ee]" /> Upcoming
          </span>
        </div>
      </Panel>

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
  const { acceptedLeads, acceptLead, approvedCampaigns } = useDemoState();
  const [searchParams, setSearchParams] = useSearchParams();
  const reviewOnly = searchParams.get('review') === '1';
  const [filter, setFilter] = useState<string>('all');
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const campaignById = useMemo(
    () => new Map(account.campaigns.map((c) => [c.id, c])),
    [account.campaigns],
  );

  // Locked service reached by direct URL → back to Overview.
  if (!hasService(account, 'leads')) return <Navigate to={path(account.id, '')} replace />;

  const statusFor = (l: Lead): Lead['status'] =>
    acceptedLeads.has(demoKey(account.id, l.id)) ? 'accepted' : l.status;

  // Live metrics: accepting a lead moves billable and the accept rate in place.
  const acceptedNow = account.leads.filter(
    (l) => l.status === 'review' && acceptedLeads.has(demoKey(account.id, l.id)),
  ).length;
  const ls = account.leadsSummary!;
  const liveBillable = ls.billable + acceptedNow;
  const liveMetrics: MetricTile[] = [
    { label: 'Delivered', value: int(ls.delivered) },
    { label: 'Billable', value: int(liveBillable) },
    { label: 'Accept rate', value: pct(liveBillable, ls.delivered), positive: true },
    { label: 'Cost per lead', value: money(ls.costPerLead) },
  ];

  let rows = filter === 'all' ? account.leads : account.leads.filter((l) => l.campaignId === filter);
  if (reviewOnly) rows = rows.filter((l) => statusFor(l) === 'review');
  const filterLabel = filter === 'all' ? 'All campaigns' : (campaignById.get(filter)?.name ?? 'All campaigns');

  const emptyCopy = (): string => {
    const c = filter === 'all' ? undefined : campaignById.get(filter);
    if (reviewOnly) return 'Nothing is awaiting your review right now.';
    if (!c) return 'Leads will appear here as campaigns deliver.';
    const next = c.schedule.find((d) => d.status === 'upcoming');
    return next
      ? `No leads from ${c.name} yet — next drop ${next.date}.`
      : `No leads from ${c.name} yet — the schedule is being confirmed.`;
  };

  return (
    <>
      <Hero hero={account.heroes.leads!} />

      <div className="mb-[22px]">
        <MetricStrip metrics={liveMetrics} />
      </div>

      <Eyebrow className="mb-[2px]">Campaigns</Eyebrow>
      <div className="mb-[24px]">
        {account.campaigns.map((c) => (
          <CampaignRow
            key={c.id}
            c={c}
            accountId={account.id}
            approved={approvedCampaigns.has(demoKey(account.id, c.id))}
          />
        ))}
      </div>

      <DeliverySchedule filter={filter} />

      <div className="mb-[8px] flex items-center justify-between">
        <Eyebrow>Recent leads</Eyebrow>
        <div className="flex items-center gap-[8px]">
          {reviewOnly && (
            <button
              onClick={() => setSearchParams({}, { replace: true })}
              className="rounded-full border border-hairline bg-need-bg px-[13px] py-[6px] text-[12px] text-need-fg transition-colors duration-150 ease-standard hover:bg-page"
            >
              Showing your review queue · Show all
            </button>
          )}
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
      </div>

      <div>
        <div className="flex items-center py-[12px]">
          <Eyebrow className="flex-1">Contact</Eyebrow>
          <Eyebrow className="w-[200px]">Campaign</Eyebrow>
          <Eyebrow className="w-[80px]">Date</Eyebrow>
          <Eyebrow className="w-[110px] text-right">Status</Eyebrow>
        </div>
        {rows.length === 0 ? (
          <div className="border-t border-hairline">
            <EmptyLine>{emptyCopy()}</EmptyLine>
          </div>
        ) : (
          rows.map((l) => {
            const status = statusFor(l);
            const reviewable = status === 'review';
            const expanded = expandedId === l.id;
            return (
              <div key={l.id} className="border-t border-hairline">
                <div
                  role={reviewable ? 'button' : undefined}
                  tabIndex={reviewable ? 0 : undefined}
                  onClick={reviewable ? () => setExpandedId(expanded ? null : l.id) : undefined}
                  onKeyDown={
                    reviewable
                      ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setExpandedId(expanded ? null : l.id);
                          }
                        }
                      : undefined
                  }
                  className={`flex items-center py-[12px] ${
                    reviewable
                      ? 'cursor-pointer transition-colors duration-150 ease-standard hover:bg-[#fafbfd]'
                      : ''
                  }`}
                  title={reviewable ? 'Open to review this lead' : undefined}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] text-strong">{l.name}</p>
                    <p className="mt-[3px] text-[12px] text-muted">
                      {l.title} · {l.company}
                    </p>
                  </div>
                  <span className="w-[200px] text-[12.5px] text-secondary">
                    {campaignById.get(l.campaignId)?.name}
                  </span>
                  <span className="w-[80px] text-[12.5px] text-muted">{l.date}</span>
                  <span className="w-[110px] text-right">
                    {status === 'accepted' ? (
                      <StatusPill state="good">Accepted</StatusPill>
                    ) : (
                      <StatusPill state="needsYou">Your review</StatusPill>
                    )}
                  </span>
                </div>
                {expanded && reviewable && (
                  <div className="mb-[13px] rounded-card border border-hairline bg-[#fafbfd] px-[16px] py-[12px]">
                    <p className="m-0 text-[12.5px] text-secondary">
                      {l.title} at {l.company}, delivered {l.date} from {campaignById.get(l.campaignId)?.name}.
                      Accepting adds this lead to your billable count.
                    </p>
                    <div className="mt-[10px] flex gap-[8px]">
                      <button
                        onClick={() => {
                          acceptLead(demoKey(account.id, l.id));
                          setExpandedId(null);
                        }}
                        className="rounded-full bg-cta px-[14px] py-[6px] text-[11.5px] font-semibold text-white transition-[filter] duration-150 ease-standard hover:brightness-[1.08]"
                      >
                        Accept lead
                      </button>
                      <Link
                        to={path(account.id, 'support')}
                        className="rounded-full border border-hairline bg-white px-[13px] py-[6px] text-[11.5px] !text-body transition-colors duration-150 ease-standard hover:bg-page"
                      >
                        Ask a question
                      </Link>
                    </div>
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

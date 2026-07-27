// Leads — the data-table screen. Billable and delivered are both visible and
// clearly distinguished (docs/01). Campaigns carry their commercial fields and
// cadence; the delivery schedule shows landed and upcoming drops; leads awaiting
// review can be accepted in place, and the metrics recompute live.
import { useMemo, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { useAccount } from '@/components/AppLayout';
import StatusPill from '@/components/StatusPill';
import {
  Cols,
  Eyebrow,
  EmptyLine,
  Hero,
  MetricStrip,
  PaceBars,
  ProgressRule,
  Row,
  Section,
  TableHead,
} from '@/components/ui';
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
    <div className="-mx-[26px] border-t border-hairline px-[26px] py-[18px] transition-colors duration-150 ease-standard first:border-t-0 hover:bg-row-hover">
      <div className="flex items-start justify-between gap-[14px]">
        <div className="min-w-0 flex-1">
          <Link
            to={path(accountId, `leads/${c.id}`)}
            className="group inline-flex items-center gap-[5px] text-[16px] font-medium !text-strong hover:!text-accent"
          >
            {c.name} · {c.geo}
            <IconChevronRight
              size={15}
              stroke={2}
              className="text-muted transition-transform duration-150 ease-standard group-hover:translate-x-[2px] group-hover:text-accent"
            />
          </Link>
          <p className="mt-[5px] text-[14px] text-muted">
            {int(c.accepted)} of {int(c.target)} accepted · {int(c.delivered)} delivered · {campaignAccept(c)} accept
          </p>
        </div>
        <div className="flex items-center gap-[10px]">
          {pending && (
            <Link
              to={path(accountId, 'documents')}
              className="rounded-full border border-hairline bg-white px-[14px] py-[6px] text-[14px] !text-accent transition-colors duration-150 ease-standard hover:bg-page"
            >
              Review scope
            </Link>
          )}
          <StatusPill state={status.state}>{status.label}</StatusPill>
        </div>
      </div>
      <div className="mt-[12px] flex max-w-[520px] items-center gap-[14px]">
        <span className="flex-1">
          <ProgressRule value={pace} />
        </span>
        <span className="w-[52px] text-right text-[14.5px] text-secondary">{pace}%</span>
      </div>
      <p className="mt-[10px] text-[14px] text-muted">
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
    <Cols className="mb-[28px]">
      <div className="lg:col-span-2">
        <Section title="Delivery schedule" className="mb-0 lg:mb-0">
          <PaceBars
            height={168}
            bars={timeline.map((d) => ({
              height: (d.leads / maxLeads) * 100,
              muted: d.status === 'upcoming',
              title: `${d.date} · ${d.campaign} · ${int(d.leads)} leads`,
            }))}
          />
          <div className="mt-[12px] flex justify-between text-[13.5px] text-muted">
            <span>{timeline[0].date}</span>
            <span>{timeline[timeline.length - 1].date}</span>
          </div>
          <div className="mt-[16px] flex gap-[22px] border-t border-hairline pt-[14px] text-[14px] text-muted">
            <span className="flex items-center gap-[7px]">
              <span className="inline-block h-[9px] w-[9px] rounded-[2px] bg-accent" /> Delivered
            </span>
            <span className="flex items-center gap-[7px]">
              <span className="inline-block h-[9px] w-[9px] rounded-[2px] bg-[#dde4ee]" /> Upcoming
            </span>
          </div>
        </Section>
      </div>

      <Section title="Next drops" className="mb-0 lg:mb-0">
        {upcoming.length === 0 ? (
          <EmptyLine>All scheduled drops have been delivered.</EmptyLine>
        ) : (
          upcoming.map((d, i) => (
            <Row key={i} className="gap-[12px] first:border-t-0">
              <div className="min-w-0 flex-1">
                <p className="text-[14.5px] font-medium text-strong">{d.campaign}</p>
                <p className="mt-[4px] text-[13.5px] text-muted">
                  {d.geo} · {d.date}
                </p>
              </div>
              <span className="text-[14.5px] text-secondary">{int(d.leads)}</span>
            </Row>
          ))
        )}
      </Section>
    </Cols>
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

      <Section bare>
        <MetricStrip metrics={liveMetrics} />
      </Section>

      <Section title="Campaigns">
        {account.campaigns.map((c) => (
          <CampaignRow
            key={c.id}
            c={c}
            accountId={account.id}
            approved={approvedCampaigns.has(demoKey(account.id, c.id))}
          />
        ))}
      </Section>

      <DeliverySchedule filter={filter} />

      <Section
        title="Recent leads"
        right={
          <div className="flex items-center gap-[10px]">
            {reviewOnly && (
              <button
                onClick={() => setSearchParams({}, { replace: true })}
                className="rounded-full border border-hairline bg-need-bg px-[14px] py-[7px] text-[14px] text-need-fg transition-colors duration-150 ease-standard hover:bg-page"
              >
                Showing your review queue · Show all
              </button>
            )}
            <div className="relative">
              <button
                onClick={() => setOpen((v) => !v)}
                onBlur={() => setTimeout(() => setOpen(false), 120)}
                className="flex items-center gap-[7px] rounded-full border border-hairline bg-white px-[16px] py-[7px] text-[14px] text-body transition-colors duration-150 ease-standard hover:bg-page"
              >
                {filterLabel}
                <IconChevronDown size={13} className="text-muted" stroke={2} />
              </button>
              {open && (
                <ul className="absolute right-0 z-10 mt-[6px] w-[260px] overflow-hidden rounded-card border border-hairline bg-white py-[4px] shadow-[0_8px_24px_rgba(7,17,31,0.10)]">
                  {[{ id: 'all', name: 'All campaigns' }, ...account.campaigns].map((c) => (
                    <li key={c.id}>
                      <button
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setFilter(c.id);
                          setOpen(false);
                        }}
                        className={`block w-full px-[16px] py-[9px] text-left text-[14.5px] transition-colors duration-150 ease-standard hover:bg-row-hover ${
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
        }
      >
        <TableHead>
          <Eyebrow className="flex-1">Contact</Eyebrow>
          <Eyebrow className="w-[240px]">Campaign</Eyebrow>
          <Eyebrow className="w-[100px]">Date</Eyebrow>
          <Eyebrow className="w-[140px] text-right">Status</Eyebrow>
        </TableHead>
        {rows.length === 0 ? (
          <div className="-mx-[26px] border-t border-hairline px-[26px]">
            <EmptyLine>{emptyCopy()}</EmptyLine>
          </div>
        ) : (
          rows.map((l) => {
            const status = statusFor(l);
            const reviewable = status === 'review';
            const expanded = expandedId === l.id;
            return (
              <div key={l.id} className="-mx-[26px] border-t border-hairline">
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
                  className={`flex items-center px-[26px] py-[16px] transition-colors duration-150 ease-standard hover:bg-row-hover ${
                    reviewable ? 'cursor-pointer' : ''
                  }`}
                  title={reviewable ? 'Open to review this lead' : undefined}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[15.5px] text-strong">{l.name}</p>
                    <p className="mt-[4px] text-[14px] text-muted">
                      {l.title} · {l.company}
                    </p>
                  </div>
                  <span className="w-[240px] text-[14.5px] text-secondary">
                    {campaignById.get(l.campaignId)?.name}
                  </span>
                  <span className="w-[100px] text-[14.5px] text-muted">{l.date}</span>
                  <span className="w-[140px] text-right">
                    {status === 'accepted' ? (
                      <StatusPill state="good">Accepted</StatusPill>
                    ) : (
                      <StatusPill state="needsYou">Your review</StatusPill>
                    )}
                  </span>
                </div>
                {expanded && reviewable && (
                  <div className="mx-[26px] mb-[14px] rounded-card border border-hairline bg-page px-[20px] py-[18px]">
                    <p className="m-0 text-[14.5px] text-secondary">
                      {l.title} at {l.company}, delivered {l.date} from {campaignById.get(l.campaignId)?.name}.
                      Accepting adds this lead to your billable count.
                    </p>
                    <div className="mt-[14px] flex gap-[10px]">
                      <button
                        onClick={() => {
                          acceptLead(demoKey(account.id, l.id));
                          setExpandedId(null);
                        }}
                        className="rounded-full bg-cta px-[18px] py-[8px] text-[14px] font-semibold text-white transition-[filter] duration-150 ease-standard hover:brightness-[1.08]"
                      >
                        Accept lead
                      </button>
                      <Link
                        to={path(account.id, 'support')}
                        className="rounded-full border border-hairline bg-white px-[16px] py-[8px] text-[14px] !text-body transition-colors duration-150 ease-standard hover:bg-page"
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
      </Section>
    </>
  );
}

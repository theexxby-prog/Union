// Media — programmatic delivery. Structured to mirror the reporting API that
// will back it: daily delivery rows, channel mix, account engagement and asset
// performance are each a section, so the live integration is an adapter swap
// rather than a redesign (docs/06).
//
// The reach → engage → convert strip is the point of this screen: a DSP shows
// impressions and a marketing platform shows leads, but only DBSL owns both
// ends and can join them.
import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { IconChevronRight } from '@tabler/icons-react';
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
import { compact, int, money, pct, pctValue, rate } from '@/data/format';
import { hasService, path } from '@/lib/nav';
import type { EngagementLevel, StatusState } from '@/data/types';

const RANGES = [
  { key: 'flight', label: 'Flight to date' },
  { key: '14', label: 'Last 14 days' },
] as const;
type RangeKey = (typeof RANGES)[number]['key'];

const LEVEL: Record<EngagementLevel, { state: StatusState; label: string }> = {
  high: { state: 'good', label: 'High' },
  medium: { state: 'neutral', label: 'Medium' },
  low: { state: 'neutral', label: 'Low' },
};

function FunnelStep({
  value,
  label,
  positive = false,
}: {
  value: string;
  label: string;
  positive?: boolean;
}) {
  return (
    <div className="min-w-[170px] flex-1">
      <p className={`font-display text-[34px] font-bold leading-none ${positive ? 'text-positive' : 'text-strong'}`}>
        {value}
      </p>
      <p className="mt-[8px] text-[14px] text-muted">{label}</p>
    </div>
  );
}

export default function Media() {
  const account = useAccount();
  const [range, setRange] = useState<RangeKey>('flight');

  if (!hasService(account, 'programmatic') || !account.media)
    return <Navigate to={path(account.id, '')} replace />;

  const media = account.media;
  const days = range === '14' ? media.daily.slice(-14) : media.daily;
  const maxDay = Math.max(...days.map((d) => d.impressions));
  const rangeImpressions = days.reduce((a, d) => a + d.impressions, 0);
  const rangeSpend = days.reduce((a, d) => a + d.spend, 0);
  // CPM is derived, never stored — the one media metric every buyer asks for.
  const cpm = (rangeSpend / rangeImpressions) * 1000;

  const leads = account.leadsSummary;
  const topChannel = media.channels.reduce((a, b) => (b.impressions > a.impressions ? b : a));

  return (
    <>
      <Hero hero={account.heroes.media!} />

      <Section bare>
        <MetricStrip
          metrics={[
            { label: 'Impressions', value: compact(media.impressions) },
            { label: 'Media investment', value: money(media.investment) },
            { label: 'Viewability', value: media.viewability },
            { label: 'Accounts reached', value: compact(media.accountsReached) },
            { label: 'Accounts engaged', value: int(media.accountsEngaged), positive: true },
          ]}
        />
      </Section>

      {/* Delivery chart and budget pacing sit side by side at desktop width. */}
      <Cols className="mb-[28px]">
        <div className="lg:col-span-2">
          <Section
            title="Daily delivery"
            className="mb-0 lg:mb-0"
            right={
              <div className="flex overflow-hidden rounded-full border border-hairline">
                {RANGES.map((r) => (
                  <button
                    key={r.key}
                    onClick={() => setRange(r.key)}
                    className={`px-[16px] py-[7px] text-[13.5px] transition-colors duration-150 ease-standard ${
                      range === r.key
                        ? 'bg-[#F4F7FB] font-semibold text-strong'
                        : 'text-secondary hover:text-strong'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            }
          >
            <PaceBars
              height={176}
              bars={days.map((d) => ({
                height: (d.impressions / maxDay) * 100,
                title: `${d.date} · ${int(d.impressions)} impressions · ${money(d.spend)}`,
              }))}
            />
            <div className="mt-[12px] flex justify-between text-[13.5px] text-muted">
              <span>{days[0].date}</span>
              <span>{days[days.length - 1].date}</span>
            </div>
            <div className="mt-[16px] flex flex-wrap gap-x-[26px] gap-y-[6px] border-t border-hairline pt-[14px] text-[14px] text-secondary">
              <span>
                {int(rangeImpressions)} impressions in range · {money(rangeSpend)}
              </span>
              <span>Average CPM {rate(cpm)}</span>
            </div>
          </Section>
        </div>

        <Section title="Budget pacing" className="mb-0 lg:mb-0">
          <div className="flex items-center justify-between gap-[12px]">
            <p className="font-display text-[34px] font-bold leading-none text-strong">
              {pct(media.investment, media.budget)}
            </p>
            <StatusPill state={media.pacing.state}>{media.pacing.label}</StatusPill>
          </div>
          <p className="mb-[16px] mt-[8px] text-[14px] text-muted">of budget invested</p>
          <ProgressRule value={pctValue(media.investment, media.budget)} />
          <p className="mt-[16px] text-[14.5px] text-secondary">
            {money(media.investment)} of {money(media.budget)}
          </p>
          <p className="mt-[6px] text-[14px] text-muted">
            Flight {media.flightStart} – {media.flightEnd}
          </p>
        </Section>
      </Cols>

      {/* ---- Reach → engage → convert ---------------------------------- */}
      <Section title="Reach to revenue">
        <div className="flex flex-wrap items-center gap-y-[18px]">
          <FunnelStep value={int(media.accountsReached)} label="accounts reached" />
          <IconChevronRight size={20} stroke={2} className="mx-[12px] text-muted" />
          <FunnelStep
            value={int(media.accountsEngaged)}
            label={`engaged · ${pct(media.accountsEngaged, media.accountsReached)} of reached`}
          />
          <IconChevronRight size={20} stroke={2} className="mx-[12px] text-muted" />
          <FunnelStep value={leads ? int(leads.delivered) : '—'} label="leads delivered" />
          <IconChevronRight size={20} stroke={2} className="mx-[12px] text-muted" />
          <FunnelStep value={leads ? int(leads.billable) : '—'} label="billable leads" positive />
        </div>
        {leads && (
          <p className="mt-[20px] border-t border-hairline pt-[16px] text-[14.5px] text-muted">
            The accounts your media reached are the accounts your leads came from — one programme, end to end.{' '}
            <Link to={path(account.id, 'leads')} className="font-medium !text-accent">
              See the leads →
            </Link>
          </p>
        )}
      </Section>

      {/* Channel mix and creative performance pair up. */}
      <Cols className="mb-[28px]">
        <div className="lg:col-span-2">
          <Section title="Channel mix" className="mb-0 lg:mb-0">
            <TableHead>
              <Eyebrow className="flex-1">Channel</Eyebrow>
              <Eyebrow className="w-[220px]">Share of delivery</Eyebrow>
              <Eyebrow className="w-[140px] text-right">Impressions</Eyebrow>
            </TableHead>
            {media.channels.map((c) => {
              const share = pctValue(c.impressions, media.impressions);
              const relative = pctValue(c.impressions, topChannel.impressions);
              return (
                <Row key={c.name}>
                  <span className="min-w-0 flex-1 text-[15.5px] text-strong">{c.name}</span>
                  <span className="flex w-[220px] items-center gap-[12px]">
                    <span className="flex-1">
                      <ProgressRule value={relative} />
                    </span>
                    <span className="w-[42px] text-right text-[13.5px] text-muted">{share}%</span>
                  </span>
                  <span className="w-[140px] text-right text-[14.5px] text-secondary">{int(c.impressions)}</span>
                </Row>
              );
            })}
          </Section>
        </div>

        <Section title="Creative performance" className="mb-0 lg:mb-0">
          {media.assets.map((a) => (
            <Row key={a.name} className="gap-[12px] first:border-t-0">
              <div className="min-w-0 flex-1">
                <p className="text-[14.5px] font-medium text-strong">{a.name}</p>
                <p className="mt-[4px] text-[13px] text-muted">{a.format}</p>
              </div>
              <span className="text-right text-[14px] text-secondary">
                {compact(a.impressions)}
                <span className="ml-[10px] text-muted">{a.engagementRate}</span>
              </span>
            </Row>
          ))}
        </Section>
      </Cols>

      {/* ---- Account engagement ---------------------------------------- */}
      <Section title="Account engagement">
        <TableHead>
          <Eyebrow className="flex-1">Account</Eyebrow>
          <Eyebrow className="w-[150px] text-right">Impressions</Eyebrow>
          <Eyebrow className="w-[120px] pl-[20px]">Last seen</Eyebrow>
          <Eyebrow className="w-[150px] text-right">Engagement</Eyebrow>
        </TableHead>
        {media.engagedAccounts.length === 0 ? (
          <EmptyLine>Engaged accounts will appear here as the flight delivers.</EmptyLine>
        ) : (
          media.engagedAccounts.map((a) => (
            <Row key={a.name}>
              <div className="min-w-0 flex-1">
                <p className="text-[15.5px] text-strong">{a.name}</p>
                <p className="mt-[5px] text-[13.5px] text-muted">
                  {a.industry}
                  {a.becameLead && ' · became a lead'}
                </p>
              </div>
              <span className="w-[150px] text-right text-[14.5px] text-secondary">{int(a.impressions)}</span>
              <span className="w-[120px] pl-[20px] text-[14.5px] text-muted">{a.lastActivity}</span>
              <span className="w-[150px] text-right">
                <StatusPill state={LEVEL[a.level].state}>{LEVEL[a.level].label}</StatusPill>
              </span>
            </Row>
          ))
        )}
      </Section>
    </>
  );
}

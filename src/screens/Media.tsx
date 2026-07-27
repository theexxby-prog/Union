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
import { Eyebrow, EmptyLine, Hero, MetricStrip, PaceBars, Panel, ProgressRule } from '@/components/ui';
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

      <div className="mb-[22px]">
        <MetricStrip
          metrics={[
            { label: 'Impressions', value: compact(media.impressions) },
            { label: 'Media investment', value: money(media.investment) },
            { label: 'Viewability', value: media.viewability },
            { label: 'Accounts reached', value: compact(media.accountsReached) },
            { label: 'Accounts engaged', value: int(media.accountsEngaged), positive: true },
          ]}
        />
      </div>

      {/* ---- Daily delivery ------------------------------------------- */}
      <div className="mb-[12px] flex items-center justify-between">
        <Eyebrow>Daily delivery</Eyebrow>
        <div className="flex overflow-hidden rounded-full border border-hairline">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`px-[13px] py-[5px] text-[11.5px] transition-colors duration-150 ease-standard ${
                range === r.key ? 'bg-[#F4F7FB] font-semibold text-strong' : 'text-secondary hover:text-strong'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <Panel className="mb-[22px]">
        <PaceBars
          bars={days.map((d) => ({
            height: (d.impressions / maxDay) * 100,
            title: `${d.date} · ${int(d.impressions)} impressions · ${money(d.spend)}`,
          }))}
        />
        <div className="mt-[8px] flex justify-between text-[11.5px] text-muted">
          <span>{days[0].date}</span>
          <span>{days[days.length - 1].date}</span>
        </div>
        <div className="mt-[12px] flex flex-wrap gap-x-[18px] gap-y-[4px] border-t border-hairline pt-[10px] text-[11.5px] text-secondary">
          <span>
            {int(rangeImpressions)} impressions in range · {money(rangeSpend)}
          </span>
          <span>Average CPM {rate(cpm)}</span>
          <span>
            Flight {media.flightStart} – {media.flightEnd}
          </span>
        </div>
      </Panel>

      {/* ---- Budget pacing --------------------------------------------- */}
      <Eyebrow className="mb-[10px]">Budget pacing</Eyebrow>
      <Panel className="mb-[22px]">
        <div className="flex items-center gap-[12px]">
          <span className="flex-1">
            <ProgressRule value={pctValue(media.investment, media.budget)} />
          </span>
          <StatusPill state={media.pacing.state}>{media.pacing.label}</StatusPill>
        </div>
        <p className="mt-[10px] text-[12px] text-secondary">
          {money(media.investment)} of {money(media.budget)} invested ·{' '}
          {pct(media.investment, media.budget)} of budget · flight ends {media.flightEnd}
        </p>
      </Panel>

      {/* ---- Reach → engage → convert ---------------------------------- */}
      <Eyebrow className="mb-[10px]">Reach to revenue</Eyebrow>
      <Panel className="mb-[22px]">
        <div className="flex flex-wrap items-center gap-y-[10px]">
          <div className="min-w-[150px] flex-1">
            <p className="font-display text-[22px] font-bold leading-none text-strong">
              {int(media.accountsReached)}
            </p>
            <p className="mt-[4px] text-[11.5px] text-muted">accounts reached</p>
          </div>
          <IconChevronRight size={16} stroke={2} className="mx-[8px] text-muted" />
          <div className="min-w-[150px] flex-1">
            <p className="font-display text-[22px] font-bold leading-none text-strong">
              {int(media.accountsEngaged)}
            </p>
            <p className="mt-[4px] text-[11.5px] text-muted">
              engaged · {pct(media.accountsEngaged, media.accountsReached)} of reached
            </p>
          </div>
          <IconChevronRight size={16} stroke={2} className="mx-[8px] text-muted" />
          <div className="min-w-[150px] flex-1">
            <p className="font-display text-[22px] font-bold leading-none text-strong">
              {leads ? int(leads.delivered) : '—'}
            </p>
            <p className="mt-[4px] text-[11.5px] text-muted">leads delivered</p>
          </div>
          <IconChevronRight size={16} stroke={2} className="mx-[8px] text-muted" />
          <div className="min-w-[150px] flex-1">
            <p className="font-display text-[22px] font-bold leading-none text-positive">
              {leads ? int(leads.billable) : '—'}
            </p>
            <p className="mt-[4px] text-[11.5px] text-muted">billable leads</p>
          </div>
        </div>
        {leads && (
          <p className="mt-[12px] border-t border-hairline pt-[10px] text-[11.5px] text-muted">
            The accounts your media reached are the accounts your leads came from — one programme, end to end.{' '}
            <Link to={path(account.id, 'leads')} className="font-medium !text-accent">
              See the leads →
            </Link>
          </p>
        )}
      </Panel>

      {/* ---- Channel mix ------------------------------------------------ */}
      <Eyebrow className="mb-[2px]">Channel mix</Eyebrow>
      <div className="mb-[22px]">
        <div className="flex items-center py-[12px]">
          <Eyebrow className="flex-1">Channel</Eyebrow>
          <Eyebrow className="w-[170px]">Share of delivery</Eyebrow>
          <Eyebrow className="w-[120px] text-right">Impressions</Eyebrow>
        </div>
        {media.channels.map((c) => {
          const share = pctValue(c.impressions, media.impressions);
          const relative = pctValue(c.impressions, topChannel.impressions);
          return (
            <div key={c.name} className="flex items-center border-t border-hairline py-[12px]">
              <span className="min-w-0 flex-1 text-[13px] text-strong">{c.name}</span>
              <span className="flex w-[170px] items-center gap-[8px]">
                <span className="flex-1">
                  <ProgressRule value={relative} />
                </span>
                <span className="w-[34px] text-right text-[11.5px] text-muted">{share}%</span>
              </span>
              <span className="w-[120px] text-right text-[12.5px] text-secondary">{int(c.impressions)}</span>
            </div>
          );
        })}
      </div>

      {/* ---- Account engagement ---------------------------------------- */}
      <Eyebrow className="mb-[2px]">Account engagement</Eyebrow>
      <div className="mb-[22px]">
        <div className="flex items-center py-[12px]">
          <Eyebrow className="flex-1">Account</Eyebrow>
          <Eyebrow className="w-[120px] text-right">Impressions</Eyebrow>
          <Eyebrow className="w-[90px] pl-[16px]">Last seen</Eyebrow>
          <Eyebrow className="w-[130px] text-right">Engagement</Eyebrow>
        </div>
        {media.engagedAccounts.length === 0 ? (
          <EmptyLine>Engaged accounts will appear here as the flight delivers.</EmptyLine>
        ) : (
          media.engagedAccounts.map((a) => (
            <div key={a.name} className="flex items-center border-t border-hairline py-[12px]">
              <div className="min-w-0 flex-1">
                <p className="text-[13px] text-strong">{a.name}</p>
                <p className="mt-[3px] text-[12px] text-muted">
                  {a.industry}
                  {a.becameLead && ' · became a lead'}
                </p>
              </div>
              <span className="w-[120px] text-right text-[12.5px] text-secondary">{int(a.impressions)}</span>
              <span className="w-[90px] pl-[16px] text-[12.5px] text-muted">{a.lastActivity}</span>
              <span className="w-[130px] text-right">
                <StatusPill state={LEVEL[a.level].state}>{LEVEL[a.level].label}</StatusPill>
              </span>
            </div>
          ))
        )}
      </div>

      {/* ---- Creative performance --------------------------------------- */}
      <Eyebrow className="mb-[2px]">Creative performance</Eyebrow>
      <div>
        <div className="flex items-center py-[12px]">
          <Eyebrow className="flex-1">Asset</Eyebrow>
          <Eyebrow className="w-[130px] text-right">Impressions</Eyebrow>
          <Eyebrow className="w-[110px] text-right">Engagement</Eyebrow>
        </div>
        {media.assets.map((a) => (
          <div key={a.name} className="flex items-center border-t border-hairline py-[12px]">
            <div className="min-w-0 flex-1">
              <p className="text-[13px] text-strong">{a.name}</p>
              <p className="mt-[3px] text-[12px] text-muted">{a.format}</p>
            </div>
            <span className="w-[130px] text-right text-[12.5px] text-secondary">{int(a.impressions)}</span>
            <span className="w-[110px] text-right text-[12.5px] text-muted">{a.engagementRate}</span>
          </div>
        ))}
      </div>
    </>
  );
}

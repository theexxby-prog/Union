// Overview — the anchor screen. Two shapes share one hero + one card grammar:
// a services grid (full programme / data only) or a campaigns list (syndication).
// Below the fold: what needs the client, and the approve-a-campaign moment.
import { Link } from 'react-router-dom';
import { IconChevronRight } from '@tabler/icons-react';
import { useAccount } from '@/components/AppLayout';
import StatusPill from '@/components/StatusPill';
import { Eyebrow, Hero, LockedNote, MetricStrip, ProgressRule, ServiceCard } from '@/components/ui';
import { int, money, pctValue } from '@/data/format';
import { cadenceLine, campaignStatusMeta, effectiveStatus } from '@/lib/campaign';
import { demoKey, useDemoState } from '@/lib/demo-state';
import { noticesFor } from '@/lib/notices';
import { path } from '@/lib/nav';
import type { Account, Campaign, ServiceId } from '@/data/types';

/** The chain argument, phrased per entitlement (docs/01) — shown when the account
 *  runs more than one link of the chain. F&A and research sit outside the chain. */
const CHAIN_PHRASES: Partial<Record<ServiceId, string>> = {
  idata: 'iData builds the universe',
  cleanrich: 'CleanRich enriches it',
  programmatic: 'programmatic runs against it',
  leads: 'leads are sourced from it',
};
const CHAIN_ORDER: ServiceId[] = ['idata', 'cleanrich', 'programmatic', 'leads'];

function ChainCaption({ account }: { account: Account }) {
  const links = CHAIN_ORDER.filter((id) => account.entitlements.includes(id));
  if (links.length < 2) return null;
  return (
    <p className="mb-0 mt-[12px] text-[12px] text-muted">
      One programme: {links.map((id) => CHAIN_PHRASES[id]).join(' · ')} · one invoice covers all of it.
    </p>
  );
}

function CampaignRow({ c, approved }: { c: Campaign; approved: boolean }) {
  const pace = pctValue(c.accepted, c.target);
  const status = campaignStatusMeta[effectiveStatus(c, approved)];
  return (
    <div className="flex items-center gap-[14px] border-t border-hairline py-[12px]">
      <div className="min-w-0 flex-1">
        <p className="text-[13px] text-strong">
          {c.name} · {c.geo}
        </p>
        <p className="mt-[3px] text-[12px] text-muted">
          {int(c.accepted)} of {int(c.target)} accepted · {int(c.delivered)} delivered · {cadenceLine(c)}
        </p>
      </div>
      <StatusPill state={status.state}>{status.label}</StatusPill>
      <span className="w-[130px]">
        <ProgressRule value={pace} />
      </span>
      <span className="w-[40px] text-right text-[12.5px] text-secondary">{pace}%</span>
    </div>
  );
}

/** Campaigns pending the client's approval — the second live interaction. */
function ApprovalsBlock({ account }: { account: Account }) {
  const { approvedCampaigns, approveCampaign } = useDemoState();
  const pending = account.campaigns.filter(
    (c) => c.status === 'pendingApproval' && !approvedCampaigns.has(demoKey(account.id, c.id)),
  );
  if (pending.length === 0) return null;
  const cpl = account.leadsSummary?.costPerLead;

  return (
    <>
      <Eyebrow className="mb-[10px] mt-[22px]">Awaiting your approval</Eyebrow>
      {pending.map((c) => (
        <div key={c.id} className="rounded-card border border-hero-border bg-hero-fill px-[20px] py-[18px]">
          <div className="flex items-start justify-between gap-[14px]">
            <div>
              <p className="m-0 text-[14px] font-medium text-strong">
                {c.name} · {c.geo}
              </p>
              <p className="mb-0 mt-[4px] text-[12.5px] text-secondary">
                {int(c.target)} leads{cpl ? ` at ${money(cpl)}` : ''} · {money(c.budget)} · {c.startDate} –{' '}
                {c.endDate} · {cadenceLine(c)}
              </p>
            </div>
            <StatusPill state="needsYou">Awaiting approval</StatusPill>
          </div>
          <div className="mt-[14px] flex gap-[8px]">
            <button
              onClick={() => approveCampaign(demoKey(account.id, c.id))}
              className="rounded-full bg-cta px-[15px] py-[6px] text-[11.5px] font-semibold text-white transition-[filter] duration-150 ease-standard hover:brightness-[1.08]"
            >
              Approve campaign
            </button>
            <Link
              to={path(account.id, 'documents')}
              className="rounded-full border border-hero-border bg-white px-[13px] py-[6px] text-[11.5px] !text-body transition-colors duration-150 ease-standard hover:bg-page"
            >
              View scope document
            </Link>
          </div>
        </div>
      ))}
    </>
  );
}

/** Everything currently waiting on the client, in one strip. Derived from the
 *  same source as the notification bell, so the two always agree. */
function AttentionStrip({ account }: { account: Account }) {
  const notices = noticesFor(account);
  if (notices.length === 0) return null;
  return (
    <>
      <Eyebrow className="mb-[2px] mt-[22px]">Needs your attention</Eyebrow>
      <div>
        {notices.map((n) => (
          <Link
            key={n.id}
            to={path(account.id, n.segment)}
            className="group flex items-center gap-[10px] border-t border-hairline py-[12px] transition-colors duration-150 ease-standard hover:bg-[#fafbfd]"
          >
            <span className="min-w-0 flex-1 text-[12.5px] !text-body">{n.label}</span>
            <StatusPill state={n.state}>{n.state === 'action' ? 'Action' : 'Needs you'}</StatusPill>
            <IconChevronRight
              size={14}
              stroke={2}
              className="text-muted transition-transform duration-150 ease-standard group-hover:translate-x-[2px] group-hover:text-accent"
            />
          </Link>
        ))}
      </div>
    </>
  );
}

export default function Overview() {
  const account = useAccount();
  const { approvedCampaigns } = useDemoState();

  if (account.overviewKind === 'campaigns') {
    return (
      <>
        <Hero hero={account.heroes.overview!} />
        {account.overviewMetrics && (
          <div className="mb-[22px]">
            <MetricStrip metrics={account.overviewMetrics} />
          </div>
        )}
        <Eyebrow className="mb-[2px]">Campaigns</Eyebrow>
        <div>
          {account.campaigns.map((c) => (
            <CampaignRow key={c.id} c={c} approved={approvedCampaigns.has(demoKey(account.id, c.id))} />
          ))}
        </div>
        <ApprovalsBlock account={account} />
        <AttentionStrip account={account} />
        {account.lockedNote && <LockedNote note={account.lockedNote} />}
      </>
    );
  }

  // services kind
  const cols = Math.min(account.services.length, 4);
  const colClass = cols >= 4 ? 'grid-cols-2 lg:grid-cols-4' : cols === 3 ? 'grid-cols-3' : 'grid-cols-2';
  return (
    <>
      <Hero hero={account.heroes.overview!} />
      <Eyebrow className="mb-[12px]">Services</Eyebrow>
      <div className={`grid gap-px overflow-hidden rounded-card border border-hairline bg-hairline ${colClass}`}>
        {account.services.map((s) => {
          const target =
            s.id === 'idata' || s.id === 'cleanrich'
              ? 'data'
              : s.id === 'programmatic'
                ? 'media'
                : s.id === 'fa'
                  ? 'finance'
                  : s.id === 'research'
                    ? 'research'
                    : 'leads';
          return (
            <Link key={s.id} to={path(account.id, target)} className="group block !text-body" title={`Open ${s.name}`}>
              <ServiceCard s={s} className="h-full transition-colors duration-150 ease-standard group-hover:bg-[#fafbfd]" />
            </Link>
          );
        })}
      </div>
      <ChainCaption account={account} />
      <ApprovalsBlock account={account} />
      <AttentionStrip account={account} />
      {account.lockedNote && <LockedNote note={account.lockedNote} />}
    </>
  );
}

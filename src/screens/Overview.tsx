// Overview — the anchor screen. Two shapes share one hero + one card grammar:
// a services grid (full programme / data only) or a campaigns list (syndication).
import { useAccount } from '@/components/AppLayout';
import StatusPill from '@/components/StatusPill';
import { Eyebrow, Hero, LockedNote, MetricStrip, ProgressRule, ServiceCard } from '@/components/ui';
import { int, pctValue } from '@/data/format';
import { cadenceLine, campaignStatusMeta } from '@/lib/campaign';
import type { Campaign } from '@/data/types';

function CampaignRow({ c }: { c: Campaign }) {
  const pace = pctValue(c.accepted, c.target);
  const status = campaignStatusMeta[c.status];
  return (
    <div className="flex items-center gap-[14px] border-t border-hairline py-[13px]">
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

export default function Overview() {
  const account = useAccount();

  if (account.overviewKind === 'campaigns') {
    return (
      <>
        <Hero hero={account.heroes.overview!} />
        {account.overviewMetrics && (
          <div className="mb-[28px]">
            <MetricStrip metrics={account.overviewMetrics} />
          </div>
        )}
        <Eyebrow className="mb-[2px]">Campaigns</Eyebrow>
        <div>
          {account.campaigns.map((c) => (
            <CampaignRow key={c.id} c={c} />
          ))}
        </div>
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
        {account.services.map((s) => (
          <ServiceCard key={s.id} s={s} />
        ))}
      </div>
      {account.lockedNote && <LockedNote note={account.lockedNote} />}
    </>
  );
}

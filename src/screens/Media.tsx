// Media — programmatic. Weekly delivery is plain divs, no charting library. Placement
// names are generic categories, never real publisher names (docs/03).
import { Navigate } from 'react-router-dom';
import { useAccount } from '@/components/AppLayout';
import { Eyebrow, Hero, MetricStrip, PaceBars, Panel, ProgressRule } from '@/components/ui';
import { int, pctValue } from '@/data/format';
import { hasService, path } from '@/lib/nav';

export default function Media() {
  const account = useAccount();
  if (!hasService(account, 'programmatic') || !account.media)
    return <Navigate to={path(account.id, '')} replace />;

  const media = account.media;
  const lastBar = media.weeklyBars.length - 1;

  return (
    <>
      <Hero hero={account.heroes.media!} />

      <div className="mb-[22px]">
        <MetricStrip metrics={media.metrics} />
      </div>

      <Eyebrow className="mb-[12px]">Weekly delivery</Eyebrow>
      <Panel className="mb-[22px]">
        <PaceBars
          bars={media.weeklyBars.map((h, i) => ({
            height: h,
            muted: i === lastBar,
            title: i === lastBar ? 'This week · in progress' : `Week ${int(i + 1)} · ${int(h)}% of peak`,
          }))}
        />
        <div className="mt-[8px] flex justify-between text-[11.5px] text-muted">
          <span>Week 1</span>
          <span>This week</span>
        </div>
      </Panel>

      <Eyebrow className="mb-[2px]">Top placements</Eyebrow>
      <div>
        <div className="flex items-center py-[12px]">
          <Eyebrow className="flex-1">Placement</Eyebrow>
          <Eyebrow className="w-[150px]">Share</Eyebrow>
          <Eyebrow className="w-[130px] text-right">Impressions</Eyebrow>
          <Eyebrow className="w-[80px] text-right">CTR</Eyebrow>
        </div>
        {media.placements.map((p) => {
          const share = pctValue(p.impressions, media.impressions);
          const relative = pctValue(p.impressions, media.placements[0].impressions);
          return (
            <div key={p.name} className="flex items-center border-t border-hairline py-[12px]">
              <span className="min-w-0 flex-1 text-[13px] text-strong">{p.name}</span>
              <span className="flex w-[150px] items-center gap-[8px]" title={`${share}% of all impressions`}>
                <span className="flex-1">
                  <ProgressRule value={relative} />
                </span>
                <span className="w-[34px] text-right text-[11.5px] text-muted">{share}%</span>
              </span>
              <span className="w-[130px] text-right text-[12.5px] text-secondary">{int(p.impressions)}</span>
              <span className="w-[80px] text-right text-[12.5px] text-muted">{p.ctr}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}

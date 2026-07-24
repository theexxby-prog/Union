// Data — iData + CleanRich on one screen. Batches, not campaigns: no pacing
// curve, a batch drop and a match rate. Exists partly to prove the platform is
// not campaign-shaped (docs/03).
import { Navigate } from 'react-router-dom';
import { useAccount } from '@/components/AppLayout';
import StatusPill from '@/components/StatusPill';
import { Eyebrow, Hero, MetricStrip, Panel, ServiceCard } from '@/components/ui';
import { int } from '@/data/format';
import { hasService, path } from '@/lib/nav';
import type { MetricTile, Service } from '@/data/types';

/** "Field fill 94% · Match 71%" → quality tiles. The line is the single source;
 *  the tiles are a projection of it, so the two can never disagree. */
const qualityTiles = (services: Service[]): MetricTile[] =>
  services.flatMap((s) =>
    s.qualityLine.split(' · ').map((part) => {
      const cut = part.lastIndexOf(' ');
      return { label: part.slice(0, cut), value: part.slice(cut + 1) };
    }),
  );

export default function Data() {
  const account = useAccount();
  if (!hasService(account, 'idata', 'cleanrich')) return <Navigate to={path(account.id, '')} replace />;

  const dataServices = account.services.filter((s) => s.id === 'idata' || s.id === 'cleanrich');
  const serviceName = new Map(dataServices.map((s) => [s.id, s.name]));
  const nextBatch = account.batches.find((b) => b.status === 'neutral');

  return (
    <>
      <Hero hero={account.heroes.data!} />

      <Eyebrow className="mb-[12px]">Services</Eyebrow>
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-hairline bg-hairline">
        {dataServices.map((s) => (
          <ServiceCard key={s.id} s={s} />
        ))}
      </div>

      <Eyebrow className="mb-[12px] mt-[22px]">Quality</Eyebrow>
      <MetricStrip metrics={qualityTiles(dataServices)} />

      <Eyebrow className="mb-[12px] mt-[22px]">Batch timeline</Eyebrow>
      <Panel>
        <div className="flex gap-[7px]">
          {account.batches.map((b) => {
            const delivered = b.status === 'good';
            return (
              <div key={b.id} className="flex-1" title={`${b.name} · ${int(b.records)} records · ${b.statusLabel}`}>
                <div className={`mb-[8px] h-[3px] ${delivered ? 'bg-accent' : 'bg-[#d6deea]'}`} />
                <span className={`block text-[11.5px] ${delivered ? 'text-strong' : 'text-secondary'}`}>{b.date}</span>
                <span className="block text-[11px] text-muted">{int(b.records)}</span>
              </div>
            );
          })}
        </div>
      </Panel>
      {nextBatch && (
        <div className="mt-[14px] flex items-center gap-[10px] rounded-card border border-hairline bg-[#fafbfd] px-[16px] py-[11px]">
          <StatusPill state="neutral">Scheduled</StatusPill>
          <p className="m-0 flex-1 text-[12.5px] text-secondary">
            Next batch — {nextBatch.name} · {int(nextBatch.records)} records · lands {nextBatch.date}.
          </p>
        </div>
      )}

      <Eyebrow className="mb-[2px] mt-[22px]">Batch deliveries</Eyebrow>
      <div>
        <div className="flex items-center py-[12px]">
          <Eyebrow className="flex-1">Batch</Eyebrow>
          <Eyebrow className="w-[110px] text-right">Records</Eyebrow>
          <Eyebrow className="w-[80px] pl-[16px]">Date</Eyebrow>
          <Eyebrow className="w-[110px] text-right">Status</Eyebrow>
        </div>
        {account.batches.map((b) => (
          <div key={b.id} className="flex items-center border-t border-hairline py-[12px]">
            <div className="min-w-0 flex-1">
              <p className="text-[13px] text-strong">{b.name}</p>
              <p className="mt-[3px] text-[12px] text-muted">{serviceName.get(b.serviceId)}</p>
            </div>
            <span className="w-[110px] text-right text-[12.5px] text-secondary">{int(b.records)}</span>
            <span className="w-[80px] pl-[16px] text-[12.5px] text-muted">{b.date}</span>
            <span className="w-[110px] text-right">
              <StatusPill state={b.status}>{b.statusLabel}</StatusPill>
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

// Data — iData + CleanRich on one screen. Batches, not campaigns: no pacing
// curve, a batch drop and a match rate. Exists partly to prove the platform is
// not campaign-shaped (docs/03).
import { Navigate } from 'react-router-dom';
import { useAccount } from '@/components/AppLayout';
import StatusPill from '@/components/StatusPill';
import { Eyebrow, Hero, MetricStrip, Row, Section, ServiceCard, TableHead } from '@/components/ui';
import { batchesByDate } from '@/data/accounts';
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
  const batches = batchesByDate(account.batches);
  const nextBatch = batches.find((b) => b.status === 'neutral');

  return (
    <>
      <Hero hero={account.heroes.data!} />

      {/* Quality lives in its own strip below, so the cards do not repeat it. */}
      <Section title="Services" bare>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[16px] border border-hairline bg-hairline">
          {dataServices.map((s) => (
            <ServiceCard key={s.id} s={s} showQuality={false} />
          ))}
        </div>
      </Section>

      <Section title="Quality" bare>
        <MetricStrip metrics={qualityTiles(dataServices)} />
      </Section>

      <Section title="Batch timeline">
        <div className="flex gap-[14px]">
          {batches.map((b) => {
            const delivered = b.status === 'good';
            // Colour by service so the two streams stay readable once the
            // batches interleave chronologically.
            const fill = !delivered
              ? 'bg-hairline'
              : b.serviceId === 'idata'
                ? 'bg-accent'
                : 'bg-positive';
            return (
              <div key={b.id} className="flex-1" title={`${b.name} · ${int(b.records)} records · ${b.statusLabel}`}>
                <div className={`mb-[12px] h-[7px] rounded-full ${fill}`} />
                <span className={`block text-[14px] ${delivered ? 'text-strong' : 'text-secondary'}`}>{b.date}</span>
                <span className="mt-[2px] block text-[13.5px] text-muted">{int(b.records)}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-[20px] flex flex-wrap items-center gap-x-[22px] gap-y-[8px] border-t border-hairline pt-[16px] text-[14px] text-muted">
          {dataServices.map((s) => (
            <span key={s.id} className="flex items-center gap-[8px]">
              <span
                className={`inline-block h-[9px] w-[9px] rounded-[2px] ${s.id === 'idata' ? 'bg-accent' : 'bg-positive'}`}
              />
              {s.name}
            </span>
          ))}
          <span className="flex items-center gap-[8px]">
            <span className="inline-block h-[9px] w-[9px] rounded-[2px] bg-hairline" /> Scheduled
          </span>
          {nextBatch && (
            <span className="text-secondary">
              Next — {nextBatch.name} · {int(nextBatch.records)} records · lands {nextBatch.date}.
            </span>
          )}
        </div>
      </Section>

      <Section title="Batch deliveries">
        <TableHead>
          <Eyebrow className="flex-1">Batch</Eyebrow>
          <Eyebrow className="w-[200px] text-right">Records</Eyebrow>
          <Eyebrow className="w-[160px] pl-[24px]">Date</Eyebrow>
          <Eyebrow className="w-[200px] text-right">Status</Eyebrow>
        </TableHead>
        {batches.map((b) => (
          <Row key={b.id}>
            <div className="min-w-0 flex-1">
              <p className="max-w-[560px] text-[15.5px] text-strong">{b.name}</p>
              <p className="mt-[4px] text-[14px] text-muted">{serviceName.get(b.serviceId)}</p>
            </div>
            <span className="w-[200px] text-right text-[14.5px] text-secondary">{int(b.records)}</span>
            <span className="w-[160px] pl-[24px] text-[14.5px] text-muted">{b.date}</span>
            <span className="w-[200px] text-right">
              {/* Delivered is the expected state — quiet. Scheduled is the news. */}
              <StatusPill state={b.status} quiet={b.status === 'good'}>
                {b.statusLabel}
              </StatusPill>
            </span>
          </Row>
        ))}
      </Section>
    </>
  );
}

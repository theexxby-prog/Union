// Data — iData + CleanRich on one screen. Batches, not campaigns: no pacing
// curve, a batch drop and a match rate. Exists partly to prove the platform is
// not campaign-shaped (docs/03).
import { Navigate } from 'react-router-dom';
import { useAccount } from '@/components/AppLayout';
import StatusPill from '@/components/StatusPill';
import { Eyebrow, Hero, MetricStrip, Row, Section, ServiceCard, TableHead } from '@/components/ui';
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

      <Section title="Services" bare>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[16px] border border-hairline bg-hairline">
          {dataServices.map((s) => (
            <ServiceCard key={s.id} s={s} />
          ))}
        </div>
      </Section>

      <Section title="Quality" bare>
        <MetricStrip metrics={qualityTiles(dataServices)} />
      </Section>

      <Section title="Batch timeline">
        <div className="flex gap-[10px]">
          {account.batches.map((b) => {
            const delivered = b.status === 'good';
            return (
              <div key={b.id} className="flex-1" title={`${b.name} · ${int(b.records)} records · ${b.statusLabel}`}>
                <div className={`mb-[12px] h-[3px] rounded-full ${delivered ? 'bg-accent' : 'bg-[#d6deea]'}`} />
                <span className={`block text-[14px] ${delivered ? 'text-strong' : 'text-secondary'}`}>{b.date}</span>
                <span className="mt-[2px] block text-[13.5px] text-muted">{int(b.records)}</span>
              </div>
            );
          })}
        </div>
        {nextBatch && (
          <div className="mt-[22px] flex items-center gap-[12px] border-t border-hairline pt-[18px]">
            <StatusPill state="neutral">Scheduled</StatusPill>
            <p className="m-0 flex-1 text-[14.5px] text-secondary">
              Next batch — {nextBatch.name} · {int(nextBatch.records)} records · lands {nextBatch.date}.
            </p>
          </div>
        )}
      </Section>

      <Section title="Batch deliveries">
        <TableHead>
          <Eyebrow className="flex-1">Batch</Eyebrow>
          <Eyebrow className="w-[140px] text-right">Records</Eyebrow>
          <Eyebrow className="w-[100px] pl-[20px]">Date</Eyebrow>
          <Eyebrow className="w-[140px] text-right">Status</Eyebrow>
        </TableHead>
        {account.batches.map((b) => (
          <Row key={b.id}>
            <div className="min-w-0 flex-1">
              <p className="text-[15.5px] text-strong">{b.name}</p>
              <p className="mt-[4px] text-[14px] text-muted">{serviceName.get(b.serviceId)}</p>
            </div>
            <span className="w-[140px] text-right text-[14.5px] text-secondary">{int(b.records)}</span>
            <span className="w-[100px] pl-[20px] text-[14.5px] text-muted">{b.date}</span>
            <span className="w-[140px] text-right">
              <StatusPill state={b.status}>{b.statusLabel}</StatusPill>
            </span>
          </Row>
        ))}
      </Section>
    </>
  );
}

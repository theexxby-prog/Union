// Data — iData + CleanRich on one screen. Batches, not campaigns: no pacing curve,
// a batch drop and a match rate. Exists partly to prove the platform is not
// campaign-shaped (docs/03).
import { Navigate } from 'react-router-dom';
import { useAccount } from '@/components/AppLayout';
import StatusPill from '@/components/StatusPill';
import { Eyebrow, Hero, ServiceCard } from '@/components/ui';
import { int } from '@/data/format';
import { hasService, path } from '@/lib/nav';

export default function Data() {
  const account = useAccount();
  if (!hasService(account, 'idata', 'cleanrich')) return <Navigate to={path(account.id, '')} replace />;

  const dataServices = account.services.filter((s) => s.id === 'idata' || s.id === 'cleanrich');
  const serviceName = new Map(dataServices.map((s) => [s.id, s.name]));

  return (
    <>
      <Hero hero={account.heroes.data!} />

      <Eyebrow className="mb-[12px]">Services</Eyebrow>
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-hairline bg-hairline">
        {dataServices.map((s) => (
          <ServiceCard key={s.id} s={s} />
        ))}
      </div>

      <Eyebrow className="mb-[2px] mt-[28px]">Batch deliveries</Eyebrow>
      <div>
        <div className="flex items-center py-[13px]">
          <Eyebrow className="flex-1">Batch</Eyebrow>
          <Eyebrow className="w-[110px] text-right">Records</Eyebrow>
          <Eyebrow className="w-[80px] pl-[16px]">Date</Eyebrow>
          <Eyebrow className="w-[110px] text-right">Status</Eyebrow>
        </div>
        {account.batches.map((b) => (
          <div key={b.id} className="flex items-center border-t border-hairline py-[13px]">
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

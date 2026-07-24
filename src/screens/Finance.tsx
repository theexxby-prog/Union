// Finance & Accounting — workstreams, not campaigns: AP, AR, close, cleanup.
// Same card grammar (bought / received / quality / pace), different nouns.
import { Navigate } from 'react-router-dom';
import { useAccount } from '@/components/AppLayout';
import StatusPill from '@/components/StatusPill';
import { Eyebrow, EmptyLine, Hero, MetricStrip, ProgressRule } from '@/components/ui';
import { int, pctValue } from '@/data/format';
import { hasService, path } from '@/lib/nav';

export default function Finance() {
  const account = useAccount();
  const fa = account.services.find((s) => s.id === 'fa');
  if (!hasService(account, 'fa') || !fa) return <Navigate to={path(account.id, '')} replace />;

  const pace = pctValue(fa.received, fa.target);
  // "Accuracy 99.2% · Turnaround 1.8 days" → tiles, same projection as Data.
  const qualityTiles = fa.qualityLine.split(' · ').map((part) => {
    const cut = part.lastIndexOf(' ');
    return { label: part.slice(0, cut), value: part.slice(cut + 1) };
  });

  return (
    <>
      <Hero hero={account.heroes.finance!} />

      <Eyebrow className="mb-[12px]">This quarter</Eyebrow>
      <div className="mb-[22px]">
        <MetricStrip
          metrics={[
            { label: 'Invoices processed', value: int(fa.received) },
            { label: 'Quarterly scope', value: int(fa.target) },
            ...qualityTiles,
          ]}
        />
      </div>

      <div className="mb-[22px] flex items-center gap-[10px]">
        <span className="flex-1">
          <ProgressRule value={pace} />
        </span>
        <span className="text-[12px] text-secondary">{pace}% of quarterly scope</span>
      </div>

      <Eyebrow className="mb-[2px]">Workstreams</Eyebrow>
      <div>
        {!account.faWorkstreams || account.faWorkstreams.length === 0 ? (
          <EmptyLine>Workstreams will appear here as they are set up.</EmptyLine>
        ) : (
          account.faWorkstreams.map((w) => (
            <div key={w.id} className="flex items-center gap-[12px] border-t border-hairline py-[12px]">
              <div className="min-w-0 flex-1">
                <p className="text-[13px] text-strong">{w.name}</p>
                <p className="mt-[3px] text-[12px] text-muted">{w.detail}</p>
              </div>
              <StatusPill state={w.status}>{w.statusLabel}</StatusPill>
            </div>
          ))
        )}
      </div>
    </>
  );
}

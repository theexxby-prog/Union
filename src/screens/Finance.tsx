// Finance & Accounting — workstreams, not campaigns: AP, AR, close, cleanup.
// Same card grammar (bought / received / quality / pace), different nouns.
import { Navigate } from 'react-router-dom';
import { useAccount } from '@/components/AppLayout';
import StatusPill from '@/components/StatusPill';
import { EmptyLine, Hero, MetricStrip, ProgressRule, Row, Section } from '@/components/ui';
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

      <Section title="This quarter" bare>
        <MetricStrip
          metrics={[
            { label: 'Invoices processed', value: int(fa.received) },
            { label: 'Quarterly scope', value: int(fa.target) },
            ...qualityTiles,
          ]}
        />
      </Section>

      <Section title="Progress against scope">
        <div className="flex items-center gap-[16px]">
          <span className="flex-1">
            <ProgressRule value={pace} />
          </span>
          <span className="text-[14.5px] text-secondary">{pace}% of quarterly scope</span>
        </div>
        <p className="mt-[16px] border-t border-hairline pt-[14px] text-[14px] text-muted">
          {int(fa.received)} of {int(fa.target)} {fa.unit} this quarter · {fa.qualityLine}
        </p>
      </Section>

      <Section title="Workstreams">
        {!account.faWorkstreams || account.faWorkstreams.length === 0 ? (
          <EmptyLine>Workstreams will appear here as they are set up.</EmptyLine>
        ) : (
          account.faWorkstreams.map((w) => (
            <Row key={w.id} className="gap-[14px] first:border-t-0">
              <div className="min-w-0 flex-1">
                <p className="text-[16px] font-medium text-strong">{w.name}</p>
                <p className="mt-[5px] text-[14px] text-muted">{w.detail}</p>
              </div>
              <StatusPill state={w.status}>{w.statusLabel}</StatusPill>
            </Row>
          ))
        )}
      </Section>
    </>
  );
}

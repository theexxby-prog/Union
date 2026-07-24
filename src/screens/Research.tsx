// B2B Market Research — studies progress through stages, not pacing curves.
// The phase-strip primitive carries the workflow, same as documents.
import { Navigate } from 'react-router-dom';
import { useAccount } from '@/components/AppLayout';
import StatusPill from '@/components/StatusPill';
import { Eyebrow, EmptyLine, Hero, MetricStrip, PhaseStrip } from '@/components/ui';
import { int } from '@/data/format';
import { hasService, path } from '@/lib/nav';
import { RESEARCH_STAGES } from '@/data/types';

export default function Research() {
  const account = useAccount();
  const svc = account.services.find((s) => s.id === 'research');
  if (!hasService(account, 'research') || !svc) return <Navigate to={path(account.id, '')} replace />;

  const studies = account.studies ?? [];
  const inField = studies.filter((s) => s.stage > 0 && s.stage < 3).length;
  const delivered = studies.filter((s) => s.stage === 3).length;

  return (
    <>
      <Hero hero={account.heroes.research!} />

      <Eyebrow className="mb-[12px]">Programme</Eyebrow>
      <div className="mb-[22px]">
        <MetricStrip
          metrics={[
            { label: 'Studies commissioned', value: int(studies.length) },
            { label: 'Reports delivered', value: int(delivered) },
            { label: 'In progress', value: int(inField) },
            { label: 'Quality', value: svc.qualityLine.split(' · ')[1] ?? svc.qualityLine, positive: true },
          ]}
        />
      </div>

      <Eyebrow className="mb-[10px]">Studies</Eyebrow>
      {studies.length === 0 ? (
        <EmptyLine>Commissioned studies will appear here with their fieldwork status.</EmptyLine>
      ) : (
        studies.map((s) => {
          const done = s.stage === 3;
          return (
            <div key={s.id} className="mb-[12px] rounded-card border border-hairline px-[18px] py-[15px]">
              <div className="mb-[14px] flex items-start justify-between gap-[12px]">
                <div className="min-w-0 flex-1">
                  <p className="m-0 text-[13.5px] font-medium text-strong">
                    {s.name} · {s.geo}
                  </p>
                  <p className="mb-0 mt-[3px] text-[12px] text-muted">
                    {s.method} · {s.detail} · {s.due}
                  </p>
                </div>
                {done ? (
                  <StatusPill state="good">Delivered</StatusPill>
                ) : (
                  <StatusPill state="neutral">{RESEARCH_STAGES[s.stage]}</StatusPill>
                )}
              </div>
              <PhaseStrip phase={done ? RESEARCH_STAGES.length : s.stage} needsClient={false} labels={RESEARCH_STAGES} />
            </div>
          );
        })
      )}
    </>
  );
}

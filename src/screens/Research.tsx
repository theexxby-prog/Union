// B2B Market Research — studies progress through stages, not pacing curves.
// The phase-strip primitive carries the workflow, same as documents.
import { Navigate } from 'react-router-dom';
import { useAccount } from '@/components/AppLayout';
import StatusPill from '@/components/StatusPill';
import { EmptyLine, Hero, MetricStrip, PhaseStrip, Section } from '@/components/ui';
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

      <Section title="Programme" bare>
        <MetricStrip
          metrics={[
            { label: 'Studies commissioned', value: int(studies.length) },
            { label: 'Reports delivered', value: int(delivered) },
            { label: 'In progress', value: int(inField) },
            { label: 'Quality', value: svc.qualityLine.split(' · ')[1] ?? svc.qualityLine, positive: true },
          ]}
        />
      </Section>

      <Section title="Studies" bare>
        {studies.length === 0 ? (
          <div className="rounded-[16px] border border-hairline bg-white px-[26px] py-[8px]">
            <EmptyLine>Commissioned studies will appear here with their fieldwork status.</EmptyLine>
          </div>
        ) : (
          studies.map((s) => {
            const done = s.stage === 3;
            return (
              <div
                key={s.id}
                className="mb-[14px] rounded-[16px] border border-hairline bg-white px-[26px] py-[22px] last:mb-0"
              >
                <div className="mb-[20px] flex flex-wrap items-start justify-between gap-[14px]">
                  <div className="min-w-0 flex-1">
                    <p className="m-0 text-[17px] font-medium text-strong">
                      {s.name} · {s.geo}
                    </p>
                    <p className="mb-0 mt-[5px] text-[14.5px] text-muted">
                      {s.method} · {s.detail} · {s.due}
                    </p>
                  </div>
                  {done ? (
                    <StatusPill state="good">Delivered</StatusPill>
                  ) : (
                    <StatusPill state="neutral">{RESEARCH_STAGES[s.stage]}</StatusPill>
                  )}
                </div>
                <PhaseStrip
                  phase={done ? RESEARCH_STAGES.length : s.stage}
                  needsClient={false}
                  labels={RESEARCH_STAGES}
                />
              </div>
            );
          })
        )}
      </Section>
    </>
  );
}

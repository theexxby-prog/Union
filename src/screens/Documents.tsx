// Documents — proves the card grammar holds for workflow state, not just percentages.
// The client sees five plain phases, never the granular internal stages (docs/02).
import { useAccount } from '@/components/AppLayout';
import StatusPill from '@/components/StatusPill';
import { Eyebrow, Hero, PhaseStrip } from '@/components/ui';
import { money } from '@/data/format';
import type { DocumentRecord, StatusState } from '@/data/types';

/** Client-facing row status. Deliberately not a 1:1 of the internal type. */
function rowStatus(d: DocumentRecord): { state: StatusState; label: string } {
  if (d.type === 'client_signature' && d.phase < 4) return { state: 'action', label: 'Awaiting you' };
  if (d.kind === 'Contract') return { state: 'good', label: 'Signed' };
  if (d.type === 'msa_covered') return { state: 'neutral', label: 'MSA covered' };
  if (d.phase === 4) return { state: 'good', label: 'Signed' };
  return { state: 'neutral', label: 'In progress' };
}

const isAwaiting = (d: DocumentRecord): boolean => d.type === 'client_signature' && d.phase < 4;

export default function Documents() {
  const account = useAccount();
  const awaiting = account.documents.find(isAwaiting);

  return (
    <>
      <Hero hero={account.heroes.documents!} />

      {awaiting && (
        <>
          <Eyebrow className="mb-[10px]">Awaiting you</Eyebrow>
          <div className="mb-[28px] rounded-card border border-hairline px-[20px] py-[18px]">
            <div className="mb-[18px] flex items-start justify-between gap-[14px]">
              <div>
                <p className="text-[14px] font-medium text-strong">
                  {awaiting.id} · {awaiting.title}
                </p>
                {awaiting.scopeSummary && (
                  <p className="mt-[4px] text-[12.5px] text-secondary">{awaiting.scopeSummary}</p>
                )}
              </div>
              <StatusPill state="action">Awaiting signature</StatusPill>
            </div>
            <PhaseStrip phase={awaiting.phase} needsClient />
          </div>
        </>
      )}

      <Eyebrow className="mb-[2px]">All documents</Eyebrow>
      <div>
        <div className="flex items-center py-[13px]">
          <Eyebrow className="flex-1">Document</Eyebrow>
          <Eyebrow className="w-[100px]">Value</Eyebrow>
          <Eyebrow className="w-[80px]">Date</Eyebrow>
          <Eyebrow className="w-[130px] text-right">Status</Eyebrow>
        </div>
        {account.documents.map((d) => {
          const status = rowStatus(d);
          return (
            <div key={d.id} className="flex items-center border-t border-hairline py-[13px]">
              <div className="min-w-0 flex-1">
                <p className="text-[13px] text-strong">
                  {d.id === 'MSA' ? d.title : `${d.id} · ${d.title}`}
                </p>
                <p className="mt-[3px] text-[12px] text-muted">{d.kindDetail ?? d.kind}</p>
              </div>
              <span className={`w-[100px] text-[12.5px] ${d.value === null ? 'text-muted' : 'text-secondary'}`}>
                {d.value === null ? '—' : money(d.value)}
              </span>
              <span className="w-[80px] text-[12.5px] text-muted">{d.date}</span>
              <span className="w-[130px] text-right">
                <StatusPill state={status.state}>{status.label}</StatusPill>
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}

// Documents — proves the card grammar holds for workflow state, not just
// percentages. The client sees five plain phases, never granular internal
// stages (docs/02). Rows expand to their own phase strip.
import { useState } from 'react';
import { IconChevronDown } from '@tabler/icons-react';
import { useAccount } from '@/components/AppLayout';
import StatusPill from '@/components/StatusPill';
import { Eyebrow, Hero, PhaseStrip, Section, TableHead } from '@/components/ui';
import { money } from '@/data/format';
import { PHASES } from '@/data/types';
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

function DocCard({ doc, eyebrow }: { doc: DocumentRecord; eyebrow: string }) {
  const awaiting = isAwaiting(doc);
  return (
    <Section title={eyebrow} bare>
      {/* Needs-you cards take the hero fill so the page's attention anchor is tonal, not just a border. */}
      <div
        className={`rounded-[16px] border px-[26px] py-[24px] ${
          awaiting ? 'border-hero-border bg-hero-fill' : 'border-hairline bg-white'
        }`}
      >
        <div className="mb-[24px] flex flex-wrap items-start justify-between gap-[16px]">
          <div className="min-w-0">
            <p className="m-0 text-[19px] font-medium text-strong">
              {doc.id === 'MSA' ? doc.title : `${doc.id} · ${doc.title}`}
            </p>
            <p className="mb-0 mt-[6px] text-[15px] text-secondary">
              {doc.scopeSummary ?? doc.kindDetail ?? `${doc.kind} · ${doc.date}`}
            </p>
          </div>
          {awaiting ? (
            <StatusPill state="action">Awaiting signature</StatusPill>
          ) : (
            <StatusPill state="good">Signed</StatusPill>
          )}
        </div>
        {/* A signed document has completed every phase. */}
        <PhaseStrip phase={awaiting ? doc.phase : PHASES.length} needsClient={awaiting} />
      </div>
    </Section>
  );
}

export default function Documents() {
  const account = useAccount();
  const [expanded, setExpanded] = useState<string | null>(null);
  const awaiting = account.documents.find(isAwaiting);
  // The workflow pattern stays visible even when nothing needs the client.
  const featured = awaiting ?? account.documents[0];

  return (
    <>
      <Hero hero={account.heroes.documents!} />

      {featured && <DocCard doc={featured} eyebrow={awaiting ? 'Awaiting you' : 'Latest document'} />}

      <Section title="All documents">
        <TableHead>
          <Eyebrow className="flex-1">Document</Eyebrow>
          <Eyebrow className="w-[130px]">Value</Eyebrow>
          <Eyebrow className="w-[100px]">Date</Eyebrow>
          <Eyebrow className="w-[160px] text-right">Status</Eyebrow>
        </TableHead>
        {account.documents.map((d) => {
          const status = rowStatus(d);
          const isOpen = expanded === d.id;
          return (
            <div key={d.id} className="border-t border-hairline">
              <button
                onClick={() => setExpanded(isOpen ? null : d.id)}
                aria-expanded={isOpen}
                className="flex w-full items-center py-[16px] text-left transition-colors duration-150 ease-standard hover:bg-[#fafbfd]"
                title="Show workflow status"
              >
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-[7px] text-[15.5px] text-strong">
                    {d.id === 'MSA' ? d.title : `${d.id} · ${d.title}`}
                    <IconChevronDown
                      size={14}
                      stroke={2}
                      className={`text-muted transition-transform duration-150 ease-standard ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </p>
                  <p className="mt-[4px] text-[14px] text-muted">{d.kindDetail ?? d.kind}</p>
                </div>
                <span className={`w-[130px] text-[14.5px] ${d.value === null ? 'text-muted' : 'text-secondary'}`}>
                  {d.value === null ? '—' : money(d.value)}
                </span>
                <span className="w-[100px] text-[14.5px] text-muted">{d.date}</span>
                <span className="w-[160px] text-right">
                  <StatusPill state={status.state}>{status.label}</StatusPill>
                </span>
              </button>
              {isOpen && (
                <div className="mb-[16px] rounded-card border border-hairline bg-page px-[20px] py-[18px]">
                  {d.scopeSummary && <p className="mb-[16px] mt-0 text-[14.5px] text-secondary">{d.scopeSummary}</p>}
                  <PhaseStrip
                    phase={isAwaiting(d) ? d.phase : PHASES.length}
                    needsClient={isAwaiting(d)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </Section>
    </>
  );
}

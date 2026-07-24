// Leads — the data-table screen. Billable and delivered are both visible and clearly
// distinguished; that pair is the most confusion-prone in the product (docs/01, docs/03).
import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { IconChevronDown } from '@tabler/icons-react';
import { useAccount } from '@/components/AppLayout';
import StatusPill from '@/components/StatusPill';
import { Eyebrow, Hero, MetricStrip } from '@/components/ui';
import { hasService, path } from '@/lib/nav';
import type { Lead } from '@/data/types';

function LeadStatus({ status }: { status: Lead['status'] }) {
  return status === 'accepted' ? (
    <StatusPill state="good">Accepted</StatusPill>
  ) : (
    <StatusPill state="needsYou">Your review</StatusPill>
  );
}

export default function Leads() {
  const account = useAccount();
  const [filter, setFilter] = useState<string>('all');
  const [open, setOpen] = useState(false);

  const campaignName = useMemo(
    () => new Map(account.campaigns.map((c) => [c.id, c.name])),
    [account.campaigns],
  );

  // Locked service reached by direct URL → back to Overview.
  if (!hasService(account, 'leads')) return <Navigate to={path(account.id, '')} replace />;

  const rows = filter === 'all' ? account.leads : account.leads.filter((l) => l.campaignId === filter);
  const filterLabel = filter === 'all' ? 'All campaigns' : (campaignName.get(filter) ?? 'All campaigns');

  return (
    <>
      <Hero hero={account.heroes.leads!} />

      {account.leadsMetrics && (
        <div className="mb-[28px]">
          <MetricStrip metrics={account.leadsMetrics} />
        </div>
      )}

      <div className="mb-[8px] flex items-center justify-between">
        <Eyebrow>Recent leads</Eyebrow>
        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            className="flex items-center gap-[6px] rounded-full border border-hairline px-[13px] py-[6px] text-[12px] text-body transition-colors duration-150 ease-standard hover:bg-page"
          >
            {filterLabel}
            <IconChevronDown size={11} className="text-muted" stroke={2} />
          </button>
          {open && (
            <ul className="absolute right-0 z-10 mt-[6px] w-[220px] overflow-hidden rounded-card border border-hairline bg-white py-[4px] shadow-[0_8px_24px_rgba(7,17,31,0.10)]">
              {[{ id: 'all', name: 'All campaigns' }, ...account.campaigns].map((c) => (
                <li key={c.id}>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setFilter(c.id);
                      setOpen(false);
                    }}
                    className={`block w-full px-[15px] py-[8px] text-left text-[12.5px] transition-colors duration-150 ease-standard hover:bg-page ${
                      c.id === filter ? 'text-strong' : 'text-secondary'
                    }`}
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center py-[13px]">
          <Eyebrow className="flex-1">Contact</Eyebrow>
          <Eyebrow className="w-[200px]">Campaign</Eyebrow>
          <Eyebrow className="w-[80px]">Date</Eyebrow>
          <Eyebrow className="w-[110px] text-right">Status</Eyebrow>
        </div>
        {rows.map((l) => (
          <div key={l.id} className="flex items-center border-t border-hairline py-[13px]">
            <div className="min-w-0 flex-1">
              <p className="text-[13px] text-strong">{l.name}</p>
              <p className="mt-[3px] text-[12px] text-muted">
                {l.title} · {l.company}
              </p>
            </div>
            <span className="w-[200px] text-[12.5px] text-secondary">{campaignName.get(l.campaignId)}</span>
            <span className="w-[80px] text-[12.5px] text-muted">{l.date}</span>
            <span className="w-[110px] text-right">
              <LeadStatus status={l.status} />
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

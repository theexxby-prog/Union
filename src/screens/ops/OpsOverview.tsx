// Ops overview — the book of business. The client Overview answers "how is my
// programme going"; this answers "how is every programme going", for the clients
// this role carries.
//
// Every figure is a sum over the same fixtures the client screens read, so the
// two sides can never disagree. `npm run verify` asserts exactly that.
import { Link } from 'react-router-dom';
import { IconChevronRight } from '@tabler/icons-react';
import { useOpsUser } from '@/components/OpsLayout';
import StatusPill from '@/components/StatusPill';
import {
  Eyebrow,
  MetricStrip,
  ProgressRule,
  Row,
  Section,
  TableHead,
} from '@/components/ui';
import { accountsFor, campaignsAcross, opsAccountRows, opsTotals } from '@/data/ops';
import { int, money, pct, pctValue, plural } from '@/data/format';
import { campaignStatusMeta, effectiveStatus } from '@/lib/campaign';
import { demoKey, useDemoState } from '@/lib/demo-state';
import { path } from '@/lib/nav';

export default function OpsOverview() {
  const user = useOpsUser();
  const { approvedCampaigns } = useDemoState();
  const list = accountsFor(user);
  const t = opsTotals(list);
  const rows = opsAccountRows(list);

  // What needs someone at DBSL, not what needs the client.
  const attention = campaignsAcross(list).filter(
    (c) =>
      effectiveStatus(c, approvedCampaigns.has(demoKey(c.accountId, c.id))) === 'pendingApproval',
  );

  const scope =
    user.assignedAccountIds.length === 0
      ? 'Every client'
      : `${int(list.length)} assigned ${list.length === 1 ? 'client' : 'clients'}`;

  return (
    <>
      <section className="mb-[28px] rounded-[18px] border border-hero-border bg-hero-fill px-[34px] py-[30px]">
        <Eyebrow tone="blue">Operations · Q3 2026</Eyebrow>
        <h1 className="font-display mt-[12px] text-[40px] font-bold leading-[1.12] text-strong">
          {int(t.accepted)} billable leads across {int(t.campaigns)} campaigns
        </h1>
        <p className="mb-0 mt-[10px] text-[16px] text-secondary">
          {scope} · {user.name}, {user.roleLabel.toLowerCase()}.
        </p>
      </section>

      <Section bare>
        <MetricStrip
          metrics={[
            { label: 'Clients', value: int(t.accounts) },
            { label: 'Active campaigns', value: int(t.activeCampaigns) },
            { label: 'Billable leads', value: int(t.accepted), primary: true },
            { label: 'Accept rate', value: pct(t.accepted, t.delivered), positive: true },
            { label: 'Contracted', value: money(t.budget) },
          ]}
        />
      </Section>

      {attention.length > 0 && (
        <Section title="Waiting on a client">
          {attention.map((c) => (
            <Link
              key={`${c.accountId}:${c.id}`}
              to={path(c.accountId, `leads/${c.id}`)}
              className="group -mx-[26px] flex items-center gap-[16px] border-t border-hairline px-[26px] py-[16px] transition-colors duration-150 ease-standard first:border-t-0 hover:bg-row-hover"
            >
              <span className="min-w-0 flex-1 text-[15.5px] !text-body">
                {c.accountName} · {c.name} — awaiting client approval
              </span>
              <StatusPill state="needsYou">Sent</StatusPill>
              <IconChevronRight
                size={17}
                stroke={2}
                className="text-muted transition-transform duration-150 ease-standard group-hover:translate-x-[2px] group-hover:text-accent"
              />
            </Link>
          ))}
        </Section>
      )}

      <Section title="Book of business">
        <TableHead>
          <Eyebrow className="flex-1">Client</Eyebrow>
          <Eyebrow className="w-[240px]">Lead pace</Eyebrow>
          <Eyebrow className="w-[180px] text-right">Invested</Eyebrow>
          <Eyebrow className="w-[180px] text-right">Outstanding</Eyebrow>
        </TableHead>
        {rows.map((r) => {
          const pace = pctValue(r.accepted, r.target);
          return (
            <Row key={r.id} className="gap-[16px]">
              <div className="min-w-0 flex-1">
                {/* Ops can open the client's own view of the same account — the
                    fastest way to answer "what are they actually seeing?" */}
                <Link
                  to={path(r.id, '')}
                  className="group inline-flex items-center gap-[5px] text-[15.5px] font-medium !text-strong hover:!text-accent"
                  title={`Open ${r.name} as the client sees it`}
                >
                  {r.name}
                  <IconChevronRight
                    size={15}
                    stroke={2}
                    className="text-muted transition-transform duration-150 ease-standard group-hover:translate-x-[2px] group-hover:text-accent"
                  />
                </Link>
                <p className="mt-[4px] text-[14px] text-muted">
                  {r.descriptor} · {int(r.services)} {plural(r.services, 'service')} ·{' '}
                  {int(r.campaigns)} {plural(r.campaigns, 'campaign')}
                </p>
              </div>
              <span className="flex w-[240px] items-center gap-[14px]">
                {r.target > 0 ? (
                  <>
                    <span className="flex-1">
                      <ProgressRule value={pace} />
                    </span>
                    <span className="w-[46px] text-right text-[13.5px] tabular-nums text-muted">
                      {pace}%
                    </span>
                  </>
                ) : (
                  <span className="text-[14px] text-muted">No campaigns</span>
                )}
              </span>
              <span className="w-[180px] text-right text-[14.5px] text-secondary">
                {money(r.invested)}
              </span>
              <span className="w-[180px] text-right text-[14.5px]">
                {r.dueNow > 0 ? (
                  <span className="font-medium text-cta">{money(r.dueNow)}</span>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </span>
            </Row>
          );
        })}
      </Section>

      <Section title="Campaigns needing a look">
        <TableHead>
          <Eyebrow className="flex-1">Campaign</Eyebrow>
          <Eyebrow className="w-[200px]">Pace</Eyebrow>
          <Eyebrow className="w-[200px] text-right">Status</Eyebrow>
        </TableHead>
        {campaignsAcross(list)
          .slice()
          .sort((a, b) => pctValue(a.accepted, a.target) - pctValue(b.accepted, b.target))
          .slice(0, 5)
          .map((c) => {
            const meta = campaignStatusMeta[
              effectiveStatus(c, approvedCampaigns.has(demoKey(c.accountId, c.id)))
            ];
            const pace = pctValue(c.accepted, c.target);
            return (
              <Row key={`${c.accountId}:${c.id}`} className="gap-[16px]">
                <div className="min-w-0 flex-1">
                  <p className="text-[15.5px] text-strong">
                    {c.name} · {c.geo}
                  </p>
                  <p className="mt-[4px] text-[14px] text-muted">
                    {c.accountName} · {int(c.accepted)} of {int(c.target)} accepted
                  </p>
                </div>
                <span className="flex w-[200px] items-center gap-[14px]">
                  <span className="flex-1">
                    <ProgressRule value={pace} />
                  </span>
                  <span className="w-[46px] text-right text-[13.5px] tabular-nums text-muted">
                    {pace}%
                  </span>
                </span>
                <span className="w-[200px] text-right">
                  <StatusPill state={meta.state}>{meta.label}</StatusPill>
                </span>
              </Row>
            );
          })}
      </Section>
    </>
  );
}

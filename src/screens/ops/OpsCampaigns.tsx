// Ops campaigns — every campaign this role carries, across every client, plus
// the setup flow.
//
// Campaign setup is the reason this screen matters beyond reporting. A campaign
// created here is issued a UNION KEY at creation, which travels with it to the
// partner platforms as an external reference. That is what lets partner
// reporting be joined back later without matching on campaign names — the gap
// the September epics currently carry as a risk (docs/07).
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { IconChevronRight, IconPlus } from '@tabler/icons-react';
import { useOpsUser } from '@/components/OpsLayout';
import StatusPill from '@/components/StatusPill';
import {
  Eyebrow,
  EmptyLine,
  MetricStrip,
  ProgressRule,
  Row,
  Section,
  TableHead,
} from '@/components/ui';
import { accountsFor, campaignsAcross } from '@/data/ops';
import { int, money, pct, pctValue } from '@/data/format';
import { cadenceLine, campaignStatusMeta, effectiveStatus } from '@/lib/campaign';
import { demoKey, useDemoState } from '@/lib/demo-state';
import { canEditCampaigns } from '@/lib/ops-nav';
import { path } from '@/lib/nav';
import type { Account, OpsUser } from '@/data/types';

/** The key issued at creation and carried to partner platforms. Sequential
 *  within the session — deterministic, so the walkthrough reads the same twice. */
const unionKey = (accountId: string, n: number): string =>
  `UN-${accountId.slice(0, 3).toUpperCase()}-${int(n).padStart(4, '0')}`;

function NewCampaignForm({
  user,
  clients,
  onDone,
}: {
  user: OpsUser;
  clients: Account[];
  onDone: () => void;
}) {
  const { createdCampaigns, createCampaign } = useDemoState();
  const [accountId, setAccountId] = useState(clients[0]?.id ?? '');
  const [name, setName] = useState('');
  const [geo, setGeo] = useState('NAM');
  const [target, setTarget] = useState('150');
  const [cpl, setCpl] = useState('45');

  const targetNum = Number(target) || 0;
  const cplNum = Number(cpl) || 0;
  const budget = targetNum * cplNum;
  const nextKey = unionKey(accountId || 'gen', createdCampaigns.length + 1);
  const valid = accountId !== '' && name.trim() !== '' && targetNum > 0 && cplNum > 0;

  const field =
    'w-full rounded-[10px] border border-hairline bg-white px-[14px] py-[10px] text-[15px] text-strong outline-none transition-colors duration-150 ease-standard focus:border-accent';

  const submit = () => {
    if (!valid) return;
    const id = `new${createdCampaigns.length + 1}`;
    createCampaign({
      id,
      accountId,
      name: name.trim(),
      geo,
      target: targetNum,
      budget,
      startDate: 'Sep 1, 2026',
      endDate: 'Dec 15, 2026',
      cadence: 'Tuesday & Thursday',
      perDrop: Math.max(1, Math.round(targetNum / 20)),
      externalKey: nextKey,
      createdBy: user.id,
    });
    onDone();
  };

  return (
    <Section title="New campaign">
      <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <Eyebrow className="mb-[8px]">Client</Eyebrow>
          <select className={field} value={accountId} onChange={(e) => setAccountId(e.target.value)}>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block lg:col-span-2">
          <Eyebrow className="mb-[8px]">Campaign name</Eyebrow>
          <input
            className={field}
            value={name}
            placeholder="e.g. Identity platform guide"
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="block">
          <Eyebrow className="mb-[8px]">Region</Eyebrow>
          <select className={field} value={geo} onChange={(e) => setGeo(e.target.value)}>
            {['NAM', 'EMEA', 'APAC', 'Global'].map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <Eyebrow className="mb-[8px]">Lead target</Eyebrow>
          <input
            className={field}
            inputMode="numeric"
            value={target}
            onChange={(e) => setTarget(e.target.value.replace(/\D/g, ''))}
          />
        </label>
        <label className="block">
          <Eyebrow className="mb-[8px]">Cost per lead</Eyebrow>
          <input
            className={field}
            inputMode="numeric"
            value={cpl}
            onChange={(e) => setCpl(e.target.value.replace(/\D/g, ''))}
          />
        </label>
        <div className="lg:col-span-2">
          <Eyebrow className="mb-[8px]">Contract value</Eyebrow>
          <p className="font-display text-[28px] font-bold leading-none text-strong">
            {money(budget)}
          </p>
          <p className="mt-[6px] text-[14px] text-muted">
            {int(targetNum)} leads at {money(cplNum)}
          </p>
        </div>
      </div>

      {/* The point of doing setup here rather than in a partner platform. */}
      <div className="mt-[22px] flex flex-wrap items-center gap-[14px] rounded-[12px] border border-hero-border bg-hero-fill px-[20px] py-[16px]">
        <span className="text-[14.5px] text-secondary">
          Union key issued at creation and carried to partner reporting:
        </span>
        <span className="font-display text-[16px] font-bold tabular-nums text-strong">{nextKey}</span>
      </div>

      <div className="mt-[20px] flex flex-wrap gap-[10px] border-t border-hairline pt-[18px]">
        <button
          onClick={submit}
          disabled={!valid}
          className="rounded-full bg-cta px-[20px] py-[9px] text-[14px] font-semibold text-white transition-[filter] duration-150 ease-standard hover:brightness-[1.08] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Create and send for approval
        </button>
        <button
          onClick={onDone}
          className="rounded-full border border-hairline bg-white px-[18px] py-[9px] text-[14px] text-body transition-colors duration-150 ease-standard hover:bg-page"
        >
          Cancel
        </button>
      </div>
    </Section>
  );
}

export default function OpsCampaigns() {
  const user = useOpsUser();
  const { approvedCampaigns, createdCampaigns } = useDemoState();
  const [creating, setCreating] = useState(false);
  const [clientFilter, setClientFilter] = useState('all');

  const clients = accountsFor(user);
  const clientName = useMemo(
    () => new Map(clients.map((c) => [c.id, c.name])),
    [clients],
  );

  const existing = campaignsAcross(clients);
  const drafts = createdCampaigns.filter((d) => clientName.has(d.accountId));

  const filtered =
    clientFilter === 'all' ? existing : existing.filter((c) => c.accountId === clientFilter);
  const filteredDrafts =
    clientFilter === 'all' ? drafts : drafts.filter((d) => d.accountId === clientFilter);

  const accepted = filtered.reduce((a, c) => a + c.accepted, 0);
  const delivered = filtered.reduce((a, c) => a + c.delivered, 0);
  const contracted =
    filtered.reduce((a, c) => a + c.budget, 0) + filteredDrafts.reduce((a, d) => a + d.budget, 0);

  const mayEdit = canEditCampaigns(user);

  return (
    <>
      <Section bare>
        <MetricStrip
          metrics={[
            { label: 'Campaigns', value: int(filtered.length + filteredDrafts.length) },
            { label: 'Billable leads', value: int(accepted), primary: true },
            { label: 'Delivered', value: int(delivered) },
            { label: 'Accept rate', value: pct(accepted, delivered), positive: true },
            { label: 'Contracted', value: money(contracted) },
          ]}
        />
      </Section>

      {creating && mayEdit && (
        <NewCampaignForm user={user} clients={clients} onDone={() => setCreating(false)} />
      )}

      <Section
        title="All campaigns"
        right={
          <div className="flex items-center gap-[10px]">
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="rounded-full border border-hairline bg-white px-[16px] py-[7px] text-[14px] text-body outline-none transition-colors duration-150 ease-standard hover:bg-page"
            >
              <option value="all">All clients</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {mayEdit && !creating && (
              <button
                onClick={() => setCreating(true)}
                className="flex items-center gap-[7px] rounded-full bg-cta px-[18px] py-[8px] text-[14px] font-semibold text-white transition-[filter] duration-150 ease-standard hover:brightness-[1.08]"
              >
                <IconPlus size={16} stroke={2} />
                New campaign
              </button>
            )}
          </div>
        }
      >
        <TableHead>
          <Eyebrow className="flex-1">Campaign</Eyebrow>
          <Eyebrow className="w-[220px]">Pace</Eyebrow>
          <Eyebrow className="w-[160px] text-right">Contracted</Eyebrow>
          <Eyebrow className="w-[200px] text-right">Status</Eyebrow>
        </TableHead>

        {filteredDrafts.length === 0 && filtered.length === 0 && (
          <EmptyLine>No campaigns for this client yet.</EmptyLine>
        )}

        {/* Created this session — sitting with the client for approval. */}
        {filteredDrafts.map((d) => (
          <Row key={d.id} className="gap-[16px]">
            <div className="min-w-0 flex-1">
              <p className="text-[15.5px] font-medium text-strong">
                {d.name} · {d.geo}
              </p>
              <p className="mt-[4px] text-[14px] text-muted">
                {clientName.get(d.accountId)} · {int(d.target)} target · {d.cadence} ·{' '}
                <span className="tabular-nums">{d.externalKey}</span>
              </p>
            </div>
            <span className="w-[220px] text-[14px] text-muted">Not started</span>
            <span className="w-[160px] text-right text-[14.5px] text-secondary">
              {money(d.budget)}
            </span>
            <span className="w-[200px] text-right">
              <StatusPill state="needsYou">Awaiting approval</StatusPill>
            </span>
          </Row>
        ))}

        {filtered.map((c) => {
          const meta =
            campaignStatusMeta[
              effectiveStatus(c, approvedCampaigns.has(demoKey(c.accountId, c.id)))
            ];
          const pace = pctValue(c.accepted, c.target);
          return (
            <Row key={`${c.accountId}:${c.id}`} className="gap-[16px]">
              <div className="min-w-0 flex-1">
                <Link
                  to={path(c.accountId, `leads/${c.id}`)}
                  className="group inline-flex items-center gap-[5px] text-[15.5px] font-medium !text-strong hover:!text-accent"
                  title="Open the client's view of this campaign"
                >
                  {c.name} · {c.geo}
                  <IconChevronRight
                    size={15}
                    stroke={2}
                    className="text-muted transition-transform duration-150 ease-standard group-hover:translate-x-[2px] group-hover:text-accent"
                  />
                </Link>
                <p className="mt-[4px] text-[14px] text-muted">
                  {c.accountName} · {int(c.accepted)} of {int(c.target)} accepted ·{' '}
                  {int(c.delivered)} delivered · {cadenceLine(c)}
                </p>
              </div>
              <span className="flex w-[220px] items-center gap-[14px]">
                <span className="flex-1">
                  <ProgressRule value={pace} />
                </span>
                <span className="w-[46px] text-right text-[13.5px] tabular-nums text-muted">
                  {pace}%
                </span>
              </span>
              <span className="w-[160px] text-right text-[14.5px] text-secondary">
                {money(c.budget)}
              </span>
              <span className="w-[200px] text-right">
                <StatusPill state={meta.state}>{meta.label}</StatusPill>
              </span>
            </Row>
          );
        })}
      </Section>

      {!mayEdit && (
        <p className="text-[14px] text-muted">
          {user.roleLabel} has view access to campaigns. Setup and edits sit with the campaign
          manager or operations.
        </p>
      )}

      <p className="mt-[4px] text-[14px] text-muted">
        Opening a campaign shows the client's own view of it — the same numbers, their side of the
        glass. Use the role switcher to come back.
      </p>
    </>
  );
}

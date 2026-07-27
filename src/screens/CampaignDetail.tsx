// Campaign drill-down — one campaign's full picture: commercial terms, cadence,
// every drop, and its leads. Reached from the campaign list on Leads.
import { useMemo } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { IconArrowLeft } from '@tabler/icons-react';
import { useAccount } from '@/components/AppLayout';
import StatusPill from '@/components/StatusPill';
import {
  Cols,
  Eyebrow,
  EmptyLine,
  MetricStrip,
  PaceBars,
  ProgressRule,
  Row,
  Section,
  TableHead,
} from '@/components/ui';
import { int, money, pctValue } from '@/data/format';
import { campaignAccept, cadenceLine, campaignStatusMeta, effectiveStatus } from '@/lib/campaign';
import { demoKey, useDemoState } from '@/lib/demo-state';
import { hasService, path } from '@/lib/nav';
import type { Lead } from '@/data/types';

export default function CampaignDetail() {
  const account = useAccount();
  const { campaignId } = useParams();
  const { acceptedLeads, approvedCampaigns } = useDemoState();

  const campaign = useMemo(
    () => account.campaigns.find((c) => c.id === campaignId),
    [account.campaigns, campaignId],
  );

  if (!hasService(account, 'leads') || !campaign)
    return <Navigate to={path(account.id, 'leads')} replace />;

  const approved = approvedCampaigns.has(demoKey(account.id, campaign.id));
  const status = campaignStatusMeta[effectiveStatus(campaign, approved)];
  const pending = effectiveStatus(campaign, approved) === 'pendingApproval';
  const pace = pctValue(campaign.accepted, campaign.target);
  const leads = account.leads.filter((l) => l.campaignId === campaign.id);
  const statusFor = (l: Lead): Lead['status'] =>
    acceptedLeads.has(demoKey(account.id, l.id)) ? 'accepted' : l.status;

  const maxLeads = campaign.schedule.length
    ? Math.max(...campaign.schedule.map((d) => d.leads))
    : 0;

  return (
    <>
      <Link
        to={path(account.id, 'leads')}
        className="mb-[16px] inline-flex items-center gap-[7px] text-[14.5px] !text-muted hover:!text-accent"
      >
        <IconArrowLeft size={15} stroke={2} />
        All campaigns
      </Link>

      {/* The drill-down keeps the hero shape so it reads as a page, not a modal. */}
      <section className="mb-[28px] rounded-[18px] border border-hero-border bg-hero-fill px-[34px] py-[30px]">
        <div className="flex flex-wrap items-start justify-between gap-[16px]">
          <div className="min-w-0">
            <Eyebrow tone="blue">Lead generation · Campaign</Eyebrow>
            <h1 className="font-display mt-[12px] text-[40px] font-bold leading-[1.12] text-strong">
              {campaign.name} · {campaign.geo}
            </h1>
            <p className="mb-0 mt-[10px] text-[16px] text-secondary">
              {money(campaign.budget)} · {campaign.startDate} – {campaign.endDate} · {cadenceLine(campaign)}
            </p>
          </div>
          <div className="flex items-center gap-[10px] pt-[6px]">
            {pending && (
              <Link
                to={path(account.id, 'documents')}
                className="rounded-full border border-hero-border bg-white px-[16px] py-[8px] text-[14px] !text-accent transition-colors duration-150 ease-standard hover:bg-page"
              >
                Review scope
              </Link>
            )}
            <StatusPill state={status.state}>{status.label}</StatusPill>
          </div>
        </div>
        <div className="mt-[24px] flex items-center gap-[14px]">
          <span className="flex-1">
            <ProgressRule value={pace} />
          </span>
          <span className="text-[14.5px] text-secondary">{pace}% of target</span>
        </div>
      </section>

      <Section bare>
        <MetricStrip
          metrics={[
            { label: 'Accepted', value: int(campaign.accepted), primary: true },
            { label: 'Target', value: int(campaign.target) },
            { label: 'Delivered', value: int(campaign.delivered) },
            { label: 'Accept rate', value: campaignAccept(campaign), positive: true },
          ]}
        />
      </Section>

      {campaign.schedule.length === 0 ? (
        <Section title="Delivery schedule">
          <EmptyLine>Drops will be scheduled once the campaign starts delivering.</EmptyLine>
        </Section>
      ) : (
        <Cols className="mb-[28px]">
          <div className="lg:col-span-2">
            <Section title="Delivery schedule" className="mb-0 lg:mb-0">
              <PaceBars
                height={168}
                bars={campaign.schedule.map((d) => ({
                  height: (d.leads / maxLeads) * 100,
                  muted: d.status === 'upcoming',
                  title: `${d.date} · ${int(d.leads)} leads`,
                }))}
              />
              <div className="mt-[12px] flex justify-between text-[13.5px] text-muted">
                <span>{campaign.schedule[0].date}</span>
                <span>{campaign.schedule[campaign.schedule.length - 1].date}</span>
              </div>
            </Section>
          </div>

          <Section title="Drops" className="mb-0 lg:mb-0">
            {campaign.schedule.map((d, i) => (
              <Row key={i} className="gap-[12px] first:border-t-0">
                <span className="w-[90px] text-[14.5px] text-muted">{d.date}</span>
                <span className="min-w-0 flex-1 text-[14.5px] text-secondary">{int(d.leads)} leads</span>
                {d.status === 'delivered' ? (
                  <StatusPill state="good" quiet>
                    Delivered
                  </StatusPill>
                ) : (
                  <StatusPill state="neutral">Upcoming</StatusPill>
                )}
              </Row>
            ))}
          </Section>
        </Cols>
      )}

      <Section title="Leads from this campaign">
        {leads.length === 0 ? (
          <EmptyLine>Leads will appear here as drops are delivered.</EmptyLine>
        ) : (
          <>
            <TableHead>
              <Eyebrow className="flex-1">Contact</Eyebrow>
              <Eyebrow className="w-[160px] pl-[24px]">Date</Eyebrow>
              <Eyebrow className="w-[180px] text-right">Status</Eyebrow>
            </TableHead>
            {leads.map((l) => (
              <Row key={l.id}>
                <div className="min-w-0 flex-1">
                  <p className="max-w-[520px] text-[15.5px] text-strong">{l.name}</p>
                  <p className="mt-[4px] text-[14px] text-muted">
                    {l.title} · {l.company}
                  </p>
                </div>
                <span className="w-[160px] pl-[24px] text-[14.5px] text-muted">{l.date}</span>
                <span className="w-[180px] text-right">
                  {statusFor(l) === 'accepted' ? (
                    <StatusPill state="good">Accepted</StatusPill>
                  ) : (
                    <StatusPill state="needsYou">Your review</StatusPill>
                  )}
                </span>
              </Row>
            ))}
          </>
        )}
      </Section>
    </>
  );
}

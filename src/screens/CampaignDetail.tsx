// Campaign drill-down — one campaign's full picture: commercial terms, cadence,
// every drop, and its leads. Reached from the campaign list on Leads.
import { useMemo } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { IconArrowLeft } from '@tabler/icons-react';
import { useAccount } from '@/components/AppLayout';
import StatusPill from '@/components/StatusPill';
import { Eyebrow, EmptyLine, MetricStrip, PaceBars, Panel, ProgressRule } from '@/components/ui';
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
        className="mb-[16px] inline-flex items-center gap-[6px] text-[12.5px] !text-muted hover:!text-accent"
      >
        <IconArrowLeft size={14} stroke={2} />
        All campaigns
      </Link>

      <div className="mb-[6px] flex items-start justify-between gap-[14px]">
        <div>
          <Eyebrow tone="blue">Lead generation · Campaign</Eyebrow>
          <h1 className="font-display mt-[8px] text-[25px] font-bold leading-[1.15] text-strong">
            {campaign.name} · {campaign.geo}
          </h1>
          <p className="mb-0 mt-[6px] text-[12.5px] text-secondary">
            {money(campaign.budget)} · {campaign.startDate} – {campaign.endDate} · {cadenceLine(campaign)}
          </p>
        </div>
        <div className="flex items-center gap-[8px] pt-[4px]">
          {pending && (
            <Link
              to={path(account.id, 'documents')}
              className="rounded-full border border-hairline bg-white px-[12px] py-[5px] text-[11.5px] !text-accent transition-colors duration-150 ease-standard hover:bg-page"
            >
              Review scope
            </Link>
          )}
          <StatusPill state={status.state}>{status.label}</StatusPill>
        </div>
      </div>

      <div className="mb-[10px] mt-[14px] flex items-center gap-[10px]">
        <span className="flex-1">
          <ProgressRule value={pace} />
        </span>
        <span className="text-[12px] text-secondary">{pace}% of target</span>
      </div>

      <div className="mb-[22px] mt-[18px]">
        <MetricStrip
          metrics={[
            { label: 'Accepted', value: int(campaign.accepted) },
            { label: 'Target', value: int(campaign.target) },
            { label: 'Delivered', value: int(campaign.delivered) },
            { label: 'Accept rate', value: campaignAccept(campaign), positive: true },
          ]}
        />
      </div>

      <Eyebrow className="mb-[14px]">Delivery schedule</Eyebrow>
      {campaign.schedule.length === 0 ? (
        <EmptyLine>Drops will be scheduled once the campaign starts delivering.</EmptyLine>
      ) : (
        <>
          <Panel>
            <PaceBars
              bars={campaign.schedule.map((d) => ({
                height: (d.leads / maxLeads) * 100,
                muted: d.status === 'upcoming',
                title: `${d.date} · ${int(d.leads)} leads`,
              }))}
              height={72}
            />
            <div className="mt-[8px] flex justify-between text-[11.5px] text-muted">
              <span>{campaign.schedule[0].date}</span>
              <span>{campaign.schedule[campaign.schedule.length - 1].date}</span>
            </div>
          </Panel>
          <div className="mb-[22px] mt-[10px]">
            {campaign.schedule.map((d, i) => (
              <div key={i} className="flex items-center border-t border-hairline py-[11px]">
                <span className="w-[80px] text-[12.5px] text-muted">{d.date}</span>
                <span className="min-w-0 flex-1 text-[12.5px] text-secondary">
                  {int(d.leads)} leads
                </span>
                <span className="w-[110px] text-right">
                  {d.status === 'delivered' ? (
                    <StatusPill state="good">Delivered</StatusPill>
                  ) : (
                    <StatusPill state="neutral">Upcoming</StatusPill>
                  )}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      <Eyebrow className="mb-[2px]">Leads from this campaign</Eyebrow>
      <div>
        {leads.length === 0 ? (
          <EmptyLine>Leads will appear here as drops are delivered.</EmptyLine>
        ) : (
          leads.map((l) => (
            <div key={l.id} className="flex items-center border-t border-hairline py-[12px]">
              <div className="min-w-0 flex-1">
                <p className="text-[13px] text-strong">{l.name}</p>
                <p className="mt-[3px] text-[12px] text-muted">
                  {l.title} · {l.company}
                </p>
              </div>
              <span className="w-[80px] text-[12.5px] text-muted">{l.date}</span>
              <span className="w-[110px] text-right">
                {statusFor(l) === 'accepted' ? (
                  <StatusPill state="good">Accepted</StatusPill>
                ) : (
                  <StatusPill state="needsYou">Your review</StatusPill>
                )}
              </span>
            </div>
          ))
        )}
      </div>
    </>
  );
}

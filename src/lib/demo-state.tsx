// Session-local demo state — the live interactions in the walkthrough:
// accepting a lead, approving a campaign, and creating a campaign in ops.
//
// Lead and campaign keys are `${accountId}:${entityId}` so each account's
// walkthrough is independent. The provider sits ABOVE both the client and the
// ops route trees, so a campaign created in ops is visible on the client side
// without a reload — that crossing is the point of the demo. A full reload
// resets everything, which is the desired behaviour. No persistence: this is a
// demo artifact, not a product.
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { DraftCampaign } from '@/data/types';

interface DemoState {
  acceptedLeads: ReadonlySet<string>;
  approvedCampaigns: ReadonlySet<string>;
  createdCampaigns: readonly DraftCampaign[];
  acceptLead: (key: string) => void;
  approveCampaign: (key: string) => void;
  createCampaign: (campaign: DraftCampaign) => void;
}

const DemoStateContext = createContext<DemoState | null>(null);

export function DemoStateProvider({ children }: { children: React.ReactNode }) {
  const [acceptedLeads, setAcceptedLeads] = useState<ReadonlySet<string>>(new Set());
  const [approvedCampaigns, setApprovedCampaigns] = useState<ReadonlySet<string>>(new Set());
  const [createdCampaigns, setCreatedCampaigns] = useState<readonly DraftCampaign[]>([]);

  const acceptLead = useCallback((key: string) => {
    setAcceptedLeads((prev) => new Set(prev).add(key));
  }, []);
  const approveCampaign = useCallback((key: string) => {
    setApprovedCampaigns((prev) => new Set(prev).add(key));
  }, []);
  const createCampaign = useCallback((campaign: DraftCampaign) => {
    setCreatedCampaigns((prev) => [...prev, campaign]);
  }, []);

  const value = useMemo(
    () => ({
      acceptedLeads,
      approvedCampaigns,
      createdCampaigns,
      acceptLead,
      approveCampaign,
      createCampaign,
    }),
    [acceptedLeads, approvedCampaigns, createdCampaigns, acceptLead, approveCampaign, createCampaign],
  );
  return <DemoStateContext.Provider value={value}>{children}</DemoStateContext.Provider>;
}

export function useDemoState(): DemoState {
  const ctx = useContext(DemoStateContext);
  if (!ctx) throw new Error('useDemoState must be used within DemoStateProvider');
  return ctx;
}

export const demoKey = (accountId: string, entityId: string): string => `${accountId}:${entityId}`;

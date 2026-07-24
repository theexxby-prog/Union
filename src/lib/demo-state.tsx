// Session-local demo state — the two live interactions (accepting a lead,
// approving a campaign). Keys are `${accountId}:${entityId}` so each account's
// walkthrough is independent. State lives above the screen routes (AppLayout),
// so it survives tab switches; a full reload resets it, which is the desired
// demo behaviour. No persistence — this is a demo artifact, not a product.
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

interface DemoState {
  acceptedLeads: ReadonlySet<string>;
  approvedCampaigns: ReadonlySet<string>;
  acceptLead: (key: string) => void;
  approveCampaign: (key: string) => void;
}

const DemoStateContext = createContext<DemoState | null>(null);

export function DemoStateProvider({ children }: { children: React.ReactNode }) {
  const [acceptedLeads, setAcceptedLeads] = useState<ReadonlySet<string>>(new Set());
  const [approvedCampaigns, setApprovedCampaigns] = useState<ReadonlySet<string>>(new Set());

  const acceptLead = useCallback((key: string) => {
    setAcceptedLeads((prev) => new Set(prev).add(key));
  }, []);
  const approveCampaign = useCallback((key: string) => {
    setApprovedCampaigns((prev) => new Set(prev).add(key));
  }, []);

  const value = useMemo(
    () => ({ acceptedLeads, approvedCampaigns, acceptLead, approveCampaign }),
    [acceptedLeads, approvedCampaigns, acceptLead, approveCampaign],
  );
  return <DemoStateContext.Provider value={value}>{children}</DemoStateContext.Provider>;
}

export function useDemoState(): DemoState {
  const ctx = useContext(DemoStateContext);
  if (!ctx) throw new Error('useDemoState must be used within DemoStateProvider');
  return ctx;
}

export const demoKey = (accountId: string, entityId: string): string => `${accountId}:${entityId}`;

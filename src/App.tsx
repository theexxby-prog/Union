import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import OpsLayout from '@/components/OpsLayout';
import Entry from '@/screens/Entry';
import Picker from '@/screens/Picker';
import Overview from '@/screens/Overview';
import Data from '@/screens/Data';
import Media from '@/screens/Media';
import Leads from '@/screens/Leads';
import CampaignDetail from '@/screens/CampaignDetail';
import Finance from '@/screens/Finance';
import Research from '@/screens/Research';
import Report from '@/screens/Report';
import Documents from '@/screens/Documents';
import Invoices from '@/screens/Invoices';
import Support from '@/screens/Support';
import AccountSettings from '@/screens/AccountSettings';
import OpsPicker from '@/screens/ops/OpsPicker';
import OpsOverview from '@/screens/ops/OpsOverview';
import OpsCampaigns from '@/screens/ops/OpsCampaigns';
import { DemoStateProvider } from '@/lib/demo-state';

// One session spans both sides: a campaign created in ops is visible to the
// client without a reload, which is the crossing the walkthrough turns on. That
// is why the provider sits here rather than inside either shell.
export default function App() {
  return (
    <DemoStateProvider>
      <Routes>
        <Route path="/" element={<Entry />} />

        {/* Client side */}
        <Route path="/clients" element={<Picker />} />
        <Route path="/:accountId" element={<AppLayout />}>
          <Route index element={<Overview />} />
          <Route path="data" element={<Data />} />
          <Route path="media" element={<Media />} />
          <Route path="leads" element={<Leads />} />
          <Route path="leads/:campaignId" element={<CampaignDetail />} />
          <Route path="finance" element={<Finance />} />
          <Route path="research" element={<Research />} />
          <Route path="report" element={<Report />} />
          <Route path="documents" element={<Documents />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="support" element={<Support />} />
          <Route path="account" element={<AccountSettings />} />
        </Route>

        {/* Ops side */}
        <Route path="/ops" element={<OpsPicker />} />
        <Route path="/ops/:roleId" element={<OpsLayout />}>
          <Route index element={<OpsOverview />} />
          <Route path="campaigns" element={<OpsCampaigns />} />
        </Route>

        {/* Anything else → the entry fork. */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DemoStateProvider>
  );
}

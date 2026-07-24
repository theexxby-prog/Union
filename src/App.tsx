import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import Picker from '@/screens/Picker';
import Overview from '@/screens/Overview';
import Data from '@/screens/Data';
import Media from '@/screens/Media';
import Leads from '@/screens/Leads';
import Documents from '@/screens/Documents';
import Invoices from '@/screens/Invoices';
import Support from '@/screens/Support';
import AccountSettings from '@/screens/AccountSettings';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Picker />} />
      <Route path="/:accountId" element={<AppLayout />}>
        <Route index element={<Overview />} />
        <Route path="data" element={<Data />} />
        <Route path="media" element={<Media />} />
        <Route path="leads" element={<Leads />} />
        <Route path="documents" element={<Documents />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="support" element={<Support />} />
        <Route path="account" element={<AccountSettings />} />
      </Route>
      {/* Anything else → the account picker. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

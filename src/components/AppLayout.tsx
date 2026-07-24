// The app shell: chrome (logo, account switcher, notifications, gear, avatar) +
// tabs + screen outlet. Locked service tabs are shown greyed with a lock, never
// hidden — the locked item is the product's only upsell surface (docs/02).
import { useEffect, useState } from 'react';
import {
  Navigate,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
} from 'react-router-dom';
import {
  IconBell,
  IconChevronDown,
  IconLock,
  IconSettings,
} from '@tabler/icons-react';
import StatusPill from '@/components/StatusPill';
import { accounts, getAccount } from '@/data/accounts';
import { DemoStateProvider } from '@/lib/demo-state';
import { noticesFor } from '@/lib/notices';
import { currentSegment, isEntitled, path, switchTarget, TABS } from '@/lib/nav';
import type { Account } from '@/data/types';

/** Screens read the resolved account from the router outlet. */
export const useAccount = (): Account => useOutletContext<Account>();

const dropdownClass =
  'absolute right-0 z-10 mt-[6px] overflow-hidden rounded-card border border-hairline bg-white py-[4px] shadow-[0_8px_24px_rgba(7,17,31,0.10)]';

function Logo() {
  return (
    <div className="flex items-center gap-[9px]">
      <span className="font-display flex h-[22px] w-[22px] items-center justify-center rounded-[5px] bg-cta text-[11px] font-bold text-white">
        D
      </span>
      <span className="font-display text-[15px] font-bold text-strong">Union</span>
    </div>
  );
}

function AccountSwitcher({ account }: { account: Account }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        className="flex items-center gap-[6px] rounded-full border border-hairline px-[13px] py-[6px] text-[12.5px] text-body transition-colors duration-150 ease-standard hover:bg-page"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {account.name}
        <IconChevronDown size={12} className="text-muted" stroke={2} />
      </button>
      {open && (
        <ul role="listbox" className={`${dropdownClass} w-[260px]`}>
          {accounts.map((a) => (
            <li key={a.id}>
              <button
                role="option"
                aria-selected={a.id === account.id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  setOpen(false);
                  // Stay on the current tab when the target account can see it —
                  // switching accounts mid-screen is the comparison move.
                  navigate(switchTarget(a.id, location.pathname, a));
                }}
                className={`flex w-full flex-col items-start px-[15px] py-[9px] text-left transition-colors duration-150 ease-standard hover:bg-page ${
                  a.id === account.id ? 'bg-page' : ''
                }`}
              >
                <span className="text-[13px] text-strong">{a.name}</span>
                <span className="mt-[2px] block text-[11.5px] text-muted">{a.descriptor}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function NotificationBell({ account }: { account: Account }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const notices = noticesFor(account);
  const hasAction = notices.some((n) => n.state === 'action');

  return (
    <div className="relative">
      <button
        aria-label="Notifications"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        className="relative text-muted transition-colors duration-150 ease-standard hover:text-secondary"
      >
        <IconBell size={17} stroke={2} />
        {notices.length > 0 && (
          <span
            className={`absolute -right-[2px] -top-[1px] h-[7px] w-[7px] rounded-full border border-white ${
              hasAction ? 'bg-cta' : 'bg-accent'
            }`}
          />
        )}
      </button>
      {open && (
        <div role="menu" className={`${dropdownClass} w-[320px]`}>
          <p className="m-0 px-[15px] pb-[6px] pt-[8px] text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            Notifications
          </p>
          {notices.length === 0 ? (
            <p className="m-0 px-[15px] pb-[12px] pt-[4px] text-[12.5px] text-muted">
              Nothing needs your attention right now.
            </p>
          ) : (
            notices.map((n) => (
              <button
                key={n.id}
                role="menuitem"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setOpen(false);
                  navigate(path(account.id, n.segment));
                }}
                className="flex w-full items-center gap-[10px] border-t border-hairline px-[15px] py-[10px] text-left transition-colors duration-150 ease-standard hover:bg-page"
              >
                <span className="min-w-0 flex-1 text-[12.5px] leading-[1.4] text-body">{n.label}</span>
                <StatusPill state={n.state}>{n.state === 'action' ? 'Action' : 'Needs you'}</StatusPill>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function Chrome({ account }: { account: Account }) {
  return (
    <header className="flex items-center justify-between border-b border-hairline px-[28px] py-[14px]">
      <Logo />
      <div className="flex items-center gap-[14px]">
        <AccountSwitcher account={account} />
        <NotificationBell account={account} />
        <NavLink
          to={path(account.id, 'account')}
          aria-label="Account settings"
          className={({ isActive }) =>
            `transition-colors duration-150 ease-standard hover:text-secondary ${isActive ? 'text-accent' : 'text-muted'}`
          }
        >
          <IconSettings size={17} stroke={2} />
        </NavLink>
        <span className="flex h-[25px] w-[25px] items-center justify-center rounded-full bg-[#F4F7FB] text-[10.5px] font-semibold text-secondary">
          {account.user.initials}
        </span>
      </div>
    </header>
  );
}

function Tabs({ account }: { account: Account }) {
  const navigate = useNavigate();
  return (
    <nav className="flex gap-[26px] border-b border-hairline px-[28px] pt-[13px]">
      {TABS.map((tab) => {
        const entitled = isEntitled(tab, account);
        if (!entitled) {
          return (
            <button
              key={tab.key}
              onClick={() => navigate(path(account.id, ''))}
              className="flex items-center gap-[4px] border-b-2 border-transparent pb-[11px] text-[13px] text-faint"
              title={`${tab.label} is available on your account — see Overview`}
            >
              {tab.label}
              <IconLock size={11} stroke={2} />
            </button>
          );
        }
        return (
          <NavLink
            key={tab.key}
            to={path(account.id, tab.segment)}
            end={tab.segment === ''}
            className={({ isActive }) =>
              `border-b-2 pb-[11px] text-[13px] transition-colors duration-150 ease-standard ${
                isActive
                  ? 'border-accent font-medium text-strong'
                  : 'border-transparent text-muted hover:text-secondary'
              }`
            }
          >
            {tab.label}
          </NavLink>
        );
      })}
    </nav>
  );
}

/** Slim corporate footer — links out to the main Datamatics Business Solutions
 *  site, NY office only, two compact rows. Closes every screen. */
const CORP_URL = 'https://www.datamaticsbpm.com';
const CORP_LINKS = ['About', 'Services', 'Case Studies', 'Careers', 'Contact'];

function SiteFooter() {
  return (
    <footer className="border-t border-hairline px-[28px] py-[12px]">
      <div className="flex flex-wrap items-center justify-between gap-x-[16px] gap-y-[6px]">
        <div className="flex flex-wrap items-center gap-x-[14px] gap-y-[4px]">
          <a
            href={CORP_URL}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] font-semibold !text-secondary hover:!text-accent"
          >
            Datamatics Business Solutions
          </a>
          {CORP_LINKS.map((label) => (
            <a
              key={label}
              href={CORP_URL}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] !text-muted hover:!text-accent"
            >
              {label}
            </a>
          ))}
        </div>
        <span className="text-[11px] text-muted">
          146 West 29th Street, Ste 10W, New York, NY 10001 · +1-213-647-8029
        </span>
      </div>
      <div className="mt-[6px] flex flex-wrap items-center justify-between gap-x-[16px] gap-y-[4px]">
        <span className="text-[11px] text-faint">
          © 2026 Datamatics Business Solutions Limited. All rights reserved.
        </span>
        <span className="text-[11px] text-faint">Union · Internal demo</span>
      </div>
    </footer>
  );
}

const TITLE_BY_SEGMENT: Record<string, string> = Object.fromEntries(
  TABS.map((t) => [t.segment, t.label]),
);
TITLE_BY_SEGMENT['account'] = 'Account';
TITLE_BY_SEGMENT['report'] = 'Report';

export default function AppLayout() {
  const { accountId } = useParams();
  const location = useLocation();
  const account = getAccount(accountId);

  useEffect(() => {
    if (!account) return;
    const seg = currentSegment(location.pathname);
    const label = TITLE_BY_SEGMENT[seg] ?? TITLE_BY_SEGMENT[''];
    document.title = `${label} · ${account.name} · Union`;
  }, [account, location.pathname]);

  // Unknown account slug → back to the picker.
  if (!account) return <Navigate to="/" replace />;

  const screenKey = `${account.id}/${currentSegment(location.pathname)}`;

  return (
    <DemoStateProvider>
      <div className="min-h-full bg-[#f6f8fb]">
        <div className="mx-auto max-w-[1200px] px-[24px] py-[40px]">
          <div className="overflow-hidden rounded-[16px] border border-hairline bg-white">
            <Chrome account={account} />
            <Tabs account={account} />
            {/* Keyed by account+tab so switching either fades the screen in. */}
            <div key={screenKey} className="animate-screen px-[28px] py-[26px]">
              <Outlet context={account} />
            </div>
            <SiteFooter />
          </div>
        </div>
      </div>
    </DemoStateProvider>
  );
}

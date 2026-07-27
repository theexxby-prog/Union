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
import { DbslLockup, DbslMark } from '@/components/BrandLogo';
import StatusPill from '@/components/StatusPill';
import { accounts, getAccount } from '@/data/accounts';
import { DemoStateProvider } from '@/lib/demo-state';
import { noticesFor } from '@/lib/notices';
import { currentSegment, isEntitled, path, switchTarget, TABS } from '@/lib/nav';
import type { Account } from '@/data/types';

/** Screens read the resolved account from the router outlet. */
export const useAccount = (): Account => useOutletContext<Account>();

/** Chrome and content share one measure; the bars themselves run full-bleed. */
const SHELL = 'mx-auto w-full max-w-[1560px] px-[32px]';

const dropdownClass =
  'absolute right-0 z-20 mt-[8px] overflow-hidden rounded-[14px] border border-hairline bg-white py-[6px] shadow-[0_10px_30px_rgba(7,17,31,0.12)]';

function Logo() {
  return (
    <div className="flex items-center gap-[8px]">
      {/* The official DBSL mark — used as-is, never redrawn (brand rules). */}
      <DbslMark className="h-[34px] w-auto" />
      <span className="font-display text-[19px] font-bold text-strong">Union</span>
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
        className="flex items-center gap-[8px] rounded-full border border-hairline px-[18px] py-[9px] text-[14.5px] font-medium text-body transition-colors duration-150 ease-standard hover:bg-page"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {account.name}
        <IconChevronDown size={15} className="text-muted" stroke={2} />
      </button>
      {open && (
        <ul role="listbox" className={`${dropdownClass} w-[320px]`}>
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
                className={`flex w-full flex-col items-start px-[18px] py-[11px] text-left transition-colors duration-150 ease-standard hover:bg-page ${
                  a.id === account.id ? 'bg-page' : ''
                }`}
              >
                <span className="text-[15px] font-medium text-strong">{a.name}</span>
                <span className="mt-[3px] block text-[13px] text-muted">{a.descriptor}</span>
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
        <IconBell size={20} stroke={2} />
        {notices.length > 0 && (
          <span
            className={`absolute -right-[2px] -top-[1px] h-[9px] w-[9px] rounded-full border-2 border-white ${
              hasAction ? 'bg-cta' : 'bg-accent'
            }`}
          />
        )}
      </button>
      {open && (
        <div role="menu" className={`${dropdownClass} w-[320px]`}>
          <p className="m-0 px-[18px] pb-[8px] pt-[10px] text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">
            Notifications
          </p>
          {notices.length === 0 ? (
            <p className="m-0 px-[18px] pb-[14px] pt-[6px] text-[14px] text-muted">
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
                className="flex w-full items-center gap-[12px] border-t border-hairline px-[18px] py-[13px] text-left transition-colors duration-150 ease-standard hover:bg-page"
              >
                <span className="min-w-0 flex-1 text-[14px] leading-[1.4] text-body">{n.label}</span>
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
    <header className={`${SHELL} flex items-center justify-between py-[16px]`}>
      <Logo />
      <div className="flex items-center gap-[18px]">
        <AccountSwitcher account={account} />
        <NotificationBell account={account} />
        <NavLink
          to={path(account.id, 'account')}
          aria-label="Account settings"
          className={({ isActive }) =>
            `transition-colors duration-150 ease-standard hover:text-secondary ${isActive ? 'text-accent' : 'text-muted'}`
          }
        >
          <IconSettings size={20} stroke={2} />
        </NavLink>
        <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#EEF2F8] text-[13px] font-semibold text-secondary">
          {account.user.initials}
        </span>
      </div>
    </header>
  );
}

function Tabs({ account }: { account: Account }) {
  const navigate = useNavigate();
  return (
    <nav className={`${SHELL} flex gap-[40px] pt-[6px]`}>
      {TABS.map((tab) => {
        const entitled = isEntitled(tab, account);
        if (!entitled) {
          return (
            <button
              key={tab.key}
              onClick={() => navigate(path(account.id, ''))}
              className="flex items-center gap-[6px] border-b-2 border-transparent pb-[16px] text-[16px] text-faint"
              title={`${tab.label} is available on your account — see Overview`}
            >
              {tab.label}
              <IconLock size={14} stroke={2} />
            </button>
          );
        }
        return (
          <NavLink
            key={tab.key}
            to={path(account.id, tab.segment)}
            end={tab.segment === ''}
            className={({ isActive }) =>
              `border-b-2 pb-[16px] text-[16px] transition-colors duration-150 ease-standard ${
                isActive
                  ? 'border-accent font-semibold text-strong'
                  : 'border-transparent font-medium text-secondary hover:text-strong'
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
    <footer className={`${SHELL} py-[18px]`}>
      <div className="flex flex-wrap items-center justify-between gap-x-[16px] gap-y-[6px]">
        <div className="flex flex-wrap items-center gap-x-[14px] gap-y-[4px]">
          <a
            href={CORP_URL}
            target="_blank"
            rel="noreferrer"
            title="Datamatics Business Solutions"
            className="opacity-90 transition-opacity duration-150 ease-standard hover:opacity-100"
          >
            <DbslLockup className="h-[30px] w-auto" />
          </a>
          {CORP_LINKS.map((label) => (
            <a
              key={label}
              href={CORP_URL}
              target="_blank"
              rel="noreferrer"
              className="text-[13px] !text-muted hover:!text-accent"
            >
              {label}
            </a>
          ))}
        </div>
        <span className="text-[13px] text-muted">
          146 West 29th Street, Ste 10W, New York, NY 10001 · +1-213-647-8029
        </span>
      </div>
      <div className="mt-[8px] flex flex-wrap items-center justify-between gap-x-[16px] gap-y-[4px]">
        <span className="text-[13px] text-faint">
          © 2026 Datamatics Business Solutions Limited. All rights reserved.
        </span>
        <span className="text-[13px] text-faint">Union · Internal demo</span>
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
      {/* Chrome and tabs run edge to edge and stay pinned, so the app owns the
          viewport instead of floating as a card in the middle of it. */}
      <div className="min-h-full">
        <div className="sticky top-0 z-30 border-b border-hairline bg-white">
          <Chrome account={account} />
          <Tabs account={account} />
        </div>
        <main className={`${SHELL} py-[32px]`}>
          {/* Keyed by account+tab so switching either fades the screen in. */}
          <div key={screenKey} className="animate-screen">
            <Outlet context={account} />
          </div>
        </main>
        <div className="border-t border-hairline bg-white">
          <SiteFooter />
        </div>
      </div>
    </DemoStateProvider>
  );
}

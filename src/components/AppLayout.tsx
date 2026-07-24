// The app shell: chrome (logo, account switcher, controls) + tabs + screen outlet.
// Locked service tabs are shown greyed with a lock, never hidden — the locked item
// is the product's only upsell surface (docs/02).
import { useState } from 'react';
import {
  Navigate,
  NavLink,
  Outlet,
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
import { accounts, getAccount } from '@/data/accounts';
import type { Account } from '@/data/types';
import { isEntitled, path, TABS } from '@/lib/nav';

/** Screens read the resolved account from the router outlet. */
export const useAccount = (): Account => useOutletContext<Account>();

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
        <ul
          role="listbox"
          className="absolute right-0 z-10 mt-[6px] w-[260px] overflow-hidden rounded-card border border-hairline bg-white py-[4px] shadow-[0_8px_24px_rgba(7,17,31,0.10)]"
        >
          {accounts.map((a) => (
            <li key={a.id}>
              <button
                role="option"
                aria-selected={a.id === account.id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  setOpen(false);
                  navigate(path(a.id, ''));
                }}
                className={`flex w-full flex-col items-start px-[15px] py-[9px] text-left transition-colors duration-150 ease-standard hover:bg-page ${
                  a.id === account.id ? 'bg-page' : ''
                }`}
              >
                <span className="text-[13px] text-strong">{a.name}</span>
                <span className="mt-[2px] text-[11.5px] text-muted">{a.descriptor}</span>
              </button>
            </li>
          ))}
        </ul>
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
        <button aria-label="Notifications" className="text-muted transition-colors duration-150 ease-standard hover:text-secondary">
          <IconBell size={17} stroke={2} />
        </button>
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
  return (
    <nav className="flex gap-[26px] border-b border-hairline px-[28px] pt-[13px]">
      {TABS.map((tab) => {
        const entitled = isEntitled(tab, account);
        if (!entitled) {
          return (
            <span
              key={tab.key}
              className="flex items-center gap-[4px] border-b-2 border-transparent pb-[11px] text-[13px] text-faint"
              title="Available on your account"
            >
              {tab.label}
              <IconLock size={11} stroke={2} />
            </span>
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

export default function AppLayout() {
  const { accountId } = useParams();
  const account = getAccount(accountId);

  // Unknown account slug → back to the picker.
  if (!account) return <Navigate to="/" replace />;

  return (
    <div className="min-h-full bg-[#f6f8fb]">
      <div className="mx-auto max-w-[1200px] px-[24px] py-[40px]">
        <div className="overflow-hidden rounded-[16px] border border-hairline bg-white">
          <Chrome account={account} />
          <Tabs account={account} />
          <div className="px-[28px] py-[26px]">
            <Outlet context={account} />
          </div>
        </div>
      </div>
    </div>
  );
}

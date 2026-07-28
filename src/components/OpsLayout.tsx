// The ops shell. Same chrome grammar as the client app — full-bleed sticky bar,
// tabs, 1560px measure — because it is one product with two audiences, not two
// products. What differs is the nav: ops thinks in campaigns across every
// client, the client thinks in one account.
//
// Destinations a role cannot reach are hidden. Destinations it can reach but
// that are not built yet render locked, the same device the client side uses for
// unentitled services — the roadmap stays legible in the nav.
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
import { IconChevronDown, IconLock } from '@tabler/icons-react';
import { SiteFooter } from '@/components/AppLayout';
import { DbslMark } from '@/components/BrandLogo';
import { getOpsUser, opsUsers } from '@/data/ops';
import { opsPath, opsSegment, opsSwitchTarget, opsTabsFor } from '@/lib/ops-nav';
import type { OpsUser } from '@/data/types';

/** Ops screens read the resolved role from the router outlet. */
export const useOpsUser = (): OpsUser => useOutletContext<OpsUser>();

const SHELL = 'mx-auto w-full max-w-[1560px] px-[32px]';

function RoleSwitcher({ user }: { user: OpsUser }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        className="flex items-center gap-[8px] rounded-full border border-hairline px-[18px] py-[9px] text-[14.5px] font-medium text-body transition-colors duration-150 ease-standard hover:bg-page"
      >
        {user.roleLabel}
        <IconChevronDown size={15} stroke={2} className="text-muted" />
      </button>
      {open && (
        <ul className="absolute right-0 z-20 mt-[8px] w-[320px] overflow-hidden rounded-[14px] border border-hairline bg-white py-[6px] shadow-[0_10px_30px_rgba(7,17,31,0.12)]">
          {opsUsers.map((u) => (
            <li key={u.id}>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  setOpen(false);
                  navigate(opsSwitchTarget(u, location.pathname));
                }}
                className={`flex w-full flex-col items-start px-[18px] py-[11px] text-left transition-colors duration-150 ease-standard hover:bg-row-hover ${
                  u.id === user.id ? 'bg-page' : ''
                }`}
              >
                <span className="text-[14.5px] font-medium text-strong">{u.roleLabel}</span>
                <span className="mt-[2px] text-[13.5px] text-muted">{u.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Chrome({ user }: { user: OpsUser }) {
  return (
    <header className={`${SHELL} flex items-center justify-between py-[16px]`}>
      <div className="flex items-center gap-[8px]">
        <DbslMark className="h-[34px] w-auto" />
        <span className="font-display text-[19px] font-bold text-strong">Union</span>
        {/* Says plainly which side of the product you are on. */}
        <span className="ml-[6px] rounded-full bg-hero-fill px-[11px] py-[4px] text-[12px] font-semibold uppercase tracking-[0.12em] text-accent">
          Ops
        </span>
      </div>
      <div className="flex items-center gap-[18px]">
        <RoleSwitcher user={user} />
        <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#EEF2F8] text-[13px] font-semibold text-secondary">
          {user.initials}
        </span>
      </div>
    </header>
  );
}

function Tabs({ user }: { user: OpsUser }) {
  return (
    <nav className={`${SHELL} flex gap-[40px] pt-[6px]`}>
      {opsTabsFor(user).map((tab) =>
        tab.built ? (
          <NavLink
            key={tab.key}
            to={opsPath(user.id, tab.segment)}
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
        ) : (
          <span
            key={tab.key}
            className="flex cursor-default items-center gap-[6px] border-b-2 border-transparent pb-[16px] text-[16px] text-faint"
            title={`${tab.label} is next on the ops roadmap`}
          >
            {tab.label}
            <IconLock size={14} stroke={2} />
          </span>
        ),
      )}
    </nav>
  );
}

const TITLE_BY_SEGMENT: Record<string, string> = { '': 'Overview', campaigns: 'Campaigns' };

export default function OpsLayout() {
  const { roleId } = useParams();
  const location = useLocation();
  const user = roleId ? getOpsUser(roleId) : undefined;

  useEffect(() => {
    if (!user) return;
    const seg = opsSegment(location.pathname);
    const label = TITLE_BY_SEGMENT[seg] ?? TITLE_BY_SEGMENT[''];
    document.title = `${label} · Ops · Union`;
  }, [user, location.pathname]);

  // Unknown role slug → back to the role picker.
  if (!user) return <Navigate to="/ops" replace />;

  const screenKey = `${user.id}/${opsSegment(location.pathname)}`;

  return (
    <div className="min-h-full">
      <div className="sticky top-0 z-30 border-b border-hairline bg-white">
        <Chrome user={user} />
        <Tabs user={user} />
      </div>
      <main className={`${SHELL} py-[32px]`}>
        <div key={screenKey} className="animate-screen">
          <Outlet context={user} />
        </div>
      </main>
      <div className="border-t border-hairline bg-white">
        <SiteFooter />
      </div>
    </div>
  );
}

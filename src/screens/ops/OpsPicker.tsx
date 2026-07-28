// Ops role picker (/ops) — the internal counterpart of the account picker.
// Roles, not people, are the point: what you can reach changes with the role,
// which is the whole argument for the ops side existing.
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react';
import { DbslMark } from '@/components/BrandLogo';
import { Eyebrow } from '@/components/ui';
import { accountsFor, opsUsers } from '@/data/ops';
import { int } from '@/data/format';
import { opsPath, opsTabsFor } from '@/lib/ops-nav';
import type { OpsUser } from '@/data/types';

/** One derived line: how much of the book this role touches, and how far its
 *  nav reaches. Both come from the same source the screens read. */
const scopeLine = (u: OpsUser): string => {
  const clients = accountsFor(u).length;
  const reach = opsTabsFor(u).length;
  const book =
    u.assignedAccountIds.length === 0
      ? `All ${int(clients)} clients`
      : `${int(clients)} assigned ${clients === 1 ? 'client' : 'clients'}`;
  return `${book} · ${int(reach)} destinations`;
};

export default function OpsPicker() {
  useEffect(() => {
    document.title = 'Ops · Union';
  }, []);

  return (
    <div className="flex min-h-full items-center justify-center bg-page px-[32px] py-[72px]">
      <div className="w-full max-w-[620px]">
        <div className="mb-[32px] flex items-center gap-[11px]">
          <DbslMark className="h-[42px] w-auto" />
          <span className="font-display text-[23px] font-bold text-strong">Union</span>
        </div>

        <Eyebrow tone="blue">Datamatics Business Solutions · Operations</Eyebrow>
        <h1 className="font-display mt-[12px] text-[40px] font-bold leading-[1.14] text-strong">
          Choose a role to view
        </h1>
        <p className="mb-[32px] mt-[10px] text-[17px] text-secondary">
          Each role sees a different slice of the same work.
        </p>

        <div className="overflow-hidden rounded-[16px] border border-hairline bg-white">
          {opsUsers.map((u, i) => (
            <Link
              key={u.id}
              to={opsPath(u.id, opsTabsFor(u).find((t) => t.built)?.segment ?? '')}
              className={`group flex items-center gap-[16px] px-[26px] py-[22px] transition-colors duration-150 ease-standard hover:bg-row-hover ${
                i > 0 ? 'border-t border-hairline' : ''
              }`}
            >
              <span className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-[#F4F7FB] text-[15px] font-semibold text-secondary">
                {u.initials}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[19px] font-medium text-strong">{u.roleLabel}</span>
                <span className="mt-[3px] block text-[15px] text-muted">
                  {u.name} · {u.detail}
                </span>
                <span className="mt-[5px] block text-[14px] text-secondary">{scopeLine(u)}</span>
              </span>
              <IconArrowRight
                size={20}
                stroke={2}
                className="text-muted transition-transform duration-150 ease-standard group-hover:translate-x-[2px] group-hover:text-accent"
              />
            </Link>
          ))}
        </div>

        <Link
          to="/"
          className="mt-[22px] inline-flex items-center gap-[7px] text-[14px] !text-muted hover:!text-accent"
        >
          <IconArrowLeft size={15} stroke={2} />
          Back
        </Link>
      </div>
    </div>
  );
}

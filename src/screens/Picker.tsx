// Account picker (/) — the entry screen. Makes the multi-account story the first
// thing anyone sees. A viewing-as picker, not a login: no password, no fake auth.
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IconArrowRight } from '@tabler/icons-react';
import { accounts } from '@/data/accounts';
import { int, money } from '@/data/format';
import { DbslMark } from '@/components/BrandLogo';
import { Eyebrow } from '@/components/ui';
import type { Account } from '@/data/types';

/** One derived line that lands the multi-account story before a single click. */
const pickerStat = (a: Account): string => {
  if (a.overviewKind === 'campaigns' && a.leadsSummary) {
    const ls = a.leadsSummary;
    return `${int(ls.billable)} of ${int(ls.target)} leads accepted · ${money(a.invested)} invested`;
  }
  return `${int(a.entitlements.length)} services · ${money(a.invested)} invested`;
};

export default function Picker() {
  useEffect(() => {
    document.title = 'Union · Datamatics Business Solutions';
  }, []);
  return (
    <div className="flex min-h-full items-center justify-center bg-[#f6f8fb] px-[24px] py-[64px]">
      <div className="w-full max-w-[520px]">
        <div className="mb-[26px] flex items-center gap-[9px]">
          <DbslMark className="h-[36px] w-auto" />
          <span className="font-display text-[20px] font-bold text-strong">Union</span>
        </div>

        <Eyebrow tone="blue">Datamatics Business Solutions</Eyebrow>
        <h1 className="font-display mt-[8px] text-[26px] font-bold leading-[1.2] text-strong">
          Choose an account to view
        </h1>
        <p className="mb-[24px] mt-[8px] text-[13.5px] text-secondary">
          Everything each client runs with DBSL, in one place.
        </p>

        <div className="overflow-hidden rounded-card border border-hairline bg-white">
          {accounts.map((a, i) => (
            <Link
              key={a.id}
              to={`/${a.id}`}
              className={`group flex items-center gap-[14px] px-[20px] py-[18px] transition-colors duration-150 ease-standard hover:bg-page ${
                i > 0 ? 'border-t border-hairline' : ''
              }`}
            >
              <span className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-[#F4F7FB] text-[12px] font-semibold text-secondary">
                {a.user.initials}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-medium text-strong">{a.name}</span>
                <span className="mt-[2px] block text-[12px] text-muted">{a.descriptor}</span>
                <span className="mt-[3px] block text-[11.5px] text-secondary">{pickerStat(a)}</span>
              </span>
              <IconArrowRight
                size={17}
                stroke={2}
                className="text-muted transition-transform duration-150 ease-standard group-hover:translate-x-[2px] group-hover:text-accent"
              />
            </Link>
          ))}
        </div>

        <p className="mt-[18px] text-[11.5px] text-muted">
          Internal demo · viewing as any client. No sign-in required.
        </p>
      </div>
    </div>
  );
}

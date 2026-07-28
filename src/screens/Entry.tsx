// Entry (/) — the one fork in the product: are you the client, or are you DBSL?
// Two audiences, one platform. Neither path is a sign-in; both are "viewing as"
// devices, which is the honest framing for a demo with no authentication.
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IconArrowRight, IconBuildingSkyscraper, IconSettings2 } from '@tabler/icons-react';
import { DbslMark } from '@/components/BrandLogo';
import { Eyebrow } from '@/components/ui';
import { accounts } from '@/data/accounts';
import { opsUsers } from '@/data/ops';
import { int } from '@/data/format';

const DOORS = [
  {
    to: '/clients',
    icon: IconBuildingSkyscraper,
    label: 'Clients',
    blurb: 'What a client sees — everything they are running with DBSL, in one place.',
    count: (): string => `${int(accounts.length)} accounts`,
  },
  {
    to: '/ops',
    icon: IconSettings2,
    label: 'Ops',
    blurb: 'What DBSL sees — every client, every campaign, and the work behind them.',
    count: (): string => `${int(opsUsers.length)} roles`,
  },
];

export default function Entry() {
  useEffect(() => {
    document.title = 'Union · Datamatics Business Solutions';
  }, []);

  return (
    <div className="flex min-h-full items-center justify-center bg-page px-[32px] py-[72px]">
      <div className="w-full max-w-[860px]">
        <div className="mb-[32px] flex items-center gap-[11px]">
          <DbslMark className="h-[42px] w-auto" />
          <span className="font-display text-[23px] font-bold text-strong">Union</span>
        </div>

        <Eyebrow tone="blue">Datamatics Business Solutions</Eyebrow>
        <h1 className="font-display mt-[12px] text-[40px] font-bold leading-[1.14] text-strong">
          Who are you signing in as?
        </h1>
        <p className="mb-[32px] mt-[10px] text-[17px] text-secondary">
          One platform, two audiences. Pick a side to walk through.
        </p>

        <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2">
          {DOORS.map((d) => (
            <Link
              key={d.label}
              to={d.to}
              className="group flex flex-col rounded-[18px] border border-hairline bg-white px-[30px] py-[28px] !text-body transition-colors duration-150 ease-standard hover:border-hero-border hover:bg-row-hover"
            >
              <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-hero-fill text-accent">
                <d.icon size={26} stroke={2} />
              </span>
              <span className="font-display mt-[20px] text-[26px] font-bold text-strong">
                {d.label}
              </span>
              <span className="mt-[8px] flex-1 text-[15px] text-secondary">{d.blurb}</span>
              <span className="mt-[22px] flex items-center gap-[8px] text-[14px] text-muted">
                {d.count()}
                <IconArrowRight
                  size={17}
                  stroke={2}
                  className="transition-transform duration-150 ease-standard group-hover:translate-x-[3px] group-hover:text-accent"
                />
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-[22px] text-[14px] text-muted">
          Internal demo · no sign-in required. Either side can be opened directly.
        </p>
      </div>
    </div>
  );
}

// Account settings — reached via the gear, not a tab. Low fidelity by design: it
// exists so the gear is not a dead end (docs/03). Toggles are non-functional.
import { useState } from 'react';
import { useAccount } from '@/components/AppLayout';
import { Cell, Eyebrow, HairGrid } from '@/components/ui';

function Toggle({ label, defaultOn }: { label: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between border-t border-hairline py-[14px]">
      <span className="text-[13px] text-body">{label}</span>
      <button
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={() => setOn((v) => !v)}
        className={`relative h-[22px] w-[38px] rounded-full transition-colors duration-150 ease-standard ${
          on ? 'bg-accent' : 'bg-[#d6deea]'
        }`}
      >
        <span
          className={`absolute top-[2px] h-[18px] w-[18px] rounded-full bg-white transition-[left] duration-150 ease-standard ${
            on ? 'left-[18px]' : 'left-[2px]'
          }`}
        />
      </button>
    </div>
  );
}

export default function AccountSettings() {
  const account = useAccount();

  return (
    <>
      <Eyebrow tone="blue">Account</Eyebrow>
      <h1 className="font-display mt-[8px] text-[25px] font-bold leading-[1.15] text-strong">
        {account.name}
      </h1>
      <p className="mb-[22px] mt-[6px] text-[13px] text-secondary">{account.descriptor}</p>

      <Eyebrow className="mb-[12px]">Company</Eyebrow>
      <HairGrid cols={3} className="mb-[24px]">
        <Cell>
          <Eyebrow>Company name</Eyebrow>
          <p className="mt-[6px] text-[13.5px] text-strong">{account.name}</p>
        </Cell>
        <Cell>
          <Eyebrow>Programme</Eyebrow>
          <p className="mt-[6px] text-[13.5px] text-strong">{account.descriptor}</p>
        </Cell>
        <Cell>
          <Eyebrow>Primary contact</Eyebrow>
          <p className="mt-[6px] text-[13.5px] text-strong">{account.user.name}</p>
        </Cell>
      </HairGrid>

      <Eyebrow className="mb-[2px]">People</Eyebrow>
      <div className="mb-[24px]">
        <div className="flex items-center py-[12px]">
          <Eyebrow className="flex-1">Name</Eyebrow>
          <Eyebrow className="w-[280px]">Email</Eyebrow>
          <Eyebrow className="w-[140px] text-right">Role</Eyebrow>
        </div>
        {account.team.map((m) => (
          <div key={m.email} className="flex items-center border-t border-hairline py-[12px]">
            <span className="min-w-0 flex-1 text-[13px] text-strong">{m.name}</span>
            <span className="w-[280px] text-[12.5px] text-secondary">{m.email}</span>
            <span className="w-[140px] text-right text-[12.5px] text-muted">{m.role}</span>
          </div>
        ))}
      </div>

      <Eyebrow className="mb-[2px]">Notifications</Eyebrow>
      <div className="max-w-[480px]">
        <Toggle label="Invoice reminders" defaultOn />
        <Toggle label="Lead delivery alerts" defaultOn />
        <Toggle label="Document signature requests" defaultOn />
        <Toggle label="Weekly delivery summary" defaultOn={false} />
      </div>
    </>
  );
}

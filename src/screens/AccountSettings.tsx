// Account settings — reached via the gear, not a tab. Low fidelity by design: it
// exists so the gear is not a dead end (docs/03). Toggles are non-functional.
import { useState } from 'react';
import { useAccount } from '@/components/AppLayout';
import { Cell, Eyebrow, HairGrid, Row, Section, TableHead } from '@/components/ui';

function Toggle({ label, defaultOn }: { label: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between border-t border-hairline py-[16px] first:border-t-0">
      <span className="text-[15.5px] text-body">{label}</span>
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
      <section className="mb-[28px] rounded-[18px] border border-hairline bg-white px-[34px] py-[30px]">
        <Eyebrow tone="blue">Account</Eyebrow>
        <h1 className="font-display mt-[12px] text-[40px] font-bold leading-[1.12] text-strong">
          {account.name}
        </h1>
        <p className="mb-0 mt-[10px] text-[16px] text-secondary">{account.descriptor}</p>
      </section>

      <Section title="Company" bare>
        <HairGrid cols={3}>
          <Cell>
            <Eyebrow>Company name</Eyebrow>
            <p className="mt-[8px] text-[17px] text-strong">{account.name}</p>
          </Cell>
          <Cell>
            <Eyebrow>Programme</Eyebrow>
            <p className="mt-[8px] text-[17px] text-strong">{account.descriptor}</p>
          </Cell>
          <Cell>
            <Eyebrow>Primary contact</Eyebrow>
            <p className="mt-[8px] text-[17px] text-strong">{account.user.name}</p>
          </Cell>
        </HairGrid>
      </Section>

      <Section title="People">
        <TableHead>
          <Eyebrow className="flex-1">Name</Eyebrow>
          <Eyebrow className="w-[420px]">Email</Eyebrow>
          <Eyebrow className="w-[220px] text-right">Role</Eyebrow>
        </TableHead>
        {account.team.map((m) => (
          <Row key={m.email}>
            <span className="min-w-0 flex-1 text-[15.5px] text-strong">{m.name}</span>
            <span className="w-[420px] text-[14.5px] text-secondary">{m.email}</span>
            <span className="w-[220px] text-right text-[14.5px] text-muted">{m.role}</span>
          </Row>
        ))}
      </Section>

      <Section title="Notifications" bodyClassName="max-w-[560px]">
        <Toggle label="Invoice reminders" defaultOn />
        <Toggle label="Lead delivery alerts" defaultOn />
        <Toggle label="Document signature requests" defaultOn />
        <Toggle label="Weekly delivery summary" defaultOn={false} />
      </Section>
    </>
  );
}

// Support — tickets expand to their latest message; the client's named DBSL
// contacts sit below. Fictional names only (brand rules).
import { useState } from 'react';
import { IconChevronDown } from '@tabler/icons-react';
import { useAccount } from '@/components/AppLayout';
import StatusPill from '@/components/StatusPill';
import { Cell, Eyebrow, EmptyLine, HairGrid, Hero, Section, TableHead } from '@/components/ui';

const initials = (name: string): string =>
  name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('');

export default function Support() {
  const account = useAccount();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <>
      <Hero hero={account.heroes.support!} />

      <Section title="Requests">
        <TableHead>
          <Eyebrow className="flex-1">Subject</Eyebrow>
          <Eyebrow className="w-[130px]">Opened</Eyebrow>
          <Eyebrow className="w-[180px] text-right">Status</Eyebrow>
        </TableHead>
        {account.tickets.length === 0 ? (
          <EmptyLine>Requests you raise will appear here with their status.</EmptyLine>
        ) : (
          account.tickets.map((t) => {
            const isOpen = expanded === t.id;
            return (
              <div key={t.id} className="-mx-[26px] border-t border-hairline">
                <button
                  onClick={() => setExpanded(isOpen ? null : t.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center px-[26px] py-[16px] text-left transition-colors duration-150 ease-standard hover:bg-row-hover"
                  title="Show the latest reply"
                >
                  <span className="flex min-w-0 flex-1 items-center gap-[7px] text-[15.5px] text-strong">
                    {t.subject}
                    <IconChevronDown
                      size={14}
                      stroke={2}
                      className={`text-muted transition-transform duration-150 ease-standard ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </span>
                  <span className="w-[130px] text-[14.5px] text-muted">{t.opened}</span>
                  <span className="w-[180px] text-right">
                    <StatusPill state={t.status}>{t.statusLabel}</StatusPill>
                  </span>
                </button>
                {isOpen && t.lastMessage && (
                  <div className="mx-[26px] mb-[16px] rounded-card border border-hairline bg-page px-[20px] py-[18px]">
                    <p className="m-0 text-[14.5px] leading-[1.55] text-secondary">{t.lastMessage}</p>
                    {t.status === 'needsYou' && (
                      <button className="mt-[14px] rounded-full bg-cta px-[18px] py-[8px] text-[14px] font-semibold text-white transition-[filter] duration-150 ease-standard hover:brightness-[1.08]">
                        Reply
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </Section>

      <Section title="Your DBSL team" bare>
        <HairGrid cols={2}>
          {account.contacts.map((c) => (
            <Cell key={c.name}>
              <div className="flex items-center gap-[14px]">
                <span className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[#F4F7FB] text-[14px] font-semibold text-secondary">
                  {initials(c.name)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[16px] font-medium text-strong">{c.name}</span>
                  <span className="mt-[2px] block text-[14px] text-muted">{c.role}</span>
                </span>
                <button className="rounded-full border border-hairline bg-white px-[16px] py-[8px] text-[14px] text-accent transition-colors duration-150 ease-standard hover:bg-page">
                  Book a call
                </button>
              </div>
            </Cell>
          ))}
        </HairGrid>
      </Section>
    </>
  );
}

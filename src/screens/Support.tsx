// Support — tickets expand to their latest message; the client's named DBSL
// contacts sit below. Fictional names only (brand rules).
import { useState } from 'react';
import { IconChevronDown } from '@tabler/icons-react';
import { useAccount } from '@/components/AppLayout';
import StatusPill from '@/components/StatusPill';
import { Cell, Eyebrow, EmptyLine, HairGrid, Hero } from '@/components/ui';

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

      <Eyebrow className="mb-[2px]">Requests</Eyebrow>
      <div className="mb-[24px]">
        <div className="flex items-center py-[12px]">
          <Eyebrow className="flex-1">Subject</Eyebrow>
          <Eyebrow className="w-[100px]">Opened</Eyebrow>
          <Eyebrow className="w-[150px] text-right">Status</Eyebrow>
        </div>
        {account.tickets.length === 0 ? (
          <EmptyLine>Requests you raise will appear here with their status.</EmptyLine>
        ) : (
          account.tickets.map((t) => {
            const isOpen = expanded === t.id;
            return (
              <div key={t.id} className="border-t border-hairline">
                <button
                  onClick={() => setExpanded(isOpen ? null : t.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center py-[12px] text-left transition-colors duration-150 ease-standard hover:bg-[#fafbfd]"
                  title="Show the latest reply"
                >
                  <span className="flex min-w-0 flex-1 items-center gap-[6px] text-[13px] text-strong">
                    {t.subject}
                    <IconChevronDown
                      size={12}
                      stroke={2}
                      className={`text-muted transition-transform duration-150 ease-standard ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </span>
                  <span className="w-[100px] text-[12.5px] text-muted">{t.opened}</span>
                  <span className="w-[150px] text-right">
                    <StatusPill state={t.status}>{t.statusLabel}</StatusPill>
                  </span>
                </button>
                {isOpen && t.lastMessage && (
                  <div className="mb-[14px] rounded-card border border-hairline bg-[#fafbfd] px-[16px] py-[12px]">
                    <p className="m-0 text-[12.5px] leading-[1.5] text-secondary">{t.lastMessage}</p>
                    {t.status === 'needsYou' && (
                      <button className="mt-[10px] rounded-full bg-cta px-[14px] py-[6px] text-[11.5px] font-semibold text-white transition-[filter] duration-150 ease-standard hover:brightness-[1.08]">
                        Reply
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <Eyebrow className="mb-[12px]">Your DBSL team</Eyebrow>
      <HairGrid cols={2}>
        {account.contacts.map((c) => (
          <Cell key={c.name}>
            <div className="flex items-center gap-[12px]">
              <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#F4F7FB] text-[11.5px] font-semibold text-secondary">
                {initials(c.name)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium text-strong">{c.name}</span>
                <span className="mt-[1px] block text-[12px] text-muted">{c.role}</span>
              </span>
              <button className="rounded-full border border-hairline bg-white px-[13px] py-[6px] text-[11.5px] text-accent transition-colors duration-150 ease-standard hover:bg-page">
                Book a call
              </button>
            </div>
          </Cell>
        ))}
      </HairGrid>
    </>
  );
}

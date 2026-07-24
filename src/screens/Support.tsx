// Support — the simplest screen. Tickets, then the client's named DBSL contacts.
// Fictional names only (brand rules).
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

  return (
    <>
      <Hero hero={account.heroes.support!} />

      <Eyebrow className="mb-[2px]">Requests</Eyebrow>
      <div className="mb-[30px]">
        <div className="flex items-center py-[13px]">
          <Eyebrow className="flex-1">Subject</Eyebrow>
          <Eyebrow className="w-[100px]">Opened</Eyebrow>
          <Eyebrow className="w-[150px] text-right">Status</Eyebrow>
        </div>
        {account.tickets.length === 0 ? (
          <EmptyLine>Requests you raise will appear here with their status.</EmptyLine>
        ) : (
          account.tickets.map((t) => (
            <div key={t.id} className="flex items-center border-t border-hairline py-[13px]">
              <span className="min-w-0 flex-1 text-[13px] text-strong">{t.subject}</span>
              <span className="w-[100px] text-[12.5px] text-muted">{t.opened}</span>
              <span className="w-[150px] text-right">
                <StatusPill state={t.status}>{t.statusLabel}</StatusPill>
              </span>
            </div>
          ))
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
              <span>
                <span className="block text-[13px] font-medium text-strong">{c.name}</span>
                <span className="mt-[1px] block text-[12px] text-muted">{c.role}</span>
              </span>
            </div>
          </Cell>
        ))}
      </HairGrid>
    </>
  );
}

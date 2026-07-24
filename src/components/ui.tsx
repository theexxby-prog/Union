// Layout primitives — the shapes docs/02 defines. Every screen is built from these,
// so the whole product reads as one surface rather than four stapled dashboards.
import { IconLock } from '@tabler/icons-react';
import StatusPill from '@/components/StatusPill';
import { int, pctValue } from '@/data/format';
import type { Hero as HeroData, MetricTile, Service } from '@/data/types';
import { PHASES } from '@/data/types';

/* ---- Eyebrow ---------------------------------------------------------- */
export function Eyebrow({
  tone = 'muted',
  className = '',
  children,
}: {
  tone?: 'muted' | 'blue';
  className?: string;
  children: React.ReactNode;
}) {
  const color = tone === 'blue' ? 'text-accent' : 'text-muted';
  return (
    <p className={`m-0 text-[11px] font-semibold uppercase tracking-[0.14em] ${color} ${className}`}>
      {children}
    </p>
  );
}

/* ---- Hero card -------------------------------------------------------- */
export function Hero({ hero }: { hero: HeroData }) {
  return (
    <section className="mb-[26px] rounded-hero border border-hero-border bg-hero-fill px-[26px] py-[22px]">
      <Eyebrow tone="blue">{hero.eyebrow}</Eyebrow>
      <h1 className="font-display mt-[10px] text-[29px] font-bold leading-[1.15] text-strong">
        {hero.headline}
      </h1>
      <p className="mb-[17px] mt-[7px] text-[13.5px] text-secondary">{hero.subhead}</p>
      <div className="flex flex-wrap gap-[9px]">
        {hero.actions.map((a) =>
          a.kind === 'cta' ? (
            <button
              key={a.label}
              className="rounded-full bg-cta px-[17px] py-[7px] text-[12px] font-semibold text-white transition-[filter] duration-150 ease-standard hover:brightness-[1.08]"
            >
              {a.label}
            </button>
          ) : (
            <button
              key={a.label}
              className="rounded-full border border-hero-border bg-white px-[14px] py-[7px] text-[12px] text-body transition-colors duration-150 ease-standard hover:bg-hero-fill"
            >
              {a.label}
            </button>
          ),
        )}
      </div>
    </section>
  );
}

/* ---- Service card (shared by Overview + Data) ------------------------- */
export function ServiceCard({ s }: { s: Service }) {
  const pace = pctValue(s.received, s.target);
  return (
    <div className="bg-white px-[18px] py-[16px]">
      <div className="mb-[11px] flex items-center justify-between gap-[8px]">
        <span className="text-[13px] font-medium text-strong">{s.name}</span>
        {s.status ? (
          <StatusPill state={s.status}>{s.statusLabel}</StatusPill>
        ) : (
          <span className="text-[12px] text-muted">{pace}%</span>
        )}
      </div>
      <p className="font-display text-[26px] font-bold leading-[1.1] text-strong">
        {s.headline ?? int(s.received)}
      </p>
      <p className="mb-[13px] mt-[4px] text-[12px] text-muted">
        {s.subline ?? `of ${int(s.target)} ${s.unit}`}
      </p>
      <ProgressRule value={pace} />
      <p className="mt-[11px] text-[12px] text-secondary">{s.qualityLine}</p>
    </div>
  );
}

/* ---- Progress rule ---------------------------------------------------- */
export function ProgressRule({ value }: { value: number }) {
  return (
    <div className="h-[2px] w-full bg-hairline">
      <div className="h-full bg-accent" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

/* ---- Phase strip (workflow stages in the progress-rule slot) ---------- */
export function PhaseStrip({ phase, needsClient }: { phase: number; needsClient: boolean }) {
  return (
    <div className="flex gap-[7px]">
      {PHASES.map((label, i) => {
        const done = i < phase;
        const current = i === phase;
        const currentIsAction = current && needsClient;
        const bar = done
          ? 'bg-accent'
          : currentIsAction
            ? 'bg-cta'
            : current
              ? 'bg-accent'
              : 'bg-hairline';
        const text = done
          ? 'text-strong'
          : currentIsAction
            ? 'text-cta font-semibold'
            : current
              ? 'text-strong'
              : 'text-muted';
        return (
          <div key={label} className="flex-1">
            <div className={`mb-[8px] h-[2px] ${bar}`} />
            <span className={`text-[11.5px] ${text}`}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ---- Hairline card grid ---------------------------------------------- */
export function HairGrid({
  cols,
  className = '',
  children,
}: {
  cols: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`grid gap-px overflow-hidden rounded-card border border-hairline bg-hairline ${className}`}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {children}
    </div>
  );
}

export function Cell({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <div className={`bg-white px-[18px] py-[16px] ${className}`}>{children}</div>;
}

/* ---- Metric strip ----------------------------------------------------- */
export function MetricStrip({ metrics }: { metrics: MetricTile[] }) {
  return (
    <HairGrid cols={metrics.length}>
      {metrics.map((m) => (
        <Cell key={m.label}>
          <Eyebrow>{m.label}</Eyebrow>
          <p
            className={`font-display mt-[7px] text-[22px] font-bold leading-none ${
              m.positive ? 'text-positive' : 'text-strong'
            }`}
          >
            {m.value}
          </p>
        </Cell>
      ))}
    </HairGrid>
  );
}

/* ---- Section header (eyebrow + optional right slot) ------------------- */
export function SectionHead({
  children,
  right,
  className = '',
}: {
  children: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <Eyebrow>{children}</Eyebrow>
      {right}
    </div>
  );
}

/* ---- Locked-services upsell line (one line, never a banner) ---------- */
export function LockedNote({ note }: { note: string }) {
  return (
    <div className="mt-[20px] flex items-center gap-[14px] border-t border-hairline pt-[16px]">
      <IconLock size={15} className="text-muted" stroke={2} />
      <p className="m-0 flex-1 text-[12.5px] text-muted">{note}</p>
      <button className="rounded-full border border-hairline bg-white px-[14px] py-[6px] text-[12px] text-accent transition-colors duration-150 ease-standard hover:bg-hero-fill">
        Learn more
      </button>
    </div>
  );
}

/* ---- Empty-state line (never "No data found") ------------------------ */
export function EmptyLine({ children }: { children: React.ReactNode }) {
  return <p className="py-[14px] text-[12.5px] text-muted">{children}</p>;
}

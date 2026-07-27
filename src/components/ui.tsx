// Layout primitives — the shapes docs/02 defines, at presentation scale.
//
// Two structural rules make the screens read at a distance:
//   1. Content lives on white Section cards over the Soft Grey canvas, so every
//      section is a physical object rather than a label followed by rows.
//   2. Type runs ~25% larger than the original 1200px canvas called for; the
//      docs/02 scale table records the amended values.
import { IconChevronRight, IconLock } from '@tabler/icons-react';
import { Link, useParams } from 'react-router-dom';
import StatusPill from '@/components/StatusPill';
import { int, pctValue } from '@/data/format';
import { path } from '@/lib/nav';
import type { Hero as HeroData, MetricTile, Service } from '@/data/types';
import { PHASES } from '@/data/types';

/* ---- Eyebrow — table column heads and small labels -------------------- */
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
    <p className={`m-0 text-[12px] font-semibold uppercase tracking-[0.12em] ${color} ${className}`}>
      {children}
    </p>
  );
}

/* ---- Section — a titled white card on the grey canvas ----------------- */
export function Section({
  title,
  right,
  bare = false,
  className = '',
  bodyClassName = '',
  children,
}: {
  title?: string;
  right?: React.ReactNode;
  /** Skip the white card when the child already carries its own surface. */
  bare?: boolean;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`mb-[28px] ${className}`}>
      {(title || right) && (
        <div className="mb-[14px] flex flex-wrap items-center justify-between gap-x-[16px] gap-y-[8px]">
          {title ? (
            <h2 className="m-0 text-[13px] font-semibold uppercase tracking-[0.12em] text-strong">{title}</h2>
          ) : (
            <span />
          )}
          {right}
        </div>
      )}
      <div
        className={
          bare ? bodyClassName : `rounded-[16px] border border-hairline bg-white px-[26px] py-[22px] ${bodyClassName}`
        }
      >
        {children}
      </div>
    </section>
  );
}

/* ---- Cols — side-by-side sections at desktop width -------------------- */
export function Cols({
  className = '',
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  // items-start: a short side card sits at its natural height rather than being
  // stretched to match a tall neighbour, which is where the dead white came from.
  return (
    <div className={`grid grid-cols-1 items-start gap-x-[20px] gap-y-[28px] lg:grid-cols-3 ${className}`}>
      {children}
    </div>
  );
}

/* ---- Hero card -------------------------------------------------------- */
/* Actions with a `to` navigate and carry a chevron affix; plain actions render
   as static chips so clickable and non-clickable never look identical. */
export function Hero({ hero }: { hero: HeroData }) {
  const { accountId } = useParams();
  const ctaClass =
    'rounded-full bg-cta px-[22px] py-[10px] text-[14px] font-semibold text-white transition-[filter] duration-150 ease-standard hover:brightness-[1.08]';
  const pillClass =
    'rounded-full border border-hero-border bg-white px-[18px] py-[10px] text-[14px] text-body';

  return (
    <section className="mb-[28px] rounded-[18px] border border-hero-border bg-hero-fill px-[34px] py-[30px]">
      <Eyebrow tone="blue">{hero.eyebrow}</Eyebrow>
      <h1 className="font-display mt-[12px] text-[40px] font-bold leading-[1.12] text-strong">
        {hero.headline}
      </h1>
      <p className="mb-[22px] mt-[10px] max-w-[900px] text-[16px] text-secondary">{hero.subhead}</p>
      <div className="flex flex-wrap items-center gap-[10px]">
        {hero.actions.map((a) => {
          const to = a.to !== undefined && accountId ? path(accountId, a.to) : undefined;
          if (a.kind === 'cta') {
            return to ? (
              <Link key={a.label} to={to} className={`${ctaClass} inline-flex items-center gap-[6px] !text-white`}>
                {a.label}
              </Link>
            ) : (
              <button key={a.label} className={ctaClass}>
                {a.label}
              </button>
            );
          }
          return to ? (
            <Link
              key={a.label}
              to={to}
              className={`${pillClass} inline-flex items-center gap-[6px] !text-body transition-colors duration-150 ease-standard hover:border-accent hover:!text-accent`}
            >
              {a.label}
              <IconChevronRight size={14} stroke={2} className="text-muted" />
            </Link>
          ) : (
            <span key={a.label} className={pillClass}>
              {a.label}
            </span>
          );
        })}
      </div>
    </section>
  );
}

/* ---- Service card (shared by Overview + Data) ------------------------- */
export function ServiceCard({ s, className = '' }: { s: Service; className?: string }) {
  const pace = pctValue(s.received, s.target);
  return (
    <div className={`bg-white px-[24px] py-[22px] ${className}`}>
      <div className="mb-[14px] flex items-center justify-between gap-[10px]">
        <span className="text-[15px] font-medium text-strong">{s.name}</span>
        {s.status ? (
          <StatusPill state={s.status}>{s.statusLabel}</StatusPill>
        ) : (
          <span className="text-[14px] text-muted">{pace}%</span>
        )}
      </div>
      <p className="font-display text-[33px] font-bold leading-[1.05] text-strong">
        {s.headline ?? int(s.received)}
      </p>
      <p className="mb-[16px] mt-[6px] text-[14px] text-muted">
        {s.subline ?? `of ${int(s.target)} ${s.unit}`}
      </p>
      <ProgressRule value={pace} />
      <p className="mt-[14px] text-[14px] text-secondary">{s.qualityLine}</p>
    </div>
  );
}

/* ---- Pace bars (delivery cadence, weekly media, billing history) ------ */
export function PaceBars({
  bars,
  height = 132,
}: {
  bars: { height: number; muted?: boolean; title?: string }[];
  height?: number;
}) {
  return (
    <div className="flex items-end gap-[6px]" style={{ height }}>
      {bars.map((b, i) => (
        <div
          key={i}
          title={b.title}
          className={`flex-1 rounded-t-[3px] ${b.muted ? 'bg-[#dde4ee]' : 'bg-accent'}`}
          style={{ height: `${Math.max(4, Math.min(100, b.height))}%` }}
        />
      ))}
    </div>
  );
}

/* ---- Progress rule ---------------------------------------------------- */
export function ProgressRule({ value }: { value: number }) {
  return (
    <div className="h-[3px] w-full rounded-full bg-hairline">
      <div
        className="h-full rounded-full bg-accent"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

/* ---- Phase strip (workflow stages in the progress-rule slot) ---------- */
export function PhaseStrip({
  phase,
  needsClient,
  labels = PHASES,
}: {
  phase: number;
  needsClient: boolean;
  labels?: readonly string[];
}) {
  return (
    <div className="flex gap-[8px]">
      {labels.map((label, i) => {
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
            <div className={`mb-[10px] h-[3px] rounded-full ${bar}`} />
            <span className={`text-[13.5px] ${text}`}>{label}</span>
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
      className={`grid gap-px overflow-hidden rounded-[16px] border border-hairline bg-hairline ${className}`}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {children}
    </div>
  );
}

export function Cell({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <div className={`bg-white px-[24px] py-[20px] ${className}`}>{children}</div>;
}

/* ---- Metric strip ----------------------------------------------------- */
export function MetricStrip({ metrics }: { metrics: MetricTile[] }) {
  return (
    <HairGrid cols={metrics.length}>
      {metrics.map((m) => (
        <div key={m.label} className="bg-white px-[24px] py-[20px]">
          <Eyebrow>{m.label}</Eyebrow>
          <p
            className={`font-display mt-[10px] text-[34px] font-bold leading-none ${
              m.positive ? 'text-positive' : 'text-strong'
            }`}
          >
            {m.value}
          </p>
        </div>
      ))}
    </HairGrid>
  );
}

/* ---- Data table row helpers ------------------------------------------ */
export function TableHead({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center pb-[14px]">{children}</div>;
}

export function Row({
  className = '',
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={`flex items-center border-t border-hairline py-[16px] ${className}`}>{children}</div>;
}

/* ---- Locked-services upsell line (one line, never a banner) ---------- */
export function LockedNote({ note }: { note: string }) {
  return (
    <div className="mb-[28px] flex flex-wrap items-center gap-[16px] rounded-[16px] border border-hairline bg-white px-[26px] py-[18px]">
      <IconLock size={17} className="text-muted" stroke={2} />
      <p className="m-0 flex-1 text-[14.5px] text-muted">{note}</p>
      <button className="rounded-full border border-hairline bg-white px-[18px] py-[8px] text-[14px] text-accent transition-colors duration-150 ease-standard hover:bg-page">
        Learn more
      </button>
    </div>
  );
}

/* ---- Empty-state line (never "No data found") ------------------------ */
export function EmptyLine({ children }: { children: React.ReactNode }) {
  return <p className="py-[16px] text-[14.5px] text-muted">{children}</p>;
}

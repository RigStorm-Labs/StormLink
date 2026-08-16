import { STATUS_STYLES } from '@/lib/constants';

export function StatusBadge({ value }) {
  const style = STATUS_STYLES[value] || 'bg-slate-400/15 text-slate-300 border-slate-400/25';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize tracking-wide ${style}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {String(value || 'unknown').replace('-', ' ')}
    </span>
  );
}

export function RoleChip({ role }) {
  return (
    <span className="inline-flex items-center rounded-full border border-violet-400/25 bg-violet-400/10 px-2.5 py-0.5 text-[11px] font-medium text-violet-200">
      {role}
    </span>
  );
}

export function CompanyTag({ name }) {
  return (
    <span className="inline-flex max-w-full items-center truncate rounded-full border border-sky-400/25 bg-sky-400/10 px-2.5 py-0.5 text-[11px] font-medium text-sky-200">
      {name}
    </span>
  );
}

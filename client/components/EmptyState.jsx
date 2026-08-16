import { Icon } from './Icons';

export default function EmptyState({ title = 'Nothing here yet', message, action }) {
  return (
    <div className="glass flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/20 to-violet-600/20 text-sky-300">
        <Icon.Sparkle className="h-7 w-7" />
      </span>
      <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
      {message && <p className="mt-1.5 max-w-sm text-sm text-slate-400">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

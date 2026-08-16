'use client';

export function FullScreenLoader({ label = 'Summoning the storm…' }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border-2 border-white/10" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-sky-400 border-r-violet-500" />
        <div className="absolute inset-3 animate-pulse rounded-full bg-gradient-to-br from-sky-500/30 to-violet-600/30 blur-md" />
      </div>
      <p className="font-display text-sm tracking-[0.25em] text-slate-400 uppercase">{label}</p>
    </div>
  );
}

export function InlineLoader() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-sky-400" />
    </div>
  );
}

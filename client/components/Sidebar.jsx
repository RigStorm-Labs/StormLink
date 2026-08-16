'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Icon } from './Icons';
import { ROLE_LABELS } from '@/lib/constants';
import { useAuth } from '@/lib/auth-context';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: Icon.Dashboard },
  { href: '/projects', label: 'Projects', icon: Icon.Folder },
  { href: '/workflows', label: 'Workflows', icon: Icon.Workflow },
  { href: '/products', label: 'Products', icon: Icon.Box },
  { href: '/companies', label: 'Companies', icon: Icon.Building },
  { href: '/admin', label: 'Admin', icon: Icon.Shield },
];

function NavList({ onNavigate }) {
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  return (
    <nav className="mt-8 flex flex-1 flex-col gap-1.5">
      {NAV_ITEMS.map((item) => {
        const active = pathname?.startsWith(item.href);
        if (item.href === '/admin' && !isAdmin) return null;
        const ItemIcon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
              active
                ? 'text-white'
                : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-100'
            }`}
          >
            {active && (
              <motion.span
                layoutId="nav-pill"
                className="absolute inset-0 rounded-xl border border-sky-400/25 bg-gradient-to-r from-sky-500/20 via-blue-600/15 to-violet-600/20 shadow-glow"
                transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              />
            )}
            <ItemIcon className={`relative h-5 w-5 ${active ? 'text-sky-300' : 'text-slate-500 group-hover:text-sky-300'}`} />
            <span className="relative tracking-wide">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function Logo({ compact = false }) {
  return (
    <Link href="/dashboard" className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 via-blue-600 to-violet-600 shadow-glow">
        <Icon.Bolt className="h-6 w-6 text-white" />
      </span>
      {!compact && (
        <span className="font-display text-lg font-bold tracking-[0.12em]">
          <span className="text-gradient">STORMLINK</span>
        </span>
      )}
    </Link>
  );
}

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-storm-950/70 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`glass fixed inset-y-0 left-0 z-50 flex w-64 flex-col rounded-none border-y-0 border-l-0 p-5 transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Logo />
        <NavList onNavigate={onClose} />

        <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.04] p-3.5">
          <p className="text-xs font-medium text-slate-200">{user?.name || '—'}</p>
          <p className="mt-0.5 truncate text-[11px] text-slate-500">{user?.email || ''}</p>
          <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-300">
            <Icon.Shield className="h-3 w-3" />
            {ROLE_LABELS[user?.role] || user?.role}
          </span>
        </div>
      </aside>
    </>
  );
}

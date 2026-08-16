'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon } from './Icons';
import Avatar from './Avatar';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { PAGE_TITLES, STATUS_STYLES } from '@/lib/constants';
import { useToast } from './Toast';

export default function Header({ onMenu }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const toast = useToast();

  const [notifications, setNotifications] = useState([]);
  const [bellOpen, setBellOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const bellRef = useRef(null);
  const menuRef = useRef(null);

  const title = PAGE_TITLES[pathname] || 'StormLink';
  const unread = notifications.filter((n) => !n.read).length;

  const loadNotifications = () =>
    api('/notifications')
      .then((d) => setNotifications(d.items || []))
      .catch(() => {});

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false);
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  async function markAllRead() {
    try {
      await api('/notifications/read-all', { method: 'POST' });
      loadNotifications();
      toast.info('All notifications marked as read');
    } catch {
      toast.error('Could not update notifications');
    }
  }

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-storm-950/55 backdrop-blur-xl">
      {/* Gradient accent bar */}
      <div className="h-[3px] w-full bg-gradient-to-r from-sky-400 via-blue-600 to-violet-600" />

      <div className="flex items-center gap-4 px-5 py-3.5 lg:px-8">
        <button
          className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
          onClick={onMenu}
          aria-label="Open menu"
        >
          <Icon.Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="font-display text-lg font-semibold tracking-wide text-white text-glow">{title}</h1>
          <p className="hidden text-[11px] uppercase tracking-[0.22em] text-slate-500 sm:block">
            RigStorm Command Center
          </p>
        </div>

        <div className="ml-auto flex items-center gap-2.5">
          {/* Notifications */}
          <div className="relative" ref={bellRef}>
            <button
              onClick={() => setBellOpen((v) => !v)}
              className="relative rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-slate-300 transition hover:border-sky-400/30 hover:text-white"
              aria-label="Notifications"
            >
              <Icon.Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-[18px] items-center justify-center rounded-full bg-gradient-to-r from-sky-400 to-violet-500 px-1 text-[10px] font-bold text-white shadow-glow">
                  {unread}
                </span>
              )}
            </button>

            <AnimatePresence>
              {bellOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                  className="glass-strong absolute right-0 mt-3 w-80 overflow-hidden shadow-lift"
                >
                  <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                    <p className="font-display text-sm font-semibold text-white">Notifications</p>
                    {unread > 0 && (
                      <button onClick={markAllRead} className="text-[11px] font-medium text-sky-300 hover:text-sky-200">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 && (
                      <p className="px-4 py-6 text-center text-sm text-slate-500">No notifications yet</p>
                    )}
                    {notifications.map((note) => (
                      <div
                        key={note.id}
                        className={`border-b border-white/[0.05] px-4 py-3 last:border-0 ${
                          note.read ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${
                              STATUS_STYLES[note.type] || STATUS_STYLES.update
                            }`}
                          >
                            {note.type}
                          </span>
                          {!note.read && <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />}
                        </div>
                        <p className="mt-1.5 text-sm font-medium text-slate-100">{note.title}</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{note.message}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] py-1.5 pl-1.5 pr-3 transition hover:border-sky-400/30"
            >
              <Avatar name={user?.name} image={user?.image} size="sm" />
              <span className="hidden text-left sm:block">
                <span className="block text-xs font-semibold text-white">{user?.name}</span>
                <span className="block text-[10px] uppercase tracking-wider text-slate-500">{user?.role}</span>
              </span>
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                  className="glass-strong absolute right-0 mt-3 w-56 overflow-hidden shadow-lift"
                >
                  <div className="border-b border-white/10 px-4 py-3">
                    <p className="text-sm font-semibold text-white">{user?.name}</p>
                    <p className="truncate text-xs text-slate-500">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
                  >
                    <Icon.Logout className="h-5 w-5 text-slate-500" />
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}

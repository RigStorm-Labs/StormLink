'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { signIn, getSession } from 'next-auth/react';
import { Icon } from '@/components/Icons';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/Toast';

const fadeUp = {
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
};

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const { status, adminLogin, demoLogin, googleLogin } = useAuth();

  const [tab, setTab] = useState('google');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(null);

  // Redirect if already signed in
  useEffect(() => {
    if (status === 'authed') router.replace('/dashboard');
  }, [status, router]);

  // Is Google OAuth configured?
  useEffect(() => {
    fetch('/api/auth/config')
      .then((r) => r.json())
      .then((d) => {
        setGoogleEnabled(Boolean(d.googleEnabled));
        if (!d.googleEnabled) setTab('admin');
      })
      .catch(() => {
        setGoogleEnabled(false);
        setTab('admin');
      });
  }, []);

  // Returning from Google OAuth → exchange the profile for a StormLink token
  useEffect(() => {
    if (status !== 'guest') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('google') !== '1') return;
    getSession().then(async (session) => {
      if (!session?.user?.email) return;
      try {
        await googleLogin({
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
        });
        toast.success('Signed in with Google');
        router.replace('/dashboard');
      } catch (err) {
        toast.error(err.message);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function handleGoogle() {
    setBusy(true);
    try {
      await signIn('google', { callbackUrl: '/login?google=1' });
    } catch {
      setBusy(false);
      toast.error('Google sign-in failed to start');
    }
  }

  async function handleAdmin(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const user = await adminLogin(username, password);
      toast.success(`Welcome back, ${user.name}`);
      router.replace('/admin');
    } catch (err) {
      toast.error(err.message || 'Invalid admin credentials');
      setBusy(false);
    }
  }

  async function handleDemo(role) {
    setBusy(true);
    try {
      await demoLogin(role);
      toast.success(`Exploring as ${role}`);
      router.replace('/dashboard');
    } catch (err) {
      toast.error(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 lg:p-8">
      <div className="grid w-full max-w-5xl overflow-hidden lg:grid-cols-[1.05fr_1fr]">
        {/* Brand panel */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="card-shine relative hidden flex-col justify-between border-r border-white/10 bg-gradient-to-br from-sky-500/15 via-storm-800/40 to-violet-600/20 p-10 backdrop-blur-xl lg:flex"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 via-blue-600 to-violet-600 shadow-glow">
              <Icon.Bolt className="h-6 w-6 text-white" />
            </span>
            <span className="font-display text-xl font-bold tracking-[0.14em] text-gradient">STORMLINK</span>
          </div>

          <div>
            <h1 className="font-display text-4xl font-bold leading-tight text-white text-glow">
              One command center
              <br />
              for every <span className="text-gradient">RigStorm</span> venture.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
              Project tracking, workflow organization, product pipelines and company-wide
              communication — unified under a single glass-and-lightning dashboard.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {['Labs', 'SiteMarket', 'LandAura', 'Zeyora', 'AdStorm', 'SkyED', 'Hub'].map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-medium text-slate-300 backdrop-blur"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
            RigStorm Labs · {new Date().getFullYear()}
          </p>
        </motion.div>

        {/* Auth panel */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.12, ease: 'easeOut' }}
          className="glass-strong p-8 sm:p-10"
        >
          <div className="mb-8 lg:hidden">
            <span className="font-display text-lg font-bold tracking-[0.14em] text-gradient">STORMLINK</span>
          </div>

          <h2 className="font-display text-2xl font-bold text-white">Sign in</h2>
          <p className="mt-1.5 text-sm text-slate-400">Choose how you want to enter the storm.</p>

          {/* Tabs */}
          <div className="mt-6 flex rounded-xl border border-white/10 bg-white/[0.04] p-1">
            {[
              { id: 'google', label: 'Google' },
              { id: 'admin', label: 'Admin' },
              { id: 'demo', label: 'Demo' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  tab === t.id
                    ? 'bg-gradient-to-r from-sky-500/25 to-violet-600/25 text-white shadow-glow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="mt-6">
            {tab === 'google' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {googleEnabled === null && <p className="text-sm text-slate-500">Checking configuration…</p>}

                {googleEnabled === true && (
                  <>
                    <button onClick={handleGoogle} disabled={busy} className="btn-ghost w-full !py-3">
                      <Icon.Google className="h-5 w-5" />
                      Continue with Google
                    </button>
                    <p className="text-center text-xs text-slate-500">
                      Secure OAuth handled by NextAuth.js — no password needed.
                    </p>
                  </>
                )}

                {googleEnabled === false && (
                  <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-4 text-sm text-amber-200/90">
                    <p className="font-medium">Google OAuth is not configured yet.</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-amber-200/70">
                      Add <code className="rounded bg-black/30 px-1">GOOGLE_CLIENT_ID</code> and{' '}
                      <code className="rounded bg-black/30 px-1">GOOGLE_CLIENT_SECRET</code> to{' '}
                      <code className="rounded bg-black/30 px-1">client/.env.local</code> to enable it. Meanwhile,
                      use Admin or Demo sign-in below.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {tab === 'admin' && (
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleAdmin}
                className="space-y-4"
              >
                <div>
                  <label className="label" htmlFor="admin-user">
                    Username
                  </label>
                  <input
                    id="admin-user"
                    className="field"
                    placeholder="e.g. RigStorm CEO"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
                <div>
                  <label className="label" htmlFor="admin-pass">
                    Password
                  </label>
                  <input
                    id="admin-pass"
                    type="password"
                    className="field"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>
                <button type="submit" disabled={busy || !username || !password} className="btn-primary w-full">
                  {busy ? 'Verifying…' : 'Enter Admin Panel'}
                </button>
                <p className="text-center text-xs text-slate-500">
                  Admin panel lives at <span className="text-slate-300">/admin</span> — role-gated by JWT.
                </p>
              </motion.form>
            )}

            {tab === 'demo' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                <button onClick={() => handleDemo('member')} disabled={busy} className="btn-primary w-full">
                  <Icon.Users className="h-5 w-5" />
                  Explore as Member
                </button>
                <button onClick={() => handleDemo('viewer')} disabled={busy} className="btn-ghost w-full">
                  Explore as Viewer
                </button>
                <p className="pt-1 text-center text-xs leading-relaxed text-slate-500">
                  Members can create and edit records, viewers get read-only access. Deletions are
                  reserved for admins.
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

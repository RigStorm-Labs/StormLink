'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import StatCard from '@/components/StatCard';
import ProgressBar from '@/components/ProgressBar';
import Avatar from '@/components/Avatar';
import { StatusBadge } from '@/components/Badges';
import { InlineLoader } from '@/components/Loader';
import EmptyState from '@/components/EmptyState';
import { Icon } from '@/components/Icons';
import { WORKFLOW_STAGES } from '@/lib/constants';

const listVariants = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: 'easeOut' },
  }),
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const bannerRef = useRef(null);

  useEffect(() => {
    Promise.all([
      api('/stats'),
      api('/projects'),
      api('/goals'),
      api('/members'),
      api('/workflows'),
    ])
      .then(([stats, projects, goals, members, workflows]) =>
        setData({
          stats,
          projects: projects.items || [],
          goals: goals.items || [],
          members: members.items || [],
          workflows: workflows.items || [],
        })
      )
      .catch(() => setData({ stats: null, projects: [], goals: [], members: [], workflows: [] }));
  }, []);

  // GSAP banner entrance
  useEffect(() => {
    if (!bannerRef.current) return;
    gsap.fromTo(
      bannerRef.current,
      { opacity: 0, y: 26, scale: 0.985 },
      { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'power3.out' }
    );
  }, []);

  if (!data) return <InlineLoader />;
  const { stats, projects, goals, members, workflows } = data;

  const activeProjects = projects
    .filter((p) => ['active', 'review'].includes(p.status))
    .sort((a, b) => (b.progress || 0) - (a.progress || 0))
    .slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Hero banner */}
      <div ref={bannerRef} className="glass card-shine relative overflow-hidden p-7 lg:p-9">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-600/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl" />
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-sky-300">
          {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold text-white text-glow lg:text-4xl">
          Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0]}</span>
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
          Every RigStorm venture at a glance — track momentum across projects, goals and pipelines,
          and keep the whole storm moving in one direction.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Projects" value={stats?.counts?.projects} icon={Icon.Folder} hint={`${stats?.counts?.activeProjects || 0} currently active`} delay={0} />
        <StatCard label="Workflows" value={stats?.counts?.workflows} icon={Icon.Workflow} hint={`${stats?.workflowsByStage?.['in-progress'] || 0} in motion`} delay={0.08} />
        <StatCard label="Products" value={stats?.counts?.products} icon={Icon.Box} hint={`${stats?.averageProgress?.products || 0}% average progress`} delay={0.16} />
        <StatCard label="Companies" value={stats?.counts?.companies} icon={Icon.Building} hint={`${stats?.counts?.members || 0} team members`} delay={0.24} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        {/* Active projects */}
        <motion.section variants={listVariants} initial="hidden" animate="show" className="glass p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-white">Hot Projects</h3>
            <Link href="/projects" className="flex items-center gap-1 text-xs font-medium text-sky-300 hover:text-sky-200">
              View all <Icon.ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {activeProjects.length === 0 && (
            <EmptyState title="No active projects" message="Create your first project to light up the dashboard." />
          )}
          <div className="space-y-5">
            {activeProjects.map((project, i) => (
              <motion.div key={project.id} variants={listVariants} custom={i} initial="hidden" animate="show">
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <p className="truncate text-sm font-semibold text-white">{project.name}</p>
                    <StatusBadge value={project.status} />
                  </div>
                  <span className="shrink-0 font-display text-sm font-bold text-sky-300">{project.progress || 0}%</span>
                </div>
                <ProgressBar value={project.progress} />
                <p className="mt-1.5 text-xs text-slate-500">
                  {project.company} · {project.owner} · due {project.dueDate || '—'}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Goals */}
        <motion.section variants={listVariants} initial="hidden" animate="show" custom={1} className="glass p-6">
          <div className="mb-5 flex items-center gap-2">
            <Icon.Target className="h-5 w-5 text-violet-300" />
            <h3 className="font-display text-lg font-semibold text-white">Company Goals</h3>
          </div>
          <div className="space-y-4">
            {goals.slice(0, 5).map((goal) => (
              <div key={goal.id} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-slate-100">{goal.title}</p>
                  <StatusBadge value={goal.status} />
                </div>
                <div className="mt-2.5 flex items-center gap-3">
                  <div className="flex-1">
                    <ProgressBar value={goal.progress} compact />
                  </div>
                  <span className="text-xs font-semibold text-slate-400">{goal.progress || 0}%</span>
                </div>
              </div>
            ))}
            {goals.length === 0 && <p className="py-6 text-center text-sm text-slate-500">No goals yet.</p>}
          </div>
        </motion.section>
      </div>

      {/* Pipeline snapshot */}
      <motion.section variants={listVariants} initial="hidden" animate="show" custom={2} className="glass p-6">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-white">Workflow Pipeline</h3>
          <Link href="/workflows" className="flex items-center gap-1 text-xs font-medium text-sky-300 hover:text-sky-200">
            Open board <Icon.ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {WORKFLOW_STAGES.map((stage) => {
            const items = workflows.filter((w) => w.stage === stage.id);
            return (
              <div key={stage.id} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{stage.label}</p>
                <p className="mt-1 font-display text-3xl font-bold text-white">{items.length}</p>
                <div className="mt-3 space-y-1.5">
                  {items.slice(0, 2).map((w) => (
                    <p key={w.id} className="truncate text-xs text-slate-400">
                      • {w.name}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* Team */}
      <motion.section variants={listVariants} initial="hidden" animate="show" custom={3}>
        <div className="mb-4 flex items-center gap-2">
          <Icon.Users className="h-5 w-5 text-sky-300" />
          <h3 className="font-display text-lg font-semibold text-white">RigStorm Team</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {members.map((member, i) => (
            <motion.div
              key={member.id}
              variants={listVariants}
              custom={i}
              initial="hidden"
              animate="show"
              whileHover={{ y: -5 }}
              className="glass glass-hover p-4 text-center"
            >
              <div className="flex justify-center">
                <Avatar name={member.name} size="lg" />
              </div>
              <p className="mt-3 text-sm font-semibold text-white">{member.name}</p>
              <p className="mt-0.5 text-xs font-medium text-sky-300">{member.role}</p>
              <p className="mt-1 text-[11px] text-slate-500">{member.company}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}

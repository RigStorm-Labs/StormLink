'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/Toast';
import PageHeader from '@/components/PageHeader';
import ProgressBar from '@/components/ProgressBar';
import Modal, { ConfirmDialog } from '@/components/Modal';
import { StatusBadge, CompanyTag } from '@/components/Badges';
import { InlineLoader } from '@/components/Loader';
import EmptyState from '@/components/EmptyState';
import { Icon } from '@/components/Icons';
import { PROJECT_STATUSES, PRIORITIES } from '@/lib/constants';

const EMPTY_FORM = {
  name: '',
  description: '',
  company: '',
  status: 'planning',
  priority: 'medium',
  owner: '',
  dueDate: '',
  progress: 0,
};

export default function ProjectsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const canEdit = ['admin', 'member'].includes(user?.role);

  const [projects, setProjects] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [filter, setFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    api('/projects')
      .then((d) => setProjects(d.items || []))
      .catch((err) => toast.error(err.message));
    api('/companies')
      .then((d) => setCompanies(d.items || []))
      .catch(() => {});
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(project) {
    setEditing(project);
    setForm({
      name: project.name || '',
      description: project.description || '',
      company: project.company || '',
      status: project.status || 'planning',
      priority: project.priority || 'medium',
      owner: project.owner || '',
      dueDate: project.dueDate || '',
      progress: project.progress ?? 0,
    });
    setModalOpen(true);
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api(`/projects/${editing.id}`, { method: 'PUT', body: form });
        toast.success('Project updated');
      } else {
        await api('/projects', { method: 'POST', body: form });
        toast.success('Project created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await api(`/projects/${deleting.id}`, { method: 'DELETE' });
      toast.success(`Deleted “${deleting.name}”`);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  if (!projects) return <InlineLoader />;

  const visible = filter === 'all' ? projects : projects.filter((p) => p.status === filter);

  return (
    <div>
      <PageHeader
        title="Projects"
        subtitle="Add, manage and track every RigStorm initiative from spark to launch."
      >
        {canEdit && (
          <button className="btn-primary" onClick={openCreate}>
            <Icon.Plus className="h-4 w-4" /> New Project
          </button>
        )}
      </PageHeader>

      {/* Status filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {['all', ...PROJECT_STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium capitalize transition ${
              filter === s
                ? 'border-sky-400/40 bg-sky-400/15 text-sky-200 shadow-glow'
                : 'border-white/10 bg-white/[0.04] text-slate-400 hover:text-slate-200'
            }`}
          >
            {s.replace('-', ' ')}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title="No projects found"
          message={canEdit ? 'Create a new project to get started.' : 'Nothing matches this filter yet.'}
          action={canEdit ? (
            <button className="btn-primary" onClick={openCreate}>
              <Icon.Plus className="h-4 w-4" /> New Project
            </button>
          ) : undefined}
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((project, i) => (
            <motion.article
              key={project.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05, ease: 'easeOut' }}
              whileHover={{ y: -6 }}
              className="glass glass-hover flex flex-col p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate font-display text-base font-semibold text-white">{project.name}</h3>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <StatusBadge value={project.status} />
                    <StatusBadge value={project.priority} />
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  {canEdit && (
                    <button
                      onClick={() => openEdit(project)}
                      className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/10 hover:text-sky-300"
                      aria-label="Edit project"
                    >
                      <Icon.Edit className="h-4 w-4" />
                    </button>
                  )}
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => setDeleting(project)}
                      className="rounded-lg p-1.5 text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-300"
                      aria-label="Delete project"
                    >
                      <Icon.Trash className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-400">{project.description}</p>

              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Progress</span>
                  <span className="font-semibold text-sky-300">{project.progress || 0}%</span>
                </div>
                <ProgressBar value={project.progress} compact />
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3.5 text-xs text-slate-500">
                <CompanyTag name={project.company || '—'} />
                <span>
                  {project.owner} · due {project.dueDate || '—'}
                </span>
              </div>
            </motion.article>
          ))}
        </div>
      )}

      {/* Create / edit modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Project' : 'New Project'}
        subtitle="Projects are visible to everyone across the RigStorm network."
      >
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="label">Name *</label>
            <input
              className="field"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              maxLength={120}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Company</label>
              <select className="field" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}>
                <option value="">Select company…</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Owner</label>
              <input className="field" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} maxLength={80} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Status</label>
              <select className="field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {PROJECT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="field" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Due date</label>
              <input type="date" className="field" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>
            <div>
              <label className="label">Progress — {form.progress}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={form.progress}
                onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })}
                className="mt-3 w-full accent-sky-400"
              />
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="field min-h-[90px] resize-y"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              maxLength={600}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving || !form.name.trim()}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Create project'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Delete project?"
        message={`“${deleting?.name}” will be permanently removed for every RigStorm company.`}
      />
    </div>
  );
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/Toast';
import PageHeader from '@/components/PageHeader';
import Modal, { ConfirmDialog } from '@/components/Modal';
import { StatusBadge, RoleChip, CompanyTag } from '@/components/Badges';
import { InlineLoader } from '@/components/Loader';
import { Icon } from '@/components/Icons';
import { WORKFLOW_STAGES, PRIORITIES, TEAM_ROLES } from '@/lib/constants';

const EMPTY_FORM = {
  name: '',
  description: '',
  stage: 'backlog',
  company: '',
  owner: '',
  roles: [],
  priority: 'medium',
};

export default function WorkflowsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const canEdit = ['admin', 'member'].includes(user?.role);

  const [workflows, setWorkflows] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    api('/workflows')
      .then((d) => setWorkflows(d.items || []))
      .catch((err) => toast.error(err.message));
    api('/companies')
      .then((d) => setCompanies(d.items || []))
      .catch(() => {});
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate(stage = 'backlog') {
    setEditing(null);
    setForm({ ...EMPTY_FORM, stage });
    setModalOpen(true);
  }

  function openEdit(workflow) {
    setEditing(workflow);
    setForm({
      name: workflow.name || '',
      description: workflow.description || '',
      stage: workflow.stage || 'backlog',
      company: workflow.company || '',
      owner: workflow.owner || '',
      roles: workflow.roles || [],
      priority: workflow.priority || 'medium',
    });
    setModalOpen(true);
  }

  function toggleRole(role) {
    setForm((f) => ({
      ...f,
      roles: f.roles.includes(role) ? f.roles.filter((r) => r !== role) : [...f.roles, role],
    }));
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api(`/workflows/${editing.id}`, { method: 'PUT', body: form });
        toast.success('Workflow updated');
      } else {
        await api('/workflows', { method: 'POST', body: form });
        toast.success('Workflow created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function move(workflow, direction) {
    const index = WORKFLOW_STAGES.findIndex((s) => s.id === workflow.stage);
    const next = WORKFLOW_STAGES[index + direction];
    if (!next) return;
    try {
      await api(`/workflows/${workflow.id}`, { method: 'PATCH', body: { stage: next.id } });
      setWorkflows((list) => list.map((w) => (w.id === workflow.id ? { ...w, stage: next.id } : w)));
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await api(`/workflows/${deleting.id}`, { method: 'DELETE' });
      toast.success(`Deleted “${deleting.name}”`);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  if (!workflows) return <InlineLoader />;

  return (
    <div>
      <PageHeader
        title="Workflows"
        subtitle="Organize product pipelines and assign team roles across the storm."
      >
        {canEdit && (
          <button className="btn-primary" onClick={() => openCreate()}>
            <Icon.Plus className="h-4 w-4" /> New Workflow
          </button>
        )}
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {WORKFLOW_STAGES.map((stage, stageIndex) => {
          const cards = workflows.filter((w) => w.stage === stage.id);
          return (
            <motion.section
              key={stage.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: stageIndex * 0.07, ease: 'easeOut' }}
              className="glass flex min-h-[300px] flex-col p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wider text-slate-300">
                  <span className={`h-2 w-2 rounded-full ${stage.id === 'done' ? 'bg-emerald-400' : stage.id === 'in-progress' ? 'bg-sky-400' : stage.id === 'review' ? 'bg-amber-400' : 'bg-slate-500'}`} />
                  {stage.label}
                </h3>
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-xs font-semibold text-slate-400">
                  {cards.length}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-3">
                {cards.map((workflow) => (
                  <motion.div
                    key={workflow.id}
                    layout
                    whileHover={{ y: -3 }}
                    className="group rounded-xl border border-white/[0.08] bg-white/[0.04] p-3.5 transition hover:border-sky-400/25"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold leading-snug text-white">{workflow.name}</p>
                      <div className="flex shrink-0 gap-0.5 opacity-0 transition group-hover:opacity-100">
                        {canEdit && (
                          <>
                            <button
                              onClick={() => move(workflow, -1)}
                              disabled={workflow.stage === 'backlog'}
                              className="rounded p-1 text-slate-500 hover:bg-white/10 hover:text-white disabled:opacity-25"
                              aria-label="Move back"
                            >
                              <Icon.ChevronLeft className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => move(workflow, 1)}
                              disabled={workflow.stage === 'done'}
                              className="rounded p-1 text-slate-500 hover:bg-white/10 hover:text-white disabled:opacity-25"
                              aria-label="Move forward"
                            >
                              <Icon.ChevronRight className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => openEdit(workflow)}
                              className="rounded p-1 text-slate-500 hover:bg-white/10 hover:text-sky-300"
                              aria-label="Edit workflow"
                            >
                              <Icon.Edit className="h-3.5 w-3.5" />
                            </button>
                            {user?.role === 'admin' && (
                              <button
                                onClick={() => setDeleting(workflow)}
                                className="rounded p-1 text-slate-500 hover:bg-rose-500/10 hover:text-rose-300"
                                aria-label="Delete workflow"
                              >
                                <Icon.Trash className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    {workflow.description && (
                      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-400">{workflow.description}</p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <StatusBadge value={workflow.priority} />
                      {(workflow.roles || []).map((role) => (
                        <RoleChip key={role} role={role} />
                      ))}
                    </div>
                    <div className="mt-2.5 flex items-center justify-between border-t border-white/[0.05] pt-2 text-[11px] text-slate-500">
                      <span className="truncate">{workflow.company}</span>
                      <span className="shrink-0">{workflow.owner}</span>
                    </div>
                  </motion.div>
                ))}

                {canEdit && (
                  <button
                    onClick={() => openCreate(stage.id)}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/10 py-2.5 text-xs font-medium text-slate-500 transition hover:border-sky-400/30 hover:text-sky-300"
                  >
                    <Icon.Plus className="h-3.5 w-3.5" /> Add here
                  </button>
                )}
              </div>
            </motion.section>
          );
        })}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Workflow' : 'New Workflow'}
        subtitle="Assign a pipeline stage and the team roles responsible for delivery."
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
              <label className="label">Stage</label>
              <select className="field" value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })}>
                {WORKFLOW_STAGES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
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
          <div>
            <label className="label">Team roles</label>
            <div className="flex flex-wrap gap-2">
              {TEAM_ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleRole(role)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    form.roles.includes(role)
                      ? 'border-violet-400/50 bg-violet-400/20 text-violet-200'
                      : 'border-white/10 bg-white/[0.04] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="field min-h-[80px] resize-y"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              maxLength={400}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving || !form.name.trim()}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Create workflow'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Delete workflow?"
        message={`“${deleting?.name}” will be removed from the pipeline.`}
      />
    </div>
  );
}

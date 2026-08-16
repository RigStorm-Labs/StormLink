'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/Toast';
import Modal, { ConfirmDialog } from '@/components/Modal';
import { StatusBadge } from '@/components/Badges';
import { InlineLoader } from '@/components/Loader';
import { Icon } from '@/components/Icons';
import {
  PROJECT_STATUSES,
  PRODUCT_STATUSES,
  GOAL_STATUSES,
  PRIORITIES,
  TEAM_ROLES,
  ROLE_LABELS,
  WORKFLOW_STAGES,
} from '@/lib/constants';

const TABS = [
  { id: 'projects', label: 'Projects', endpoint: '/projects', required: ['name'] },
  { id: 'workflows', label: 'Workflows', endpoint: '/workflows', required: ['name'] },
  { id: 'products', label: 'Products', endpoint: '/products', required: ['name'] },
  { id: 'companies', label: 'Companies', endpoint: '/companies', required: ['name'] },
  { id: 'goals', label: 'Goals', endpoint: '/goals', required: ['title'] },
  { id: 'members', label: 'Members', endpoint: '/members', required: ['name'] },
  { id: 'notifications', label: 'Notifications', endpoint: '/notifications', required: ['title'] },
  { id: 'users', label: 'Users', endpoint: '/users', required: ['name'] },
];

/** Field schemas drive the generic table + form for every collection. */
function useFieldConfigs(companyNames) {
  return useMemo(
    () => ({
      projects: [
        { key: 'name', label: 'Name', type: 'text', table: true },
        { key: 'company', label: 'Company', type: 'select', options: companyNames, table: true },
        { key: 'status', label: 'Status', type: 'select', options: PROJECT_STATUSES, table: true, badge: true },
        { key: 'priority', label: 'Priority', type: 'select', options: PRIORITIES, badge: true },
        { key: 'owner', label: 'Owner', type: 'text', table: true },
        { key: 'dueDate', label: 'Due date', type: 'date' },
        { key: 'progress', label: 'Progress', type: 'number', table: true, suffix: '%' },
        { key: 'description', label: 'Description', type: 'textarea' },
      ],
      workflows: [
        { key: 'name', label: 'Name', type: 'text', table: true },
        { key: 'stage', label: 'Stage', type: 'select', options: WORKFLOW_STAGES.map((s) => s.id), table: true, badge: true },
        { key: 'company', label: 'Company', type: 'select', options: companyNames, table: true },
        { key: 'priority', label: 'Priority', type: 'select', options: PRIORITIES, badge: true },
        { key: 'owner', label: 'Owner', type: 'text', table: true },
        { key: 'roles', label: 'Roles', type: 'multiselect', options: TEAM_ROLES },
        { key: 'description', label: 'Description', type: 'textarea' },
      ],
      products: [
        { key: 'name', label: 'Name', type: 'text', table: true },
        { key: 'company', label: 'Company', type: 'select', options: companyNames, table: true },
        { key: 'status', label: 'Status', type: 'select', options: PRODUCT_STATUSES, table: true, badge: true },
        { key: 'version', label: 'Version', type: 'text', table: true },
        { key: 'owner', label: 'Owner', type: 'text', table: true },
        { key: 'progress', label: 'Progress', type: 'number', suffix: '%' },
        { key: 'description', label: 'Description', type: 'textarea' },
      ],
      companies: [
        { key: 'name', label: 'Name', type: 'text', table: true },
        { key: 'url', label: 'URL', type: 'text', table: true },
        { key: 'accent', label: 'Accent', type: 'select', options: ['electric', 'cyan', 'emerald', 'fuchsia', 'amber', 'sky', 'violet'] },
        { key: 'goals', label: 'Goals', type: 'list', placeholder: 'One goal per line' },
        { key: 'description', label: 'Description', type: 'textarea', table: true },
      ],
      goals: [
        { key: 'title', label: 'Title', type: 'text', table: true },
        { key: 'company', label: 'Company', type: 'select', options: companyNames, table: true },
        { key: 'status', label: 'Status', type: 'select', options: GOAL_STATUSES, table: true, badge: true },
        { key: 'progress', label: 'Progress', type: 'number', table: true, suffix: '%' },
        { key: 'dueDate', label: 'Due date', type: 'date' },
        { key: 'description', label: 'Description', type: 'textarea' },
      ],
      members: [
        { key: 'name', label: 'Name', type: 'text', table: true },
        { key: 'role', label: 'Role', type: 'text', table: true },
        { key: 'company', label: 'Company', type: 'select', options: companyNames, table: true },
        { key: 'focus', label: 'Focus', type: 'text', table: true },
      ],
      notifications: [
        { key: 'title', label: 'Title', type: 'text', table: true },
        { key: 'type', label: 'Type', type: 'select', options: ['announcement', 'milestone', 'update', 'team'], table: true, badge: true },
        { key: 'read', label: 'Read', type: 'boolean', table: true },
        { key: 'message', label: 'Message', type: 'textarea', table: true },
      ],
      users: [
        { key: 'name', label: 'Name', type: 'text', table: true },
        { key: 'email', label: 'Email', type: 'text', table: true },
        { key: 'role', label: 'Role', type: 'select', options: ['admin', 'member', 'viewer'], table: true, badge: true },
        { key: 'provider', label: 'Provider', type: 'text', table: true },
      ],
    }),
    [companyNames]
  );
}

function FieldInput({ field, value, onChange }) {
  switch (field.type) {
    case 'textarea':
      return <textarea className="field min-h-[90px] resize-y" value={value || ''} onChange={(e) => onChange(e.target.value)} maxLength={1000} />;
    case 'select':
      return (
        <select className="field" value={value || ''} onChange={(e) => onChange(e.target.value)}>
          <option value="">—</option>
          {(field.options || []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    case 'multiselect':
      return (
        <div className="flex flex-wrap gap-2">
          {(field.options || []).map((opt) => {
            const selected = (value || []).includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onChange(selected ? value.filter((v) => v !== opt) : [...(value || []), opt])}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  selected
                    ? 'border-violet-400/50 bg-violet-400/20 text-violet-200'
                    : 'border-white/10 bg-white/[0.04] text-slate-400 hover:text-slate-200'
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      );
    case 'list':
      return (
        <textarea
          className="field min-h-[90px] resize-y"
          placeholder={field.placeholder}
          value={(value || []).join('\n')}
          onChange={(e) => onChange(e.target.value.split('\n').map((s) => s.trim()).filter(Boolean))}
          maxLength={1000}
        />
      );
    case 'number':
      return (
        <input
          type="number"
          min="0"
          max="100"
          className="field"
          value={value ?? 0}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      );
    case 'date':
      return <input type="date" className="field" value={value || ''} onChange={(e) => onChange(e.target.value)} />;
    case 'boolean':
      return (
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5">
          <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-sky-400" />
          <span className="text-sm text-slate-300">{value ? 'Yes' : 'No'}</span>
        </label>
      );
    default:
      return <input className="field" value={value || ''} onChange={(e) => onChange(e.target.value)} maxLength={200} />;
  }
}

export default function AdminPage() {
  const { user, isAdmin } = useAuth();
  const toast = useToast();

  const [tab, setTab] = useState('projects');
  const [collections, setCollections] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);

  const activeTab = TABS.find((t) => t.id === tab);

  const loadAll = useCallback(async () => {
    try {
      const entries = await Promise.all(TABS.map((t) => api(t.endpoint).then((d) => [t.id, d.items || []])));
      setCollections(Object.fromEntries(entries));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoaded(true);
    }
  }, [toast]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const companyNames = useMemo(
    () => (collections.companies || []).map((c) => c.name).sort(),
    [collections]
  );
  const fieldConfigs = useFieldConfigs(companyNames);

  const items = collections[tab] || [];
  const fields = fieldConfigs[tab] || [];
  const tableFields = fields.filter((f) => f.table);

  const visibleItems = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter((item) =>
      fields.some((f) => String(item[f.key] ?? '').toLowerCase().includes(q))
    );
  }, [items, fields, query]);

  function openCreate() {
    setEditing(null);
    setForm(Object.fromEntries(fields.map((f) => [f.key, f.type === 'multiselect' || f.type === 'list' ? [] : f.type === 'boolean' ? false : f.type === 'number' ? 0 : ''])));
    setModalOpen(true);
  }

  function openEdit(item) {
    setEditing(item);
    setForm({ ...item });
    setModalOpen(true);
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const body = Object.fromEntries(fields.map((f) => [f.key, form[f.key]]));
      if (editing) {
        await api(`${activeTab.endpoint}/${editing.id}`, { method: 'PUT', body });
        toast.success(`${activeTab.label.replace(/s$/, '')} updated`);
      } else {
        await api(activeTab.endpoint, { method: 'POST', body });
        toast.success(`${activeTab.label.replace(/s$/, '')} created`);
      }
      setModalOpen(false);
      loadAll();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await api(`${activeTab.endpoint}/${deleting.id}`, { method: 'DELETE' });
      toast.success('Record deleted');
      loadAll();
    } catch (err) {
      toast.error(err.message);
    }
  }

  /* ── 403: not an admin ─────────────────────────────────────────────────── */
  if (!isAdmin) {
    return (
      <div className="glass-strong mx-auto mt-16 max-w-md p-10 text-center">
        <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-300">
          <Icon.Shield className="h-8 w-8" />
        </span>
        <h2 className="font-display text-2xl font-bold text-white">Access restricted</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          The Admin CMS is reserved for the <span className="text-slate-200">Admin</span> role. You are signed in as{' '}
          <span className="text-slate-200 capitalize">{ROLE_LABELS[user?.role] || user?.role}</span>. Sign in with the
          admin credentials to manage all modules.
        </p>
      </div>
    );
  }

  if (!loaded) return <InlineLoader />;

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold tracking-wide text-white text-glow lg:text-3xl">Admin CMS</h2>
        <p className="mt-1.5 text-sm text-slate-400">
          Secure content management for every StormLink module — signed in as{' '}
          <span className="font-medium text-sky-300">{user?.name}</span>.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTab(t.id);
              setQuery('');
            }}
            className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
              tab === t.id
                ? 'border-sky-400/40 bg-gradient-to-r from-sky-500/20 to-violet-600/20 text-white shadow-glow'
                : 'border-white/10 bg-white/[0.04] text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.label}
            <span className="ml-2 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold">
              {(collections[t.id] || []).length}
            </span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Icon.Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            className="field pl-9"
            placeholder={`Search ${tab}…`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <Icon.Plus className="h-4 w-4" /> Add {activeTab.label.replace(/s$/, '')}
        </button>
      </div>

      {/* Table */}
      <div className="glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03]">
                {tableFields.map((f) => (
                  <th key={f.key} className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    {f.label}
                  </th>
                ))}
                <th className="px-4 py-3.5 text-right text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {visibleItems.map((item) => (
                  <motion.tr
                    key={item.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-b border-white/[0.05] transition hover:bg-white/[0.03] last:border-0"
                  >
                    {tableFields.map((f) => (
                      <td key={f.key} className="max-w-[260px] truncate px-4 py-3 text-slate-300">
                        {f.badge ? (
                          <StatusBadge value={item[f.key]} />
                        ) : f.type === 'boolean' ? (
                          item[f.key] ? 'Yes' : 'No'
                        ) : (
                          <>
                            {item[f.key] === undefined || item[f.key] === '' ? '—' : String(item[f.key])}
                            {f.suffix && item[f.key] !== undefined && item[f.key] !== '' ? f.suffix : ''}
                          </>
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(item)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-white/10 hover:text-sky-300"
                          aria-label="Edit"
                        >
                          <Icon.Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleting(item)}
                          disabled={tab === 'users' && item.id === user?.id}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-30"
                          aria-label="Delete"
                        >
                          <Icon.Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {visibleItems.length === 0 && (
                <tr>
                  <td colSpan={tableFields.length + 1} className="px-4 py-12 text-center text-slate-500">
                    No records{query ? ' match your search' : ''}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / edit modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Edit ${activeTab.label.replace(/s$/, '')}` : `New ${activeTab.label.replace(/s$/, '')}`}
        subtitle={`Collection: ${tab} — changes apply immediately across the dashboard.`}
        wide
      >
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.key} className={field.type === 'textarea' || field.type === 'multiselect' || field.type === 'list' ? 'sm:col-span-2' : ''}>
              <label className="label">
                {field.label}
                {activeTab.required.includes(field.key) && <span className="ml-1 text-sky-300">*</span>}
              </label>
              <FieldInput field={field} value={form[field.key]} onChange={(v) => setForm({ ...form, [field.key]: v })} />
            </div>
          ))}
          <div className="flex justify-end gap-3 pt-2 sm:col-span-2">
            <button type="button" className="btn-ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={saving || activeTab.required.some((r) => !String(form[r] ?? '').trim())}
            >
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Delete record?"
        message={`This ${activeTab.label.replace(/s$/, '').toLowerCase()} record will be permanently removed.`}
      />
    </div>
  );
}

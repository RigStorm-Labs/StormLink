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
import { PRODUCT_STATUSES } from '@/lib/constants';

const EMPTY_FORM = {
  name: '',
  description: '',
  company: '',
  status: 'concept',
  version: 'v0.1',
  owner: '',
  progress: 0,
};

export default function ProductsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const canEdit = ['admin', 'member'].includes(user?.role);

  const [products, setProducts] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    api('/products')
      .then((d) => setProducts(d.items || []))
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

  function openEdit(product) {
    setEditing(product);
    setForm({
      name: product.name || '',
      description: product.description || '',
      company: product.company || '',
      status: product.status || 'concept',
      version: product.version || 'v0.1',
      owner: product.owner || '',
      progress: product.progress ?? 0,
    });
    setModalOpen(true);
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api(`/products/${editing.id}`, { method: 'PUT', body: form });
        toast.success('Product updated');
      } else {
        await api('/products', { method: 'POST', body: form });
        toast.success('Product created');
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
      await api(`/products/${deleting.id}`, { method: 'DELETE' });
      toast.success(`Deleted “${deleting.name}”`);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  if (!products) return <InlineLoader />;

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle="Manage product details, progress, and release updates across the portfolio."
      >
        {canEdit && (
          <button className="btn-primary" onClick={openCreate}>
            <Icon.Plus className="h-4 w-4" /> New Product
          </button>
        )}
      </PageHeader>

      {products.length === 0 ? (
        <EmptyState
          title="No products yet"
          message="Products are the shipped heart of every RigStorm company."
          action={canEdit ? (
            <button className="btn-primary" onClick={openCreate}>
              <Icon.Plus className="h-4 w-4" /> New Product
            </button>
          ) : undefined}
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product, i) => (
            <motion.article
              key={product.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05, ease: 'easeOut' }}
              whileHover={{ y: -6 }}
              className="glass glass-hover flex flex-col p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/25 to-violet-600/25 text-sky-300">
                    <Icon.Box className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-base font-semibold text-white">{product.name}</h3>
                    <p className="text-[11px] font-medium tracking-wide text-slate-500">{product.version}</p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  {canEdit && (
                    <button
                      onClick={() => openEdit(product)}
                      className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/10 hover:text-sky-300"
                      aria-label="Edit product"
                    >
                      <Icon.Edit className="h-4 w-4" />
                    </button>
                  )}
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => setDeleting(product)}
                      className="rounded-lg p-1.5 text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-300"
                      aria-label="Delete product"
                    >
                      <Icon.Trash className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <p className="mt-3.5 line-clamp-2 text-sm leading-relaxed text-slate-400">{product.description}</p>

              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <StatusBadge value={product.status} />
                  <span className="font-semibold text-sky-300">{product.progress || 0}%</span>
                </div>
                <ProgressBar value={product.progress} compact />
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3.5 text-xs text-slate-500">
                <CompanyTag name={product.company || '—'} />
                <span>{product.owner}</span>
              </div>
            </motion.article>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Product' : 'New Product'}
        subtitle="Track a product from concept to release and beyond."
      >
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="label">Name *</label>
            <input className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={120} />
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
                {PRODUCT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Version</label>
              <input className="field" value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} maxLength={20} />
            </div>
          </div>
          <div>
            <label className="label">Progress — {form.progress}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={form.progress}
              onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })}
              className="mt-2 w-full accent-sky-400"
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="field min-h-[80px] resize-y" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={500} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving || !form.name.trim()}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Create product'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Delete product?"
        message={`“${deleting?.name}” will be permanently removed.`}
      />
    </div>
  );
}

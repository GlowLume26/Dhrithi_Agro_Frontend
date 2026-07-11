import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../layouts/AdminLayout';
import { PageHeader, Modal, ConfirmModal, RowActions, Empty, Skel } from '../components/AdminUI';
import adminApi from '../services/adminApi';

const EMPTY_FORM = { name: '', icon: '📦', image_url: '', sort_order: 0, is_featured: false, is_active: true, parent_id: '' };

export default function AdminCategories() {
  const [categories, setCategories]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [modalOpen, setModalOpen]     = useState(false);
  const [editItem, setEditItem]       = useState(null);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [saving, setSaving]           = useState(false);
  const [err, setErr]                 = useState('');
  const [confirmId, setConfirmId]     = useState(null);
  const [tab, setTab]                 = useState('all'); // 'all' | 'parent' | 'sub'

  const load = () => {
    setLoading(true);
    adminApi.getCategories().then(res => {
      if (res.success) setCategories(res.data || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const parents = categories.filter(c => !c.parent_id);
  const subs    = categories.filter(c => !!c.parent_id);
  const visible = tab === 'parent' ? parents : tab === 'sub' ? subs : categories;

  function openAdd(parentId = '') {
    setEditItem(null);
    setForm({ ...EMPTY_FORM, parent_id: parentId });
    setErr('');
    setModalOpen(true);
  }

  function openEdit(cat) {
    setEditItem(cat);
    setForm({
      name: cat.name, icon: cat.icon || '📦', image_url: cat.image_url || '',
      sort_order: cat.sort_order || 0, is_featured: !!cat.is_featured,
      is_active: cat.is_active !== false, parent_id: cat.parent_id || ''
    });
    setErr('');
    setModalOpen(true);
  }

  async function save() {
    if (!form.name.trim()) { setErr('Category name is required.'); return; }
    setSaving(true); setErr('');
    const payload = {
      ...form,
      parent_id: form.parent_id || null,
      sort_order: Number(form.sort_order) || 0,
    };
    const res = editItem
      ? await adminApi.updateCategory(editItem.id, payload)
      : await adminApi.createCategory(payload);
    if (res.success) { setModalOpen(false); load(); }
    else setErr(res.message || 'Failed to save.');
    setSaving(false);
  }

  async function doDelete(id) {
    await adminApi.deleteCategory(id);
    load();
  }

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <AdminLayout>
      <PageHeader
        title="Categories"
        sub={`${parents.length} parent categories · ${subs.length} subcategories`}
        actions={
          <>
            <button className="a-btn a-btn-sec" onClick={() => openAdd('')}>+ Add Category</button>
            <button className="a-btn a-btn-pri" onClick={() => openAdd('sub')}>+ Add Subcategory</button>
          </>
        }
      />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[['all', 'All', categories.length], ['parent', 'Parent', parents.length], ['sub', 'Subcategories', subs.length]].map(([key, label, count]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`a-btn a-btn-sm ${tab === key ? 'a-btn-pri' : 'a-btn-sec'}`}>
            {label} <span style={{ marginLeft: 4, opacity: 0.7 }}>({count})</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <motion.div className="a-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr>
                <th>Icon</th>
                <th>Name</th>
                <th>Type</th>
                <th>Parent</th>
                <th>Sort</th>
                <th>Featured</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? [0,1,2,3,4].map(i => (
                    <tr key={i}>{[0,1,2,3,4,5,6,7].map(j => <td key={j}><Skel h={18} /></td>)}</tr>
                  ))
                : visible.length === 0
                  ? <tr><td colSpan={8}><Empty icon="🗂️" title="No categories found" /></td></tr>
                  : visible.map(cat => (
                      <tr key={cat.id}>
                        <td style={{ fontSize: 22, textAlign: 'center' }}>{cat.icon || '📦'}</td>
                        <td style={{ fontWeight: 600, color: 'var(--atx)' }}>{cat.name}</td>
                        <td>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                            background: cat.parent_id ? '#eff6ff' : '#f0fdf4',
                            color: cat.parent_id ? '#1d4ed8' : '#15803d' }}>
                            {cat.parent_id ? 'Sub' : 'Parent'}
                          </span>
                        </td>
                        <td style={{ color: 'var(--atx2)', fontSize: 13 }}>{cat.parent_name || '—'}</td>
                        <td style={{ color: 'var(--atx2)' }}>{cat.sort_order ?? 0}</td>
                        <td>{cat.is_featured ? '⭐' : '—'}</td>
                        <td>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                            background: cat.is_active ? '#f0fdf4' : '#fef2f2',
                            color: cat.is_active ? '#15803d' : '#dc2626' }}>
                            {cat.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {!cat.parent_id && (
                              <button className="a-btn a-btn-sm a-btn-sec" title="Add subcategory"
                                onClick={() => openAdd(cat.id)}>+ Sub</button>
                            )}
                            <RowActions
                              onEdit={() => openEdit(cat)}
                              onDelete={() => setConfirmId(cat.id)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
              }
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? `Edit: ${editItem.name}` : form.parent_id ? 'Add Subcategory' : 'Add Category'}
        footer={
          <>
            <button className="a-btn a-btn-sec" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="a-btn a-btn-pri" onClick={save} disabled={saving}>
              {saving ? '⏳ Saving...' : editItem ? '💾 Update' : '➕ Create'}
            </button>
          </>
        }
      >
        {err && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 14 }}>{err}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Parent selector */}
          <div className="a-form-group">
            <label className="a-label">Type</label>
            <select className="a-input" value={form.parent_id} onChange={e => f('parent_id', e.target.value)}>
              <option value="">Parent Category</option>
              {parents.filter(p => p.id !== editItem?.id).map(p => (
                <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 12 }}>
            <div className="a-form-group">
              <label className="a-label">Icon</label>
              <input className="a-input" style={{ textAlign: 'center', fontSize: 22 }} value={form.icon} onChange={e => f('icon', e.target.value)} maxLength={4} />
            </div>
            <div className="a-form-group">
              <label className="a-label">Name *</label>
              <input className="a-input" placeholder="e.g. Fertilizers" value={form.name} onChange={e => f('name', e.target.value)} />
            </div>
          </div>

          <div className="a-form-group">
            <label className="a-label">Image URL</label>
            <input className="a-input" placeholder="https://..." value={form.image_url} onChange={e => f('image_url', e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="a-form-group">
              <label className="a-label">Sort Order</label>
              <input className="a-input" type="number" min={0} value={form.sort_order} onChange={e => f('sort_order', e.target.value)} />
            </div>
            <div className="a-form-group">
              <label className="a-label">Status</label>
              <select className="a-input" value={form.is_active ? 'active' : 'inactive'} onChange={e => f('is_active', e.target.value === 'active')}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--atx)', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.is_featured} onChange={e => f('is_featured', e.target.checked)} style={{ accentColor: '#2e7d32', width: 16, height: 16 }} />
            ⭐ Mark as Featured
          </label>
        </div>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmModal
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={() => doDelete(confirmId)}
        message="This will deactivate the category. Subcategories will remain but won't be visible."
      />
    </AdminLayout>
  );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../layouts/AdminLayout';
import { PageHeader, Modal, ConfirmModal, RowActions, Empty } from '../components/AdminUI';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminApi } from '../services/adminApi';
import { ALL_MODULES, ROLE_MODULES } from '../utils/constants';

const MODULE_LABELS = {
  dashboard: '📊 Dashboard', products: '📦 Products', orders: '🛒 Orders',
  customers: '👥 Customers', categories: '🗂️ Categories', inventory: '🗄️ Inventory',
  offers: '🏷️ Offers', reports: '📈 Reports', settings: '⚙️ Settings', admins: '🛡️ Admin Users',
};

const EMPTY_FORM = { name: '', email: '', password: '', role: 'admin', status: 'active', permissions: [...ROLE_MODULES.admin] };

export default function AdminUsers() {
  const { admin: me } = useAdminAuth();
  const isOwner = me?.role === 'owner';

  const [admins, setAdmins]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [delId, setDelId]     = useState(null);
  const [form, setForm]       = useState(EMPTY_FORM);
  const [editId, setEditId]   = useState(null);
  const [saving, setSaving]   = useState(false);
  const [err, setErr]         = useState('');
  const [loadErr, setLoadErr] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    setLoadErr('');
    try {
      const res = await adminApi.getAdmins();
      if (res.success) setAdmins(res.data ?? []);
      else setLoadErr(res.message || 'Failed to load admins');
    } catch (e) {
      setLoadErr(e?.response?.data?.message || e?.message || 'Failed to load admins');
      setAdmins([]);
    }
    setLoading(false);
  }

  const f = (k, v) => setForm(x => ({ ...x, [k]: v }));

  function togglePerm(mod) {
    setForm(x => ({
      ...x,
      permissions: x.permissions.includes(mod)
        ? x.permissions.filter(m => m !== mod)
        : [...x.permissions, mod],
    }));
  }

  function openAdd() {
    setForm(EMPTY_FORM); setEditId(null); setErr(''); setModal(true);
  }

  function openEdit(a) {
    setForm({
      name: a.name, email: a.email, password: '',
      role: a.role, status: a.is_active ? 'active' : 'inactive',
      permissions: a.permissions ?? ROLE_MODULES[a.role] ?? ROLE_MODULES.admin,
    });
    setEditId(a.id); setErr(''); setModal(true);
  }

  async function save() {
    if (!form.name.trim() || !form.email.trim()) return setErr('Name and email are required');
    if (!editId && !form.password.trim()) return setErr('Password is required');
    setSaving(true); setErr('');
    try {
      const payload = {
        name: form.name, email: form.email, role: form.role,
        is_active: form.status === 'active',
        permissions: form.role === 'owner' ? ALL_MODULES : form.permissions,
        ...(form.password ? { password: form.password } : {}),
      };
      if (editId) {
        await adminApi.updateAdmin(editId, payload);
        setAdmins(as => as.map(a => a.id === editId ? { ...a, ...payload, name: form.name } : a));
      } else {
        const res = await adminApi.createAdmin(payload);
        await load();
        void res;
      }
      setModal(false);
    } catch (e) {
      setErr(e?.response?.data?.message || 'Failed to save');
    }
    setSaving(false);
  }

  async function toggleStatus(a) {
    const next = !a.is_active;
    setAdmins(as => as.map(x => x.id === a.id ? { ...x, is_active: next } : x));
    await adminApi.updateAdmin(a.id, { is_active: next }).catch(() => load());
  }

  async function del() {
    await adminApi.deleteAdmin(delId).catch(() => {});
    setAdmins(as => as.filter(a => a.id !== delId));
    setDelId(null);
  }

  // when role changes in form, reset permissions to role default
  function handleRoleChange(role) {
    setForm(x => ({ ...x, role, permissions: role === 'owner' ? ALL_MODULES : [...ROLE_MODULES.admin] }));
  }

  const visibleModules = form.role === 'owner' ? [] : ALL_MODULES;

  return (
    <AdminLayout>
      <PageHeader title="Admin Users" sub="Manage admin accounts and page permissions"
        actions={isOwner && <button className="a-btn a-btn-pri" onClick={openAdd}>+ Create Admin</button>}
      />

      <div className="a-card">
        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr>
                <th>#</th><th>Name</th><th>Email</th><th>Role</th>
                <th>Page Access</th><th>Status</th><th>Created</th>
                {isOwner && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--atx3)' }}>Loading...</td></tr>
                : loadErr
                  ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#dc2626' }}>⚠️ {loadErr}</td></tr>
                : admins.length === 0
                  ? <tr><td colSpan={8}><Empty icon="🛡️" title="No admin users" /></td></tr>
                  : admins.map((a, i) => (
                    <motion.tr key={a.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <td style={{ color: 'var(--atx3)', fontSize: 12 }}>{i + 1}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: a.role === 'owner' ? 'linear-gradient(135deg,#b45309,#f59e0b)' : 'linear-gradient(135deg,#2e7d32,#66bb6a)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                            {(a.name || '?').charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 700 }}>{a.name}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--atx2)', fontSize: 13 }}>{a.email}</td>
                      <td>
                        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800, background: a.role === 'owner' ? 'rgba(234,179,8,0.12)' : 'rgba(99,102,241,0.1)', color: a.role === 'owner' ? '#b45309' : '#4f46e5' }}>
                          {a.role === 'owner' ? '👑 Owner' : '🛡️ Admin'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 280 }}>
                          {a.role === 'owner'
                            ? <span style={{ fontSize: 11, color: '#b45309', fontWeight: 700 }}>All Pages</span>
                            : (a.permissions ?? ROLE_MODULES.admin).map(m => (
                              <span key={m} style={{ fontSize: 10, background: 'var(--ab3)', border: '1px solid var(--abord)', borderRadius: 6, padding: '2px 7px', color: 'var(--atx2)' }}>
                                {MODULE_LABELS[m]?.split(' ').slice(1).join(' ') || m}
                              </span>
                            ))
                          }
                        </div>
                      </td>
                      <td>
                        {isOwner && a.id !== me?.id
                          ? <button onClick={() => toggleStatus(a)}
                              style={{ padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', background: a.is_active ? '#f0fdf4' : '#f8fafc', color: a.is_active ? '#16a34a' : '#94a3b8' }}>
                              {a.is_active ? '● Active' : '○ Inactive'}
                            </button>
                          : <span style={{ fontSize: 12, color: a.is_active ? '#16a34a' : '#94a3b8', fontWeight: 700 }}>{a.is_active ? '● Active' : '○ Inactive'}</span>
                        }
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--atx3)' }}>
                        {a.created_at ? new Date(a.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      {isOwner && (
                        <td>
                          {a.id !== me?.id
                            ? <RowActions onEdit={() => openEdit(a)} onDelete={() => setDelId(a.id)} />
                            : <span style={{ fontSize: 11, color: 'var(--atx3)' }}>You</span>
                          }
                        </td>
                      )}
                    </motion.tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Admin' : 'Create Admin'}
        footer={
          <>
            <button className="a-btn a-btn-sec" onClick={() => setModal(false)}>Cancel</button>
            <button className="a-btn a-btn-pri" onClick={save} disabled={saving}>
              {saving ? 'Saving...' : `💾 ${editId ? 'Update' : 'Create'}`}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {err && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 13 }}>{err}</div>}
          <div className="a-form-grid">
            <div className="a-fg full"><label>Full Name *</label><input className="a-input" value={form.name} onChange={e => f('name', e.target.value)} /></div>
            <div className="a-fg full"><label>Email *</label><input className="a-input" type="email" value={form.email} onChange={e => f('email', e.target.value)} /></div>
            <div className="a-fg full"><label>{editId ? 'New Password (leave blank to keep)' : 'Password *'}</label><input className="a-input" type="password" value={form.password} onChange={e => f('password', e.target.value)} /></div>
            <div className="a-fg">
              <label>Role</label>
              <select className="a-input a-select" value={form.role} onChange={e => handleRoleChange(e.target.value)}>
                <option value="admin">Admin (Custom Access)</option>
                <option value="owner">Owner (Full Access)</option>
              </select>
            </div>
            <div className="a-fg">
              <label>Status</label>
              <select className="a-input a-select" value={form.status} onChange={e => f('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Page Permissions — only for admin role */}
          {form.role === 'owner'
            ? (
              <div style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: 12, padding: '12px 16px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#b45309', marginBottom: 4 }}>👑 Owner — Full Access to All Pages</div>
                <div style={{ fontSize: 12, color: 'var(--atx2)' }}>Owner has unrestricted access to every page and action.</div>
              </div>
            )
            : (
              <div style={{ background: 'var(--ab3)', borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--atx2)', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 10 }}>
                  Page Access — select which pages this admin can see
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {visibleModules.map(mod => (
                    <label key={mod} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '6px 10px', borderRadius: 8, background: form.permissions.includes(mod) ? 'rgba(46,125,50,0.08)' : 'transparent', border: `1px solid ${form.permissions.includes(mod) ? 'rgba(46,125,50,0.3)' : 'var(--abord)'}`, transition: 'all 0.15s' }}>
                      <input type="checkbox" checked={form.permissions.includes(mod)} onChange={() => togglePerm(mod)}
                        style={{ accentColor: '#2e7d32', width: 15, height: 15, cursor: 'pointer' }} />
                      <span style={{ fontSize: 13, color: 'var(--atx)', fontWeight: form.permissions.includes(mod) ? 600 : 400 }}>
                        {MODULE_LABELS[mod]}
                      </span>
                    </label>
                  ))}
                </div>
                <div style={{ marginTop: 10, fontSize: 11, color: 'var(--atx3)' }}>
                  {form.permissions.length} of {ALL_MODULES.length} pages selected
                </div>
              </div>
            )
          }
        </div>
      </Modal>

      <ConfirmModal open={!!delId} onClose={() => setDelId(null)} onConfirm={del} message="Delete this admin account permanently?" />
    </AdminLayout>
  );
}

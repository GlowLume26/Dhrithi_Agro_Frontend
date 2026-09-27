import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../layouts/AdminLayout';
import { PageHeader, Modal, ConfirmModal, Skel, Empty, RowActions } from '../components/AdminUI';
import adminApi from '../services/adminApi';

const EMPTY = { name:'', contact_name:'', email:'', mobile:'', address:'', city:'', state:'', pincode:'', gst_number:'' };

export default function AdminManufacturers() {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]   = useState(false);
  const [form, setForm]     = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [delId, setDelId]   = useState(null);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await adminApi.getManufacturers();
      if (res.success) setItems(res.data ?? []);
    } catch { setItems([]); }
    setLoading(false);
  }

  const filtered = items.filter(m =>
    !search || m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.contact_name?.toLowerCase().includes(search.toLowerCase())
  );

  function openAdd() { setForm(EMPTY); setEditId(null); setModal(true); }
  function openEdit(m) { setForm(m); setEditId(m.id); setModal(true); }
  const f = (k, v) => setForm(x => ({ ...x, [k]: v }));

  async function save() {
    if (!form.name) return;
    setSaving(true);
    try {
      if (editId) {
        await adminApi.updateManufacturerOrder(editId, form); // reuse update endpoint
      } else {
        await fetch('/api/index.php?route=manufacturer&section=manufacturers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('da_admin_token') },
          body: JSON.stringify(form),
        });
      }
      setModal(false); load();
    } catch {}
    setSaving(false);
  }

  return (
    <AdminLayout>
      <PageHeader title="Manufacturer Details" sub={`${filtered.length} manufacturers`}
        actions={<button className="a-btn a-btn-pri" onClick={openAdd}>+ Add Manufacturer</button>} />

      <div className="a-card">
        <div className="a-filter-bar">
          <input className="a-input" placeholder="🔍 Search manufacturer..." value={search}
            onChange={e => setSearch(e.target.value)} style={{ maxWidth: 260 }} />
        </div>
        <div className="a-table-wrap">
          <table className="a-table">
            <thead><tr><th>#</th><th>Name</th><th>Contact</th><th className="hide-mobile">Mobile</th><th className="hide-mobile">City</th><th className="hide-mobile">State</th><th className="hide-mobile">GST</th><th>Actions</th></tr></thead>
            <tbody>
              {loading
                ? [0,1,2].map(i => <tr key={i}><td colSpan={8}><Skel h={40}/></td></tr>)
                : filtered.length === 0
                ? <tr><td colSpan={8}><Empty icon="🏭" title="No manufacturers found" /></td></tr>
                : filtered.map((m, i) => (
                  <motion.tr key={m.id} initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.04 }}>
                    <td style={{ color:'var(--atx3)', fontSize:12 }}>{i+1}</td>
                    <td style={{ fontWeight:700 }}>{m.name}</td>
                    <td style={{ fontSize:13, color:'var(--atx2)' }}>{m.contact_name || '—'}</td>
                    <td className="hide-mobile" style={{ fontSize:13 }}>{m.mobile || '—'}</td>
                    <td className="hide-mobile" style={{ fontSize:13 }}>{m.city || '—'}</td>
                    <td className="hide-mobile" style={{ fontSize:13 }}>{m.state || '—'}</td>
                    <td className="hide-mobile" style={{ fontSize:12, color:'var(--atx3)' }}>{m.gst_number || '—'}</td>
                    <td><RowActions onEdit={() => openEdit(m)} onDelete={() => setDelId(m.id)} /></td>
                  </motion.tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Manufacturer' : 'Add Manufacturer'}
        footer={<><button className="a-btn a-btn-sec" onClick={() => setModal(false)}>Cancel</button><button className="a-btn a-btn-pri" onClick={save} disabled={saving}>{saving ? '⏳' : '💾 Save'}</button></>}>
        <div className="a-form-grid">
          <div className="a-fg full"><label>Manufacturer Name *</label><input className="a-input" value={form.name} onChange={e => f('name', e.target.value)} /></div>
          <div className="a-fg"><label>Contact Person</label><input className="a-input" value={form.contact_name||''} onChange={e => f('contact_name', e.target.value)} /></div>
          <div className="a-fg"><label>Mobile</label><input className="a-input" value={form.mobile||''} onChange={e => f('mobile', e.target.value)} /></div>
          <div className="a-fg"><label>Email</label><input className="a-input" type="email" value={form.email||''} onChange={e => f('email', e.target.value)} /></div>
          <div className="a-fg"><label>GST Number</label><input className="a-input" value={form.gst_number||''} onChange={e => f('gst_number', e.target.value)} /></div>
          <div className="a-fg"><label>City</label><input className="a-input" value={form.city||''} onChange={e => f('city', e.target.value)} /></div>
          <div className="a-fg"><label>State</label><input className="a-input" value={form.state||''} onChange={e => f('state', e.target.value)} /></div>
          <div className="a-fg"><label>Pincode</label><input className="a-input" value={form.pincode||''} onChange={e => f('pincode', e.target.value)} /></div>
          <div className="a-fg full"><label>Address</label><textarea className="a-input" rows={2} value={form.address||''} onChange={e => f('address', e.target.value)} /></div>
        </div>
      </Modal>
      <ConfirmModal open={!!delId} onClose={() => setDelId(null)} onConfirm={() => setDelId(null)} message="Delete this manufacturer?" />
    </AdminLayout>
  );
}

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../layouts/AdminLayout';
import { PageHeader, Modal, ConfirmModal, Skel, Empty, RowActions } from '../components/AdminUI';
import adminApi from '../services/adminApi';

const INDIAN_STATES = ['Andhra Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Odisha','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','Uttarakhand','West Bengal'];
const EMPTY = { cnf_company_id:'', name:'', address:'', city:'', state:'', pincode:'', manager_name:'', contact_number:'', email:'' };

export default function AdminWarehouseManagement() {
  const [warehouses, setWarehouses] = useState([]);
  const [companies, setCompanies]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [modal, setModal]           = useState(false);
  const [form, setForm]             = useState(EMPTY);
  const [editId, setEditId]         = useState(null);
  const [delId, setDelId]           = useState(null);
  const [filterState, setFilterState]   = useState('');
  const [filterCnf, setFilterCnf]       = useState('');
  const [saving, setSaving]         = useState(false);

  useEffect(() => { loadCompanies(); }, []);
  useEffect(() => { load(); }, [filterState, filterCnf]);

  async function loadCompanies() {
    try { const r = await adminApi.getCnfCompanies({}); if (r.success) setCompanies(r.data ?? []); } catch {}
  }

  async function load() {
    setLoading(true);
    try {
      const r = await adminApi.getWarehouses({ state: filterState, cnf_company_id: filterCnf });
      if (r.success) setWarehouses(r.data ?? []);
    } catch { setWarehouses([]); }
    setLoading(false);
  }

  function openAdd() { setForm(EMPTY); setEditId(null); setModal(true); }
  function openEdit(w) { setForm(w); setEditId(w.id); setModal(true); }
  const f = (k, v) => setForm(x => ({ ...x, [k]: v }));

  async function save() {
    if (!form.cnf_company_id || !form.name) return alert('Company and warehouse name required');
    setSaving(true);
    try {
      if (editId) await adminApi.updateWarehouse(editId, form);
      else await adminApi.createWarehouse(form);
      setModal(false); load();
    } catch {}
    setSaving(false);
  }

  return (
    <AdminLayout>
      <PageHeader title="Warehouse Management" sub={`${warehouses.length} warehouses`}
        actions={<button className="a-btn a-btn-pri" onClick={openAdd}>+ Add Warehouse</button>} />

      <div className="a-card">
        <div className="a-filter-bar">
          <select className="a-input a-select" value={filterState} onChange={e => setFilterState(e.target.value)} style={{ maxWidth:180 }}>
            <option value="">All States</option>
            {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="a-input a-select" value={filterCnf} onChange={e => setFilterCnf(e.target.value)} style={{ maxWidth:200 }}>
            <option value="">All C&F Companies</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="a-table-wrap">
          <table className="a-table">
            <thead><tr><th>#</th><th>Warehouse</th><th>C&F Company</th><th className="hide-mobile">Manager</th><th className="hide-mobile">City</th><th className="hide-mobile">State</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {loading
                ? [0,1,2].map(i => <tr key={i}><td colSpan={8}><Skel h={40}/></td></tr>)
                : warehouses.length === 0
                ? <tr><td colSpan={8}><Empty icon="🏗️" title="No warehouses found" /></td></tr>
                : warehouses.map((w, i) => (
                  <motion.tr key={w.id} initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.04 }}>
                    <td style={{ color:'var(--atx3)', fontSize:12 }}>{i+1}</td>
                    <td style={{ fontWeight:700 }}>{w.name}</td>
                    <td style={{ fontSize:13, color:'var(--atx2)' }}>{w.company_name || '—'}</td>
                    <td className="hide-mobile" style={{ fontSize:13 }}>{w.manager_name || '—'}</td>
                    <td className="hide-mobile" style={{ fontSize:13 }}>{w.city || '—'}</td>
                    <td className="hide-mobile" style={{ fontSize:13 }}>{w.state || '—'}</td>
                    <td><span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20, background: w.status==='active'?'#f0fdf4':'#fef2f2', color: w.status==='active'?'#16a34a':'#dc2626' }}>{w.status}</span></td>
                    <td><RowActions onEdit={() => openEdit(w)} onDelete={() => setDelId(w.id)} /></td>
                  </motion.tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Warehouse' : 'Add Warehouse'}
        footer={<><button className="a-btn a-btn-sec" onClick={() => setModal(false)}>Cancel</button><button className="a-btn a-btn-pri" onClick={save} disabled={saving}>{saving ? '⏳' : '💾 Save'}</button></>}>
        <div className="a-form-grid">
          <div className="a-fg full">
            <label>C&F Company *</label>
            <select className="a-input a-select" value={form.cnf_company_id} onChange={e => f('cnf_company_id', e.target.value)}>
              <option value="">Select Company</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="a-fg full"><label>Warehouse Name *</label><input className="a-input" value={form.name} onChange={e => f('name', e.target.value)} /></div>
          <div className="a-fg"><label>Manager Name</label><input className="a-input" value={form.manager_name||''} onChange={e => f('manager_name', e.target.value)} /></div>
          <div className="a-fg"><label>Contact Number</label><input className="a-input" value={form.contact_number||''} onChange={e => f('contact_number', e.target.value)} /></div>
          <div className="a-fg"><label>Email</label><input className="a-input" type="email" value={form.email||''} onChange={e => f('email', e.target.value)} /></div>
          <div className="a-fg"><label>City</label><input className="a-input" value={form.city||''} onChange={e => f('city', e.target.value)} /></div>
          <div className="a-fg">
            <label>State</label>
            <select className="a-input a-select" value={form.state||''} onChange={e => f('state', e.target.value)}>
              <option value="">Select State</option>
              {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="a-fg"><label>Pincode</label><input className="a-input" value={form.pincode||''} onChange={e => f('pincode', e.target.value)} /></div>
          <div className="a-fg full"><label>Address</label><textarea className="a-input" rows={2} value={form.address||''} onChange={e => f('address', e.target.value)} /></div>
        </div>
      </Modal>
      <ConfirmModal open={!!delId} onClose={() => setDelId(null)} onConfirm={() => { setDelId(null); load(); }} message="Delete this warehouse?" />
    </AdminLayout>
  );
}

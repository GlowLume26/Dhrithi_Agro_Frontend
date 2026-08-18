import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../layouts/AdminLayout';
import { PageHeader, Modal, ConfirmModal, Skel, Empty, RowActions } from '../components/AdminUI';
import adminApi from '../services/adminApi';

const EMPTY = { name:'', contact_person:'', contact_number:'', email:'', address:'', city:'', state:'', pincode:'', gst_number:'' };

export default function AdminCnfCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(false);
  const [form, setForm]           = useState(EMPTY);
  const [editId, setEditId]       = useState(null);
  const [delId, setDelId]         = useState(null);
  const [search, setSearch]       = useState('');
  const [stateF, setStateF]       = useState('');
  const [saving, setSaving]       = useState(false);

  useEffect(() => { load(); }, [search, stateF]);

  async function load() {
    setLoading(true);
    try {
      const res = await adminApi.getCnfCompanies({ search, state: stateF });
      if (res.success) setCompanies(res.data);
    } catch { setCompanies([]); }
    setLoading(false);
  }

  function openAdd() { setForm(EMPTY); setEditId(null); setModal(true); }
  function openEdit(c) { setForm(c); setEditId(c.id); setModal(true); }

  async function save() {
    setSaving(true);
    try {
      if (editId) await adminApi.updateCnfCompany(editId, form);
      else await adminApi.createCnfCompany(form);
      setModal(false); load();
    } catch {}
    setSaving(false);
  }

  async function del() { try { await adminApi.deleteCnfCompany(delId); load(); } catch {} setDelId(null); }

  const f = (k,v) => setForm(x=>({...x,[k]:v}));

  return (
    <AdminLayout>
      <PageHeader title="C&F Companies" sub={`${companies.length} companies`}
        actions={<button className="a-btn a-btn-pri" onClick={openAdd}>+ Add Company</button>} />

      <div className="a-card">
        <div className="a-filter-bar">
          <input className="a-input" placeholder="🔍 Search..." value={search}
            onChange={e=>{setSearch(e.target.value);}} style={{maxWidth:220}} />
          <input className="a-input" placeholder="Filter by state..." value={stateF}
            onChange={e=>setStateF(e.target.value)} style={{maxWidth:160}} />
        </div>
        <div className="a-table-wrap">
          <table className="a-table">
            <thead><tr><th>#</th><th>Company</th><th className="hide-mobile">Contact</th><th className="hide-mobile">State</th><th className="hide-mobile">City</th><th>Warehouses</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {loading
                ? [0,1,2].map(i=><tr key={i}><td colSpan={8}><Skel h={40}/></td></tr>)
                : companies.length===0
                ? <tr><td colSpan={8}><Empty icon="🏢" title="No C&F companies found"/></td></tr>
                : companies.map((c,i)=>(
                  <motion.tr key={c.id} initial={{opacity:0,y:5}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}>
                    <td style={{color:'var(--atx3)',fontWeight:600,textAlign:'center'}}>{i+1}</td>
                    <td><div style={{fontWeight:700}}>{c.name}</div><div style={{fontSize:11,color:'var(--atx3)'}}>{c.gst_number||''}</div></td>
                    <td className="hide-mobile" style={{fontSize:13,color:'var(--atx2)'}}>{c.contact_person}<br/><span style={{fontSize:11}}>{c.contact_number}</span></td>
                    <td className="hide-mobile" style={{fontSize:13}}>{c.state||'—'}</td>
                    <td className="hide-mobile" style={{fontSize:13}}>{c.city||'—'}</td>
                    <td style={{textAlign:'center',fontWeight:700}}>{c.warehouse_count||0}</td>
                    <td><span style={{fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:20,background:c.status==='active'?'#f0fdf4':'#fef2f2',color:c.status==='active'?'#16a34a':'#dc2626'}}>{c.status}</span></td>
                    <td><RowActions onEdit={()=>openEdit(c)} onDelete={()=>setDelId(c.id)}/></td>
                  </motion.tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={()=>setModal(false)} title={editId?'Edit Company':'Add C&F Company'}
        footer={<><button className="a-btn a-btn-sec" onClick={()=>setModal(false)}>Cancel</button><button className="a-btn a-btn-pri" onClick={save} disabled={saving}>{saving?'⏳ Saving...':'💾 Save'}</button></>}>
        <div className="a-form-grid">
          <div className="a-fg full"><label>Company Name *</label><input className="a-input" value={form.name} onChange={e=>f('name',e.target.value)} /></div>
          <div className="a-fg"><label>Contact Person</label><input className="a-input" value={form.contact_person||''} onChange={e=>f('contact_person',e.target.value)} /></div>
          <div className="a-fg"><label>Contact Number</label><input className="a-input" value={form.contact_number||''} onChange={e=>f('contact_number',e.target.value)} /></div>
          <div className="a-fg"><label>Email</label><input className="a-input" type="email" value={form.email||''} onChange={e=>f('email',e.target.value)} /></div>
          <div className="a-fg"><label>GST Number</label><input className="a-input" value={form.gst_number||''} onChange={e=>f('gst_number',e.target.value)} /></div>
          <div className="a-fg"><label>City</label><input className="a-input" value={form.city||''} onChange={e=>f('city',e.target.value)} /></div>
          <div className="a-fg"><label>State</label><input className="a-input" value={form.state||''} onChange={e=>f('state',e.target.value)} /></div>
          <div className="a-fg"><label>Pincode</label><input className="a-input" value={form.pincode||''} onChange={e=>f('pincode',e.target.value)} /></div>
          <div className="a-fg full"><label>Address</label><textarea className="a-input" rows={2} value={form.address||''} onChange={e=>f('address',e.target.value)} /></div>
        </div>
      </Modal>
      <ConfirmModal open={!!delId} onClose={()=>setDelId(null)} onConfirm={del} message="Delete this C&F company? All warehouses will also be deleted." />
    </AdminLayout>
  );
}

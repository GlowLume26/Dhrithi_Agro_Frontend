import { useState } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../layouts/AdminLayout';
import { PageHeader, Modal, ConfirmModal, RowActions, Empty } from '../components/AdminUI';
import { ROLES } from '../utils/constants';

const MOCK = [
  { id:1, name:'Admin Owner', email:'owner@drithiagro.com', role:'owner', status:'active',  created:'10 Jan 2025' },
  { id:2, name:'Product Admin', email:'admin@drithiagro.com', role:'admin', status:'active', created:'12 Jan 2025' },
  { id:3, name:'Sales Admin', email:'sales@drithiagro.com', role:'admin', status:'inactive', created:'14 Jan 2025' },
];
const EMPTY_FORM = { name:'', email:'', password:'', role:'admin', status:'active' };
const ROLE_MODULES_DISPLAY = {
  owner: ['Dashboard','Products','Orders','Customers','Inventory','Offers','Reports','Settings','Admin Users'],
  admin: ['Dashboard','Products','Orders','Customers'],
};

export default function AdminUsers() {
  const [admins, setAdmins]   = useState(MOCK);
  const [modal, setModal]     = useState(false);
  const [delId, setDelId]     = useState(null);
  const [form, setForm]       = useState(EMPTY_FORM);
  const [editId, setEditId]   = useState(null);

  const f = (k,v) => setForm(x=>({...x,[k]:v}));

  function openAdd() { setForm(EMPTY_FORM); setEditId(null); setModal(true); }
  function openEdit(a) { setForm({ name:a.name, email:a.email, password:'', role:a.role, status:a.status }); setEditId(a.id); setModal(true); }
  function save() {
    if (editId) setAdmins(as=>as.map(a=>a.id===editId?{...a,...form}:a));
    else setAdmins(as=>[...as,{ id:Date.now(), ...form, created: new Date().toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) }]);
    setModal(false);
  }
  function toggleStatus(id) { setAdmins(as=>as.map(a=>a.id===id?{...a,status:a.status==='active'?'inactive':'active'}:a)); }
  function del() { setAdmins(as=>as.filter(a=>a.id!==delId)); }

  return (
    <AdminLayout>
      <PageHeader title="Admin Users" sub="Manage admin accounts and permissions"
        actions={<button className="a-btn a-btn-pri" onClick={openAdd}>+ Create Admin</button>}
      />

      <div className="a-card">
        <div className="a-table-wrap">
          <table className="a-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Modules</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>
              {admins.length === 0
                ? <tr><td colSpan={7}><Empty icon="🛡️" title="No admin users" /></td></tr>
                : admins.map((a,i)=>(
                  <motion.tr key={a.id} initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.06 }}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:34, height:34, borderRadius:'50%', background:'linear-gradient(135deg,#2e7d32,#66bb6a)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:14, flexShrink:0 }}>{a.name.charAt(0)}</div>
                        <span style={{ fontWeight:700 }}>{a.name}</span>
                      </div>
                    </td>
                    <td style={{ color:'var(--atx2)', fontSize:13 }}>{a.email}</td>
                    <td>
                      <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:800, background: a.role==='owner'?'rgba(234,179,8,0.12)':'rgba(99,102,241,0.1)', color: a.role==='owner'?'#b45309':'#4f46e5', textTransform:'capitalize' }}>
                        {a.role==='owner'?'👑 Owner':'🛡️ Admin'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:4, maxWidth:260 }}>
                        {ROLE_MODULES_DISPLAY[a.role].map(m=>(
                          <span key={m} style={{ fontSize:10, background:'var(--ab3)', border:'1px solid var(--abord)', borderRadius:6, padding:'2px 7px', color:'var(--atx2)' }}>{m}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <button onClick={()=>toggleStatus(a.id)}
                        style={{ padding:'3px 12px', borderRadius:20, fontSize:11, fontWeight:700, border:'none', cursor:'pointer', background: a.status==='active'?'#f0fdf4':'#f8fafc', color: a.status==='active'?'#16a34a':'#94a3b8' }}>
                        {a.status==='active'?'● Active':'○ Inactive'}
                      </button>
                    </td>
                    <td style={{ fontSize:12, color:'var(--atx3)' }}>{a.created}</td>
                    <td><RowActions onEdit={()=>openEdit(a)} onDelete={()=>setDelId(a.id)} /></td>
                  </motion.tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={()=>setModal(false)} title={editId?'Edit Admin':'Create Admin'}
        footer={<><button className="a-btn a-btn-sec" onClick={()=>setModal(false)}>Cancel</button><button className="a-btn a-btn-pri" onClick={save}>💾 {editId?'Update':'Create'}</button></>}
      >
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="a-form-grid">
            <div className="a-fg full"><label>Full Name *</label><input className="a-input" value={form.name} onChange={e=>f('name',e.target.value)} /></div>
            <div className="a-fg full"><label>Email *</label><input className="a-input" type="email" value={form.email} onChange={e=>f('email',e.target.value)} /></div>
            <div className="a-fg full"><label>{editId?'New Password (leave blank to keep)':'Password *'}</label><input className="a-input" type="password" value={form.password} onChange={e=>f('password',e.target.value)} /></div>
            <div className="a-fg"><label>Role</label>
              <select className="a-input a-select" value={form.role} onChange={e=>f('role',e.target.value)}>
                <option value="admin">Admin (Limited)</option>
                <option value="owner">Owner (Full Access)</option>
              </select>
            </div>
            <div className="a-fg"><label>Status</label>
              <select className="a-input a-select" value={form.status} onChange={e=>f('status',e.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div style={{ background:'var(--ab3)', borderRadius:12, padding:'14px 16px' }}>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--atx2)', textTransform:'uppercase', letterSpacing:0.7, marginBottom:8 }}>Permissions for {form.role==='owner'?'Owner':'Admin'}</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {ROLE_MODULES_DISPLAY[form.role].map(m=>(
                <span key={m} style={{ fontSize:12, background:'var(--apri)', color:'white', borderRadius:8, padding:'3px 10px', fontWeight:600 }}>✓ {m}</span>
              ))}
            </div>
          </div>
        </div>
      </Modal>
      <ConfirmModal open={!!delId} onClose={()=>setDelId(null)} onConfirm={del} message="Delete this admin account permanently?" />
    </AdminLayout>
  );
}

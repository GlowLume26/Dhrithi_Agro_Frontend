import { useState } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../layouts/AdminLayout';
import { PageHeader, Modal, ConfirmModal, RowActions, Empty } from '../components/AdminUI';

const MOCK = [
  { id:1, name:'Kharif Season 2025', image:'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&q=80', start:'2025-01-01', end:'2025-03-31', clicks:2840, orders:142, revenue:48200, active:true },
  { id:2, name:'Organic Collection', image:'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&q=80', start:'2025-01-10', end:'2025-02-28', clicks:1560, orders:78,  revenue:29100, active:true },
  { id:3, name:'Farm Equipment Sale', image:'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80', start:'2024-12-01', end:'2024-12-31', clicks:3200, orders:210, revenue:87600, active:false },
];

const EMPTY_FORM = { name:'', image:'', start:'', end:'', redirect_product:'', redirect_category:'' };

export default function AdminOffers() {
  const [offers, setOffers]   = useState(MOCK);
  const [modal, setModal]     = useState(false);
  const [delId, setDelId]     = useState(null);
  const [form, setForm]       = useState(EMPTY_FORM);
  const [editId, setEditId]   = useState(null);

  const f = (k,v) => setForm(x=>({...x,[k]:v}));

  function openAdd() { setForm(EMPTY_FORM); setEditId(null); setModal(true); }
  function openEdit(o) { setForm({ name:o.name, image:o.image, start:o.start, end:o.end, redirect_product:'', redirect_category:'' }); setEditId(o.id); setModal(true); }
  function save() {
    if (editId) setOffers(os=>os.map(o=>o.id===editId?{...o,...form}:o));
    else setOffers(os=>[...os,{id:Date.now(),...form,clicks:0,orders:0,revenue:0,active:true}]);
    setModal(false);
  }
  function del() { setOffers(os=>os.filter(o=>o.id!==delId)); }

  return (
    <AdminLayout>
      <PageHeader title="Offers & Banners" sub="Manage promotional banners and track performance"
        actions={<button className="a-btn a-btn-pri" onClick={openAdd}>+ Create Banner</button>}
      />

      {offers.length === 0
        ? <div className="a-card a-card-p"><Empty icon="🏷️" title="No offers yet" sub="Create your first promotional banner" /></div>
        : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))', gap:20 }}>
            {offers.map((o,i)=>(
              <motion.div key={o.id} className="a-card" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}>
                <div style={{ position:'relative', height:160, borderRadius:'13px 13px 0 0', overflow:'hidden' }}>
                  <img src={o.image} alt={o.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(0deg,rgba(0,0,0,0.55) 0%,transparent 60%)' }} />
                  <div style={{ position:'absolute', bottom:12, left:14, color:'white', fontWeight:800, fontSize:16 }}>{o.name}</div>
                  <span style={{ position:'absolute', top:12, right:12, background: o.active?'#16a34a':'#64748b', color:'white', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20 }}>
                    {o.active?'Active':'Ended'}
                  </span>
                </div>
                <div className="a-card-p">
                  <div style={{ fontSize:12, color:'var(--atx2)', marginBottom:14 }}>📅 {o.start} → {o.end}</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:14 }}>
                    {[['👆 Clicks',o.clicks.toLocaleString(),'#2563eb'],['🛒 Orders',o.orders,'#16a34a'],['💰 Revenue','₹'+Number(o.revenue).toLocaleString('en-IN'),'#9333ea']].map(([l,v,c])=>(
                      <div key={l} style={{ background:'var(--ab3)', borderRadius:10, padding:'10px 12px', textAlign:'center' }}>
                        <div style={{ fontSize:16, fontWeight:900, color:c }}>{v}</div>
                        <div style={{ fontSize:10, color:'var(--atx2)', marginTop:2 }}>{l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <button className="a-btn a-btn-sm a-btn-sec" style={{ flex:1 }} onClick={()=>openEdit(o)}>✏️ Edit</button>
                    <button className="a-btn a-btn-sm a-btn-danger" onClick={()=>setDelId(o.id)}>🗑</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )
      }

      <Modal open={modal} onClose={()=>setModal(false)} title={editId?'Edit Banner':'Create Banner'}
        footer={<><button className="a-btn a-btn-sec" onClick={()=>setModal(false)}>Cancel</button><button className="a-btn a-btn-pri" onClick={save}>💾 Save</button></>}
      >
        <div className="a-form-grid">
          <div className="a-fg full"><label>Banner Name *</label><input className="a-input" value={form.name} onChange={e=>f('name',e.target.value)} /></div>
          <div className="a-fg full"><label>Banner Image URL</label><input className="a-input" value={form.image} onChange={e=>f('image',e.target.value)} placeholder="https://..." /></div>
          <div className="a-fg"><label>Start Date</label><input className="a-input" type="date" value={form.start} onChange={e=>f('start',e.target.value)} /></div>
          <div className="a-fg"><label>End Date</label><input className="a-input" type="date" value={form.end} onChange={e=>f('end',e.target.value)} /></div>
          <div className="a-fg"><label>Redirect Product ID</label><input className="a-input" value={form.redirect_product} onChange={e=>f('redirect_product',e.target.value)} /></div>
          <div className="a-fg"><label>Redirect Category ID</label><input className="a-input" value={form.redirect_category} onChange={e=>f('redirect_category',e.target.value)} /></div>
        </div>
      </Modal>
      <ConfirmModal open={!!delId} onClose={()=>setDelId(null)} onConfirm={del} message="Delete this banner offer? This cannot be undone." />
    </AdminLayout>
  );
}

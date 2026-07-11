import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../layouts/AdminLayout';
import { PageHeader, Modal, ConfirmModal, Empty, Skel } from '../components/AdminUI';
import adminApi from '../services/adminApi';

const MOCK = [
  { id:1, title:'Kharif Season 2025',  image_url:'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&q=80', start_date:'2025-01-01', end_date:'2025-03-31', is_active:true  },
  { id:2, title:'Organic Collection',  image_url:'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&q=80', start_date:'2025-01-10', end_date:'2025-02-28', is_active:true  },
  { id:3, title:'Farm Equipment Sale', image_url:'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80', start_date:'2024-12-01', end_date:'2024-12-31', is_active:false },
];

const EMPTY_FORM = { name:'', image:'', start:'', end:'', redirect_product:'', redirect_category:'' };

export default function AdminOffers() {
  const [offers, setOffers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [statusF, setStatusF] = useState('');
  const [modal, setModal]     = useState(false);
  const [delId, setDelId]     = useState(null);
  const [form, setForm]       = useState(EMPTY_FORM);
  const [editId, setEditId]   = useState(null);
  const [saving, setSaving]   = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await adminApi.getOffers();
      if (res.success) setOffers(res.data || []);
      else throw new Error();
    } catch { setOffers(MOCK); }
    setLoading(false);
  }

  const filtered = offers.filter(o => {
    const name = (o.title || o.name || '').toLowerCase();
    if (search  && !name.includes(search.toLowerCase())) return false;
    if (statusF === 'active'   && !o.is_active) return false;
    if (statusF === 'inactive' &&  o.is_active) return false;
    return true;
  });

  const f = (k, v) => setForm(x => ({ ...x, [k]: v }));

  function openAdd() { setForm(EMPTY_FORM); setEditId(null); setModal(true); }
  function openEdit(o) {
    setForm({ name: o.title||o.name||'', image: o.image_url||o.image||'', start: o.start_date||o.start||'', end: o.end_date||o.end||'', redirect_product:'', redirect_category:'' });
    setEditId(o.id); setModal(true);
  }

  async function save() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editId) await adminApi.updateOffer(editId, form);
      else        await adminApi.createOffer(form);
      await load();
    } catch {
      if (editId) setOffers(os => os.map(o => o.id === editId ? { ...o, title: form.name, image_url: form.image, start_date: form.start, end_date: form.end } : o));
      else        setOffers(os => [...os, { id: Date.now(), title: form.name, image_url: form.image, start_date: form.start, end_date: form.end, is_active: true }]);
    }
    setSaving(false); setModal(false);
  }

  async function del() {
    try { await adminApi.deleteOffer(delId); } catch {}
    setOffers(os => os.filter(o => o.id !== delId));
  }

  const isExpired = (o) => o.end_date && new Date(o.end_date) < new Date();

  return (
    <AdminLayout>
      <PageHeader title="Offers & Banners" sub={`${offers.length} total banners`}
        actions={<button className="a-btn a-btn-pri" onClick={openAdd}>+ Create Banner</button>}
      />

      {/* Filter bar */}
      <div className="a-filter-bar" style={{ marginBottom:20 }}>
        <input className="a-input" placeholder="🔍 Search banners..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ maxWidth:260 }} />
        <select className="a-input a-select" style={{ maxWidth:150 }} value={statusF}
          onChange={e => setStatusF(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">✅ Active</option>
          <option value="inactive">⛔ Inactive</option>
        </select>
        {(search || statusF) && (
          <button className="a-btn a-btn-sm a-btn-sec" onClick={() => { setSearch(''); setStatusF(''); }}>✕ Clear</button>
        )}
      </div>

      {loading
        ? <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:20 }}>
            {[0,1,2].map(i => <div key={i} className="a-card"><Skel h={160} r={13} /><div style={{ padding:16 }}><Skel h={18} /><Skel h={14} w="60%" /></div></div>)}
          </div>
        : filtered.length === 0
        ? <div className="a-card a-card-p"><Empty icon="🏷️" title="No banners found" sub="Create your first promotional banner" /></div>
        : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:20 }}>
            {filtered.map((o, i) => {
              const expired = isExpired(o);
              const active  = o.is_active && !expired;
              const title   = o.title || o.name || 'Untitled';
              const img     = o.image_url || o.image || '';
              const start   = o.start_date || o.start || '';
              const end     = o.end_date   || o.end   || '';
              return (
                <motion.div key={o.id} className="a-card" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}>
                  {/* Banner image */}
                  <div style={{ position:'relative', height:150, borderRadius:'13px 13px 0 0', overflow:'hidden', background:'#e8f5e9' }}>
                    {img
                      ? <img src={img} alt={title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:48 }}>🏷️</div>
                    }
                    <div style={{ position:'absolute', inset:0, background:'linear-gradient(0deg,rgba(0,0,0,0.5) 0%,transparent 55%)' }} />
                    <div style={{ position:'absolute', bottom:10, left:14, color:'white', fontWeight:800, fontSize:15 }}>{title}</div>
                    <span style={{ position:'absolute', top:10, right:10, fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20,
                      background: active ? '#16a34a' : expired ? '#64748b' : '#dc2626', color:'white' }}>
                      {active ? 'Active' : expired ? 'Expired' : 'Inactive'}
                    </span>
                  </div>

                  <div className="a-card-p">
                    {/* Dates */}
                    <div style={{ fontSize:12, color:'var(--atx2)', marginBottom:12, display:'flex', alignItems:'center', gap:6 }}>
                      📅 {start || '—'} → {end || '—'}
                      {expired && <span style={{ fontSize:11, color:'#dc2626', fontWeight:700 }}>· Expired</span>}
                    </div>

                    {/* Actions */}
                    <div style={{ display:'flex', gap:8 }}>
                      <button className="a-btn a-btn-sm a-btn-sec" style={{ flex:1 }} onClick={() => openEdit(o)}>✏️ Edit</button>
                      <button className="a-btn a-btn-sm a-btn-danger" onClick={() => setDelId(o.id)}>🗑</button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )
      }

      {/* Add/Edit Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Banner' : 'Create Banner'}
        footer={
          <>
            <button className="a-btn a-btn-sec" onClick={() => setModal(false)}>Cancel</button>
            <button className="a-btn a-btn-pri" onClick={save} disabled={saving}>{saving ? '⏳ Saving...' : '💾 Save'}</button>
          </>
        }
      >
        <div className="a-form-grid">
          <div className="a-fg full"><label>Banner Name *</label><input className="a-input" value={form.name} onChange={e => f('name', e.target.value)} placeholder="e.g. Kharif Season Sale" /></div>
          <div className="a-fg full">
            <label>Banner Image URL</label>
            <input className="a-input" value={form.image} onChange={e => f('image', e.target.value)} placeholder="https://..." />
            {form.image && <img src={form.image} alt="preview" style={{ marginTop:8, width:'100%', height:100, objectFit:'cover', borderRadius:8 }} onError={e => e.target.style.display='none'} />}
          </div>
          <div className="a-fg"><label>Start Date</label><input className="a-input" type="date" value={form.start} onChange={e => f('start', e.target.value)} /></div>
          <div className="a-fg"><label>End Date</label><input className="a-input" type="date" value={form.end} onChange={e => f('end', e.target.value)} /></div>
          <div className="a-fg"><label>Redirect Product ID</label><input className="a-input" value={form.redirect_product} onChange={e => f('redirect_product', e.target.value)} placeholder="Optional" /></div>
          <div className="a-fg"><label>Redirect Category ID</label><input className="a-input" value={form.redirect_category} onChange={e => f('redirect_category', e.target.value)} placeholder="Optional" /></div>
        </div>
      </Modal>

      <ConfirmModal open={!!delId} onClose={() => setDelId(null)} onConfirm={del} message="Delete this banner? This cannot be undone." />
    </AdminLayout>
  );
}

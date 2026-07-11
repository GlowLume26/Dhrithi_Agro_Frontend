import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../layouts/AdminLayout';
import { PageHeader, Modal, ConfirmModal, Empty, Skel } from '../components/AdminUI';
import adminApi from '../services/adminApi';

const EMPTY_FORM = { name: '', icon: '📦', image_url: '', sort_order: 0, is_featured: false, is_active: true, parent_id: '' };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [expanded, setExpanded]     = useState({});   // { [parentId]: true/false }
  const [modalOpen, setModalOpen]   = useState(false);
  const [editItem, setEditItem]     = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);
  const [err, setErr]               = useState('');
  const [confirmId, setConfirmId]   = useState(null);

  const load = () => {
    setLoading(true);
    adminApi.getCategories().then(res => {
      if (res.success) setCategories(res.data || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const parents = categories.filter(c => !c.parent_id);
  const subs    = categories.filter(c => !!c.parent_id);

  // search filters both parents and subs by name
  const q = search.toLowerCase();
  const matchedSubs     = q ? subs.filter(s => s.name.toLowerCase().includes(q)) : subs;
  const matchedParentIds = new Set(matchedSubs.map(s => s.parent_id));
  const visibleParents  = q
    ? parents.filter(p => p.name.toLowerCase().includes(q) || matchedParentIds.has(p.id))
    : parents;

  const subsByParent = subs.reduce((acc, s) => {
    (acc[s.parent_id] = acc[s.parent_id] || []).push(s);
    return acc;
  }, {});

  // auto-expand parents that have matched subs when searching
  const effectiveExpanded = q
    ? parents.reduce((a, p) => ({ ...a, [p.id]: matchedParentIds.has(p.id) || !!expanded[p.id] }), {})
    : expanded;

  const toggleExpand = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }));

  function openAdd(parentId = '') {
    setEditItem(null);
    setForm({ ...EMPTY_FORM, parent_id: parentId });
    setErr(''); setModalOpen(true);
  }

  function openEdit(cat) {
    setEditItem(cat);
    setForm({
      name: cat.name, icon: cat.icon || '📦', image_url: cat.image_url || '',
      sort_order: cat.sort_order || 0, is_featured: !!cat.is_featured,
      is_active: cat.is_active !== false, parent_id: cat.parent_id || ''
    });
    setErr(''); setModalOpen(true);
  }

  async function save() {
    if (!form.name.trim()) { setErr('Category name is required.'); return; }
    setSaving(true); setErr('');
    const payload = { ...form, parent_id: form.parent_id || null, sort_order: Number(form.sort_order) || 0 };
    const res = editItem
      ? await adminApi.updateCategory(editItem.id, payload)
      : await adminApi.createCategory(payload);
    if (res.success) {
      setModalOpen(false);
      if (payload.parent_id) setExpanded(e => ({ ...e, [payload.parent_id]: true }));
      load();
    } else setErr(res.message || 'Failed to save.');
    setSaving(false);
  }

  async function doDelete(id) { await adminApi.deleteCategory(id); load(); }

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const Badge = ({ active }) => (
    <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:6,
      background: active ? '#f0fdf4' : '#fef2f2', color: active ? '#15803d' : '#dc2626' }}>
      {active ? 'Active' : 'Inactive'}
    </span>
  );

  return (
    <AdminLayout>
      <PageHeader
        title="Categories"
        sub={`${parents.length} categories · ${subs.length} subcategories`}
        actions={
          <>
            <button className="a-btn a-btn-sec" onClick={() => openAdd('')}>+ Category</button>
            <button className="a-btn a-btn-pri" onClick={() => setExpanded(parents.reduce((a,p)=>({...a,[p.id]:true}),{}))}>Expand All</button>
          </>
        }
      />

      {/* Search bar */}
      <div style={{ marginBottom:16 }}>
        <input className="a-input" placeholder="🔍 Search categories and subcategories..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ maxWidth:320 }} />
        {search && <button className="a-btn a-btn-sm a-btn-sec" style={{ marginLeft:8 }} onClick={() => setSearch('')}>✕ Clear</button>}
      </div>

      <motion.div className="a-card" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}>
        {loading
          ? [0,1,2,3].map(i => <div key={i} style={{ padding:'14px 20px', borderBottom:'1px solid var(--abord)' }}><Skel h={20} /></div>)
          : visibleParents.length === 0
          ? <Empty icon="🗂️" title="No categories match your search" />
          : visibleParents.map((cat, pi) => {
              const children = subsByParent[cat.id] || [];
              const isOpen   = !!effectiveExpanded[cat.id];
              const filteredChildren = q ? children.filter(s => s.name.toLowerCase().includes(q) || matchedParentIds.has(cat.id) && !q) : children;
              return (
                <div key={cat.id} style={{ borderBottom:'1px solid var(--abord)' }}>
                  {/* PARENT ROW */}
                  <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 20px',
                    background: isOpen ? 'var(--ab3)' : 'transparent', transition:'background 0.2s' }}>

                    {/* Expand toggle */}
                    <button onClick={() => toggleExpand(cat.id)}
                      style={{ width:26, height:26, borderRadius:6, border:'1px solid var(--abord)',
                        background:'var(--ab)', cursor:'pointer', fontSize:12, color:'var(--atx2)',
                        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                        transition:'transform 0.2s', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                      ›
                    </button>

                    <span style={{ fontSize:22, width:32, textAlign:'center' }}>{cat.icon || '📦'}</span>

                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:14, color:'var(--atx)' }}>{cat.name}</div>
                      <div style={{ fontSize:11, color:'var(--atx3)', marginTop:2 }}>
                        {children.length} subcategory{children.length !== 1 ? 'ies' : 'y'} · Sort: {cat.sort_order ?? 0}
                        {cat.is_featured ? ' · ⭐ Featured' : ''}
                      </div>
                    </div>

                    <Badge active={cat.is_active} />

                    <div style={{ display:'flex', gap:6 }}>
                      <button className="a-btn a-btn-sm a-btn-sec" onClick={() => openAdd(cat.id)}>+ Sub</button>
                      <button className="a-btn a-btn-sm a-btn-sec" onClick={() => openEdit(cat)}>✏️</button>
                      <button className="a-btn a-btn-sm a-btn-danger" onClick={() => setConfirmId(cat.id)}>🗑</button>
                    </div>
                  </div>

                  {/* SUBCATEGORY ROWS */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
                        exit={{ height:0, opacity:0 }} transition={{ duration:0.22 }}
                        style={{ overflow:'hidden' }}
                      >
                        {children.length === 0
                          ? (
                            <div style={{ padding:'10px 20px 10px 72px', fontSize:13, color:'var(--atx3)', fontStyle:'italic' }}>
                              No subcategories — <span style={{ color:'var(--apri)', cursor:'pointer', textDecoration:'underline' }} onClick={() => openAdd(cat.id)}>add one</span>
                            </div>
                          )
                          : (q ? children.filter(s => s.name.toLowerCase().includes(q) || !matchedParentIds.has(cat.id)) : children).map(sub => (
                            <div key={sub.id} style={{ display:'flex', alignItems:'center', gap:12,
                              padding:'9px 20px 9px 72px', borderTop:'1px solid var(--abord)',
                              background:'var(--ab3)' }}>
                              <span style={{ fontSize:18, width:28, textAlign:'center' }}>{sub.icon || '📂'}</span>
                              <div style={{ flex:1 }}>
                                <div style={{ fontWeight:600, fontSize:13, color:'var(--atx)' }}>{sub.name}</div>
                                <div style={{ fontSize:11, color:'var(--atx3)', marginTop:1 }}>Sort: {sub.sort_order ?? 0}{sub.is_featured ? ' · ⭐' : ''}</div>
                              </div>
                              <Badge active={sub.is_active} />
                              <div style={{ display:'flex', gap:6 }}>
                                <button className="a-btn a-btn-sm a-btn-sec" onClick={() => openEdit(sub)}>✏️</button>
                                <button className="a-btn a-btn-sm a-btn-danger" onClick={() => setConfirmId(sub.id)}>🗑</button>
                              </div>
                            </div>
                          ))
                        }
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
        }
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
        {err && <div style={{ background:'#fef2f2', color:'#dc2626', padding:'10px 14px', borderRadius:8, fontSize:13, marginBottom:14 }}>{err}</div>}

        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div className="a-form-group">
            <label className="a-label">Type</label>
            <select className="a-input" value={form.parent_id} onChange={e => { f('parent_id', e.target.value); }}>
              <option value="">Parent Category</option>
              {parents.filter(p => p.id !== editItem?.id).map(p => (
                <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'72px 1fr', gap:12 }}>
            <div className="a-form-group">
              <label className="a-label">Icon</label>
              <input className="a-input" style={{ textAlign:'center', fontSize:22 }} value={form.icon} onChange={e => f('icon', e.target.value)} maxLength={4} />
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

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
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

          <label style={{ display:'flex', alignItems:'center', gap:10, fontSize:14, color:'var(--atx)', cursor:'pointer' }}>
            <input type="checkbox" checked={form.is_featured} onChange={e => f('is_featured', e.target.checked)} style={{ accentColor:'#2e7d32', width:16, height:16 }} />
            ⭐ Mark as Featured
          </label>
        </div>
      </Modal>

      <ConfirmModal
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={() => doDelete(confirmId)}
        message="This will deactivate the category. Subcategories will remain but won't be visible."
      />
    </AdminLayout>
  );
}

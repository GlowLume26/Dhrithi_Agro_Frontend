import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../layouts/AdminLayout';
import { PageHeader, Modal, ConfirmModal, Skel, Empty, RowActions } from '../components/AdminUI';
import adminApi from '../services/adminApi';
import { compressAndUpload } from '../utils/imageUpload';

const EMPTY = { title: '', subtitle: '', image_url: '', product_id: '', link_url: '', is_active: true, sort_order: 0 };

export default function AdminBanners() {
  const [banners, setBanners]   = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [form, setForm]         = useState(EMPTY);
  const [editId, setEditId]     = useState(null);
  const [delId, setDelId]       = useState(null);
  const [saving, setSaving]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState('');
  const fileRef = useRef();

  useEffect(() => { load(); loadProducts(); }, []);

  async function load() {
    setLoading(true);
    try {
      const r = await adminApi.getOffers();
      if (r.success) setBanners(r.data ?? []);
    } catch { setBanners([]); }
    setLoading(false);
  }

  async function loadProducts() {
    try {
      const r = await adminApi.getProducts({ limit: 200 });
      if (r.success) setProducts(r.data ?? []);
    } catch {}
  }

  function openAdd() { setForm(EMPTY); setEditId(null); setUploadErr(''); setModal(true); }
  function openEdit(b) {
    // Try to extract product_id from redirect_url like /product/UUID
    const match = (b.redirect_url || b.link_url || '').match(/\/product\/([a-f0-9-]{36})/i);
    setForm({
      title:      b.title || b.name || '',
      subtitle:   b.subtitle || '',
      image_url:  b.image_url || b.image || '',
      product_id: match ? match[1] : '',
      link_url:   (!match && (b.redirect_url || b.link_url)) ? (b.redirect_url || b.link_url) : '',
      is_active:  b.is_active ?? true,
      sort_order: b.sort_order || 0,
    });
    setEditId(b.id); setUploadErr(''); setModal(true);
  }

  const f = (k, v) => setForm(x => ({ ...x, [k]: v }));

  async function handleImageFile(file) {
    if (!file) return;
    setUploading(true); setUploadErr('');
    try {
      const url = await compressAndUpload(file, 'banners');
      f('image_url', url);
    } catch (e) {
      setUploadErr(e.message || 'Upload failed');
    }
    setUploading(false);
  }

  async function save() {
    if (!form.image_url) return setUploadErr('Please add a banner image');
    setSaving(true);
    try {
      const redirect = form.product_id
        ? `/product/${form.product_id}`
        : (form.link_url || '');
      const payload = {
        name:         form.title,
        title:        form.title,
        subtitle:     form.subtitle,
        image:        form.image_url,
        image_url:    form.image_url,
        redirect_url: redirect,
        link_url:     redirect,
        product_id:   form.product_id || null,
        is_active:    form.is_active,
        sort_order:   Number(form.sort_order) || 0,
      };
      if (editId) await adminApi.updateOffer(editId, payload);
      else await adminApi.createOffer(payload);
      setModal(false); load();
    } catch {}
    setSaving(false);
  }

  async function toggleActive(b) {
    await adminApi.updateOffer(b.id, { is_active: !b.is_active, name: b.name || b.title }).catch(() => {});
    load();
  }

  // Resolve product name from product_id stored in redirect_url
  function getProductName(b) {
    const match = (b.redirect_url || b.link_url || '').match(/\/product\/([a-f0-9-]{36})/i);
    if (!match) return b.redirect_url || b.link_url || '—';
    const prod = products.find(p => p.id === match[1]);
    return prod ? `🔗 ${prod.name}` : `🔗 Product`;
  }

  return (
    <AdminLayout>
      <PageHeader title="Banners" sub={`${banners.length} banners`}
        actions={<button className="a-btn a-btn-pri" onClick={openAdd}>+ Add Banner</button>} />

      <div className="a-card">
        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Preview</th>
                <th>Title</th>
                <th className="hide-mobile">Links To</th>
                <th className="hide-mobile">Order</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? [0,1,2].map(i => <tr key={i}><td colSpan={7}><Skel h={56}/></td></tr>)
                : banners.length === 0
                ? <tr><td colSpan={7}><Empty icon="🖼️" title="No banners yet — add your first banner" /></td></tr>
                : banners.map((b, i) => (
                  <motion.tr key={b.id} initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.04 }}>
                    <td style={{ color:'var(--atx3)', fontSize:12, textAlign:'center' }}>{i+1}</td>
                    <td>
                      {(b.image_url || b.image)
                        ? <img src={b.image_url || b.image} alt=""
                            style={{ width:100, height:52, objectFit:'cover', borderRadius:8, border:'1px solid var(--abord)', display:'block' }} />
                        : <div style={{ width:100, height:52, background:'var(--ab3)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>🖼️</div>
                      }
                    </td>
                    <td>
                      <div style={{ fontWeight:700 }}>{b.title || b.name || '—'}</div>
                      {b.subtitle && <div style={{ fontSize:11, color:'var(--atx3)' }}>{b.subtitle}</div>}
                    </td>
                    <td className="hide-mobile" style={{ fontSize:12, color:'var(--apri)', maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {getProductName(b)}
                    </td>
                    <td className="hide-mobile" style={{ textAlign:'center', fontSize:13 }}>{b.sort_order ?? 0}</td>
                    <td>
                      <button onClick={() => toggleActive(b)}
                        style={{ width:38, height:22, borderRadius:11, border:'none', cursor:'pointer', position:'relative',
                          background: b.is_active ? '#2e7d32' : '#cbd5e1', transition:'background 0.2s', flexShrink:0 }}>
                        <span style={{ position:'absolute', top:3, left: b.is_active ? 18 : 3, width:16, height:16,
                          borderRadius:'50%', background:'white', transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }} />
                      </button>
                    </td>
                    <td><RowActions onEdit={() => openEdit(b)} onDelete={() => setDelId(b.id)} /></td>
                  </motion.tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Banner' : 'Add Banner'}
        footer={
          <>
            <button className="a-btn a-btn-sec" onClick={() => setModal(false)}>Cancel</button>
            <button className="a-btn a-btn-pri" onClick={save} disabled={saving || uploading}>
              {saving ? '⏳ Saving...' : '💾 Save Banner'}
            </button>
          </>
        }>
        <div className="a-form-grid">

          {/* IMAGE UPLOAD */}
          <div className="a-fg full">
            <label>Banner Image *</label>
            {/* Live preview */}
            {form.image_url && (
              <div style={{ marginBottom:10, borderRadius:10, overflow:'hidden', border:'1px solid var(--abord)', position:'relative' }}>
                <img src={form.image_url} alt="preview"
                  style={{ width:'100%', height:160, objectFit:'cover', display:'block' }} />
                <button onClick={() => f('image_url', '')}
                  style={{ position:'absolute', top:8, right:8, background:'rgba(0,0,0,0.6)', color:'white',
                    border:'none', borderRadius:'50%', width:28, height:28, cursor:'pointer', fontSize:14, lineHeight:'28px' }}>
                  ✕
                </button>
              </div>
            )}
            {/* Upload area */}
            {!form.image_url && (
              <div onClick={() => fileRef.current?.click()}
                style={{ border:'2px dashed var(--abord)', borderRadius:10, padding:'28px 20px', textAlign:'center',
                  cursor:'pointer', background:'var(--ab3)', transition:'border-color 0.2s' }}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); handleImageFile(e.dataTransfer.files[0]); }}>
                <div style={{ fontSize:36, marginBottom:8 }}>🖼️</div>
                <div style={{ fontWeight:700, color:'var(--atx)', marginBottom:4 }}>
                  {uploading ? '⏳ Uploading...' : 'Click or drag & drop image'}
                </div>
                <div style={{ fontSize:12, color:'var(--atx3)' }}>JPG, PNG, WebP — recommended 1200×400px</div>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }}
              onChange={e => handleImageFile(e.target.files[0])} />
            {/* Or paste URL */}
            <input className="a-input" placeholder="Or paste image URL directly..."
              value={form.image_url} onChange={e => f('image_url', e.target.value)}
              style={{ marginTop:8 }} />
            {uploadErr && <div style={{ color:'#dc2626', fontSize:12, marginTop:4 }}>⚠️ {uploadErr}</div>}
          </div>

          <div className="a-fg full"><label>Banner Title</label>
            <input className="a-input" placeholder="e.g. Summer Sale — 40% Off Seeds" value={form.title} onChange={e => f('title', e.target.value)} />
          </div>
          <div className="a-fg full"><label>Subtitle (optional)</label>
            <input className="a-input" placeholder="Short description shown on banner" value={form.subtitle} onChange={e => f('subtitle', e.target.value)} />
          </div>

          {/* PRODUCT LINK */}
          <div className="a-fg full">
            <label>🔗 Link to Product (click on banner → goes to product page)</label>
            <select className="a-input a-select" value={form.product_id}
              onChange={e => { f('product_id', e.target.value); if (e.target.value) f('link_url', ''); }}>
              <option value="">— No product link —</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {form.product_id && (
              <div style={{ marginTop:6, fontSize:12, color:'#2e7d32', fontWeight:600 }}>
                ✅ Banner will link to: <code style={{ background:'#f0fdf4', padding:'2px 6px', borderRadius:4 }}>/product/{form.product_id}</code>
              </div>
            )}
          </div>

          {/* CUSTOM URL — only if no product selected */}
          {!form.product_id && (
            <div className="a-fg full">
              <label>Or Custom URL (if no product selected)</label>
              <input className="a-input" placeholder="/categories or https://..." value={form.link_url} onChange={e => f('link_url', e.target.value)} />
            </div>
          )}

          <div className="a-fg">
            <label>Sort Order</label>
            <input className="a-input" type="number" min={0} value={form.sort_order} onChange={e => f('sort_order', e.target.value)} />
          </div>

          <div className="a-fg" style={{ display:'flex', alignItems:'center', gap:10, paddingTop:22 }}>
            <label style={{ margin:0 }}>Active</label>
            <button type="button" onClick={() => f('is_active', !form.is_active)}
              style={{ width:42, height:24, borderRadius:12, border:'none', cursor:'pointer', position:'relative',
                background: form.is_active ? '#2e7d32' : '#cbd5e1', transition:'background 0.2s', flexShrink:0 }}>
              <span style={{ position:'absolute', top:3, left: form.is_active ? 20 : 3, width:18, height:18,
                borderRadius:'50%', background:'white', transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }} />
            </button>
            <span style={{ fontSize:12, color:'var(--atx3)' }}>{form.is_active ? 'Visible on homepage' : 'Hidden'}</span>
          </div>

        </div>
      </Modal>

      <ConfirmModal open={!!delId} onClose={() => setDelId(null)}
        onConfirm={async () => { await adminApi.deleteOffer(delId).catch(() => {}); setDelId(null); load(); }}
        message="Delete this banner? It will be removed from the homepage." />
    </AdminLayout>
  );
}

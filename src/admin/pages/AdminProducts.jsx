import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../layouts/AdminLayout';
import { PageHeader, Modal, ConfirmModal, Pagination, RowActions, Skel, Empty } from '../components/AdminUI';
import adminApi from '../services/adminApi';

const FALLBACK = 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=200&q=80';

function genCode() {
  return 'PRD-' + Date.now().toString(36).toUpperCase().slice(-6) + Math.random().toString(36).slice(2,5).toUpperCase();
}

const EMPTY_FORM = { name:'', vendor_id:'', category_id:'', subcategory_id:'', brand:'', sku:'', product_code:'', selling_price:'', mrp:'', stock_qty:'', description:'', is_active:true };

export default function AdminProducts() {
  const [products, setProducts]     = useState([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(1);
  const [limit, setLimit]           = useState(10);
  const [search, setSearch]         = useState('');
  const [filterCat, setFilterCat]   = useState('');
  const [filterSub, setFilterSub]   = useState('');
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors]       = useState([]);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [variants, setVariants]     = useState([{ qty:'', price:'' }]);
  const [images, setImages]         = useState([]);
  const [editId, setEditId]         = useState(null);
  const [modal, setModal]           = useState(false);
  const [delId, setDelId]           = useState(null);
  const [dragOver, setDragOver]     = useState(false);
  const [saving, setSaving]         = useState(false);
  const [saveErr, setSaveErr]       = useState('');
  const fileRef = useRef();

  const parentCats       = categories.filter(c => !c.parent_id);
  const allSubs          = categories.filter(c => !!c.parent_id);
  const filterSubOptions = filterCat ? allSubs.filter(c => c.parent_id === filterCat) : allSubs;
  const modalSubOptions  = form.category_id ? allSubs.filter(c => c.parent_id === form.category_id) : [];

  useEffect(() => {
    adminApi.getCategories().then(res => { if (res.success) setCategories(res.data || []); });
    adminApi.getVendors({ status: 'approved' }).then(res => { if (res.success) setVendors(res.data || []); });
  }, []);

  useEffect(() => { load(); }, [page, limit, search, filterCat, filterSub]);

  async function load() {
    setLoading(true);
    try {
      const params = { page, limit, search };
      if (filterSub)      params.category_id = filterSub;
      else if (filterCat) params.category_id = filterCat;
      const res = await adminApi.getProducts(params);
      if (res.success) { setProducts(res.data); setTotal(res.meta?.total || 0); }
    } catch {
      setProducts(MOCK_PRODUCTS.slice((page-1)*limit, page*limit));
      setTotal(MOCK_PRODUCTS.length);
    }
    setLoading(false);
  }

  function openAdd() {
    setForm({ ...EMPTY_FORM, product_code: genCode() });
    setVariants([{qty:'',price:''}]); setImages([]); setEditId(null); setSaveErr(''); setModal(true);
  }

  function openEdit(p) {
    // p.category_id is the subcategory (leaf). Find its parent to pre-fill the category dropdown.
    const sub = categories.find(c => c.id === p.category_id);
    const parentId = sub?.parent_id || '';
    setForm({
      name: p.name, vendor_id: p.vendor_id||'',
      category_id: parentId || p.category_id || '',
      subcategory_id: parentId ? (p.category_id || '') : '',
      brand: p.brand_name||'', sku: p.sku||'', product_code: p.product_code||p.sku||'',
      selling_price: p.selling_price, mrp: p.mrp||'', stock_qty: p.stock_qty,
      description: p.description||'', is_active: p.is_active !== false
    });
    setVariants(p.variants||[{qty:'',price:''}]); setImages(p.images||[]); setEditId(p.id); setSaveErr(''); setModal(true);
  }

  async function save() {
    setSaveErr('');
    if (!form.name.trim())        return setSaveErr('Product name is required');
    if (!form.vendor_id)          return setSaveErr('Please select a vendor');
    if (!form.selling_price)      return setSaveErr('Selling price is required');
    if (!form.mrp)                return setSaveErr('MRP is required');
    if (!form.stock_qty)          return setSaveErr('Stock quantity is required');

    // Use subcategory_id as category_id if selected, else use parent category_id
    const category_id = form.subcategory_id || form.category_id || undefined;

    const payload = {
      name:         form.name,
      vendor_id:    form.vendor_id,
      category_id,
      description:  form.description,
      sku:          form.sku,
      product_code: form.product_code,
      mrp:          Number(form.mrp),
      selling_price: Number(form.selling_price),
      stock_qty:    Number(form.stock_qty),
      is_active:    form.is_active,
    };

    setSaving(true);
    try {
      const res = editId
        ? await adminApi.updateProduct(editId, payload)
        : await adminApi.createProduct(payload);
      if (!res.success) { setSaveErr(res.message || 'Failed to save product'); setSaving(false); return; }
      setModal(false);
      load();
    } catch (e) {
      setSaveErr(e?.response?.data?.message || e?.message || 'Failed to save product');
    }
    setSaving(false);
  }

  async function del() { try { await adminApi.deleteProduct(delId); } catch {} setDelId(null); load(); }

  function handleFiles(files) {
    const newImgs = [...images];
    Array.from(files).slice(0, 8 - images.length).forEach(file => {
      newImgs.push({ url: URL.createObjectURL(file), file });
    });
    setImages(newImgs);
  }

  const f  = (k, v) => setForm(x => ({ ...x, [k]: v }));
  const vf = (i, k, v) => setVariants(vs => vs.map((x, idx) => idx === i ? { ...x, [k]: v } : x));

  return (
    <AdminLayout>
      <PageHeader title="Products" sub={`${total} products total`}
        actions={<button className="a-btn a-btn-pri" onClick={openAdd}>+ Add Product</button>}
      />

      <div className="a-card">
        {/* Filter bar */}
        <div className="a-filter-bar">
          <input className="a-input" placeholder="🔍 Search products..." value={search}
            onChange={e=>{ setSearch(e.target.value); setPage(1); }} style={{ maxWidth:220 }} />

          <select className="a-input a-select" style={{ maxWidth:160 }} value={filterCat}
            onChange={e=>{ setFilterCat(e.target.value); setFilterSub(''); setPage(1); }}>
            <option value="">All Categories</option>
            {parentCats.map(c=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>

          <select className="a-input a-select" style={{ maxWidth:160 }} value={filterSub}
            onChange={e=>{ setFilterSub(e.target.value); setPage(1); }}
            disabled={filterSubOptions.length === 0}>
            <option value="">All Subcategories</option>
            {filterSubOptions.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <select className="a-input a-select" style={{ maxWidth:130 }} value={limit}
            onChange={e=>setLimit(+e.target.value)}>
            {[10,25,50,100].map(n=><option key={n} value={n}>{n} per page</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr>
                <th style={{ width:44 }}>#</th>
                <th>Image</th>
                <th>Product</th>
                <th>Product Code</th>
                <th>Brand</th>
                <th>Category</th>
                <th>Subcategory</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? [0,1,2,3,4].map(i=><tr key={i}><td colSpan={11}><Skel h={44} /></td></tr>)
                : products.length === 0
                ? <tr><td colSpan={11}><Empty icon="📦" title="No products found" /></td></tr>
                : products.map((p,i) => (
                  <motion.tr key={p.id} initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}>
                    <td style={{ color:'var(--atx3)', fontWeight:600, fontSize:13, textAlign:'center' }}>{(page-1)*limit + i + 1}</td>
                    <td><img src={p.primary_image||FALLBACK} alt={p.name} onError={e=>e.target.src=FALLBACK} /></td>
                    <td>
                      <div style={{ fontWeight:700, fontSize:13, color:'var(--atx)', maxWidth:200 }}>{p.name}</div>
                      <div style={{ fontSize:11, color:'var(--atx3)', marginTop:2 }}>SKU: {p.sku||'—'}</div>
                    </td>
                    <td style={{ fontSize:12, fontWeight:600, color:'var(--apri)', fontFamily:'monospace' }}>{p.product_code||'—'}</td>
                    <td style={{ color:'var(--atx2)', fontSize:13 }}>{p.brand_name||'—'}</td>
                    <td style={{ color:'var(--atx2)', fontSize:13 }}>{p.category_name||'—'}</td>
                    <td style={{ color:'var(--atx2)', fontSize:13 }}>{p.subcategory_name||'—'}</td>
                    <td style={{ fontWeight:700, color:'var(--apri)' }}>₹{Number(p.selling_price).toLocaleString('en-IN')}</td>
                    <td>
                      <span style={{ fontWeight:700, color: p.stock_qty<=0?'#dc2626':p.stock_qty<=10?'#ea580c':'var(--atx)' }}>
                        {p.stock_qty ?? 0}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize:12, fontWeight:700, padding:'3px 10px', borderRadius:20,
                        background: p.is_active!==false?'#f0fdf4':'#fef2f2',
                        color: p.is_active!==false?'#16a34a':'#dc2626' }}>
                        {p.is_active!==false?'Active':'Inactive'}
                      </span>
                    </td>
                    <td><RowActions onEdit={()=>openEdit(p)} onDelete={()=>setDelId(p.id)} /></td>
                  </motion.tr>
                ))
              }
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={total} limit={limit} onChange={setPage} />
      </div>

      {/* ADD / EDIT MODAL */}
      <Modal open={modal} onClose={()=>{ setModal(false); setSaveErr(''); }} title={editId?'Edit Product':'Add Product'} large
        footer={<>
          <button className="a-btn a-btn-sec" onClick={()=>{ setModal(false); setSaveErr(''); }}>Cancel</button>
          <button className="a-btn a-btn-pri" onClick={save} disabled={saving}>
            {saving ? '⏳ Saving...' : `💾 ${editId?'Update':'Create'} Product`}
          </button>
        </>}
      >
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          {saveErr && <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:8, padding:'10px 14px', color:'#dc2626', fontSize:13 }}>⚠️ {saveErr}</div>}
          <div className="a-form-grid">
            <div className="a-fg full"><label>Product Name *</label><input className="a-input" value={form.name} onChange={e=>f('name',e.target.value)} placeholder="Enter product name" /></div>

            <div className="a-fg full">
              <label>Vendor *</label>
              <select className="a-input a-select" value={form.vendor_id} onChange={e=>f('vendor_id', e.target.value)}>
                <option value="">Select vendor</option>
                {vendors.map(v=><option key={v.id} value={v.id}>{v.business_name}</option>)}
              </select>
            </div>

            <div className="a-fg">
              <label>Category</label>
              <select className="a-input a-select" value={form.category_id}
                onChange={e=>{ f('category_id', e.target.value); f('subcategory_id',''); }}>
                <option value="">Select category</option>
                {parentCats.map(c=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>

            <div className="a-fg">
              <label>Subcategory</label>
              <select className="a-input a-select" value={form.subcategory_id}
                onChange={e=>f('subcategory_id', e.target.value)}
                disabled={!form.category_id || modalSubOptions.length === 0}>
                <option value="">Select subcategory</option>
                {modalSubOptions.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="a-fg"><label>Brand</label><input className="a-input" value={form.brand} onChange={e=>f('brand',e.target.value)} placeholder="Brand name" /></div>

            <div className="a-fg">
              <label>Product Code</label>
              <div style={{ display:'flex', gap:6 }}>
                <input className="a-input" value={form.product_code} onChange={e=>f('product_code',e.target.value)} placeholder="e.g. PRD-ABC123" style={{ flex:1 }} />
                <button type="button" className="a-btn a-btn-sm a-btn-sec" title="Regenerate" onClick={()=>f('product_code', genCode())}>🔄</button>
              </div>
            </div>

            <div className="a-fg"><label>SKU</label><input className="a-input" value={form.sku} onChange={e=>f('sku',e.target.value)} placeholder="SKU code" /></div>
            <div className="a-fg"><label>Selling Price (₹) *</label><input className="a-input" type="number" value={form.selling_price} onChange={e=>f('selling_price',e.target.value)} /></div>
            <div className="a-fg"><label>MRP (₹)</label><input className="a-input" type="number" value={form.mrp} onChange={e=>f('mrp',e.target.value)} /></div>
            <div className="a-fg"><label>Stock Quantity *</label><input className="a-input" type="number" value={form.stock_qty} onChange={e=>f('stock_qty',e.target.value)} /></div>

            <div className="a-fg">
              <label>Status</label>
              <select className="a-input a-select" value={form.is_active ? 'active' : 'inactive'} onChange={e=>f('is_active', e.target.value==='active')}>
                <option value="active">Active</option><option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="a-fg full"><label>Description</label><textarea className="a-input" rows={3} value={form.description} onChange={e=>f('description',e.target.value)} style={{ resize:'vertical' }} /></div>
          </div>

          {/* Image Upload */}
          <div>
            <label style={{ fontSize:12, fontWeight:700, color:'var(--atx2)', textTransform:'uppercase', letterSpacing:0.7, display:'block', marginBottom:8 }}>Product Images (Min 4)</label>
            <div className={`a-upload-zone${dragOver?' drag':''}`}
              onClick={()=>fileRef.current.click()}
              onDragOver={e=>{e.preventDefault();setDragOver(true)}}
              onDragLeave={()=>setDragOver(false)}
              onDrop={e=>{e.preventDefault();setDragOver(false);handleFiles(e.dataTransfer.files)}}
            >
              <input ref={fileRef} type="file" multiple accept="image/*" style={{ display:'none' }} onChange={e=>handleFiles(e.target.files)} />
              <div style={{ fontSize:32 }}>📸</div>
              <p>Drag & drop or click to upload images</p>
              <p style={{ fontSize:11, color:'var(--atx3)' }}>PNG, JPG up to 5MB each · Max 8 images</p>
            </div>
            {images.length > 0 && (
              <div className="a-img-thumbs">
                {images.map((img, i) => (
                  <div key={i} className="a-img-thumb">
                    <img src={img.url || img.image_url || img} alt={`img-${i}`} />
                    <button className="a-img-thumb-del" onClick={()=>setImages(imgs=>imgs.filter((_,idx)=>idx!==i))}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quantity Variants */}
          <div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
              <label style={{ fontSize:12, fontWeight:700, color:'var(--atx2)', textTransform:'uppercase', letterSpacing:0.7 }}>Quantity-wise Pricing</label>
              <button className="a-btn a-btn-sm a-btn-sec" onClick={()=>setVariants(vs=>[...vs,{qty:'',price:''}])}>+ Add</button>
            </div>
            {variants.map((v,i) => (
              <div key={i} className="a-var-row">
                <input className="a-input" placeholder="Qty (e.g. 250g)" value={v.qty} onChange={e=>vf(i,'qty',e.target.value)} />
                <input className="a-input" placeholder="Price (₹)" type="number" value={v.price} onChange={e=>vf(i,'price',e.target.value)} />
                <button className="a-btn a-btn-sm a-btn-danger" onClick={()=>setVariants(vs=>vs.filter((_,idx)=>idx!==i))} disabled={variants.length===1}>✕</button>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      <ConfirmModal open={!!delId} onClose={()=>setDelId(null)} onConfirm={del} message="Are you sure you want to delete this product? This action cannot be undone." />
    </AdminLayout>
  );
}

const MOCK_PRODUCTS = [
  { id:1, name:'Hybrid Tomato Seeds F1 (10g)', brand_name:'Syngenta', category_name:'Seeds', subcategory_name:'Vegetable Seeds', selling_price:299, stock_qty:48, sku:'SYN-TOM-F1', is_active:true, primary_image:'' },
  { id:2, name:'NPK 19:19:19 Fertilizer 1kg', brand_name:'IFFCO', category_name:'Fertilizers', subcategory_name:'Water Soluble', selling_price:185, stock_qty:8, sku:'IFFCO-NPK', is_active:true, primary_image:'' },
  { id:3, name:'Neem Oil 10000 PPM 1L', brand_name:'Anand Agro', category_name:'Organic', subcategory_name:'Bio Pesticides', selling_price:840, stock_qty:32, sku:'AA-NEEM', is_active:true, primary_image:'' },
  { id:4, name:'Imidacloprid 17.8% SL 500ml', brand_name:'Bayer', category_name:'Pesticides', subcategory_name:'Insecticides', selling_price:420, stock_qty:0, sku:'BAY-IMI', is_active:false, primary_image:'' },
  { id:5, name:'Drip Irrigation Kit 1 Acre', brand_name:'Jain Irrigation', category_name:'Irrigation', subcategory_name:'Drip Systems', selling_price:3499, stock_qty:3, sku:'JI-DRIP', is_active:true, primary_image:'' },
];

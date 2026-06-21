import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../layouts/AdminLayout';
import { PageHeader, Modal, ConfirmModal, Pagination, RowActions, StatusBadge, Skel, Empty } from '../components/AdminUI';
import adminApi from '../services/adminApi';

const FALLBACK = 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=200&q=80';
const EMPTY_FORM = { name:'', category_id:'', brand:'', sku:'', selling_price:'', mrp:'', stock_quantity:'', description:'', status:'active' };

export default function AdminProducts() {
  const [products, setProducts]   = useState([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(1);
  const [limit, setLimit]         = useState(10);
  const [search, setSearch]       = useState('');
  const [form, setForm]           = useState(EMPTY_FORM);
  const [variants, setVariants]   = useState([{ qty:'', price:'' }]);
  const [images, setImages]       = useState([]);
  const [editId, setEditId]       = useState(null);
  const [modal, setModal]         = useState(false);
  const [delId, setDelId]         = useState(null);
  const [dragOver, setDragOver]   = useState(false);
  const fileRef = useRef();

  useEffect(() => { load(); }, [page, limit, search]);

  async function load() {
    setLoading(true);
    try {
      const res = await adminApi.getProducts({ page, limit, search });
      if (res.success) { setProducts(res.data); setTotal(res.meta?.total || 0); }
    } catch {
      // fallback mock
      setProducts(MOCK_PRODUCTS.slice((page-1)*limit, page*limit));
      setTotal(MOCK_PRODUCTS.length);
    }
    setLoading(false);
  }

  function openAdd() { setForm(EMPTY_FORM); setVariants([{qty:'',price:''}]); setImages([]); setEditId(null); setModal(true); }
  function openEdit(p) { setForm({ name:p.name, category_id:p.category_id||'', brand:p.brand_name||'', sku:p.sku||'', selling_price:p.selling_price, mrp:p.mrp||'', stock_quantity:p.stock_quantity, description:p.description||'', status:p.status||'active' }); setVariants(p.variants||[{qty:'',price:''}]); setImages(p.images||[]); setEditId(p.id); setModal(true); }

  async function save() {
    try {
      const payload = { ...form, variants, images };
      if (editId) await adminApi.updateProduct(editId, payload);
      else await adminApi.createProduct(payload);
    } catch {}
    setModal(false); load();
  }

  async function del() { try { await adminApi.deleteProduct(delId); } catch {} setDelId(null); load(); }

  function handleFiles(files) {
    const newImgs = [...images];
    Array.from(files).slice(0, 8 - images.length).forEach(f => {
      const url = URL.createObjectURL(f);
      newImgs.push({ url, file: f });
    });
    setImages(newImgs);
  }

  const f = (k, v) => setForm(x => ({ ...x, [k]: v }));
  const vf = (i, k, v) => setVariants(vs => vs.map((x, idx) => idx === i ? { ...x, [k]: v } : x));

  return (
    <AdminLayout>
      <PageHeader title="Products" sub={`${total} products total`}
        actions={<button className="a-btn a-btn-pri" onClick={openAdd}>+ Add Product</button>}
      />

      <div className="a-card">
        {/* Filter bar */}
        <div className="a-filter-bar">
          <input className="a-input" placeholder="🔍 Search products..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} style={{ maxWidth:280 }} />
          <select className="a-input a-select" style={{ maxWidth:140 }} onChange={e=>setLimit(+e.target.value)} value={limit}>
            {[10,25,50,100].map(n=><option key={n} value={n}>{n} per page</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="a-table-wrap">
          <table className="a-table">
            <thead><tr><th>Image</th><th>Product</th><th>Brand</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {loading
                ? [0,1,2,3,4].map(i=><tr key={i}><td colSpan={8}><Skel h={44} /></td></tr>)
                : products.length === 0
                ? <tr><td colSpan={8}><Empty icon="📦" title="No products found" /></td></tr>
                : products.map((p,i) => (
                  <motion.tr key={p.id} initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}>
                    <td><img src={p.primary_image||FALLBACK} alt={p.name} onError={e=>e.target.src=FALLBACK} /></td>
                    <td>
                      <div style={{ fontWeight:700, fontSize:13, color:'var(--atx)', maxWidth:220 }}>{p.name}</div>
                      <div style={{ fontSize:11, color:'var(--atx3)', marginTop:2 }}>SKU: {p.sku||'—'}</div>
                    </td>
                    <td style={{ color:'var(--atx2)' }}>{p.brand_name||'—'}</td>
                    <td style={{ color:'var(--atx2)' }}>{p.category_name||'—'}</td>
                    <td style={{ fontWeight:700, color:'var(--apri)' }}>₹{Number(p.selling_price).toLocaleString('en-IN')}</td>
                    <td>
                      <span style={{ fontWeight:700, color: p.stock_quantity<=0?'#dc2626':p.stock_quantity<=10?'#ea580c':'var(--atx)' }}>
                        {p.stock_quantity}
                      </span>
                    </td>
                    <td><StatusBadge status={p.status==='active'?'Delivered':'Cancelled'} /></td>
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
      <Modal open={modal} onClose={()=>setModal(false)} title={editId?'Edit Product':'Add Product'} large
        footer={<>
          <button className="a-btn a-btn-sec" onClick={()=>setModal(false)}>Cancel</button>
          <button className="a-btn a-btn-pri" onClick={save}>💾 {editId?'Update':'Create'} Product</button>
        </>}
      >
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <div className="a-form-grid">
            <div className="a-fg full"><label>Product Name *</label><input className="a-input" value={form.name} onChange={e=>f('name',e.target.value)} placeholder="Enter product name" /></div>
            <div className="a-fg"><label>Category</label><input className="a-input" value={form.category_id} onChange={e=>f('category_id',e.target.value)} placeholder="Category" /></div>
            <div className="a-fg"><label>Brand</label><input className="a-input" value={form.brand} onChange={e=>f('brand',e.target.value)} placeholder="Brand name" /></div>
            <div className="a-fg"><label>SKU</label><input className="a-input" value={form.sku} onChange={e=>f('sku',e.target.value)} placeholder="SKU code" /></div>
            <div className="a-fg"><label>Selling Price (₹) *</label><input className="a-input" type="number" value={form.selling_price} onChange={e=>f('selling_price',e.target.value)} /></div>
            <div className="a-fg"><label>Stock Quantity *</label><input className="a-input" type="number" value={form.stock_quantity} onChange={e=>f('stock_quantity',e.target.value)} /></div>
            <div className="a-fg full"><label>Description</label><textarea className="a-input" rows={3} value={form.description} onChange={e=>f('description',e.target.value)} style={{ resize:'vertical' }} /></div>
            <div className="a-fg"><label>Status</label>
              <select className="a-input a-select" value={form.status} onChange={e=>f('status',e.target.value)}>
                <option value="active">Active</option><option value="inactive">Inactive</option>
              </select>
            </div>
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
  { id:1, name:'Hybrid Tomato Seeds F1 (10g)', brand_name:'Syngenta', category_name:'Seeds', selling_price:299, stock_quantity:48, sku:'SYN-TOM-F1', status:'active', primary_image:'' },
  { id:2, name:'NPK 19:19:19 Fertilizer 1kg', brand_name:'IFFCO', category_name:'Fertilizers', selling_price:185, stock_quantity:8, sku:'IFFCO-NPK', status:'active', primary_image:'' },
  { id:3, name:'Neem Oil 10000 PPM 1L', brand_name:'Anand Agro', category_name:'Organic', selling_price:840, stock_quantity:32, sku:'AA-NEEM', status:'active', primary_image:'' },
  { id:4, name:'Imidacloprid 17.8% SL 500ml', brand_name:'Bayer', category_name:'Pesticides', selling_price:420, stock_quantity:0, sku:'BAY-IMI', status:'inactive', primary_image:'' },
  { id:5, name:'Drip Irrigation Kit 1 Acre', brand_name:'Jain Irrigation', category_name:'Irrigation', selling_price:3499, stock_quantity:3, sku:'JI-DRIP', status:'active', primary_image:'' },
  { id:6, name:'Humic Acid 98% 300g', brand_name:'Noble Crop', category_name:'Organic', selling_price:261, stock_quantity:22, sku:'NC-HUM', status:'active', primary_image:'' },
  { id:7, name:'Sprinkler Set 16mm', brand_name:'Netafim', category_name:'Irrigation', selling_price:580, stock_quantity:15, sku:'NF-SPR', status:'active', primary_image:'' },
  { id:8, name:'Garden Trowel Set', brand_name:'Kisan', category_name:'Tools', selling_price:199, stock_quantity:40, sku:'KS-TRW', status:'active', primary_image:'' },
  { id:9, name:'Coco Peat 5kg Brick', brand_name:'AgriGold', category_name:'Organic', selling_price:120, stock_quantity:60, sku:'AG-CP5', status:'active', primary_image:'' },
  { id:10, name:'Bird Food Mix 1kg', brand_name:'PetVet', category_name:'Animal Care', selling_price:95, stock_quantity:25, sku:'PV-BF1', status:'active', primary_image:'' },
];

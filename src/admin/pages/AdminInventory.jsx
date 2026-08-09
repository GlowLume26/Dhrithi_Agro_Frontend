import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../layouts/AdminLayout';
import { PageHeader, Modal, Skel, Empty } from '../components/AdminUI';
import adminApi from '../services/adminApi';

const MOCK = [
  { id:1, name:'Hybrid Tomato Seeds F1', sku:'SYN-TOM',  category_name:'Seeds',       available:48, reserved:12, sold:142, threshold:10 },
  { id:2, name:'NPK 19:19:19 1kg',       sku:'IFFCO-NPK',category_name:'Fertilizers', available:8,  reserved:2,  sold:98,  threshold:10 },
  { id:3, name:'Neem Oil 1L',            sku:'AA-NEEM',  category_name:'Organic',      available:32, reserved:5,  sold:76,  threshold:15 },
  { id:4, name:'Imidacloprid 500ml',     sku:'BAY-IMI',  category_name:'Pesticides',   available:0,  reserved:0,  sold:34,  threshold:5  },
  { id:5, name:'Drip Irrigation Kit',    sku:'JI-DRIP',  category_name:'Irrigation',   available:3,  reserved:1,  sold:24,  threshold:10 },
  { id:6, name:'Humic Acid 300g',        sku:'NC-HUM',   category_name:'Organic',      available:22, reserved:3,  sold:58,  threshold:10 },
  { id:7, name:'Garden Trowel Set',      sku:'KS-TRW',   category_name:'Tools',        available:40, reserved:0,  sold:19,  threshold:5  },
  { id:8, name:'Coco Peat 5kg',          sku:'AG-CP5',   category_name:'Organic',      available:60, reserved:8,  sold:44,  threshold:10 },
];

const stockStatus = (avail, thresh) =>
  avail === 0 ? 'out' : avail <= thresh ? 'low' : 'in';

const STATUS_META = {
  out: { label:'❌ Out of Stock', color:'#dc2626', bg:'#fef2f2' },
  low: { label:'⚠️ Low Stock',   color:'#ea580c', bg:'#fff7ed' },
  in:  { label:'✅ In Stock',     color:'#16a34a', bg:'#f0fdf4' },
};

export default function AdminInventory() {
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [statusF, setStatusF]         = useState('');
  const [categoryF, setCategoryF]     = useState('');
  const [subCategoryF, setSubCategoryF] = useState('');
  const [modal, setModal]         = useState(false);
  const [selItem, setSelItem]     = useState(null);
  const [addQty, setAddQty]       = useState('');

  useEffect(() => { load(); }, [search]);

  async function load() {
    setLoading(true);
    try {
      const res = await adminApi.getInventory({ search });
      if (res.success) setItems(res.data || []);
      else throw new Error();
    } catch {
      setItems(MOCK);
    }
    setLoading(false);
  }

  const categories   = [...new Set(items.map(i => i.category_name).filter(Boolean))].sort();
  const filteredSubs  = categoryF
    ? [...new Set(items.filter(i => i.category_name === categoryF).map(i => i.subcategory_name).filter(Boolean))].sort()
    : [...new Set(items.map(i => i.subcategory_name).filter(Boolean))].sort();

  const filtered = items.filter(i => {
    const s = stockStatus(i.available ?? i.current_stock ?? 0, i.threshold ?? i.low_stock_threshold ?? 10);
    if (statusF      && s !== statusF) return false;
    if (categoryF    && i.category_name !== categoryF) return false;
    if (subCategoryF && i.subcategory_name !== subCategoryF) return false;
    return true;
  });

  const lowStock = items.filter(i => {
    const avail = i.available ?? i.current_stock ?? 0;
    const thresh = i.threshold ?? i.low_stock_threshold ?? 10;
    return avail <= thresh;
  });

  function openRestock(item) { setSelItem(item); setAddQty(''); setModal(true); }

  async function saveRestock() {
    if (!addQty || isNaN(+addQty) || +addQty <= 0) return;
    try { await adminApi.restockProduct(selItem.id, +addQty); } catch {}
    setItems(is => is.map(i => i.id === selItem.id
      ? { ...i, available: (i.available ?? 0) + +addQty, current_stock: (i.current_stock ?? 0) + +addQty }
      : i
    ));
    setModal(false);
  }

  return (
    <AdminLayout>
      <PageHeader title="Inventory" sub="Track stock levels and manage restocking" />

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
          style={{ background:'#fff7ed', border:'1px solid #fed7aa', borderRadius:14, padding:'14px 18px', marginBottom:20, display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:22 }}>⚠️</span>
          <div>
            <div style={{ fontWeight:700, fontSize:14, color:'#9a3412' }}>{lowStock.length} products need restocking</div>
            <div style={{ fontSize:12, color:'#c2410c', marginTop:2 }}>{lowStock.map(i=>i.name).join(' · ')}</div>
          </div>
        </motion.div>
      )}

      <div className="a-card">
        {/* Filter bar */}
        <div className="a-filter-bar">
          <input className="a-input" placeholder="🔍 Search product or SKU..." value={search}
            onChange={e => setSearch(e.target.value)} style={{ maxWidth:240 }} />

          <select className="a-input a-select" style={{ maxWidth:150 }} value={categoryF}
            onChange={e => { setCategoryF(e.target.value); setSubCategoryF(''); }}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select className="a-input a-select" style={{ maxWidth:160 }} value={subCategoryF}
            onChange={e => setSubCategoryF(e.target.value)} disabled={filteredSubs.length === 0}>
            <option value="">All Subcategories</option>
            {filteredSubs.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select className="a-input a-select" style={{ maxWidth:150 }} value={statusF}
            onChange={e => setStatusF(e.target.value)}>
            <option value="">All Status</option>
            <option value="in">✅ In Stock</option>
            <option value="low">⚠️ Low Stock</option>
            <option value="out">❌ Out of Stock</option>
          </select>

          {(statusF || categoryF || subCategoryF) && (
            <button className="a-btn a-btn-sm a-btn-sec" onClick={() => { setStatusF(''); setCategoryF(''); setSubCategoryF(''); }}>✕ Clear</button>
          )}
        </div>

        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr>
                <th style={{ width:44 }}>#</th>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Subcategory</th>
                <th>Available</th>
                <th>Reserved</th>
                <th>Total Sold</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? [0,1,2,3,4].map(i => <tr key={i}><td colSpan={10}><Skel h={40} /></td></tr>)
                : filtered.length === 0
                ? <tr><td colSpan={10}><Empty icon="🗄️" title="No inventory data found" /></td></tr>
                : filtered.map((item, i) => {
                    const avail  = item.available ?? item.current_stock ?? 0;
                    const thresh = item.threshold ?? item.low_stock_threshold ?? 10;
                    const s      = stockStatus(avail, thresh);
                    const meta   = STATUS_META[s];
                    return (
                      <motion.tr key={item.id} initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}>
                        <td style={{ color:'var(--atx3)', fontWeight:600, fontSize:13, textAlign:'center' }}>{i + 1}</td>
                        <td style={{ fontWeight:700, color:'var(--atx)' }}>{item.name}</td>
                        <td style={{ fontSize:12, color:'var(--atx3)', fontFamily:'monospace' }}>{item.sku || '—'}</td>
                        <td style={{ fontSize:13, color:'var(--atx2)' }}>{item.category_name || '—'}</td>
                        <td style={{ fontSize:13, color:'var(--atx2)' }}>{item.subcategory_name || '—'}</td>
                        <td><span style={{ fontWeight:800, fontSize:16, color: meta.color }}>{avail}</span></td>
                        <td style={{ color:'var(--atx2)' }}>{item.reserved ?? 0}</td>
                        <td style={{ fontWeight:600 }}>{item.sold ?? item.sold_count ?? 0}</td>
                        <td>
                          <span style={{ fontSize:12, fontWeight:700, padding:'3px 8px', borderRadius:6,
                            color: meta.color, background: meta.bg }}>
                            {meta.label}
                          </span>
                        </td>
                        <td><button className="a-btn a-btn-sm a-btn-pri" onClick={() => openRestock(item)}>+ Restock</button></td>
                      </motion.tr>
                    );
                  })
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={`Restock: ${selItem?.name}`}
        footer={
          <>
            <button className="a-btn a-btn-sec" onClick={() => setModal(false)}>Cancel</button>
            <button className="a-btn a-btn-pri" onClick={saveRestock}>Add Stock</button>
          </>
        }
      >
        {selItem && (() => {
          const avail = selItem.available ?? selItem.current_stock ?? 0;
          return (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                {[['Current Stock', avail, '#16a34a'], ['Reserved', selItem.reserved ?? 0, '#2563eb'], ['Total Sold', selItem.sold ?? selItem.sold_count ?? 0, '#9333ea']].map(([l,v,c]) => (
                  <div key={l} style={{ background:'var(--ab3)', borderRadius:10, padding:'12px', textAlign:'center' }}>
                    <div style={{ fontSize:22, fontWeight:900, color:c }}>{v}</div>
                    <div style={{ fontSize:11, color:'var(--atx2)', marginTop:2 }}>{l}</div>
                  </div>
                ))}
              </div>
              <div className="a-fg">
                <label>Quantity to Add *</label>
                <input className="a-input" type="number" min="1" value={addQty}
                  onChange={e => setAddQty(e.target.value)} placeholder="Enter quantity" autoFocus />
              </div>
              {addQty && !isNaN(+addQty) && +addQty > 0 && (
                <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, padding:'10px 14px', fontSize:13, color:'#166534' }}>
                  New stock will be: <b>{avail + +addQty} units</b>
                </div>
              )}
            </div>
          );
        })()}
      </Modal>
    </AdminLayout>
  );
}

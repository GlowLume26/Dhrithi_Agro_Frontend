import { useState } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../layouts/AdminLayout';
import { PageHeader, Modal, Pagination, Skel, Empty } from '../components/AdminUI';

const MOCK = [
  { id:1, name:'Hybrid Tomato Seeds F1', sku:'SYN-TOM', available:48, reserved:12, sold:142, threshold:10 },
  { id:2, name:'NPK 19:19:19 1kg',       sku:'IFFCO-NPK', available:8,  reserved:2,  sold:98,  threshold:10 },
  { id:3, name:'Neem Oil 1L',            sku:'AA-NEEM', available:32, reserved:5,  sold:76,  threshold:15 },
  { id:4, name:'Imidacloprid 500ml',     sku:'BAY-IMI', available:0,  reserved:0,  sold:34,  threshold:5  },
  { id:5, name:'Drip Irrigation Kit',    sku:'JI-DRIP', available:3,  reserved:1,  sold:24,  threshold:10 },
  { id:6, name:'Humic Acid 300g',        sku:'NC-HUM', available:22, reserved:3,  sold:58,  threshold:10 },
  { id:7, name:'Garden Trowel Set',      sku:'KS-TRW', available:40, reserved:0,  sold:19,  threshold:5  },
  { id:8, name:'Coco Peat 5kg',          sku:'AG-CP5', available:60, reserved:8,  sold:44,  threshold:10 },
];

export default function AdminInventory() {
  const [items, setItems]     = useState(MOCK);
  const [search, setSearch]   = useState('');
  const [modal, setModal]     = useState(false);
  const [selItem, setSelItem] = useState(null);
  const [addQty, setAddQty]   = useState('');

  const filtered = items.filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase()));
  const lowStock = items.filter(i => i.available <= i.threshold);

  function openRestock(item) { setSelItem(item); setAddQty(''); setModal(true); }
  function saveRestock() {
    if (!addQty || isNaN(+addQty)) return;
    setItems(is => is.map(i => i.id === selItem.id ? { ...i, available: i.available + +addQty } : i));
    setModal(false);
  }

  const stockColor = (avail, thresh) => avail === 0 ? '#dc2626' : avail <= thresh ? '#ea580c' : '#16a34a';
  const stockLabel = (avail, thresh) => avail === 0 ? '❌ Out of Stock' : avail <= thresh ? '⚠️ Low Stock' : '✅ In Stock';

  return (
    <AdminLayout>
      <PageHeader title="Inventory" sub="Track stock levels and manage restocking" />

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
          style={{ background:'#fff7ed', border:'1px solid #fed7aa', borderRadius:14, padding:'14px 18px', marginBottom:20, display:'flex', alignItems:'center', gap:12 }}
        >
          <span style={{ fontSize:22 }}>⚠️</span>
          <div>
            <div style={{ fontWeight:700, fontSize:14, color:'#9a3412' }}>{lowStock.length} products need restocking</div>
            <div style={{ fontSize:12, color:'#c2410c', marginTop:2 }}>{lowStock.map(i=>i.name).join(' · ')}</div>
          </div>
        </motion.div>
      )}

      <div className="a-card">
        <div className="a-filter-bar">
          <input className="a-input" placeholder="🔍 Search by product or SKU..." value={search} onChange={e=>setSearch(e.target.value)} style={{ maxWidth:280 }} />
        </div>
        <div className="a-table-wrap">
          <table className="a-table">
            <thead><tr><th>Product</th><th>SKU</th><th>Available</th><th>Reserved</th><th>Total Sold</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={7}><Empty icon="🗄️" title="No inventory data" /></td></tr>
                : filtered.map((item, i) => (
                  <motion.tr key={item.id} initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}>
                    <td style={{ fontWeight:700 }}>{item.name}</td>
                    <td style={{ fontSize:12, color:'var(--atx3)', fontFamily:'monospace' }}>{item.sku}</td>
                    <td><span style={{ fontWeight:800, fontSize:16, color: stockColor(item.available, item.threshold) }}>{item.available}</span></td>
                    <td style={{ color:'var(--atx2)' }}>{item.reserved}</td>
                    <td style={{ fontWeight:600 }}>{item.sold}</td>
                    <td><span style={{ fontSize:12, fontWeight:700, color: stockColor(item.available, item.threshold) }}>{stockLabel(item.available, item.threshold)}</span></td>
                    <td><button className="a-btn a-btn-sm a-btn-pri" onClick={()=>openRestock(item)}>+ Restock</button></td>
                  </motion.tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={()=>setModal(false)} title={`Restock: ${selItem?.name}`}
        footer={<><button className="a-btn a-btn-sec" onClick={()=>setModal(false)}>Cancel</button><button className="a-btn a-btn-pri" onClick={saveRestock}>Add Stock</button></>}
      >
        {selItem && (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
              {[['Current Stock', selItem.available, '#16a34a'],['Reserved', selItem.reserved, '#2563eb'],['Total Sold', selItem.sold, '#9333ea']].map(([l,v,c])=>(
                <div key={l} style={{ background:'var(--ab3)', borderRadius:10, padding:'12px', textAlign:'center' }}>
                  <div style={{ fontSize:22, fontWeight:900, color:c }}>{v}</div>
                  <div style={{ fontSize:11, color:'var(--atx2)', marginTop:2 }}>{l}</div>
                </div>
              ))}
            </div>
            <div className="a-fg">
              <label>Quantity to Add *</label>
              <input className="a-input" type="number" min="1" value={addQty} onChange={e=>setAddQty(e.target.value)} placeholder="Enter quantity" />
            </div>
            {addQty && !isNaN(+addQty) && (
              <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, padding:'10px 14px', fontSize:13, color:'#166534' }}>
                New stock will be: <b>{selItem.available + +addQty} units</b>
              </div>
            )}
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}

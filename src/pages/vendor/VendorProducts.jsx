import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const INIT_PRODUCTS = [
  { id: 1, img: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=100&q=80', name: 'Hybrid Tomato Seeds F1 (10g)', sku: 'SYN-TOM-F1-10G', cat: 'Seeds',      price: '₹299',   stock: 48, stockCls: 'stock-ok',  status: 'Active'   },
  { id: 2, img: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=100&q=80', name: 'NPK 19:19:19 Fertilizer 1kg',  sku: 'IFFCO-NPK-1KG',  cat: 'Fertilizers', price: '₹185',   stock: 8,  stockCls: 'stock-low', status: 'Active'   },
  { id: 3, img: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=100&q=80', name: 'Neem Oil 10000 PPM 1L',        sku: 'AA-NEEM-1L',     cat: 'Organic',     price: '₹840',   stock: 32, stockCls: 'stock-ok',  status: 'Active'   },
  { id: 4, img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=100&q=80', name: 'Imidacloprid 17.8% SL 500ml',  sku: 'BAY-IMI-500ML',  cat: 'Pesticides',  price: '₹420',   stock: 0,  stockCls: 'stock-out', status: 'Inactive' },
  { id: 5, img: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=100&q=80',   name: 'Drip Irrigation Kit 1 Acre',   sku: 'JI-DRIP-1AC',    cat: 'Irrigation',  price: '₹3,499', stock: 3,  stockCls: 'stock-low', status: 'Active'   },
];

const EMPTY_FORM = { name: '', category: 'Seeds', brand: '', sku: '', mrp: '', selling_price: '', stock: '', unit: 'Piece', description: '', hsn: '', gst: '5%' };

export default function VendorProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState(INIT_PRODUCTS);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  function saveProduct() {
    if (!form.name) { alert('Please enter a product name.'); return; }
    setProducts(p => [...p, { id: Date.now(), img: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=100&q=80', name: form.name, sku: form.sku, cat: form.category, price: '₹' + (form.selling_price || 0), stock: +form.stock || 0, stockCls: +form.stock > 10 ? 'stock-ok' : +form.stock > 0 ? 'stock-low' : 'stock-out', status: 'Active' }]);
    setModal(false); setForm(EMPTY_FORM);
    alert('✅ Product saved successfully!');
  }

  function deleteProduct(id) {
    if (confirm('Delete this product?')) setProducts(p => p.filter(x => x.id !== id));
  }

  const f = (k, v) => setForm(x => ({ ...x, [k]: v }));

  return (
    <div className="dash-layout">
      {/* SIDEBAR */}
      <div className="sidebar" style={{ background: '#1b5e20' }}>
        <div className="sidebar-logo"><h2>🌿 Drithi Agro</h2><span>Vendor Portal</span></div>
        {[['📊','Dashboard',() => navigate('/vendor/dashboard')],['📦','My Products',null,true],['🛒','Orders',null],['📈','Analytics',null],['🏪','Store Settings',null],['💰','Payments',null],['⭐','Reviews',null],['🚪','Logout',() => navigate('/')]].map(([icon, label, fn, active]) => (
          <div key={label} className={'nav-item' + (active ? ' active' : '')} onClick={fn || undefined}><span className="ni">{icon}</span> {label}</div>
        ))}
      </div>

      {/* MAIN */}
      <div className="main-content">
        <div className="toolbar">
          <h1>📦 My Products</h1>
          <button className="add-btn" onClick={() => { setForm(EMPTY_FORM); setModal(true); }}>+ Add New Product</button>
        </div>

        <div className="filter-bar">
          <input type="text" placeholder="🔍 Search products by name or SKU..." style={{ flex: 1, padding: '10px 14px', border: '2px solid #e0e0e0', borderRadius: 10, fontSize: 13, outline: 'none' }} />
          <select style={{ padding: '10px 14px', border: '2px solid #e0e0e0', borderRadius: 10, fontSize: 13, outline: 'none' }}><option>All Categories</option><option>Seeds</option><option>Fertilizers</option><option>Pesticides</option></select>
          <select style={{ padding: '10px 14px', border: '2px solid #e0e0e0', borderRadius: 10, fontSize: 13, outline: 'none' }}><option>All Status</option><option>Active</option><option>Inactive</option></select>
        </div>

        <div className="products-table">
          <div className="table-header">
            <div>Image</div><div>Product</div><div>Category</div><div>Price</div><div>Stock</div><div>Status</div><div>Actions</div>
          </div>
          {products.map(p => (
            <div key={p.id} className="table-row">
              <img className="prod-img" src={p.img} alt={p.name} />
              <div><div className="prod-name">{p.name}</div><div className="prod-sku">SKU: {p.sku}</div></div>
              <div className="prod-cat">{p.cat}</div>
              <div className="prod-price">{p.price}</div>
              <div className={`prod-stock ${p.stockCls}`}>{p.stock} units</div>
              <span className={`badge ${p.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>{p.status}</span>
              <div className="action-btns">
                <button className="act-btn view" title="View">👁</button>
                <button className="act-btn edit" title="Edit" onClick={() => setModal(true)}>✏️</button>
                <button className="act-btn del" title="Delete" onClick={() => deleteProduct(p.id)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {modal && (
        <div className="modal-overlay show">
          <div className="modal-box">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3>➕ Add New Product</h3>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }}>✕</button>
            </div>
            <div className="form-grid">
              <div className="form-group full"><label>Product Name *</label><input type="text" value={form.name} onChange={e => f('name', e.target.value)} placeholder="Enter product name" /></div>
              <div className="form-group"><label>Category *</label>
                <select value={form.category} onChange={e => f('category', e.target.value)}>
                  {['Seeds','Fertilizers','Pesticides','Organic','Irrigation','Farm Tools'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Brand</label><input type="text" value={form.brand} onChange={e => f('brand', e.target.value)} placeholder="Brand name" /></div>
              <div className="form-group"><label>SKU</label><input type="text" value={form.sku} onChange={e => f('sku', e.target.value)} placeholder="Unique product code" /></div>
              <div className="form-group"><label>MRP (₹) *</label><input type="number" value={form.mrp} onChange={e => f('mrp', e.target.value)} placeholder="0.00" /></div>
              <div className="form-group"><label>Selling Price (₹) *</label><input type="number" value={form.selling_price} onChange={e => f('selling_price', e.target.value)} placeholder="0.00" /></div>
              <div className="form-group"><label>Stock Quantity *</label><input type="number" value={form.stock} onChange={e => f('stock', e.target.value)} placeholder="0" /></div>
              <div className="form-group"><label>Unit</label>
                <select value={form.unit} onChange={e => f('unit', e.target.value)}>
                  {['Piece','Kg','Gram','Litre','ML','Set'].map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div className="form-group full"><label>Description *</label><textarea rows={3} value={form.description} onChange={e => f('description', e.target.value)} placeholder="Detailed product description..." style={{ padding: '11px 14px', border: '2px solid #e0e0e0', borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: 'inherit', resize: 'vertical', width: '100%' }} /></div>
              <div className="form-group full">
                <label>Product Images (Max 5)</label>
                <div className="img-upload-area"><div style={{ fontSize: 32, marginBottom: 8 }}>📸</div><p style={{ fontSize: 13, color: '#888' }}>Click to upload product images (JPG/PNG, max 5MB each)</p></div>
              </div>
              <div className="form-group"><label>HSN Code</label><input type="text" value={form.hsn} onChange={e => f('hsn', e.target.value)} placeholder="HSN code for GST" /></div>
              <div className="form-group"><label>GST Rate (%)</label>
                <select value={form.gst} onChange={e => f('gst', e.target.value)}>
                  {['0%','5%','12%','18%','28%'].map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn-save" onClick={saveProduct}>💾 Save Product</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';

const EMPTY_FORM = { name: '', category_id: '', mrp: '', selling_price: '', stock_qty: '', unit: 'Piece', description: '', sku: '', hsn_code: '', gst_rate: '5' };

export default function VendorProducts() {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return; }
    Promise.all([
      api.get('products'),
      api.get('categories'),
    ]).then(([pRes, cRes]) => {
      if (pRes.status === 401) { logout(); navigate('/login'); return; }
      if (pRes.success) setProducts(pRes.data || []);
      if (cRes.success) setCategories(cRes.data || []);
      setLoading(false);
    }).catch(() => { setError('Failed to load products'); setLoading(false); });
  }, [isLoggedIn]);

  async function saveProduct() {
    if (!form.name || !form.category_id || !form.mrp || !form.selling_price || !form.stock_qty) {
      alert('Please fill all required fields.'); return;
    }
    setSaving(true);
    const res = await api.post('products', {
      ...form,
      mrp: parseFloat(form.mrp),
      selling_price: parseFloat(form.selling_price),
      stock_qty: parseInt(form.stock_qty),
      gst_rate: parseFloat(form.gst_rate),
    });
    if (res.success) {
      setModal(false); setForm(EMPTY_FORM);
      const pRes = await api.get('products');
      if (pRes.success) setProducts(pRes.data || []);
    } else {
      alert(res.message || 'Failed to save product.');
    }
    setSaving(false);
  }

  async function deleteProduct(id) {
    if (!confirm('Delete this product?')) return;
    const res = await api.delete('products', { id });
    if (res.success) setProducts(p => p.filter(x => x.id !== id));
    else alert(res.message || 'Failed to delete product.');
  }

  const f = (k, v) => setForm(x => ({ ...x, [k]: v }));

  const NAV = [
    ['📊', 'Dashboard',   () => navigate('/vendor/dashboard'), false],
    ['📦', 'My Products', null,                                 true],
    ['🚪', 'Logout',      () => { logout(); navigate('/'); },  false],
  ];

  return (
    <div className="dash-layout">
      <div className="sidebar" style={{ background: '#1b5e20' }}>
        <div className="sidebar-logo"><h2>🌿 Drithi Agro</h2><span>Vendor Portal</span></div>
        {NAV.map(([icon, label, fn, active]) => (
          <div key={label} className={'nav-item' + (active ? ' active' : '')} onClick={fn || undefined}>
            <span className="ni">{icon}</span> {label}
          </div>
        ))}
      </div>

      <div className="main-content">
        <div className="toolbar">
          <h1>📦 My Products</h1>
          <button className="add-btn" onClick={() => { setForm(EMPTY_FORM); setModal(true); }}>+ Add New Product</button>
        </div>

        {error && <div style={{ color: '#c62828', background: '#ffebee', padding: 12, borderRadius: 10, marginBottom: 16 }}>❌ {error}</div>}

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>⏳ Loading products...</div>
        ) : (
          <div className="products-table">
            <div className="table-header">
              <div>Image</div><div>Product</div><div>Category</div><div>Price</div><div>Stock</div><div>Status</div><div>Actions</div>
            </div>
            {products.length === 0
              ? <div style={{ padding: 40, textAlign: 'center', color: '#aaa' }}>No products yet. Add your first product!</div>
              : products.map(p => (
                <div key={p.id} className="table-row">
                  <img className="prod-img" src={p.primary_image || 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=100&q=80'} alt={p.name} />
                  <div><div className="prod-name">{p.name}</div><div className="prod-sku">SKU: {p.sku || '—'}</div></div>
                  <div className="prod-cat">{p.subcategory_name || p.category_name || '—'}</div>
                  <div className="prod-price">₹{Number(p.selling_price).toLocaleString('en-IN')}</div>
                  <div className={`prod-stock ${p.stock_qty > 10 ? 'stock-ok' : p.stock_qty > 0 ? 'stock-low' : 'stock-out'}`}>{p.stock_qty} units</div>
                  <span className={`badge ${p.is_active ? 'badge-active' : 'badge-inactive'}`}>{p.is_active ? 'Active' : 'Inactive'}</span>
                  <div className="action-btns">
                    <button className="act-btn del" title="Delete" onClick={() => deleteProduct(p.id)}>🗑</button>
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay show">
          <div className="modal-box">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3>➕ Add New Product</h3>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }}>✕</button>
            </div>
            <div className="form-grid">
              <div className="form-group full"><label>Product Name *</label><input type="text" value={form.name} onChange={e => f('name', e.target.value)} /></div>
              <div className="form-group"><label>Category *</label>
                <select value={form.category_id} onChange={e => f('category_id', e.target.value)}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label>SKU</label><input type="text" value={form.sku} onChange={e => f('sku', e.target.value)} /></div>
              <div className="form-group"><label>MRP (₹) *</label><input type="number" value={form.mrp} onChange={e => f('mrp', e.target.value)} /></div>
              <div className="form-group"><label>Selling Price (₹) *</label><input type="number" value={form.selling_price} onChange={e => f('selling_price', e.target.value)} /></div>
              <div className="form-group"><label>Stock Quantity *</label><input type="number" value={form.stock_qty} onChange={e => f('stock_qty', e.target.value)} /></div>
              <div className="form-group"><label>Unit</label>
                <select value={form.unit} onChange={e => f('unit', e.target.value)}>
                  {['Piece','Kg','Gram','Litre','ML','Set'].map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div className="form-group"><label>HSN Code</label><input type="text" value={form.hsn_code} onChange={e => f('hsn_code', e.target.value)} /></div>
              <div className="form-group"><label>GST Rate (%)</label>
                <select value={form.gst_rate} onChange={e => f('gst_rate', e.target.value)}>
                  {['0','5','12','18','28'].map(g => <option key={g} value={g}>{g}%</option>)}
                </select>
              </div>
              <div className="form-group full"><label>Description</label>
                <textarea rows={3} value={form.description} onChange={e => f('description', e.target.value)}
                  style={{ padding: '11px 14px', border: '2px solid #e0e0e0', borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: 'inherit', resize: 'vertical', width: '100%' }} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn-save" disabled={saving} onClick={saveProduct}>{saving ? '⏳ Saving...' : '💾 Save Product'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

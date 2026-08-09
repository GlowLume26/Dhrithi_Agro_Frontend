import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../layouts/AdminLayout';
import { PageHeader, Modal, Pagination, Skel, Empty } from '../components/AdminUI';
import adminApi from '../services/adminApi';

const MOCK = [
  { id:1, customer_code:'CUS-001', first_name:'Ramesh', last_name:'Patil',  mobile:'9876543210', email:'ramesh@mail.com', total_orders:12, total_spent:18540, is_active:true },
  { id:2, customer_code:'CUS-002', first_name:'Sunita', last_name:'Devi',   mobile:'8765432109', email:'sunita@mail.com', total_orders:8,  total_spent:9200,  is_active:true },
  { id:3, customer_code:'CUS-003', first_name:'Krishnamurthy', last_name:'', mobile:'7654321098', email:'krish@mail.com', total_orders:21, total_spent:31000, is_active:true },
  { id:4, customer_code:'CUS-004', first_name:'Mohan', last_name:'Lal',     mobile:'9988776655', email:'mohan@mail.com',  total_orders:5,  total_spent:7400,  is_active:true },
  { id:5, customer_code:'CUS-005', first_name:'Priya', last_name:'Sharma',  mobile:'8877665544', email:'priya@mail.com',  total_orders:3,  total_spent:3100,  is_active:false },
];

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(1);
  const [limit, setLimit]         = useState(10);
  const [search, setSearch]       = useState('');
  const [cityF, setCityF]         = useState('');
  const [detail, setDetail]       = useState(null);
  const [editing, setEditing]     = useState(false);
  const [editForm, setEditForm]   = useState({});
  const [addrPopup, setAddrPopup] = useState(null);

  useEffect(() => { load(); }, [page, limit, search, cityF]);

  async function load() {
    setLoading(true);
    try {
      const res = await adminApi.getCustomers({ page, limit, search, city: cityF });
      if (res.success) { setCustomers(res.data); setTotal(res.meta?.total || res.data?.length || 0); }
    } catch {
      const f = MOCK.filter(c =>
        (!search || `${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase()) || c.mobile.includes(search)) &&
        (!cityF || (c.city || '').toLowerCase() === cityF.toLowerCase())
      );
      setCustomers(f.slice((page - 1) * limit, page * limit));
      setTotal(f.length);
    }
    setLoading(false);
  }

  async function saveEdit() {
    try { await adminApi.updateCustomer(detail.id, editForm); } catch {}
    setCustomers(cs => cs.map(c => c.id === detail.id ? { ...c, ...editForm } : c));
    setDetail(d => ({ ...d, ...editForm }));
    setEditing(false);
  }

  async function toggleActive(customer) {
    const newStatus = !customer.is_active;
    try { await adminApi.toggleCustomerStatus(customer.id, newStatus); } catch {}
    setCustomers(cs => cs.map(c => c.id === customer.id ? { ...c, is_active: newStatus } : c));
    setDetail(d => d ? { ...d, is_active: newStatus } : d);
  }

  function openDetail(c) {
    setDetail(c);
    setEditForm({ first_name: c.first_name, last_name: c.last_name, email: c.email, mobile: c.mobile });
    setEditing(false);
  }

  return (
    <AdminLayout>
      <PageHeader title="Customers" sub={`${total} registered customers`} />

      <div className="a-card">
        <div className="a-filter-bar">
          <input className="a-input" placeholder="🔍 Search name, phone, email..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ maxWidth: 260 }} />
          <input className="a-input" placeholder="🏙️ Filter by city..." value={cityF}
            onChange={e => { setCityF(e.target.value); setPage(1); }} style={{ maxWidth: 180 }} />
          {cityF && <button className="a-btn a-btn-sm a-btn-sec" onClick={()=>{ setCityF(''); setPage(1); }}>✕ Clear</button>}
          <select className="a-input a-select" value={limit} onChange={e => setLimit(+e.target.value)}>
            {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n} per page</option>)}
          </select>
        </div>

        <div className="a-table-wrap">
          <table className="a-table">
            <thead><tr><th style={{ width:44 }}>#</th><th>ID</th><th>Name</th><th>Phone</th><th>Email</th><th>City</th><th>Orders</th><th>Spent</th><th>Action</th></tr></thead>
            <tbody>
              {loading
                ? [0, 1, 2, 3].map(i => <tr key={i}><td colSpan={9}><Skel h={40} /></td></tr>)
                : customers.length === 0
                ? <tr><td colSpan={9}><Empty icon="👥" title="No customers found" /></td></tr>
                : customers.map((c, i) => (
                  <motion.tr key={c.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <td style={{ color:'var(--atx3)', fontWeight:600, fontSize:13, textAlign:'center' }}>{(page-1)*limit + i + 1}</td>
                    <td style={{ fontSize: 12, color: 'var(--atx3)' }}>{c.customer_code}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#2e7d32,#66bb6a)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{c.first_name.charAt(0)}</div>
                        <span style={{ fontWeight: 700 }}>{c.first_name} {c.last_name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--atx2)' }}>📱 {c.mobile}</td>
                    <td style={{ color: 'var(--atx2)', fontSize: 12 }}>{c.email}</td>
                    <td onClick={e => { e.stopPropagation(); const rect = e.currentTarget.getBoundingClientRect(); setAddrPopup({ customer: c, rect }); }}>
                      <span style={{ color:'var(--apri)', cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', gap:4 }}>
                        📍 <span style={{ textDecoration:'underline dotted' }}>{c.city || '—'}</span>
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, textAlign: 'center' }}>{c.total_orders}</td>
                    <td style={{ fontWeight: 700, color: 'var(--apri)' }}>₹{Number(c.total_spent).toLocaleString('en-IN')}</td>
                    <td><button className="a-btn a-btn-sm a-btn-sec" onClick={() => openDetail(c)}>View</button></td>
                  </motion.tr>
                ))
              }
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={total} limit={limit} onChange={setPage} />
      </div>

      {/* ADDRESS POPUP */}
      <AnimatePresence>
        {addrPopup && (
          <>
            <div style={{ position:'fixed', inset:0, zIndex:400 }} onClick={()=>setAddrPopup(null)} />
            <motion.div
              initial={{ opacity:0, y:6, scale:0.96 }} animate={{ opacity:1, y:0, scale:1 }}
              exit={{ opacity:0, y:4, scale:0.96 }} transition={{ duration:0.18 }}
              style={{
                position:'fixed', zIndex:401,
                top: Math.min(addrPopup.rect.bottom + 8, window.innerHeight - 200),
                left: Math.min(addrPopup.rect.left, window.innerWidth - 300),
                background:'var(--ab)', border:'1px solid var(--abord)', borderRadius:12,
                padding:'14px 16px', minWidth:260, boxShadow:'0 8px 32px rgba(0,0,0,0.18)'
              }}
            >
              <div style={{ fontSize:12, fontWeight:700, color:'var(--atx2)', textTransform:'uppercase', letterSpacing:0.7, marginBottom:10 }}>📍 Address</div>
              {(() => {
                const c = addrPopup.customer;
                const city    = c.city || '';
                const state   = c.state || '';
                const district= c.district || '';
                if (!city && !state) return <p style={{ fontSize:13, color:'var(--atx3)' }}>No address on record</p>;
                return (
                  <div style={{ fontSize:13, color:'var(--atx)', lineHeight:1.8 }}>
                    {district && <div>{district}</div>}
                    {(city || state) && <div>{[city, state].filter(Boolean).join(', ')}</div>}
                    {c.mobile && <div style={{ marginTop:6, color:'var(--atx2)' }}>📱 {c.mobile}</div>}
                    {c.email  && <div style={{ color:'var(--atx2)' }}>✉️ {c.email}</div>}
                  </div>
                );
              })()}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Customer Details"
        footer={editing
          ? <><button className="a-btn a-btn-sec" onClick={() => setEditing(false)}>Cancel</button><button className="a-btn a-btn-pri" onClick={saveEdit}>💾 Save</button></>
          : <div style={{ display:'flex', gap:8, width:'100%' }}>
              <button className="a-btn a-btn-sec" style={{ flex:1 }} onClick={() => setEditing(true)}>✏️ Edit</button>
              <button
                className={`a-btn ${detail?.is_active ? 'a-btn-danger' : 'a-btn-pri'}`}
                style={{ flex:1 }}
                onClick={() => toggleActive(detail)}>
                {detail?.is_active ? '🚫 Deactivate' : '✅ Activate'}
              </button>
            </div>
        }
      >
        {detail && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#2e7d32,#66bb6a)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900 }}>
                {(detail.first_name || '?').charAt(0)}
              </div>
              <div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{detail.first_name} {detail.last_name}</div>
                <div style={{ fontSize: 12, color: 'var(--atx2)', marginTop: 2 }}>Code: {detail.customer_code}</div>
              </div>
            </div>

            {editing ? (
              <div className="a-form-grid">
                <div className="a-fg"><label>First Name</label><input className="a-input" value={editForm.first_name} onChange={e => setEditForm(f => ({ ...f, first_name: e.target.value }))} /></div>
                <div className="a-fg"><label>Last Name</label><input className="a-input" value={editForm.last_name} onChange={e => setEditForm(f => ({ ...f, last_name: e.target.value }))} /></div>
                <div className="a-fg"><label>Email</label><input className="a-input" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} /></div>
                <div className="a-fg"><label>Phone</label><input className="a-input" value={editForm.mobile} onChange={e => setEditForm(f => ({ ...f, mobile: e.target.value }))} /></div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[['📧 Email', detail.email], ['📱 Phone', detail.mobile], ['🛒 Orders', detail.total_orders], ['💰 Total Spent', '₹' + Number(detail.total_spent).toLocaleString('en-IN')]].map(([l, v]) => (
                  <div key={l} style={{ background: 'var(--ab3)', borderRadius: 10, padding: '12px 14px' }}>
                    <div style={{ fontSize: 11, color: 'var(--atx3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 4 }}>{l}</div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{v}</div>
                  </div>
                ))}
                <div style={{ background: 'var(--ab3)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: 11, color: 'var(--atx3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 6 }}>Account Status</div>
                  <span style={{ fontSize: 13, fontWeight: 700, padding: '4px 12px', borderRadius: 20,
                    background: detail.is_active ? '#f0fdf4' : '#fef2f2',
                    color: detail.is_active ? '#16a34a' : '#dc2626' }}>
                    {detail.is_active ? '✅ Active' : '⛔ Inactive'}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../layouts/AdminLayout';
import { PageHeader, Modal, Pagination, Skel, Empty } from '../components/AdminUI';
import adminApi from '../services/adminApi';

const MOCK = [
  { id:1, customer_id:'CUS-001', full_name:'Ramesh Patil',  mobile:'9876543210', email:'ramesh@mail.com', city:'Nashik',     total_orders:12, total_spent:18540 },
  { id:2, customer_id:'CUS-002', full_name:'Sunita Devi',   mobile:'8765432109', email:'sunita@mail.com', city:'Lucknow',    total_orders:8,  total_spent:9200  },
  { id:3, customer_id:'CUS-003', full_name:'Krishnamurthy', mobile:'7654321098', email:'krish@mail.com',  city:'Coimbatore', total_orders:21, total_spent:31000 },
  { id:4, customer_id:'CUS-004', full_name:'Mohan Lal',     mobile:'9988776655', email:'mohan@mail.com',  city:'Amritsar',   total_orders:5,  total_spent:7400  },
  { id:5, customer_id:'CUS-005', full_name:'Priya Sharma',  mobile:'8877665544', email:'priya@mail.com',  city:'Jaipur',     total_orders:3,  total_spent:3100  },
  { id:6, customer_id:'CUS-006', full_name:'Arjun Mehta',   mobile:'7766554433', email:'arjun@mail.com',  city:'Pune',       total_orders:15, total_spent:22000 },
  { id:7, customer_id:'CUS-007', full_name:'Kavitha Reddy', mobile:'9900112233', email:'kav@mail.com',    city:'Bangalore',  total_orders:9,  total_spent:12600 },
];

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(1);
  const [limit, setLimit]         = useState(10);
  const [search, setSearch]       = useState('');
  const [detail, setDetail]       = useState(null);
  const [editing, setEditing]     = useState(false);
  const [editForm, setEditForm]   = useState({});

  useEffect(() => { load(); }, [page, limit, search]);

  async function load() {
    setLoading(true);
    try {
      const res = await adminApi.getCustomers({ page, limit, search });
      if (res.success) { setCustomers(res.data); setTotal(res.meta?.total || 0); }
    } catch {
      const f = MOCK.filter(c => !search || c.full_name.toLowerCase().includes(search.toLowerCase()) || c.mobile.includes(search));
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

  function openDetail(c) {
    setDetail(c);
    setEditForm({ full_name: c.full_name, email: c.email, mobile: c.mobile });
    setEditing(false);
  }

  return (
    <AdminLayout>
      <PageHeader title="Customers" sub={`${total} registered customers`} />

      <div className="a-card">
        <div className="a-filter-bar">
          <input className="a-input" placeholder="🔍 Search name, phone, email..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ maxWidth: 280 }} />
          <select className="a-input a-select" value={limit} onChange={e => setLimit(+e.target.value)}>
            {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n} per page</option>)}
          </select>
        </div>

        <div className="a-table-wrap">
          <table className="a-table">
            <thead><tr><th>ID</th><th>Name</th><th>Phone</th><th>Email</th><th>City</th><th>Orders</th><th>Spent</th><th>Action</th></tr></thead>
            <tbody>
              {loading
                ? [0, 1, 2, 3].map(i => <tr key={i}><td colSpan={8}><Skel h={40} /></td></tr>)
                : customers.length === 0
                ? <tr><td colSpan={8}><Empty icon="👥" title="No customers found" /></td></tr>
                : customers.map((c, i) => (
                  <motion.tr key={c.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <td style={{ fontSize: 12, color: 'var(--atx3)' }}>{c.customer_id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#2e7d32,#66bb6a)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{c.full_name.charAt(0)}</div>
                        <span style={{ fontWeight: 700 }}>{c.full_name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--atx2)' }}>📱 {c.mobile}</td>
                    <td style={{ color: 'var(--atx2)', fontSize: 12 }}>{c.email}</td>
                    <td style={{ color: 'var(--atx2)' }}>📍 {c.city}</td>
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

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Customer Details"
        footer={editing
          ? <><button className="a-btn a-btn-sec" onClick={() => setEditing(false)}>Cancel</button><button className="a-btn a-btn-pri" onClick={saveEdit}>💾 Save</button></>
          : <button className="a-btn a-btn-sec" onClick={() => setEditing(true)}>✏️ Edit Customer</button>
        }
      >
        {detail && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#2e7d32,#66bb6a)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900 }}>
                {detail.full_name.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{detail.full_name}</div>
                <div style={{ fontSize: 12, color: 'var(--atx2)', marginTop: 2 }}>ID: {detail.customer_id}</div>
              </div>
            </div>

            {editing ? (
              <div className="a-form-grid">
                <div className="a-fg full"><label>Full Name</label><input className="a-input" value={editForm.full_name} onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))} /></div>
                <div className="a-fg"><label>Email</label><input className="a-input" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} /></div>
                <div className="a-fg"><label>Phone</label><input className="a-input" value={editForm.mobile} onChange={e => setEditForm(f => ({ ...f, mobile: e.target.value }))} /></div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[['📧 Email', detail.email], ['📱 Phone', detail.mobile], ['📍 City', detail.city], ['🛒 Orders', detail.total_orders], ['💰 Total Spent', '₹' + Number(detail.total_spent).toLocaleString('en-IN')]].map(([l, v]) => (
                  <div key={l} style={{ background: 'var(--ab3)', borderRadius: 10, padding: '12px 14px' }}>
                    <div style={{ fontSize: 11, color: 'var(--atx3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 4 }}>{l}</div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{v}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}

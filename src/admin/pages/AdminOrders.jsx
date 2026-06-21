import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../layouts/AdminLayout';
import { PageHeader, Modal, Pagination, StatusBadge, Skel, Empty } from '../components/AdminUI';
import { ORDER_STATUSES, STATUS_COLORS } from '../utils/constants';
import adminApi from '../services/adminApi';

const MOCK = [
  { id:1, order_number:'DA-78432', customer_name:'Ramesh Patil',    city:'Nashik',    total_amount:598,  payment_status:'Paid',   order_status:'Shipped',    placed_at:'2025-01-15T10:30:00', items:[{name:'Tomato Seeds F1',qty:2,price:299}] },
  { id:2, order_number:'DA-78401', customer_name:'Sunita Devi',     city:'Lucknow',   total_amount:925,  payment_status:'Paid',   order_status:'Processing', placed_at:'2025-01-15T08:15:00', items:[{name:'NPK Fertilizer',qty:5,price:185}] },
  { id:3, order_number:'DA-78389', customer_name:'Krishnamurthy',   city:'Coimbatore',total_amount:2520, payment_status:'Paid',   order_status:'Delivered',  placed_at:'2025-01-14T14:00:00', items:[{name:'Neem Oil 1L',qty:3,price:840}] },
  { id:4, order_number:'DA-78350', customer_name:'Mohan Lal',       city:'Amritsar',  total_amount:3499, payment_status:'Paid',   order_status:'Delivered',  placed_at:'2025-01-13T11:20:00', items:[{name:'Drip Kit 1 Acre',qty:1,price:3499}] },
  { id:5, order_number:'DA-78312', customer_name:'Priya Sharma',    city:'Jaipur',    total_amount:1044, payment_status:'Refund', order_status:'Cancelled',  placed_at:'2025-01-12T09:45:00', items:[{name:'Humic Acid 300g',qty:4,price:261}] },
  { id:6, order_number:'DA-78290', customer_name:'Arjun Mehta',     city:'Pune',      total_amount:760,  payment_status:'Paid',   order_status:'Pending',    placed_at:'2025-01-12T07:00:00', items:[{name:'Garden Tools Set',qty:2,price:380}] },
  { id:7, order_number:'DA-78255', customer_name:'Kavitha Reddy',   city:'Bangalore', total_amount:490,  payment_status:'COD',    order_status:'Pending',    placed_at:'2025-01-11T16:30:00', items:[{name:'Coco Peat 5kg',qty:4,price:120}] },
];

export default function AdminOrders() {
  const [orders, setOrders]     = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [limit, setLimit]       = useState(10);
  const [statusF, setStatusF]   = useState('');
  const [search, setSearch]     = useState('');
  const [detail, setDetail]     = useState(null);

  useEffect(() => { load(); }, [page, limit, statusF, search]);

  async function load() {
    setLoading(true);
    try {
      const res = await adminApi.getOrders({ page, limit, status: statusF, search });
      if (res.success) { setOrders(res.data); setTotal(res.meta?.total || 0); }
    } catch {
      const filtered = MOCK.filter(o => (!statusF || o.order_status === statusF) && (!search || o.order_number.includes(search) || o.customer_name.toLowerCase().includes(search.toLowerCase())));
      setOrders(filtered.slice((page-1)*limit, page*limit));
      setTotal(filtered.length);
    }
    setLoading(false);
  }

  async function updateStatus(orderId, status) {
    try { await adminApi.updateOrderStatus(orderId, status); }
    catch {}
    setOrders(os => os.map(o => o.id === orderId ? { ...o, order_status: status } : o));
    if (detail?.id === orderId) setDetail(d => ({ ...d, order_status: status }));
  }

  return (
    <AdminLayout>
      <PageHeader title="Orders" sub={`${total} total orders`} />

      <div className="a-card">
        <div className="a-filter-bar">
          <input className="a-input" placeholder="🔍 Order ID or customer..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} style={{ maxWidth:240 }} />
          <select className="a-input a-select" value={statusF} onChange={e=>{setStatusF(e.target.value);setPage(1);}}>
            <option value="">All Statuses</option>
            {ORDER_STATUSES.map(s=><option key={s}>{s}</option>)}
          </select>
          <select className="a-input a-select" value={limit} onChange={e=>setLimit(+e.target.value)}>
            {[10,25,50,100].map(n=><option key={n} value={n}>{n} per page</option>)}
          </select>
        </div>

        <div className="a-table-wrap">
          <table className="a-table">
            <thead><tr><th>Order ID</th><th>Date</th><th>Customer</th><th>Location</th><th>Amount</th><th>Payment</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {loading
                ? [0,1,2,3].map(i=><tr key={i}><td colSpan={8}><Skel h={40} /></td></tr>)
                : orders.length === 0
                ? <tr><td colSpan={8}><Empty icon="🛒" title="No orders found" /></td></tr>
                : orders.map((o,i) => (
                  <motion.tr key={o.id} initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }} style={{ cursor:'pointer' }} onClick={()=>setDetail(o)}>
                    <td style={{ fontWeight:700, color:'var(--apri)' }}>#{o.order_number}</td>
                    <td style={{ color:'var(--atx2)', fontSize:12 }}>{new Date(o.placed_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</td>
                    <td style={{ fontWeight:600 }}>{o.customer_name}</td>
                    <td style={{ color:'var(--atx2)' }}>📍 {o.city}</td>
                    <td style={{ fontWeight:700 }}>₹{Number(o.total_amount).toLocaleString('en-IN')}</td>
                    <td><span style={{ fontSize:12, fontWeight:600, color: o.payment_status==='Refund'?'#dc2626':'var(--atx2)' }}>{o.payment_status}</span></td>
                    <td><StatusBadge status={o.order_status} /></td>
                    <td onClick={e=>e.stopPropagation()}>
                      <select className="a-input a-select" style={{ padding:'5px 28px 5px 8px', fontSize:12, maxWidth:130 }}
                        value={o.order_status} onChange={e=>updateStatus(o.id, e.target.value)}>
                        {ORDER_STATUSES.map(s=><option key={s}>{s}</option>)}
                      </select>
                    </td>
                  </motion.tr>
                ))
              }
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={total} limit={limit} onChange={setPage} />
      </div>

      {/* ORDER DETAIL MODAL */}
      <Modal open={!!detail} onClose={()=>setDetail(null)} title={`Order #${detail?.order_number}`} large>
        {detail && (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div className="a-card a-card-p">
                <h4 style={{ fontSize:13, fontWeight:700, color:'var(--atx2)', marginBottom:10, textTransform:'uppercase', letterSpacing:0.7 }}>Customer Info</h4>
                <p style={{ fontWeight:700, fontSize:14 }}>{detail.customer_name}</p>
                <p style={{ fontSize:13, color:'var(--atx2)', marginTop:4 }}>📍 {detail.city}</p>
              </div>
              <div className="a-card a-card-p">
                <h4 style={{ fontSize:13, fontWeight:700, color:'var(--atx2)', marginBottom:10, textTransform:'uppercase', letterSpacing:0.7 }}>Payment</h4>
                <p style={{ fontWeight:900, fontSize:20, color:'var(--apri)' }}>₹{Number(detail.total_amount).toLocaleString('en-IN')}</p>
                <p style={{ fontSize:12, color:'var(--atx2)', marginTop:4 }}>Status: <b>{detail.payment_status}</b></p>
              </div>
            </div>

            {/* Items */}
            <div className="a-card">
              <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--abord)', fontWeight:700, fontSize:13 }}>Order Items</div>
              {(detail.items||[]).map((item,i) => (
                <div key={i} style={{ padding:'12px 16px', display:'flex', justifyContent:'space-between', borderBottom:'1px solid var(--abord)', fontSize:13 }}>
                  <span>{item.name}</span>
                  <span style={{ color:'var(--atx2)' }}>Qty: {item.qty} × ₹{item.price}</span>
                  <span style={{ fontWeight:700, color:'var(--apri)' }}>₹{item.qty*item.price}</span>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div className="a-card a-card-p">
              <h4 style={{ fontSize:13, fontWeight:700, color:'var(--atx2)', marginBottom:14, textTransform:'uppercase', letterSpacing:0.7 }}>Order Timeline</h4>
              <div className="a-timeline">
                {ORDER_STATUSES.filter(s=>s!=='Cancelled').map((s, i, arr) => {
                  const cur = ORDER_STATUSES.indexOf(detail.order_status);
                  const idx = ORDER_STATUSES.indexOf(s);
                  const done = idx <= cur && detail.order_status !== 'Cancelled';
                  const active = idx === cur;
                  const c = STATUS_COLORS[s];
                  return (
                    <div key={s} className="a-tl-item">
                      <div className="a-tl-left">
                        <div className="a-tl-dot" style={{ borderColor: done ? c.dot : 'var(--abord)', background: done ? c.dot : 'var(--ab)' }} />
                        {i < arr.length-1 && <div className="a-tl-line" style={{ background: done ? c.dot : 'var(--abord)' }} />}
                      </div>
                      <div className="a-tl-body">
                        <h5 style={{ color: active ? c.color : done ? 'var(--atx)' : 'var(--atx3)' }}>{s}</h5>
                        <p>{done ? 'Completed' : 'Pending'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Update status */}
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <label style={{ fontSize:13, fontWeight:700, color:'var(--atx2)' }}>Update Status:</label>
              <select className="a-input a-select" style={{ maxWidth:180 }} value={detail.order_status} onChange={e=>updateStatus(detail.id, e.target.value)}>
                {ORDER_STATUSES.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}

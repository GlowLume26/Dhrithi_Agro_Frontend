import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../layouts/AdminLayout';
import { PageHeader, Modal, Pagination, StatusBadge, Skel, Empty } from '../components/AdminUI';
import { ORDER_STATUSES, STATUS_COLORS } from '../utils/constants';
import adminApi from '../services/adminApi';

const MOCK = [
  { id:1, order_number:'DA-78432', customer_name:'Ramesh Patil',  final_amount:598,  payment_status:'paid',    order_status:'shipped',   created_at:'2025-01-15T10:30:00', city:'Pune',      address:{ address_line1:'12 Farm Road', address_line2:'Near Kisan Nagar', city:'Pune', state:'Maharashtra', pincode:'411001', mobile:'9876543210' }, items:[{product_name:'Tomato Seeds F1',quantity:2,price:299,total:598}] },
  { id:2, order_number:'DA-78401', customer_name:'Sunita Devi',   final_amount:925,  payment_status:'paid',    order_status:'confirmed', created_at:'2025-01-15T08:15:00', city:'Nagpur',    address:{ address_line1:'45 Agri Colony', address_line2:'', city:'Nagpur', state:'Maharashtra', pincode:'440001', mobile:'9123456780' }, items:[{product_name:'NPK Fertilizer',quantity:5,price:185,total:925}] },
  { id:3, order_number:'DA-78389', customer_name:'Krishnamurthy', final_amount:2520, payment_status:'paid',    order_status:'delivered', created_at:'2025-01-14T14:00:00', city:'Hyderabad', address:{ address_line1:'78 Green Fields', address_line2:'Sector 4', city:'Hyderabad', state:'Telangana', pincode:'500001', mobile:'9988776655' }, items:[{product_name:'Neem Oil 1L',quantity:3,price:840,total:2520}] },
  { id:4, order_number:'DA-78350', customer_name:'Mohan Lal',     final_amount:3499, payment_status:'paid',    order_status:'delivered', created_at:'2025-01-13T11:20:00', city:'Jaipur',    address:{ address_line1:'22 Kisan Vihar', address_line2:'', city:'Jaipur', state:'Rajasthan', pincode:'302001', mobile:'9001234567' }, items:[{product_name:'Drip Kit 1 Acre',quantity:1,price:3499,total:3499}] },
  { id:5, order_number:'DA-78312', customer_name:'Priya Sharma',  final_amount:1044, payment_status:'pending', order_status:'cancelled', created_at:'2025-01-12T09:45:00', city:'Delhi',     address:{ address_line1:'5 Agro Park', address_line2:'Block B', city:'Delhi', state:'Delhi', pincode:'110001', mobile:'9811223344' }, items:[{product_name:'Humic Acid 300g',quantity:4,price:261,total:1044}] },
];

export default function AdminOrders() {
  const [orders, setOrders]       = useState([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(1);
  const [limit, setLimit]         = useState(10);
  const [statusF, setStatusF]     = useState('');
  const [search, setSearch]       = useState('');
  const [dateF, setDateF]         = useState('');
  const [detail, setDetail]       = useState(null);
  const [addrPopup, setAddrPopup] = useState(null);

  useEffect(() => { load(); }, [page, limit, statusF, search, dateF]);

  async function load() {
    setLoading(true);
    try {
      const res = await adminApi.getOrders({ page, limit, status: statusF, search, date: dateF });
      if (res.success) { setOrders(res.data); setTotal(res.meta?.total || 0); }
      else throw new Error();
    } catch {
      const filtered = MOCK.filter(o =>
        (!statusF || o.order_status === statusF) &&
        (!search || o.order_number.includes(search) || o.customer_name.toLowerCase().includes(search.toLowerCase()))
      );
      setOrders(filtered.slice((page-1)*limit, page*limit));
      setTotal(filtered.length);
    }
    setLoading(false);
  }

  async function updateStatus(orderId, status) {
    try { await adminApi.updateOrderStatus(orderId, status); } catch {}
    setOrders(os => os.map(o => o.id === orderId ? { ...o, order_status: status } : o));
    if (detail?.id === orderId) setDetail(d => ({ ...d, order_status: status }));
  }

  function handleLocationClick(e, order) {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setAddrPopup({ order, rect });
  }

  const amt = (o) => {
    const v = o.final_amount ?? o.total_amount ?? o.amount;
    return v != null ? '₹' + Number(v).toLocaleString('en-IN') : '—';
  };

  return (
    <AdminLayout>
      <PageHeader title="Orders" sub={`${total} total orders`} />

      <div className="a-card">
        <div className="a-filter-bar">
          <input className="a-input" placeholder="🔍 Order ID or customer..." value={search}
            onChange={e=>{ setSearch(e.target.value); setPage(1); }} style={{ maxWidth:220 }} />
          <select className="a-input a-select" value={statusF} onChange={e=>{ setStatusF(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            {ORDER_STATUSES.map(s=><option key={s}>{s}</option>)}
          </select>
          <input className="a-input" type="date" value={dateF}
            onChange={e=>{ setDateF(e.target.value); setPage(1); }} style={{ maxWidth:160 }} />
          {dateF && <button className="a-btn a-btn-sm a-btn-sec" onClick={()=>{ setDateF(''); setPage(1); }}>✕ Clear</button>}
          <select className="a-input a-select" value={limit} onChange={e=>setLimit(+e.target.value)}>
            {[10,25,50,100].map(n=><option key={n} value={n}>{n} per page</option>)}
          </select>
        </div>

        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr>
                <th style={{ width:44 }}>#</th>
                <th>Order ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Location</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? [0,1,2,3].map(i=><tr key={i}><td colSpan={9}><Skel h={40} /></td></tr>)
                : orders.length === 0
                ? <tr><td colSpan={9}><Empty icon="🛒" title="No orders found" /></td></tr>
                : orders.map((o,i) => (
                  <motion.tr key={o.id} initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }}
                    transition={{ delay:i*0.04 }} style={{ cursor:'pointer' }} onClick={()=>setDetail(o)}>
                    <td style={{ color:'var(--atx3)', fontWeight:600, fontSize:13, textAlign:'center' }}>{(page-1)*limit + i + 1}</td>
                    <td style={{ fontWeight:700, color:'var(--apri)' }}>#{o.order_number}</td>
                    <td style={{ color:'var(--atx2)', fontSize:12 }}>
                      <div>{new Date(o.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</div>
                      <div style={{ fontSize:11, color:'var(--atx3)', marginTop:1 }}>{new Date(o.created_at).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</div>
                    </td>
                    <td style={{ fontWeight:600 }}>{o.customer_name}</td>
                    <td onClick={e=>handleLocationClick(e,o)}>
                      <span style={{ color:'var(--apri)', cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', gap:4 }}>
                        📍 <span style={{ textDecoration:'underline dotted' }}>{o.city || o.address?.city || '—'}</span>
                      </span>
                    </td>
                    <td style={{ fontWeight:700 }}>{amt(o)}</td>
                    <td>
                      <span style={{ fontSize:12, fontWeight:600,
                        color: o.payment_status==='paid'?'#16a34a': o.payment_status==='pending'?'#d97706':'#dc2626' }}>
                        {o.payment_status}
                      </span>
                    </td>
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
              <div style={{ fontSize:12, fontWeight:700, color:'var(--atx2)', textTransform:'uppercase', letterSpacing:0.7, marginBottom:10 }}>
                📍 Delivery Address
              </div>
              {(() => {
                const a = addrPopup.order.address || addrPopup.order;
                const line1 = a.address_line1 || '';
                const line2 = a.address_line2 || '';
                const city  = a.city || '';
                const state = a.state || '';
                const pin   = a.pincode || '';
                const mob   = a.mobile || '';
                if (!line1 && !city) return <p style={{ fontSize:13, color:'var(--atx3)' }}>No address on record</p>;
                return (
                  <div style={{ fontSize:13, color:'var(--atx)', lineHeight:1.7 }}>
                    {line1 && <div>{line1}</div>}
                    {line2 && <div>{line2}</div>}
                    {(city || state) && <div>{[city, state].filter(Boolean).join(', ')}{pin ? ' — ' + pin : ''}</div>}
                    {mob && <div style={{ marginTop:6, color:'var(--atx2)' }}>📱 {mob}</div>}
                  </div>
                );
              })()}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ORDER DETAIL MODAL */}
      <Modal open={!!detail} onClose={()=>setDetail(null)} title={`Order #${detail?.order_number}`} large>
        {detail && (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              {/* Customer + Address */}
              <div className="a-card a-card-p">
                <h4 style={{ fontSize:13, fontWeight:700, color:'var(--atx2)', marginBottom:10, textTransform:'uppercase', letterSpacing:0.7 }}>Customer Info</h4>
                <p style={{ fontWeight:700, fontSize:14 }}>{detail.customer_name}</p>
                {(() => {
                  const a = detail.address || detail;
                  return (
                    <div style={{ fontSize:13, color:'var(--atx2)', marginTop:6, lineHeight:1.7 }}>
                      {a.address_line1 && <div>{a.address_line1}{a.address_line2 ? ', ' + a.address_line2 : ''}</div>}
                      {(a.city || a.state) && <div>{[a.city, a.state].filter(Boolean).join(', ')}{a.pincode ? ' — ' + a.pincode : ''}</div>}
                      {a.mobile && <div>📱 {a.mobile}</div>}
                    </div>
                  );
                })()}
              </div>

              {/* Payment */}
              <div className="a-card a-card-p">
                <h4 style={{ fontSize:13, fontWeight:700, color:'var(--atx2)', marginBottom:10, textTransform:'uppercase', letterSpacing:0.7 }}>Payment</h4>
                <p style={{ fontWeight:900, fontSize:22, color:'var(--apri)' }}>{amt(detail)}</p>
                <p style={{ fontSize:13, color:'var(--atx2)', marginTop:4 }}>
                  Status: <b style={{ color: detail.payment_status==='paid'?'#16a34a':'#d97706' }}>{detail.payment_status}</b>
                </p>
              </div>
            </div>

            {/* Items */}
            <div className="a-card">
              <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--abord)', fontWeight:700, fontSize:13 }}>Order Items</div>
              {(detail.items||[]).length === 0
                ? <div style={{ padding:'16px', fontSize:13, color:'var(--atx3)' }}>No items found</div>
                : (detail.items||[]).map((item,i) => (
                  <div key={i} style={{ padding:'12px 16px', display:'flex', justifyContent:'space-between', borderBottom:'1px solid var(--abord)', fontSize:13 }}>
                    <span style={{ fontWeight:600 }}>{item.product_name}</span>
                    <span style={{ color:'var(--atx2)' }}>Qty: {item.quantity} × ₹{Number(item.price).toLocaleString('en-IN')}</span>
                    <span style={{ fontWeight:700, color:'var(--apri)' }}>₹{Number(item.total).toLocaleString('en-IN')}</span>
                  </div>
                ))
              }
            </div>

            {/* Timeline */}
            <div className="a-card a-card-p">
              <h4 style={{ fontSize:13, fontWeight:700, color:'var(--atx2)', marginBottom:14, textTransform:'uppercase', letterSpacing:0.7 }}>Order Timeline</h4>
              <div className="a-timeline">
                {ORDER_STATUSES.filter(s=>s!=='cancelled').map((s, i, arr) => {
                  const cur  = ORDER_STATUSES.indexOf(detail.order_status);
                  const idx  = ORDER_STATUSES.indexOf(s);
                  const done = idx <= cur && detail.order_status !== 'cancelled';
                  const active = idx === cur;
                  const c = STATUS_COLORS[s] || STATUS_COLORS['placed'];
                  return (
                    <div key={s} className="a-tl-item">
                      <div className="a-tl-left">
                        <div className="a-tl-dot" style={{ borderColor: done?c.dot:'var(--abord)', background: done?c.dot:'var(--ab)' }} />
                        {i < arr.length-1 && <div className="a-tl-line" style={{ background: done?c.dot:'var(--abord)' }} />}
                      </div>
                      <div className="a-tl-body">
                        <h5 style={{ color: active?c.color:done?'var(--atx)':'var(--atx3)', textTransform:'capitalize' }}>{s.replace(/_/g,' ')}</h5>
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
              <select className="a-input a-select" style={{ maxWidth:180 }} value={detail.order_status}
                onChange={e=>updateStatus(detail.id, e.target.value)}>
                {ORDER_STATUSES.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}

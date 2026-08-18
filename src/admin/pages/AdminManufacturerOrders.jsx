import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../layouts/AdminLayout';
import { PageHeader, Modal, Pagination, Skel, Empty, StatusBadge } from '../components/AdminUI';
import adminApi from '../services/adminApi';

const STATUSES = ['pending','confirmed','dispatched','delivered','cancelled'];

export default function AdminManufacturerOrders() {
  const [orders, setOrders]         = useState([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [manufacturers, setMfrs]    = useState([]);
  const [page, setPage]             = useState(1);
  const [limit]                     = useState(20);
  const [mfrFilter, setMfrFilter]   = useState('');
  const [statusFilter, setStatus]   = useState('');
  const [search, setSearch]         = useState('');
  const [date, setDate]             = useState('');
  const [detail, setDetail]         = useState(null);

  useEffect(() => {
    adminApi.getManufacturers().then(r => { if (r.success) setMfrs(r.data); }).catch(()=>{});
  }, []);

  useEffect(() => { load(); }, [page, mfrFilter, statusFilter, search, date]);

  async function load() {
    setLoading(true);
    try {
      const res = await adminApi.getManufacturerOrders({ page, limit, manufacturer_id: mfrFilter, status: statusFilter, search, date });
      if (res.success) { setOrders(res.data); setTotal(res.meta?.total || 0); }
    } catch { setOrders([]); }
    setLoading(false);
  }

  async function updateStatus(id, status) {
    try { await adminApi.updateManufacturerOrder(id, { status }); load(); } catch {}
  }

  const statusColor = { pending:'#f59e0b', confirmed:'#3b82f6', dispatched:'#8b5cf6', delivered:'#16a34a', cancelled:'#ef4444' };

  return (
    <AdminLayout>
      <PageHeader title="Manufacturer Orders" sub={`${total} total orders`} />

      <div className="a-card">
        <div className="a-filter-bar">
          <input className="a-input" placeholder="🔍 Search order ID..." value={search}
            onChange={e=>{setSearch(e.target.value);setPage(1);}} style={{maxWidth:200}} />
          <select className="a-input a-select" value={mfrFilter} onChange={e=>{setMfrFilter(e.target.value);setPage(1);}}>
            <option value="">All Manufacturers</option>
            {manufacturers.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <select className="a-input a-select" value={statusFilter} onChange={e=>{setStatus(e.target.value);setPage(1);}}>
            <option value="">All Statuses</option>
            {STATUSES.map(s=><option key={s} value={s} style={{textTransform:'capitalize'}}>{s}</option>)}
          </select>
          <input className="a-input" type="date" value={date} onChange={e=>{setDate(e.target.value);setPage(1);}} style={{maxWidth:160}} />
          {date && <button className="a-btn a-btn-sm a-btn-sec" onClick={()=>{setDate('');setPage(1);}}>✕</button>}
        </div>

        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Order No.</th>
                <th className="hide-mobile">Manufacturer</th>
                <th className="hide-mobile">Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? [0,1,2,3].map(i=><tr key={i}><td colSpan={7}><Skel h={40}/></td></tr>)
                : orders.length === 0
                ? <tr><td colSpan={7}><Empty icon="🏭" title="No manufacturer orders found"/></td></tr>
                : orders.map((o,i) => (
                  <motion.tr key={o.id} initial={{opacity:0,y:5}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
                    style={{cursor:'pointer'}} onClick={()=>setDetail(o)}>
                    <td style={{color:'var(--atx3)',fontWeight:600,textAlign:'center'}}>{(page-1)*limit+i+1}</td>
                    <td style={{fontWeight:700,color:'var(--apri)'}}>{o.order_number}</td>
                    <td className="hide-mobile">{o.manufacturer_name}</td>
                    <td className="hide-mobile" style={{fontSize:12,color:'var(--atx2)'}}>
                      {new Date(o.order_date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                    </td>
                    <td style={{fontWeight:700}}>₹{Number(o.total_amount).toLocaleString('en-IN')}</td>
                    <td>
                      <span style={{fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:20,
                        background:statusColor[o.status]+'22',color:statusColor[o.status],textTransform:'capitalize'}}>
                        {o.status}
                      </span>
                    </td>
                    <td onClick={e=>e.stopPropagation()}>
                      <select className="a-input a-select" style={{padding:'5px 28px 5px 8px',fontSize:12,maxWidth:130}}
                        value={o.status} onChange={e=>updateStatus(o.id,e.target.value)}>
                        {STATUSES.map(s=><option key={s}>{s}</option>)}
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

      <Modal open={!!detail} onClose={()=>setDetail(null)} title={`Order: ${detail?.order_number}`} large>
        {detail && (
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12}}>
              {[
                ['🏭 Manufacturer', detail.manufacturer_name],
                ['📅 Date', new Date(detail.order_date).toLocaleDateString('en-IN')],
                ['💰 Total', '₹'+Number(detail.total_amount).toLocaleString('en-IN')],
                ['📋 Status', detail.status],
                ['🧾 Invoice', detail.invoice_number||'—'],
              ].map(([l,v])=>(
                <div key={l} style={{background:'var(--ab3)',borderRadius:10,padding:'10px 14px'}}>
                  <div style={{fontSize:11,color:'var(--atx3)',fontWeight:700,textTransform:'uppercase',letterSpacing:0.7,marginBottom:4}}>{l}</div>
                  <div style={{fontSize:13,fontWeight:600,textTransform:'capitalize'}}>{v}</div>
                </div>
              ))}
            </div>
            {detail.notes && <div style={{background:'var(--ab3)',borderRadius:10,padding:'10px 14px',fontSize:13,color:'var(--atx2)'}}>📝 {detail.notes}</div>}
            <div className="a-card">
              <div style={{padding:'12px 16px',borderBottom:'1px solid var(--abord)',fontWeight:700,fontSize:13}}>Order Items</div>
              {(detail.items||[]).length===0
                ? <div style={{padding:16,fontSize:13,color:'var(--atx3)'}}>No items</div>
                : (detail.items||[]).map((it,i)=>(
                  <div key={i} style={{padding:'11px 16px',display:'flex',justifyContent:'space-between',borderBottom:'1px solid var(--abord)',fontSize:13}}>
                    <span style={{fontWeight:600}}>{it.product_name}</span>
                    <span style={{color:'var(--atx2)'}}>Qty: {it.quantity} × ₹{Number(it.unit_price).toLocaleString('en-IN')}</span>
                    <span style={{fontWeight:700,color:'var(--apri)'}}>₹{Number(it.total).toLocaleString('en-IN')}</span>
                  </div>
                ))
              }
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}

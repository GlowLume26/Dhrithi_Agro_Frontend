import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../layouts/AdminLayout';
import { PageHeader, Modal, Pagination, Skel, Empty } from '../components/AdminUI';
import adminApi from '../services/adminApi';

const ORDER_STATUSES = ['pending','confirmed','dispatched','delivered','cancelled'];
const PAY_STATUSES   = ['pending','paid','partial','cancelled'];

export default function AdminCnfOrders() {
  const [orders, setOrders]       = useState([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [companies, setCompanies] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [page, setPage]           = useState(1);
  const [limit]                   = useState(20);
  const [cnfId, setCnfId]         = useState('');
  const [whId, setWhId]           = useState('');
  const [status, setStatus]       = useState('');
  const [search, setSearch]       = useState('');
  const [detail, setDetail]       = useState(null);

  useEffect(() => {
    adminApi.getCnfCompanies({}).then(r=>{ if(r.success) setCompanies(r.data); }).catch(()=>{});
  }, []);

  useEffect(() => {
    if (cnfId) adminApi.getWarehouses({ cnf_company_id: cnfId }).then(r=>{ if(r.success) setWarehouses(r.data); }).catch(()=>{});
    else setWarehouses([]);
  }, [cnfId]);

  useEffect(() => { load(); }, [page, cnfId, whId, status, search]);

  async function load() {
    setLoading(true);
    try {
      const res = await adminApi.getCnfOrders({ page, limit, cnf_company_id: cnfId, warehouse_id: whId, status, search });
      if (res.success) { setOrders(res.data); setTotal(res.meta?.total||0); }
    } catch { setOrders([]); }
    setLoading(false);
  }

  async function updateOrder(id, data) {
    try { await adminApi.updateCnfOrder(id, data); load(); } catch {}
  }

  const payColor = { pending:'#f59e0b', paid:'#16a34a', partial:'#3b82f6', cancelled:'#ef4444' };
  const ordColor = { pending:'#f59e0b', confirmed:'#3b82f6', dispatched:'#8b5cf6', delivered:'#16a34a', cancelled:'#ef4444' };

  return (
    <AdminLayout>
      <PageHeader title="C&F Orders / Invoices" sub={`${total} orders`} />

      <div className="a-card">
        <div className="a-filter-bar">
          <input className="a-input" placeholder="🔍 Invoice / company..." value={search}
            onChange={e=>{setSearch(e.target.value);setPage(1);}} style={{maxWidth:200}} />
          <select className="a-input a-select" value={cnfId} onChange={e=>{setCnfId(e.target.value);setPage(1);}}>
            <option value="">All Companies</option>
            {companies.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="a-input a-select" value={whId} onChange={e=>{setWhId(e.target.value);setPage(1);}} disabled={!warehouses.length}>
            <option value="">All Warehouses</option>
            {warehouses.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          <select className="a-input a-select" value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}}>
            <option value="">All Statuses</option>
            {ORDER_STATUSES.map(s=><option key={s} value={s} style={{textTransform:'capitalize'}}>{s}</option>)}
          </select>
        </div>

        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Invoice</th>
                <th>Company</th>
                <th className="hide-mobile">Warehouse</th>
                <th className="hide-mobile">Date</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? [0,1,2,3].map(i=><tr key={i}><td colSpan={9}><Skel h={40}/></td></tr>)
                : orders.length===0
                ? <tr><td colSpan={9}><Empty icon="📄" title="No C&F orders found"/></td></tr>
                : orders.map((o,i)=>(
                  <motion.tr key={o.id} initial={{opacity:0,y:5}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}>
                    <td style={{color:'var(--atx3)',fontWeight:600,textAlign:'center'}}>{(page-1)*limit+i+1}</td>
                    <td style={{fontWeight:700,color:'var(--apri)',fontFamily:'monospace',fontSize:12}}>{o.invoice_number}</td>
                    <td style={{fontWeight:600}}>{o.company_name}</td>
                    <td className="hide-mobile" style={{fontSize:13,color:'var(--atx2)'}}>{o.warehouse_name||'—'}</td>
                    <td className="hide-mobile" style={{fontSize:12,color:'var(--atx2)'}}>{new Date(o.order_date).toLocaleDateString('en-IN')}</td>
                    <td style={{fontWeight:700}}>₹{Number(o.total_amount).toLocaleString('en-IN')}</td>
                    <td><span style={{fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:20,background:payColor[o.payment_status]+'22',color:payColor[o.payment_status],textTransform:'capitalize'}}>{o.payment_status}</span></td>
                    <td><span style={{fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:20,background:ordColor[o.order_status]+'22',color:ordColor[o.order_status],textTransform:'capitalize'}}>{o.order_status}</span></td>
                    <td><button className="a-btn a-btn-sm a-btn-sec" onClick={()=>setDetail(o)}>View</button></td>
                  </motion.tr>
                ))
              }
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={total} limit={limit} onChange={setPage} />
      </div>

      <Modal open={!!detail} onClose={()=>setDetail(null)} title={`Invoice: ${detail?.invoice_number}`} large>
        {detail && (
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:12}}>
              {[['🏢 Company',detail.company_name],['🏭 Warehouse',detail.warehouse_name||'—'],['📅 Date',new Date(detail.order_date).toLocaleDateString('en-IN')],['💰 Total','₹'+Number(detail.total_amount).toLocaleString('en-IN')]].map(([l,v])=>(
                <div key={l} style={{background:'var(--ab3)',borderRadius:10,padding:'10px 14px'}}>
                  <div style={{fontSize:11,color:'var(--atx3)',fontWeight:700,textTransform:'uppercase',letterSpacing:0.7,marginBottom:4}}>{l}</div>
                  <div style={{fontSize:13,fontWeight:600}}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
              <div style={{flex:1,minWidth:140}}>
                <label style={{fontSize:12,fontWeight:700,color:'var(--atx2)',display:'block',marginBottom:6}}>Order Status</label>
                <select className="a-input a-select" value={detail.order_status}
                  onChange={e=>{ updateOrder(detail.id,{order_status:e.target.value}); setDetail(d=>({...d,order_status:e.target.value})); }}>
                  {ORDER_STATUSES.map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div style={{flex:1,minWidth:140}}>
                <label style={{fontSize:12,fontWeight:700,color:'var(--atx2)',display:'block',marginBottom:6}}>Payment Status</label>
                <select className="a-input a-select" value={detail.payment_status}
                  onChange={e=>{ updateOrder(detail.id,{payment_status:e.target.value}); setDetail(d=>({...d,payment_status:e.target.value})); }}>
                  {PAY_STATUSES.map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="a-card">
              <div style={{padding:'12px 16px',borderBottom:'1px solid var(--abord)',fontWeight:700,fontSize:13}}>Items</div>
              {(detail.items||[]).map((it,i)=>(
                <div key={i} style={{padding:'11px 16px',display:'flex',justifyContent:'space-between',borderBottom:'1px solid var(--abord)',fontSize:13}}>
                  <span style={{fontWeight:600}}>{it.product_name}</span>
                  <span style={{color:'var(--atx2)'}}>Qty: {it.quantity} × ₹{Number(it.unit_price).toLocaleString('en-IN')}</span>
                  <span style={{fontWeight:700,color:'var(--apri)'}}>₹{Number(it.total).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}

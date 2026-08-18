import { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { PageHeader, Pagination, Skel, Empty, StatusBadge } from '../components/AdminUI';
import adminApi from '../services/adminApi';

export default function AdminSalesmanOrders() {
  const [orders, setOrders]     = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [salesmen, setSalesmen] = useState([]);
  const [vendors, setVendors]   = useState([]);
  const [page, setPage]         = useState(1);
  const [limit]                 = useState(20);
  const [salesmanId, setSalesmanId] = useState('');
  const [distId, setDistId]     = useState('');
  const [from, setFrom]         = useState('');
  const [to, setTo]             = useState('');
  const [search, setSearch]     = useState('');

  useEffect(() => {
    adminApi.getSalesmen({}).then(r=>{ if(r.success) setSalesmen(r.data); }).catch(()=>{});
    adminApi.getVendors({ status:'approved' }).then(r=>{ if(r.success) setVendors(r.data||[]); }).catch(()=>{});
  }, []);

  useEffect(() => { load(); }, [page, salesmanId, distId, from, to, search]);

  async function load() {
    setLoading(true);
    try {
      const res = await adminApi.getSalesmanOrders({ page, limit, salesman_id: salesmanId, distributor_id: distId, from, to, search });
      if (res.success) { setOrders(res.data); setTotal(res.meta?.total||0); }
    } catch { setOrders([]); }
    setLoading(false);
  }

  return (
    <AdminLayout>
      <PageHeader title="Salesman Orders" sub={`${total} orders`} />

      <div className="a-card">
        <div className="a-filter-bar">
          <input className="a-input" placeholder="🔍 Order ID / customer..." value={search}
            onChange={e=>{setSearch(e.target.value);setPage(1);}} style={{maxWidth:200}} />
          <select className="a-input a-select" value={distId} onChange={e=>{setDistId(e.target.value);setSalesmanId('');setPage(1);}}>
            <option value="">All Distributors</option>
            {vendors.map(v=><option key={v.id} value={v.id}>{v.business_name}</option>)}
          </select>
          <select className="a-input a-select" value={salesmanId} onChange={e=>{setSalesmanId(e.target.value);setPage(1);}}>
            <option value="">All Salesmen</option>
            {(distId ? salesmen.filter(s=>s.distributor_id===distId) : salesmen).map(s=>(
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <input className="a-input" type="date" value={from} onChange={e=>{setFrom(e.target.value);setPage(1);}} style={{maxWidth:150}} />
          <input className="a-input" type="date" value={to} onChange={e=>{setTo(e.target.value);setPage(1);}} style={{maxWidth:150}} />
          {(from||to) && <button className="a-btn a-btn-sm a-btn-sec" onClick={()=>{setFrom('');setTo('');setPage(1);}}>✕ Clear</button>}
        </div>

        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Order ID</th>
                <th>Salesman</th>
                <th className="hide-mobile">Distributor</th>
                <th className="hide-mobile">Customer</th>
                <th className="hide-mobile">Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? [0,1,2,3].map(i=><tr key={i}><td colSpan={8}><Skel h={40}/></td></tr>)
                : orders.length===0
                ? <tr><td colSpan={8}><Empty icon="🧑‍💼" title="No salesman orders found"/></td></tr>
                : orders.map((o,i)=>(
                  <tr key={o.id}>
                    <td style={{color:'var(--atx3)',fontWeight:600,textAlign:'center'}}>{(page-1)*limit+i+1}</td>
                    <td style={{fontWeight:700,color:'var(--apri)'}}>#{o.order_number}</td>
                    <td style={{fontWeight:600}}>{o.salesman_name}</td>
                    <td className="hide-mobile" style={{fontSize:13,color:'var(--atx2)'}}>{o.distributor_name||'—'}</td>
                    <td className="hide-mobile" style={{fontSize:13}}>{o.customer_name}</td>
                    <td className="hide-mobile" style={{fontSize:12,color:'var(--atx2)'}}>{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                    <td style={{fontWeight:700}}>₹{Number(o.final_amount).toLocaleString('en-IN')}</td>
                    <td><StatusBadge status={o.order_status}/></td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={total} limit={limit} onChange={setPage} />
      </div>
    </AdminLayout>
  );
}

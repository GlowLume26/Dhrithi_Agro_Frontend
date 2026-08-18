import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../layouts/AdminLayout';
import { PageHeader, Pagination, Skel, Empty, StatusBadge } from '../components/AdminUI';
import adminApi from '../services/adminApi';

export default function AdminSalesmanReports() {
  const [orders, setOrders]       = useState([]);
  const [total, setTotal]         = useState(0);
  const [summary, setSummary]     = useState(null);
  const [loading, setLoading]     = useState(false);
  const [salesmen, setSalesmen]   = useState([]);
  const [vendors, setVendors]     = useState([]);
  const [page, setPage]           = useState(1);
  const [limit]                   = useState(20);
  const [salesmanId, setSalesmanId] = useState('');
  const [distId, setDistId]       = useState('');
  const [from, setFrom]           = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0,10));
  const [to, setTo]               = useState(new Date().toISOString().slice(0,10));

  useEffect(() => {
    adminApi.getSalesmen({}).then(r=>{ if(r.success) setSalesmen(r.data); }).catch(()=>{});
    adminApi.getVendors({ status:'approved' }).then(r=>{ if(r.success) setVendors(r.data||[]); }).catch(()=>{});
  }, []);

  useEffect(() => { load(); }, [page, salesmanId, distId, from, to]);

  async function load() {
    setLoading(true);
    try {
      const res = await adminApi.getSalesmanReport({ page, limit, salesman_id: salesmanId, distributor_id: distId, from, to });
      if (res.success) { setOrders(res.data); setTotal(res.meta?.total||0); setSummary(res.summary); }
    } catch { setOrders([]); }
    setLoading(false);
  }

  const filteredSalesmen = distId ? salesmen.filter(s => s.distributor_id === distId) : salesmen;

  return (
    <AdminLayout>
      <PageHeader title="Salesman Reports" sub="Sales performance by salesman and distributor" />

      {/* Filters */}
      <div className="a-card a-card-p" style={{marginBottom:20}}>
        <div className="a-filter-bar" style={{padding:0,border:'none'}}>
          <div className="a-fg" style={{flex:1,minWidth:140}}>
            <label style={{fontSize:12,fontWeight:700,color:'var(--atx2)',display:'block',marginBottom:6}}>From</label>
            <input className="a-input" type="date" value={from} onChange={e=>{setFrom(e.target.value);setPage(1);}} />
          </div>
          <div className="a-fg" style={{flex:1,minWidth:140}}>
            <label style={{fontSize:12,fontWeight:700,color:'var(--atx2)',display:'block',marginBottom:6}}>To</label>
            <input className="a-input" type="date" value={to} onChange={e=>{setTo(e.target.value);setPage(1);}} />
          </div>
          <div className="a-fg" style={{flex:1,minWidth:160}}>
            <label style={{fontSize:12,fontWeight:700,color:'var(--atx2)',display:'block',marginBottom:6}}>Distributor</label>
            <select className="a-input a-select" value={distId} onChange={e=>{setDistId(e.target.value);setSalesmanId('');setPage(1);}}>
              <option value="">All Distributors</option>
              {vendors.map(v=><option key={v.id} value={v.id}>{v.business_name}</option>)}
            </select>
          </div>
          <div className="a-fg" style={{flex:1,minWidth:160}}>
            <label style={{fontSize:12,fontWeight:700,color:'var(--atx2)',display:'block',marginBottom:6}}>Salesman</label>
            <select className="a-input a-select" value={salesmanId} onChange={e=>{setSalesmanId(e.target.value);setPage(1);}}>
              <option value="">All Salesmen</option>
              {filteredSalesmen.map(s=><option key={s.id} value={s.id}>{s.name}{s.distributor_name?' — '+s.distributor_name:''}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Summary KPIs */}
      {summary && (
        <div className="a-kpi-grid" style={{marginBottom:20}}>
          {[
            {icon:'🛒',label:'Total Orders',value:Number(summary.total_orders||0).toLocaleString('en-IN'),iconBg:'#eff6ff'},
            {icon:'💰',label:'Total Sales',value:'₹'+Number(summary.total_amount||0).toLocaleString('en-IN'),iconBg:'#f0fdf4'},
            {icon:'👥',label:'Customers',value:Number(summary.total_customers||0).toLocaleString('en-IN'),iconBg:'#fdf4ff'},
          ].map(k=>(
            <motion.div key={k.label} className="a-kpi" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}>
              <div className="a-kpi-info"><h3>{k.value}</h3><p>{k.label}</p></div>
              <div className="a-kpi-icon" style={{background:k.iconBg}}>{k.icon}</div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Orders Table */}
      <div className="a-card">
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
                ? <tr><td colSpan={8}><Empty icon="📊" title="No salesman orders found for this period"/></td></tr>
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

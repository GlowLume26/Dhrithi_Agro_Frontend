import { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { PageHeader, Pagination, Skel, Empty } from '../components/AdminUI';
import adminApi from '../services/adminApi';

const EXPIRY_BADGE = {
  expired:      { bg:'#fef2f2', color:'#dc2626', label:'Expired' },
  expiring_soon:{ bg:'#fff7ed', color:'#ea580c', label:'Expiring Soon' },
  good:         { bg:'#f0fdf4', color:'#16a34a', label:'Good' },
  no_expiry:    { bg:'#f1f5f9', color:'#64748b', label:'No Expiry' },
};

export default function AdminCnfStock() {
  const [items, setItems]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [companies, setCompanies] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [page, setPage]         = useState(1);
  const [limit]                 = useState(20);
  const [cnfId, setCnfId]       = useState('');
  const [whId, setWhId]         = useState('');
  const [expiry, setExpiry]     = useState('');
  const [search, setSearch]     = useState('');
  const [sort, setSort]         = useState('name');

  useEffect(() => {
    adminApi.getCnfCompanies({}).then(r=>{ if(r.success) setCompanies(r.data); }).catch(()=>{});
  }, []);

  useEffect(() => {
    if (cnfId) adminApi.getWarehouses({ cnf_company_id: cnfId }).then(r=>{ if(r.success) setWarehouses(r.data); }).catch(()=>{});
    else setWarehouses([]);
    setWhId('');
  }, [cnfId]);

  useEffect(() => { load(); }, [page, cnfId, whId, expiry, search, sort]);

  async function load() {
    setLoading(true);
    try {
      const res = await adminApi.getCnfStock({ page, limit, cnf_company_id: cnfId, warehouse_id: whId, expiry_status: expiry, search, sort });
      if (res.success) { setItems(res.data); setTotal(res.meta?.total||0); }
    } catch { setItems([]); }
    setLoading(false);
  }

  return (
    <AdminLayout>
      <PageHeader title="C&F Stock" sub={`${total} stock entries`} />

      <div className="a-card">
        <div className="a-filter-bar">
          <input className="a-input" placeholder="🔍 Search product..." value={search}
            onChange={e=>{setSearch(e.target.value);setPage(1);}} style={{maxWidth:200}} />
          <select className="a-input a-select" value={cnfId} onChange={e=>{setCnfId(e.target.value);setPage(1);}}>
            <option value="">All Companies</option>
            {companies.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="a-input a-select" value={whId} onChange={e=>{setWhId(e.target.value);setPage(1);}} disabled={!warehouses.length}>
            <option value="">All Warehouses</option>
            {warehouses.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          <select className="a-input a-select" value={expiry} onChange={e=>{setExpiry(e.target.value);setPage(1);}}>
            <option value="">All Expiry</option>
            <option value="expired">Expired</option>
            <option value="expiring_soon">Expiring Soon</option>
            <option value="good">Good</option>
          </select>
          <select className="a-input a-select" value={sort} onChange={e=>setSort(e.target.value)}>
            <option value="name">Sort: Name</option>
            <option value="stock_desc">Highest Stock</option>
            <option value="stock_asc">Lowest Stock</option>
            <option value="expiry">Expiry Date</option>
          </select>
        </div>

        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th className="hide-mobile">Warehouse</th>
                <th className="hide-mobile">Company</th>
                <th>Stock</th>
                <th className="hide-mobile">Batch</th>
                <th className="hide-mobile">Expiry</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? [0,1,2,3].map(i=><tr key={i}><td colSpan={8}><Skel h={40}/></td></tr>)
                : items.length===0
                ? <tr><td colSpan={8}><Empty icon="📦" title="No stock found"/></td></tr>
                : items.map((it,i)=>{
                  const eb = EXPIRY_BADGE[it.expiry_status] || EXPIRY_BADGE.no_expiry;
                  return (
                    <tr key={it.id}>
                      <td style={{color:'var(--atx3)',fontWeight:600,textAlign:'center'}}>{(page-1)*limit+i+1}</td>
                      <td><div style={{fontWeight:700,fontSize:13}}>{it.product_name}</div><div style={{fontSize:11,color:'var(--atx3)'}}>{it.category_name}</div></td>
                      <td className="hide-mobile" style={{fontSize:13}}>{it.warehouse_name}</td>
                      <td className="hide-mobile" style={{fontSize:13,color:'var(--atx2)'}}>{it.company_name}</td>
                      <td>
                        <div style={{fontWeight:700,color:it.current_stock<=0?'#dc2626':it.current_stock<=10?'#ea580c':'var(--atx)'}}>{it.current_stock}</div>
                        {it.reserved_stock>0 && <div style={{fontSize:11,color:'var(--atx3)'}}>Reserved: {it.reserved_stock}</div>}
                      </td>
                      <td className="hide-mobile" style={{fontSize:12,fontFamily:'monospace'}}>{it.batch_number||'—'}</td>
                      <td className="hide-mobile" style={{fontSize:12}}>
                        {it.expiry_date ? new Date(it.expiry_date).toLocaleDateString('en-IN') : '—'}
                        {it.days_to_expiry!=null && it.days_to_expiry>=0 && <div style={{fontSize:11,color:'var(--atx3)'}}>{it.days_to_expiry}d left</div>}
                      </td>
                      <td><span style={{fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:20,background:eb.bg,color:eb.color}}>{eb.label}</span></td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={total} limit={limit} onChange={setPage} />
      </div>
    </AdminLayout>
  );
}

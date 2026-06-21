import { useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AdminLayout from '../layouts/AdminLayout';
import { PageHeader } from '../components/AdminUI';

const MONTHLY = [
  {m:'Aug',rev:280000,orders:620},{m:'Sep',rev:320000,orders:740},{m:'Oct',rev:290000,orders:670},
  {m:'Nov',rev:380000,orders:890},{m:'Dec',rev:410000,orders:950},{m:'Jan',rev:482000,orders:1120},
];
const DAILY = [
  {d:'Mon',rev:18400},{d:'Tue',rev:22100},{d:'Wed',rev:16800},{d:'Thu',rev:28600},{d:'Fri',rev:31200},{d:'Sat',rev:36400},{d:'Sun',rev:24800},
];
const TOP_PRODUCTS = [
  { name:'Hybrid Tomato Seeds F1', units:142, revenue:42458 },
  { name:'NPK 19:19:19 1kg',       units:98,  revenue:18130 },
  { name:'Neem Oil 10000 PPM 1L',  units:76,  revenue:63840 },
  { name:'Drip Irrigation Kit',    units:24,  revenue:83976 },
  { name:'Humic Acid 300g',        units:58,  revenue:15138 },
];

const TABS = ['Daily','Weekly','Monthly','Yearly'];

export default function AdminReports() {
  const [tab, setTab] = useState('Monthly');

  return (
    <AdminLayout>
      <PageHeader title="Reports & Analytics" sub="Revenue, orders, and product performance"
        actions={
          <div style={{ display:'flex', gap:8 }}>
            {['PDF','Excel','CSV'].map(t=>(
              <button key={t} className="a-btn a-btn-sm a-btn-sec">⬇ {t}</button>
            ))}
          </div>
        }
      />

      {/* Summary KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        {[['₹4.82L','Total Revenue','↑ 22%',true],['8,924','Total Orders','↑ 12%',true],['52,840','Customers','↑ 8%',true],['10,482','Products','↑ 3%',true]].map(([v,l,ch,up])=>(
          <div key={l} className="a-card a-card-p" style={{ textAlign:'center' }}>
            <div style={{ fontSize:26, fontWeight:900, color:'var(--atx)' }}>{v}</div>
            <div style={{ fontSize:12, color:'var(--atx2)', margin:'4px 0' }}>{l}</div>
            <div style={{ fontSize:12, fontWeight:700, color: up?'#16a34a':'#dc2626' }}>{ch} this month</div>
          </div>
        ))}
      </div>

      {/* Period tabs */}
      <div style={{ display:'flex', gap:6, marginBottom:20, background:'var(--ab)', borderRadius:10, padding:4, width:'fit-content', border:'1px solid var(--abord)' }}>
        {TABS.map(t=>(
          <button key={t} onClick={()=>setTab(t)}
            style={{ padding:'7px 16px', borderRadius:8, border:'none', fontSize:13, fontWeight:700, cursor:'pointer', background: tab===t?'var(--apri)':'transparent', color: tab===t?'white':'var(--atx2)', transition:'all 0.18s' }}
          >{t}</button>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        <div className="a-card a-card-p">
          <h3 style={{ fontSize:15, fontWeight:800, marginBottom:4 }}>Revenue Trend</h3>
          <p style={{ fontSize:12, color:'var(--atx2)', marginBottom:16 }}>{tab} view</p>
          <div className="a-chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY}>
                <defs><linearGradient id="rg2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2e7d32" stopOpacity={0.2}/><stop offset="95%" stopColor="#2e7d32" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--abord)" />
                <XAxis dataKey="m" tick={{ fontSize:11, fill:'var(--atx2)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11, fill:'var(--atx2)' }} axisLine={false} tickLine={false} tickFormatter={v=>`₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={v=>['₹'+v.toLocaleString('en-IN'),'Revenue']} contentStyle={{ background:'var(--ab)', border:'1px solid var(--abord)', borderRadius:10, fontSize:12 }} />
                <Area type="monotone" dataKey="rev" stroke="#2e7d32" strokeWidth={2.5} fill="url(#rg2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="a-card a-card-p">
          <h3 style={{ fontSize:15, fontWeight:800, marginBottom:4 }}>Daily Revenue</h3>
          <p style={{ fontSize:12, color:'var(--atx2)', marginBottom:16 }}>This week</p>
          <div className="a-chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DAILY}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--abord)" />
                <XAxis dataKey="d" tick={{ fontSize:11, fill:'var(--atx2)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11, fill:'var(--atx2)' }} axisLine={false} tickLine={false} tickFormatter={v=>`₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={v=>['₹'+v.toLocaleString('en-IN'),'Revenue']} contentStyle={{ background:'var(--ab)', border:'1px solid var(--abord)', borderRadius:10, fontSize:12 }} />
                <Bar dataKey="rev" fill="#f9a825" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="a-card">
        <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--abord)', fontWeight:800, fontSize:15 }}>🔥 High Moving Products</div>
        <div className="a-table-wrap">
          <table className="a-table">
            <thead><tr><th>#</th><th>Product</th><th>Units Sold</th><th>Revenue</th><th>Share</th></tr></thead>
            <tbody>
              {TOP_PRODUCTS.map((p,i)=>{
                const maxRev = Math.max(...TOP_PRODUCTS.map(x=>x.revenue));
                return (
                  <tr key={i}>
                    <td style={{ fontWeight:800, color:'var(--atx3)' }}>#{i+1}</td>
                    <td style={{ fontWeight:700 }}>{p.name}</td>
                    <td style={{ fontWeight:700 }}>{p.units}</td>
                    <td style={{ fontWeight:700, color:'var(--apri)' }}>₹{p.revenue.toLocaleString('en-IN')}</td>
                    <td style={{ minWidth:140 }}>
                      <div style={{ height:6, borderRadius:3, background:'var(--ab3)', overflow:'hidden' }}>
                        <div style={{ height:'100%', borderRadius:3, background:'linear-gradient(90deg,#2e7d32,#66bb6a)', width:`${(p.revenue/maxRev*100).toFixed(0)}%` }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

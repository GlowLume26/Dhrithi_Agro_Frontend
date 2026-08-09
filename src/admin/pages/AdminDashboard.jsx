import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AdminLayout from '../layouts/AdminLayout';
import { KpiCard, Skel, StatusBadge, PageHeader } from '../components/AdminUI';
import adminApi from '../services/adminApi';

const REVENUE_DATA = [
  { month:'Aug', revenue:280000 }, { month:'Sep', revenue:320000 }, { month:'Oct', revenue:290000 },
  { month:'Nov', revenue:380000 }, { month:'Dec', revenue:410000 }, { month:'Jan', revenue:482000 },
];
const DAILY_DATA = [
  { day:'Mon', orders:42 }, { day:'Tue', orders:58 }, { day:'Wed', orders:35 },
  { day:'Thu', orders:67 }, { day:'Fri', orders:79 }, { day:'Sat', orders:91 }, { day:'Sun', orders:54 },
];
const RECENT_ORDERS = [
  { id:'#DA-78432', customer:'Ramesh Patil',    amount:'₹598',   status:'Shipped',    date:'15 Jan 2025' },
  { id:'#DA-78401', customer:'Sunita Devi',     amount:'₹925',   status:'Processing', date:'15 Jan 2025' },
  { id:'#DA-78389', customer:'Krishnamurthy',   amount:'₹2,520', status:'Delivered',  date:'14 Jan 2025' },
  { id:'#DA-78350', customer:'Mohan Lal',       amount:'₹3,499', status:'Delivered',  date:'13 Jan 2025' },
  { id:'#DA-78312', customer:'Priya Sharma',    amount:'₹1,044', status:'Cancelled',  date:'12 Jan 2025' },
];
const LOW_STOCK = [
  { name:'NPK 19:19:19 1kg',       stock:8,  threshold:10 },
  { name:'Drip Irrigation Kit',    stock:3,  threshold:10 },
  { name:'Imidacloprid 17.8% SL',  stock:0,  threshold:5  },
  { name:'Hybrid Tomato Seeds F1', stock:6,  threshold:10 },
];
const KPIS = [
  { icon:'📦', label:'Total Products',   value:'10,482', change:'↑ 320 this month', changeUp:true,  iconBg:'#f0fdf4' },
  { icon:'🛒', label:'Total Orders',     value:'8,924',  change:'↑ 342 this month', changeUp:true,  iconBg:'#eff6ff' },
  { icon:'⏳', label:'Pending Orders',   value:'127',    change:'↑ 12 today',       changeUp:false, iconBg:'#fff7ed' },
  { icon:'💰', label:'Revenue',          value:'₹48.2L', change:'↑ 22% this month', changeUp:true,  iconBg:'#f0fdf4' },
  { icon:'👥', label:'Total Customers',  value:'52,840', change:'↑ 1,240 this month',changeUp:true, iconBg:'#fdf4ff' },
  { icon:'⚠️', label:'Stock Alerts',    value:'7',      change:'Products low',      changeUp:false, iconBg:'#fff7ed' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats]     = useState(null);
  const [recentOrders, setRecentOrders] = useState(RECENT_ORDERS);
  const [revenue, setRevenue]           = useState(REVENUE_DATA);

  useEffect(() => {
    adminApi.getDashboard()
      .then(res => {
        if (res.success && res.data) {
          const d = res.data;
          if (d.stats) setStats(d.stats);
          if (d.recentOrders?.length) setRecentOrders(d.recentOrders);
          if (d.monthlyRevenue?.length) setRevenue(d.monthlyRevenue.map(r => ({ month: r.month, revenue: Number(r.revenue) })));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const kpis = [
    { icon:'📦', label:'Total Products',   value: stats ? Number(stats.total_products).toLocaleString('en-IN')   : KPIS[0].value, change: KPIS[0].change, changeUp:true,  iconBg:'#f0fdf4' },
    { icon:'🛒', label:'Total Orders',     value: stats ? Number(stats.total_orders).toLocaleString('en-IN')     : KPIS[1].value, change: KPIS[1].change, changeUp:true,  iconBg:'#eff6ff' },
    { icon:'💰', label:'Revenue',          value: stats ? '₹' + Number(stats.total_revenue).toLocaleString('en-IN') : KPIS[3].value, change: KPIS[3].change, changeUp:true, iconBg:'#f0fdf4' },
    { icon:'👥', label:'Total Customers',  value: stats ? Number(stats.total_customers).toLocaleString('en-IN')  : KPIS[4].value, change: KPIS[4].change, changeUp:true,  iconBg:'#fdf4ff' },
    { icon:'🏪', label:'Active Vendors',   value: stats ? Number(stats.total_vendors).toLocaleString('en-IN')    : '—',            change: '',              changeUp:true,  iconBg:'#f0fdf4' },
    { icon:'⏳', label:'Pending Vendors',  value: stats ? Number(stats.pending_vendors).toLocaleString('en-IN')  : '—',            change: 'Awaiting review', changeUp:false, iconBg:'#fff7ed' },
  ];

  return (
    <AdminLayout>
      <PageHeader title="Dashboard" sub="Welcome back! Here's what's happening." />

      {/* KPI Cards */}
      <div className="a-kpi-grid">
        {loading
          ? [0,1,2,3,4,5].map(i => <div key={i} className="a-kpi"><Skel h={60} /><Skel h={46} w={46} r={12} /></div>)
          : kpis.map((k,i) => <KpiCard key={k.label} {...k} delay={i*0.06} />)
        }
      </div>

      {/* Charts row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        <motion.div className="a-card a-card-p" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.38 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div>
              <h3 style={{ fontSize:15, fontWeight:800, color:'var(--atx)' }}>Revenue Trend</h3>
              <p style={{ fontSize:12, color:'var(--atx2)' }}>Last 6 months</p>
            </div>
          </div>
          <div className="a-chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenue}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2e7d32" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#2e7d32" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--abord)" />
                <XAxis dataKey="month" tick={{ fontSize:11, fill:'var(--atx2)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11, fill:'var(--atx2)' }} axisLine={false} tickLine={false} tickFormatter={v=>`₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={v=>[`₹${v.toLocaleString('en-IN')}`, 'Revenue']} contentStyle={{ background:'var(--ab)', border:'1px solid var(--abord)', borderRadius:10, fontSize:12 }} />
                <Area type="monotone" dataKey="revenue" stroke="#2e7d32" strokeWidth={2.5} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div className="a-card a-card-p" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.44 }}>
          <div style={{ marginBottom:16 }}>
            <h3 style={{ fontSize:15, fontWeight:800, color:'var(--atx)' }}>Daily Orders</h3>
            <p style={{ fontSize:12, color:'var(--atx2)' }}>This week</p>
          </div>
          <div className="a-chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DAILY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--abord)" />
                <XAxis dataKey="day" tick={{ fontSize:11, fill:'var(--atx2)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11, fill:'var(--atx2)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background:'var(--ab)', border:'1px solid var(--abord)', borderRadius:10, fontSize:12 }} />
                <Bar dataKey="orders" fill="#f9a825" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent orders + Low stock */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:20 }}>
        <motion.div className="a-card" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px', borderBottom:'1px solid var(--abord)' }}>
            <h3 style={{ fontSize:15, fontWeight:800, color:'var(--atx)' }}>Recent Orders</h3>
            <button className="a-btn a-btn-sm a-btn-sec" onClick={()=>navigate('/admin/orders')}>View All</button>
          </div>
          <div className="a-table-wrap">
            <table className="a-table">
              <thead><tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o.id || o.order_number} style={{ cursor:'pointer' }} onClick={()=>navigate('/admin/orders')}>
                    <td style={{ fontWeight:700, color:'var(--apri)' }}>#{o.order_number}</td>
                    <td>{o.customer_name || o.customer}</td>
                    <td style={{ fontWeight:700 }}>₹{Number(o.final_amount || o.amount?.replace(/[₹,]/g,'')||0).toLocaleString('en-IN')}</td>
                    <td><StatusBadge status={o.order_status || o.status} /></td>
                    <td style={{ color:'var(--atx2)' }}>{o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short'}) : o.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div className="a-card a-card-p" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.54 }}>
          <h3 style={{ fontSize:15, fontWeight:800, color:'var(--atx)', marginBottom:16 }}>⚠️ Low Stock Alerts</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {LOW_STOCK.map(item => (
              <div key={item.name} style={{ background:'var(--ab3)', borderRadius:10, padding:'11px 14px', border:`1px solid ${item.stock===0?'#fecaca':item.stock<5?'#fed7aa':'var(--abord)'}` }}>
                <div style={{ fontSize:13, fontWeight:600, color:'var(--atx)', marginBottom:4 }}>{item.name}</div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span style={{ fontSize:12, color: item.stock===0?'#dc2626':item.stock<=3?'#ea580c':'#d97706', fontWeight:700 }}>
                    {item.stock===0 ? '❌ Out of Stock' : `⚠️ ${item.stock} units left`}
                  </span>
                  <button className="a-btn a-btn-sm a-btn-sec" onClick={()=>navigate('/admin/inventory')} style={{ fontSize:11 }}>Restock</button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <style>{`@media(max-width:960px){.a-kpi-grid{grid-template-columns:repeat(3,1fr)} div[style*="grid-template-columns:1fr 1fr"]{grid-template-columns:1fr} div[style*="grid-template-columns:1fr 340px"]{grid-template-columns:1fr}}`}</style>
    </AdminLayout>
  );
}

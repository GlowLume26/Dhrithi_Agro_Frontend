import { useState } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { PageHeader } from '../components/AdminUI';

const TABS = ['Business','Payment','Shipping','Tax'];

export default function AdminSettings() {
  const [tab, setTab]     = useState('Business');
  const [saved, setSaved] = useState(false);
  const [biz, setBiz]     = useState({ name:'Drithi Agro', gst:'27AABCD1234E1Z5', address:'123, Agri Hub, Pune', phone:'1800-XXX-XXXX', email:'support@drithiagro.com' });
  const [pay, setPay]     = useState({ razorpay:true, stripe:false, cod:true });
  const [ship, setShip]   = useState({ flat:true, free:true, zone:false, flat_amount:'50', free_threshold:'499' });
  const [tax, setTax]     = useState({ gst_rate:'5', state_tax:'0', extra_charges:'0' });

  function save() { setSaved(true); setTimeout(()=>setSaved(false), 2500); }

  const bf = (k,v) => setBiz(x=>({...x,[k]:v}));
  const tf = (k,v) => setTax(x=>({...x,[k]:v}));
  const sf = (k,v) => setShip(x=>({...x,[k]:v}));

  return (
    <AdminLayout>
      <PageHeader title="Settings" sub="Configure your store preferences"
        actions={<button className="a-btn a-btn-pri" onClick={save}>{saved?'✅ Saved!':'💾 Save Changes'}</button>}
      />

      {/* Tab pills */}
      <div style={{ display:'flex', gap:6, marginBottom:24, background:'var(--ab)', borderRadius:10, padding:4, width:'fit-content', border:'1px solid var(--abord)' }}>
        {TABS.map(t=>(
          <button key={t} onClick={()=>setTab(t)}
            style={{ padding:'7px 18px', borderRadius:8, border:'none', fontSize:13, fontWeight:700, cursor:'pointer', background: tab===t?'var(--apri)':'transparent', color: tab===t?'white':'var(--atx2)', transition:'all 0.18s' }}
          >{t}</button>
        ))}
      </div>

      {/* Business Info */}
      {tab === 'Business' && (
        <div className="a-card a-card-p">
          <h3 style={{ fontSize:15, fontWeight:800, marginBottom:20 }}>🏢 Business Information</h3>
          <div className="a-form-grid">
            <div className="a-fg"><label>Company Name</label><input className="a-input" value={biz.name} onChange={e=>bf('name',e.target.value)} /></div>
            <div className="a-fg"><label>GST Number</label><input className="a-input" value={biz.gst} onChange={e=>bf('gst',e.target.value)} /></div>
            <div className="a-fg full"><label>Address</label><input className="a-input" value={biz.address} onChange={e=>bf('address',e.target.value)} /></div>
            <div className="a-fg"><label>Phone</label><input className="a-input" value={biz.phone} onChange={e=>bf('phone',e.target.value)} /></div>
            <div className="a-fg"><label>Support Email</label><input className="a-input" value={biz.email} onChange={e=>bf('email',e.target.value)} /></div>
          </div>
        </div>
      )}

      {/* Payment */}
      {tab === 'Payment' && (
        <div className="a-card a-card-p">
          <h3 style={{ fontSize:15, fontWeight:800, marginBottom:20 }}>💳 Payment Gateways</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {[['razorpay','Razorpay','Online payments via UPI, Cards, Net Banking'],['stripe','Stripe','International card payments'],['cod','Cash on Delivery','Pay when product arrives']].map(([k,l,sub])=>(
              <div key={k} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 18px', background:'var(--ab3)', borderRadius:12, border:'1px solid var(--abord)' }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:14 }}>{l}</div>
                  <div style={{ fontSize:12, color:'var(--atx2)', marginTop:2 }}>{sub}</div>
                </div>
                <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
                  <span style={{ fontSize:12, color:'var(--atx2)' }}>{pay[k]?'Enabled':'Disabled'}</span>
                  <input type="checkbox" checked={pay[k]} onChange={e=>setPay(p=>({...p,[k]:e.target.checked}))} style={{ width:36, height:20, accentColor:'var(--apri)', cursor:'pointer' }} />
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shipping */}
      {tab === 'Shipping' && (
        <div className="a-card a-card-p">
          <h3 style={{ fontSize:15, fontWeight:800, marginBottom:20 }}>🚚 Shipping Settings</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {[['flat','Flat Rate Shipping','Fixed charge per order'],['free','Free Shipping Threshold','Free above a minimum order'],['zone','Zone-Based Shipping','Different rates per zone']].map(([k,l,sub])=>(
              <div key={k}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', background:'var(--ab3)', borderRadius:12, border:'1px solid var(--abord)' }}>
                  <div><div style={{ fontWeight:700, fontSize:14 }}>{l}</div><div style={{ fontSize:12, color:'var(--atx2)', marginTop:2 }}>{sub}</div></div>
                  <input type="checkbox" checked={ship[k]} onChange={e=>sf(k,e.target.checked)} style={{ width:36, height:20, accentColor:'var(--apri)', cursor:'pointer' }} />
                </div>
                {k==='flat' && ship.flat && (
                  <div style={{ padding:'12px 18px', background:'var(--ab)', border:'1px solid var(--abord)', borderTop:'none', borderRadius:'0 0 12px 12px' }}>
                    <div className="a-fg"><label>Flat Rate (₹)</label><input className="a-input" value={ship.flat_amount} onChange={e=>sf('flat_amount',e.target.value)} style={{ maxWidth:160 }} /></div>
                  </div>
                )}
                {k==='free' && ship.free && (
                  <div style={{ padding:'12px 18px', background:'var(--ab)', border:'1px solid var(--abord)', borderTop:'none', borderRadius:'0 0 12px 12px' }}>
                    <div className="a-fg"><label>Free Above (₹)</label><input className="a-input" value={ship.free_threshold} onChange={e=>sf('free_threshold',e.target.value)} style={{ maxWidth:160 }} /></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tax */}
      {tab === 'Tax' && (
        <div className="a-card a-card-p">
          <h3 style={{ fontSize:15, fontWeight:800, marginBottom:20 }}>🧾 Tax Configuration</h3>
          <div className="a-form-grid cols3">
            <div className="a-fg"><label>GST Rate (%)</label><input className="a-input" type="number" value={tax.gst_rate} onChange={e=>tf('gst_rate',e.target.value)} /></div>
            <div className="a-fg"><label>State Tax (%)</label><input className="a-input" type="number" value={tax.state_tax} onChange={e=>tf('state_tax',e.target.value)} /></div>
            <div className="a-fg"><label>Extra Charges (₹)</label><input className="a-input" type="number" value={tax.extra_charges} onChange={e=>tf('extra_charges',e.target.value)} /></div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

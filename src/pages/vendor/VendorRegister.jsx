import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const UPLOAD_DOCS = [
  { id: 'aadhaar', icon: '🪪', label: 'Aadhaar Card', sub: 'Front & Back' },
  { id: 'pan', icon: '💳', label: 'PAN Card', sub: 'Business or Personal PAN' },
  { id: 'gst', icon: '📋', label: 'GST Certificate', sub: 'GST Registration Certificate' },
  { id: 'reg', icon: '🏢', label: 'Business Registration', sub: 'Incorporation / Shop Act' },
  { id: 'bank', icon: '🏦', label: 'Bank Passbook', sub: 'Or Cancelled Cheque' },
  { id: 'logo', icon: '🖼️', label: 'Business Logo', sub: 'PNG/JPG, min 200×200px' },
];

const STATES = ['Maharashtra','Uttar Pradesh','Punjab','Karnataka','Tamil Nadu','Gujarat','Rajasthan','Madhya Pradesh','Andhra Pradesh','Telangana','Bihar','West Bengal'];

export default function VendorRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [uploads, setUploads] = useState({});
  const [agreed, setAgreed] = useState(false);
  const [success, setSuccess] = useState(false);
  const [biz, setBiz] = useState({ bizName:'',ownerName:'',bizMobile:'',bizEmail:'',gstNum:'',panNum:'',bizAddr:'',bizCity:'',bizState:'',bizPin:'',bizType:'Sole Proprietorship' });
  const [store, setStore] = useState({ storeName:'',storeCategory:'Seeds & Planting',storeDesc:'',bankAcc:'',ifscCode:'',accHolder:'',bankName:'' });

  function goStep(n) { setStep(n); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function handleUpload(id, file) { if (file) setUploads(u => ({ ...u, [id]: file.name })); }

  const stepLabels = ['Business Details', 'Documents', 'Store Setup', 'Review'];

  if (success) return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 40, textAlign: 'center' }}>
      <div style={{ fontSize: 80, marginBottom: 20 }}>🎉</div>
      <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1b5e20', marginBottom: 12 }}>Application Submitted!</h2>
      <p style={{ fontSize: 15, color: '#666', lineHeight: 1.7, maxWidth: 500, margin: '0 auto 24px' }}>Your vendor registration has been submitted successfully. Our team will review your documents and get back to you within <b>2–3 business days</b>.</p>
      <div style={{ background: '#e8f5e9', borderRadius: 12, padding: '16px 24px', display: 'inline-block', margin: '16px 0' }}>
        <span style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 4 }}>Application Reference ID</span>
        <h3 style={{ fontSize: 24, fontWeight: 900, color: '#1b5e20' }}>VR-2025-DA-{Math.floor(Math.random()*9000+1000)}</h3>
      </div>
      <p style={{ fontSize: 13, color: '#2e7d32', fontWeight: 600 }}>📧 Confirmation sent to your email & mobile</p>
      <button onClick={() => navigate('/')} style={{ background: '#2e7d32', color: 'white', border: 'none', padding: '12px 28px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 24 }}>🏠 Go to Home</button>
    </div>
  );

  return (
    <>
      <div style={{ background: '#f5f5f5', padding: '12px 40px', fontSize: 13, color: '#666' }}>
        <Link to="/" style={{ color: '#2e7d32' }}>Home</Link> › Vendor Registration
      </div>
      <div className="vendor-reg-page">
        {/* HERO */}
        <div className="vendor-hero">
          <h1>🤝 Sell on Drithi Agro</h1>
          <p>Join India's fastest growing agri-marketplace. Reach 5 lakh+ farmers across 28 states.</p>
          <div className="vendor-benefits">
            {['🚀 Zero Setup Fee','📦 Logistics Support','💰 Weekly Payouts','📊 Analytics Dashboard'].map(b => <span key={b} className="vb">{b}</span>)}
          </div>
        </div>

        {/* STEPS */}
        <div className="reg-steps">
          {stepLabels.map((l, i) => (
            <>
              {i > 0 && <div key={`rl${i}`} className={'rs-line' + (step > i ? ' done' : '')} />}
              <div key={l} className={`rs${step === i + 1 ? ' active' : step > i + 1 ? ' done' : ''}`}>
                <div className="rs-num">{step > i + 1 ? '✓' : i + 1}</div>
                <span>{l}</span>
              </div>
            </>
          ))}
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="form-section">
            <h3>🏢 Business Information</h3>
            <div className="form-grid">
              {[['Business Name','bizName','text'],['Owner Name','ownerName','text'],['Mobile Number','bizMobile','tel'],['Email Address','bizEmail','email'],['GST Number','gstNum','text'],['PAN Number','panNum','text']].map(([l,k,t]) => (
                <div key={k} className="form-group"><label>{l} <span style={{color:'#e53935'}}>*</span></label><input type={t} value={biz[k]} onChange={e => setBiz(b => ({...b,[k]:e.target.value}))} /></div>
              ))}
              <div className="form-group full"><label>Business Address <span style={{color:'#e53935'}}>*</span></label><textarea rows={2} value={biz.bizAddr} onChange={e => setBiz(b => ({...b,bizAddr:e.target.value}))} /></div>
              <div className="form-group"><label>City</label><input type="text" value={biz.bizCity} onChange={e => setBiz(b => ({...b,bizCity:e.target.value}))} /></div>
              <div className="form-group"><label>State</label>
                <select value={biz.bizState} onChange={e => setBiz(b => ({...b,bizState:e.target.value}))}>
                  <option value="">Select State</option>
                  {STATES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Pincode</label><input type="text" maxLength={6} value={biz.bizPin} onChange={e => setBiz(b => ({...b,bizPin:e.target.value}))} /></div>
              <div className="form-group"><label>Business Type</label>
                <select value={biz.bizType} onChange={e => setBiz(b => ({...b,bizType:e.target.value}))}>
                  {['Sole Proprietorship','Partnership','Private Limited','LLP','Other'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <button onClick={() => goStep(2)} style={{ background: '#2e7d32', color: 'white', border: 'none', padding: '14px 32px', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>Next: Upload Documents →</button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="form-section">
            <h3>📄 Required Documents</h3>
            <p style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>Upload clear scanned copies or photos. Accepted formats: JPG, PNG, PDF (Max 5MB each)</p>
            <div className="upload-grid">
              {UPLOAD_DOCS.map(doc => (
                <label key={doc.id} className={uploads[doc.id] ? 'doc-uploaded' : 'upload-box'} style={{ cursor: 'pointer' }}>
                  <input type="file" accept=".jpg,.png,.pdf" style={{ display: 'none' }} onChange={e => handleUpload(doc.id, e.target.files[0])} />
                  <div className={uploads[doc.id] ? 'du-icon' : 'ub-icon'}>{doc.icon}</div>
                  <h4>{doc.label}</h4>
                  {uploads[doc.id] ? <span>✅ {uploads[doc.id]}</span> : <p>{doc.sub}</p>}
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', marginTop: 16 }}>
              <button onClick={() => goStep(1)} style={{ background: '#f5f5f5', color: '#333', border: 'none', padding: '14px 32px', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>← Back</button>
              <button onClick={() => goStep(3)} style={{ background: '#2e7d32', color: 'white', border: 'none', padding: '14px 32px', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>Next: Store Setup →</button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="form-section">
            <h3>🏪 Store Details</h3>
            <div className="form-grid">
              <div className="form-group"><label>Store Name <span style={{color:'#e53935'}}>*</span></label><input type="text" value={store.storeName} onChange={e => setStore(s => ({...s,storeName:e.target.value}))} /></div>
              <div className="form-group"><label>Store Category</label>
                <select value={store.storeCategory} onChange={e => setStore(s => ({...s,storeCategory:e.target.value}))}>
                  {['Seeds & Planting','Fertilizers & Nutrients','Pesticides & Herbicides','Organic Farming','Farm Equipment','Irrigation Systems','Animal Husbandry','Multi-Category'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group full"><label>Store Description <span style={{color:'#e53935'}}>*</span></label><textarea rows={3} value={store.storeDesc} onChange={e => setStore(s => ({...s,storeDesc:e.target.value}))} /></div>
              <div className="form-group"><label>Bank Account Number <span style={{color:'#e53935'}}>*</span></label><input type="text" value={store.bankAcc} onChange={e => setStore(s => ({...s,bankAcc:e.target.value}))} /></div>
              <div className="form-group"><label>IFSC Code <span style={{color:'#e53935'}}>*</span></label><input type="text" value={store.ifscCode} onChange={e => setStore(s => ({...s,ifscCode:e.target.value}))} /></div>
              <div className="form-group"><label>Account Holder Name</label><input type="text" value={store.accHolder} onChange={e => setStore(s => ({...s,accHolder:e.target.value}))} /></div>
              <div className="form-group"><label>Bank Name</label><input type="text" value={store.bankName} onChange={e => setStore(s => ({...s,bankName:e.target.value}))} /></div>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', marginTop: 16 }}>
              <button onClick={() => goStep(2)} style={{ background: '#f5f5f5', color: '#333', border: 'none', padding: '14px 32px', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>← Back</button>
              <button onClick={() => goStep(4)} style={{ background: '#2e7d32', color: 'white', border: 'none', padding: '14px 32px', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>Review & Submit →</button>
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="form-section">
            <h3>✅ Review Your Application</h3>
            <div style={{ background: '#f9fbe7', borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: '#1b5e20', marginBottom: 12 }}>Business Details</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13 }}>
                {[['Business Name', biz.bizName], ['Owner Name', biz.ownerName], ['Mobile', biz.bizMobile], ['Email', biz.bizEmail], ['GST Number', biz.gstNum], ['PAN Number', biz.panNum]].map(([k, v]) => (
                  <div key={k}><span style={{ color: '#888' }}>{k}:</span><br /><b>{v || '—'}</b></div>
                ))}
              </div>
            </div>
            <div style={{ background: '#e8f5e9', borderRadius: 12, padding: 16, marginBottom: 16, fontSize: 13, color: '#2e7d32' }}>
              <b>📋 What happens next?</b><br />
              1. Our team will review your application within 2–3 business days.<br />
              2. You'll receive an email/SMS with the approval status.<br />
              3. Once approved, your Vendor ID and login credentials will be sent to your registered email & mobile.
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16 }}>
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginTop: 3, accentColor: '#2e7d32', width: 16, height: 16 }} />
              <label style={{ fontSize: 13, color: '#555', cursor: 'pointer' }}>I agree to the <a href="#" style={{ color: '#2e7d32', fontWeight: 600 }}>Vendor Terms & Conditions</a> and <a href="#" style={{ color: '#2e7d32', fontWeight: 600 }}>Seller Policy</a> of Drithi Agro Marketplace.</label>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}>
              <button onClick={() => goStep(3)} style={{ background: '#f5f5f5', color: '#333', border: 'none', padding: '14px 32px', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>← Back</button>
              <button onClick={() => { if (!agreed) { alert('Please agree to the Terms & Conditions to proceed.'); return; } setSuccess(true); }} style={{ background: '#2e7d32', color: 'white', border: 'none', padding: '14px 40px', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>🚀 Submit Application</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminApi } from '../services/adminApi';
import '../admin.css';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAdminAuth();
  const [email, setEmail]       = useState('');
  const [pass, setPass]         = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [err, setErr]           = useState('');
  const [showPass, setShowPass] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    if (!email || !pass) { setErr('Please enter email and password.'); return; }
    setLoading(true); setErr('');
    try {
      const res = await adminApi.login(email, pass);
      console.log(res);
      if (res.success) {
        login(res.data.token, res.data.user);
        navigate('/admin/dashboard');
      } else {
        setErr(res.message || 'Invalid credentials.');
      }
    } catch (err) {
      setErr(err.message || 'Login failed. Please try again.');
    }
    setLoading(false);
  }

  return (
    <div className="admin-root" style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#0f2b14 100%)' }}>
      <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
        {[...Array(6)].map((_,i) => (
          <motion.div key={i} animate={{ y:[0,-30,0], opacity:[0.06,0.12,0.06] }} transition={{ duration:4+i, repeat:Infinity, delay:i*0.7 }}
            style={{ position:'absolute', width:200+i*80, height:200+i*80, borderRadius:'50%', background:'rgba(46,125,50,0.15)', top:`${10+i*14}%`, left:`${5+i*15}%` }} />
        ))}
      </div>

      <motion.div initial={{ opacity:0, y:28 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}
        style={{ background:'rgba(30,41,59,0.85)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:24, padding:'44px 40px', width:'100%', maxWidth:420, boxShadow:'0 32px 80px rgba(0,0,0,0.4)', position:'relative' }}
      >
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ width:64, height:64, background:'linear-gradient(135deg,#2e7d32,#66bb6a)', borderRadius:18, display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, margin:'0 auto 14px', boxShadow:'0 8px 24px rgba(46,125,50,0.4)' }}>🌿</div>
          <h1 style={{ fontSize:22, fontWeight:900, color:'#f8fafc' }}>Drithi Agro</h1>
          <p style={{ fontSize:12, color:'#64748b', marginTop:4, textTransform:'uppercase', letterSpacing:1.5 }}>Admin Portal</p>
        </div>

        <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {err && (
            <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
              style={{ background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:10, padding:'10px 14px', fontSize:13, color:'#fca5a5' }}
            >{err}</motion.div>
          )}

          <div>
            <label style={{ fontSize:12, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:0.8, display:'block', marginBottom:6 }}>Email or Mobile</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} type="text" placeholder="admin@drithiagro.com or 9999999999"
              style={{ width:'100%', padding:'11px 14px', background:'rgba(255,255,255,0.06)', border:'1.5px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#f8fafc', fontSize:14, outline:'none' }}
              onFocus={e=>e.target.style.borderColor='#4caf50'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.1)'} />
          </div>

          <div>
            <label style={{ fontSize:12, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:0.8, display:'block', marginBottom:6 }}>Password</label>
            <div style={{ position:'relative' }}>
              <input value={pass} onChange={e=>setPass(e.target.value)} type={showPass?'text':'password'} placeholder="Enter password"
                style={{ width:'100%', padding:'11px 44px 11px 14px', background:'rgba(255,255,255,0.06)', border:'1.5px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#f8fafc', fontSize:14, outline:'none' }}
                onFocus={e=>e.target.style.borderColor='#4caf50'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.1)'} />
              <button type="button" onClick={()=>setShowPass(s=>!s)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#64748b', fontSize:16 }}>{showPass?'🙈':'👁'}</button>
            </div>
          </div>

          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13, color:'#94a3b8' }}>
              <input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} style={{ accentColor:'#4caf50', width:15, height:15 }} />
              Remember me
            </label>
            <button type="button" style={{ fontSize:13, color:'#4caf50', background:'none', border:'none', cursor:'pointer' }}>Forgot password?</button>
          </div>

          <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }} type="submit" disabled={loading}
            style={{ background:'linear-gradient(135deg,#2e7d32,#43a047)', color:'white', border:'none', padding:'13px', borderRadius:12, fontSize:15, fontWeight:800, cursor:'pointer', boxShadow:'0 6px 24px rgba(46,125,50,0.4)', opacity:loading?0.75:1 }}
          >{loading ? '⏳ Signing in...' : '🔐 Sign In'}</motion.button>
        </form>

        <p style={{ textAlign:'center', fontSize:11, color:'#475569', marginTop:20 }}>🔒 Secured with JWT Authentication · All access is logged</p>
      </motion.div>
    </div>
  );
}
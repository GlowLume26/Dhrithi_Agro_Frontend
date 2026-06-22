import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import '../auth.css';

const API_BASE = 'http://localhost/drithi-agro/backend/index.php?route=';
const OTP_LEN = 6;

function OtpInputs({ prefix, onComplete }) {
  const inputs = useRef([]);
  function handle(i, val) {
    val = val.replace(/\D/g, '');
    if (inputs.current[i]) inputs.current[i].value = val;
    if (val && i < OTP_LEN - 1) inputs.current[i + 1]?.focus();
    const otp = inputs.current.map(el => el?.value || '').join('');
    if (otp.length === OTP_LEN) onComplete(otp);
  }
  function handleKey(e, i) {
    if (e.key === 'Backspace' && !e.target.value && i > 0) inputs.current[i - 1]?.focus();
  }
  const getOtp = () => inputs.current.map(el => el?.value || '').join('');
  return { el: (
    <div className="otp-group" style={{ gap: 8 }}>
      {Array.from({ length: OTP_LEN }, (_, i) => (
        <input key={i} ref={el => inputs.current[i] = el} className="otp-input" maxLength={1}
          onInput={e => handle(i, e.target.value)} onKeyDown={e => handleKey(e, i)} id={`${prefix}${i}`} />
      ))}
    </div>
  ), getOtp };
}

function Timer({ onExpire }) {
  const [sec, setSec] = useState(30);
  useEffect(() => {
    const t = setInterval(() => setSec(s => { if (s <= 1) { clearInterval(t); onExpire(); return 0; } return s - 1; }), 1000);
    return () => clearInterval(t);
  }, []);
  return sec > 0 ? <div className="otp-timer">Resend OTP in <b>{sec}s</b></div> : null;
}

export default function Login() {
  const navigate = useNavigate();
  const { saveAuth, isLoggedIn } = useAuth();
  const [tab, setTab] = useState('login');
  const [loginStep, setLoginStep] = useState(1);
  const [signupStep, setSignupStep] = useState(1);
  const [loginMode, setLoginMode] = useState('phone');
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loginOtp, setLoginOtp] = useState('');
  const [signupOtp, setSignupOtp] = useState('');
  const [timerKey, setTimerKey] = useState(0);
  const [canResend, setCanResend] = useState(false);

  const [loginPhone, setLoginPhone] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [welcomeName, setWelcomeName] = useState('');

  useEffect(() => { if (isLoggedIn) navigate('/account'); }, [isLoggedIn]);

  const showErr = (m) => setMsg({ t: 'error', m });
  const showOk  = (m) => setMsg({ t: 'success', m });
  const hideMsg = () => setMsg(null);
  const vPhone  = (v) => /^[6-9]\d{9}$/.test(v);
  const vEmail  = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  async function sendLoginOtp() {
    hideMsg(); setLoading(true);
    const payload = loginMode === 'phone'
      ? (!vPhone(loginPhone) ? (showErr('Enter a valid 10-digit mobile number.'), setLoading(false), null) : { action: 'send_otp', mobile: loginPhone })
      : (!vEmail(loginEmail) ? (showErr('Enter a valid email address.'), setLoading(false), null) : { action: 'send_otp', email: loginEmail });
    if (!payload) return;
    try {
      const res = await fetch(API_BASE + 'auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).then(r => r.json());
      if (res.success) {
        if (res.data?.otp) showOk('Dev Mode — OTP: ' + res.data.otp);
        else showOk('OTP sent to ' + (loginMode === 'phone' ? '+91 ' + loginPhone : loginEmail));
        setLoginStep(2); setTimerKey(k => k + 1); setCanResend(false);
      } else showErr(res.message || 'Failed to send OTP.');
    } catch { showErr('Network error. Make sure the server is running.'); }
    setLoading(false);
  }

  async function verifyLoginOtp() {
    if (loginOtp.length < OTP_LEN) { showErr('Enter the complete 6-digit OTP.'); return; }
    hideMsg(); setLoading(true);
    const payload = { action: 'verify_otp', otp: loginOtp };
    if (loginMode === 'phone') payload.mobile = loginPhone; else payload.email = loginEmail;
    try {
      const res = await fetch(API_BASE + 'auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).then(r => r.json());
      if (res.success) { saveAuth(res.data.token, res.data.user); navigate('/account'); }
      else showErr(res.message || 'Invalid OTP. Try again.');
    } catch { showErr('Network error.'); }
    setLoading(false);
  }

  async function sendSignupOtp() {
    hideMsg();
    if (!signupName) { showErr('Enter your full name.'); return; }
    if (!vEmail(signupEmail)) { showErr('Enter a valid email address.'); return; }
    if (!vPhone(signupPhone)) { showErr('Enter a valid 10-digit mobile number.'); return; }
    setLoading(true);
    try {
      const res = await fetch(API_BASE + 'auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'send_otp', mobile: signupPhone, purpose: 'REGISTER' }) }).then(r => r.json());
      if (res.success) {
        if (res.data?.otp) showOk('Dev Mode — OTP: ' + res.data.otp);
        else showOk('OTP sent to +91 ' + signupPhone);
        setSignupStep(2); setTimerKey(k => k + 1); setCanResend(false);
      } else showErr(res.message || 'Failed to send OTP.');
    } catch { showErr('Network error.'); }
    setLoading(false);
  }

  async function verifySignupOtp() {
    if (signupOtp.length < OTP_LEN) { showErr('Enter the complete 6-digit OTP.'); return; }
    hideMsg(); setLoading(true);
    try {
      const [first_name, ...rest] = signupName.trim().split(' ');
      const res = await fetch(API_BASE + 'auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'register', first_name, last_name: rest.join(' '), email: signupEmail, mobile: signupPhone, otp: signupOtp }) }).then(r => r.json());
      if (res.success) {
        saveAuth(res.data.token, { mobile: signupPhone, first_name, last_name: rest.join(' '), email: signupEmail });
        setWelcomeName(signupName); setSignupStep(3);
      } else showErr(res.message || 'Registration failed. Try again.');
    } catch { showErr('Network error.'); }
    setLoading(false);
  }

  const totalSteps = tab === 'login' ? 2 : 3;
  const curStep = tab === 'login' ? loginStep : signupStep;

  return (
    <div className="auth-page">
      {/* LEFT */}
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="big-icon">🌾</div>
          <h2>Welcome to<br />Drithi Agro</h2>
          <p>India's most trusted platform for farmers. Get quality products delivered to your doorstep.</p>
          <div className="auth-features">
            {[['🚚', 'Free Delivery', 'On selective products across India'], ['✅', '100% Genuine', 'Verified products from top brands'], ['🧑🌾', 'Expert Support', 'Free agri-expert consultation 24/7'], ['💰', 'Best Prices', 'Exclusive deals for registered farmers']].map(([icon, h, p]) => (
              <div key={h} className="auth-feature"><span className="feat-icon">{icon}</span><div><h4>{h}</h4><p>{p}</p></div></div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="auth-right">
        <div className="auth-box">
          <div className="auth-logo">
            <div className="logo-icon">🌿</div>
            <div><h2>Drithi Agro</h2><span>Farm to Future</span></div>
          </div>

          <div className="auth-tabs">
            <button className={'auth-tab' + (tab === 'login' ? ' active' : '')} onClick={() => { setTab('login'); hideMsg(); }}>Login</button>
            <button className={'auth-tab' + (tab === 'signup' ? ' active' : '')} onClick={() => { setTab('signup'); hideMsg(); }}>Sign Up</button>
          </div>

          {/* STEPS */}
          <div className="step-indicator">
            {Array.from({ length: totalSteps }, (_, i) => (
              <>
                <div key={`s${i}`} className={`step${curStep > i + 1 ? ' done' : curStep === i + 1 ? ' active' : ''}`}>{curStep > i + 1 ? '✓' : i + 1}</div>
                {i < totalSteps - 1 && <div key={`l${i}`} className={'step-line' + (curStep > i + 1 ? ' done' : '')} />}
              </>
            ))}
          </div>

          {msg && (
            <div style={{ display: 'block', padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, marginBottom: 12, textAlign: 'center', background: msg.t === 'error' ? '#ffebee' : '#e8f5e9', color: msg.t === 'error' ? '#c62828' : '#1b5e20' }}>{msg.m}</div>
          )}

          {/* LOGIN */}
          {tab === 'login' && (
            <>
              {loginStep === 1 && (
                <div className="auth-form">
                  <div style={{ display: 'flex', background: '#f5f5f5', borderRadius: 10, padding: 4, marginBottom: 16 }}>
                    {['phone', 'email'].map(m => (
                      <button key={m} onClick={() => setLoginMode(m)} style={{ flex: 1, padding: 8, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: loginMode === m ? '#2e7d32' : 'transparent', color: loginMode === m ? 'white' : '#666' }}>
                        {m === 'phone' ? '📱 Mobile OTP' : '📧 Email OTP'}
                      </button>
                    ))}
                  </div>
                  {loginMode === 'phone' ? (
                    <div className="form-group">
                      <label>📱 Mobile Number</label>
                      <div className="phone-input">
                        <span className="country-code">🇮🇳 +91</span>
                        <input type="tel" placeholder="Enter 10-digit mobile number" maxLength={10} value={loginPhone} onChange={e => setLoginPhone(e.target.value)} />
                      </div>
                    </div>
                  ) : (
                    <div className="form-group">
                      <label>📧 Email Address</label>
                      <input type="email" placeholder="Enter your email address" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} style={{ width: '100%', padding: '11px 14px', border: '2px solid #e0e0e0', borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
                    </div>
                  )}
                  <button className="submit-btn" disabled={loading} onClick={sendLoginOtp}>{loading ? '⏳ Please wait...' : 'Send OTP →'}</button>
                  <p style={{ textAlign: 'center', fontSize: 12, color: '#999', marginTop: 8 }}>By continuing, you agree to our <a href="#" style={{ color: '#2e7d32' }}>Terms</a> & <a href="#" style={{ color: '#2e7d32' }}>Privacy Policy</a></p>
                </div>
              )}
              {loginStep === 2 && (
                <div className="auth-form">
                  <div className="form-group">
                    <label style={{ textAlign: 'center', display: 'block' }}>Enter 6-digit OTP sent to <b>{loginMode === 'phone' ? '+91 ' + loginPhone : loginEmail}</b></label>
                    <div id="loginOtpGroup" className="otp-group" style={{ gap: 8 }}>
                      {Array.from({ length: 6 }, (_, i) => (
                        <input key={i} className="otp-input" maxLength={1}
                          onInput={e => {
                            e.target.value = e.target.value.replace(/\D/g, '');
                            const allInputs = document.querySelectorAll('#loginOtpGroup .otp-input');
                            if (e.target.value && i < 5) allInputs[i + 1]?.focus();
                            setLoginOtp(Array.from(allInputs).map(el => el.value).join(''));
                          }}
                          onKeyDown={e => { if (e.key === 'Backspace' && !e.target.value && i > 0) document.querySelectorAll('#loginOtpGroup .otp-input')[i - 1]?.focus(); }}
                        />
                      ))}
                    </div>
                  </div>
                  {!canResend
                    ? <Timer key={timerKey} onExpire={() => setCanResend(true)} />
                    : <span style={{ color: '#2e7d32', cursor: 'pointer', fontWeight: 700, fontSize: 13 }} onClick={() => { setCanResend(false); sendLoginOtp(); }}>🔄 Resend OTP</span>
                  }
                  <button className="submit-btn" disabled={loading} onClick={verifyLoginOtp}>{loading ? '⏳ Please wait...' : '✅ Verify & Login'}</button>
                  <button onClick={() => { setLoginStep(1); hideMsg(); }} style={{ background: 'none', border: 'none', color: '#2e7d32', fontSize: 13, cursor: 'pointer', textAlign: 'center', width: '100%', marginTop: 8 }}>← Change</button>
                </div>
              )}
            </>
          )}

          {/* SIGNUP */}
          {tab === 'signup' && (
            <>
              {signupStep === 1 && (
                <div className="auth-form">
                  <div className="form-group"><label>👤 Full Name</label><input type="text" placeholder="Enter your full name" value={signupName} onChange={e => setSignupName(e.target.value)} /></div>
                  <div className="form-group"><label>📧 Email Address</label><input type="email" placeholder="Enter your email address" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} /></div>
                  <div className="form-group"><label>📱 Mobile Number</label>
                    <div className="phone-input"><span className="country-code">🇮🇳 +91</span><input type="tel" placeholder="10-digit mobile number" maxLength={10} value={signupPhone} onChange={e => setSignupPhone(e.target.value)} /></div>
                  </div>
                  <button className="submit-btn" disabled={loading} onClick={sendSignupOtp}>{loading ? '⏳ Please wait...' : 'Send OTP →'}</button>
                </div>
              )}
              {signupStep === 2 && (
                <div className="auth-form">
                  <div className="form-group">
                    <label style={{ textAlign: 'center', display: 'block' }}>Enter 6-digit OTP sent to <b>+91 {signupPhone}</b></label>
                    <div id="signupOtpGroup" className="otp-group" style={{ gap: 8 }}>
                      {Array.from({ length: 6 }, (_, i) => (
                        <input key={i} className="otp-input" maxLength={1}
                          onInput={e => {
                            e.target.value = e.target.value.replace(/\D/g, '');
                            const allInputs = document.querySelectorAll('#signupOtpGroup .otp-input');
                            if (e.target.value && i < 5) allInputs[i + 1]?.focus();
                            setSignupOtp(Array.from(allInputs).map(el => el.value).join(''));
                          }}
                          onKeyDown={e => { if (e.key === 'Backspace' && !e.target.value && i > 0) document.querySelectorAll('#signupOtpGroup .otp-input')[i - 1]?.focus(); }}
                        />
                      ))}
                    </div>
                  </div>
                  {!canResend
                    ? <Timer key={timerKey} onExpire={() => setCanResend(true)} />
                    : <span style={{ color: '#2e7d32', cursor: 'pointer', fontWeight: 700, fontSize: 13 }} onClick={() => { setCanResend(false); sendSignupOtp(); }}>🔄 Resend OTP</span>
                  }
                  <button className="submit-btn" disabled={loading} onClick={verifySignupOtp}>{loading ? '⏳ Please wait...' : '✅ Create Account'}</button>
                  <button onClick={() => { setSignupStep(1); hideMsg(); }} style={{ background: 'none', border: 'none', color: '#2e7d32', fontSize: 13, cursor: 'pointer', textAlign: 'center', width: '100%', marginTop: 8 }}>← Go Back</button>
                </div>
              )}
              {signupStep === 3 && (
                <div className="success-screen" style={{ display: 'block' }}>
                  <div className="check">🎉</div>
                  <h3>Welcome to Drithi Agro!</h3>
                  <p>Hello {welcomeName}! Your account has been created successfully. Happy farming! 🌾</p>
                  <button className="submit-btn" onClick={() => navigate('/')}>🏠 Go to Home</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

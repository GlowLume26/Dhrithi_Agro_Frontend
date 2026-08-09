import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../auth.css';

const API_BASE = import.meta.env.VITE_API_BASE || '/drithi-agro-backend/index.php?route=';
export default function Login() {
  const navigate = useNavigate();
  const { saveAuth } = useAuth();   // ← removed isLoggedIn

  const [tab, setTab] = useState('login'); // 'login' | 'signup'

  // ── Login state ──
  const [loginMode, setLoginMode] = useState('phone'); // 'phone' | 'email'
  const [loginPhone, setLoginPhone] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginOtp, setLoginOtp] = useState('');
  const [loginStep, setLoginStep] = useState(1); // 1: input, 2: otp

  // ── Register state ──
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupOtp, setSignupOtp] = useState('');
  const [signupStep, setSignupStep] = useState(1); // 1: input, 2: otp

  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // REMOVED: useEffect(() => { if (isLoggedIn) navigate('/'); }, [isLoggedIn]);
  // This was overriding the role-based navigation below.

  const showErr = (m) => setMsg({ t: 'error', m });
  const showOk = (m) => setMsg({ t: 'success', m });
  const hideMsg = () => setMsg(null);
  const vPhone = (v) => /^[6-9]\d{9}$/.test(v);
  const vEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const loginPhoneInvalid = !vPhone(loginPhone);
  const loginEmailInvalid = !vEmail(loginEmail);
  const signupEmailInvalid = signupEmail.trim() !== '' && !vEmail(signupEmail);
  const signupPhoneInvalid = !vPhone(signupPhone);

  // OTP countdown timer
  useEffect(() => {
    if ((loginStep === 2 || signupStep === 2) && timer > 0 && !canResend) {
      const t = setInterval(() => {
        setTimer(s => { if (s <= 1) { setCanResend(true); return 0; } return s - 1; });
      }, 1000);
      return () => clearInterval(t);
    }
  }, [loginStep, signupStep, timer, canResend]);

  // ═══════════════════════════════════════════════════════════
  // LOGIN FLOW
  // ═══════════════════════════════════════════════════════════

  async function sendLoginOtp() {
    hideMsg(); setLoading(true);
    const payload = loginMode === 'phone'
      ? (!vPhone(loginPhone) ? (showErr('Enter a valid 10-digit mobile number.'), setLoading(false), null)
        : { action: 'send_otp', mobile: loginPhone, purpose: 'LOGIN' })
      : (!vEmail(loginEmail) ? (showErr('Enter a valid email address.'), setLoading(false), null)
        : { action: 'send_otp', email: loginEmail, purpose: 'LOGIN' });
    if (!payload) return;

    try {
      const res = await fetch(API_BASE + 'auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(r => r.json());

      if (res.success) {
        if (res.data?.otp) showOk('Dev Mode — OTP: ' + res.data.otp);
        else showOk('OTP sent to ' + (loginMode === 'phone' ? '+91 ' + loginPhone : loginEmail));
        setLoginStep(2); setTimer(30); setCanResend(false);
      } else {
        if (res.message && (res.message.includes('not found') || res.message.includes('register'))) {
          showErr(res.message);
          setTimeout(() => {
            setTab('signup');
            setLoginStep(1);
            setSignupStep(1);
            hideMsg();
          }, 2000);
        } else {
          showErr(res.message || 'Failed to send OTP.');
        }
      }
    } catch { showErr('Network error. Make sure the server is running.'); }
    setLoading(false);
  }

  async function verifyLoginOtp() {
    if (loginOtp.length < 6) { showErr('Enter the complete 6-digit OTP.'); return; }
    hideMsg(); setLoading(true);
    const payload = { action: 'verify_otp', otp: loginOtp };
    if (loginMode === 'phone') payload.mobile = loginPhone; else payload.email = loginEmail;

    try {
      const res = await fetch(API_BASE + 'auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(r => r.json());

      if (res.success) {
        saveAuth(res.data.token, res.data.user);
        // Navigate by role — this now works because no useEffect overrides it
        const role = res.data.user.role;
        if (role === 'vendor') navigate('/vendor/dashboard');
        // else if (role === 'admin') navigate('/admin/dashboard');
        else navigate('/');
      } else showErr(res.message || 'Invalid OTP. Try again.');
    } catch { showErr('Network error.'); }
    setLoading(false);
  }

  // ═══════════════════════════════════════════════════════════
  // REGISTER FLOW (Customer only)
  // ═══════════════════════════════════════════════════════════

  async function sendSignupOtp() {
    hideMsg();
    if (!signupName.trim()) { showErr('Enter your full name.'); return; }
    if (signupEmail.trim() !== '' && !vEmail(signupEmail)) { showErr('Enter a valid email address.'); return; }
    if (!vPhone(signupPhone)) { showErr('Enter a valid 10-digit mobile number.'); return; }
    setLoading(true);

    try {
      const [first_name, ...rest] = signupName.trim().split(' ');
      const res = await fetch(API_BASE + 'auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_otp',
          purpose: 'REGISTER',
          first_name,
          last_name: rest.join(' '),
          email: signupEmail,
          mobile: signupPhone
        })
      }).then(r => r.json());

      if (res.success) {
        if (res.data?.otp) showOk('Dev Mode — OTP: ' + res.data.otp);
        else showOk('OTP sent to +91 ' + signupPhone);
        setSignupStep(2); setTimer(30); setCanResend(false);
      } else {
        if (res.message && (res.message.includes('Already registered') || res.message.includes('login'))) {
          showErr(res.message);
          setTimeout(() => {
            setTab('login');
            setLoginStep(1);
            setSignupStep(1);
            hideMsg();
          }, 2000);
        } else {
          showErr(res.message || 'Failed to send OTP.');
        }
      }
    } catch { showErr('Network error.'); }
    setLoading(false);
  }

  async function verifySignupOtp() {
    if (signupOtp.length < 6) { showErr('Enter the complete 6-digit OTP.'); return; }
    hideMsg(); setLoading(true);

    try {
      const res = await fetch(API_BASE + 'auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', mobile: signupPhone, otp: signupOtp })
      }).then(r => r.json());

      if (res.success) {
        saveAuth(res.data.token, res.data.user);
        navigate('/');
      } else showErr(res.message || 'Registration failed. Try again.');
    } catch { showErr('Network error.'); }
    setLoading(false);
  }

  const totalSteps = 2;
  const curStep = tab === 'login' ? loginStep : signupStep;

  return (
    <div className="auth-page">
      {/* LEFT PANEL */}
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="big-icon">🌾</div>
          <h2>Welcome to<br />Drithi Agro</h2>
          <p>India's most trusted platform for farmers. Get quality products delivered to your doorstep.</p>
          <div className="auth-features">
            {[['🚚', 'Free Delivery', 'On selective products across India'],
            ['✅', '100% Genuine', 'Verified products from top brands'],
            ['🧑‍🌾', 'Expert Support', 'Free agri-expert consultation 24/7'],
            ['💰', 'Best Prices', 'Exclusive deals for registered farmers']].map(([icon, h, p]) => (
              <div key={h} className="auth-feature">
                <span className="feat-icon">{icon}</span>
                <div><h4>{h}</h4><p>{p}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="auth-right">
        <div className="auth-box">
          <div className="auth-logo">
            <div className="logo-icon">🌿</div>
            <div><h2>Drithi Agro</h2><span>Farm to Future</span></div>
          </div>

          {/* Tabs */}
          <div className="auth-tabs">
            <button className={'auth-tab' + (tab === 'login' ? ' active' : '')}
              onClick={() => { setTab('login'); hideMsg(); setLoginStep(1); setSignupStep(1); }}>Login</button>
            <button className={'auth-tab' + (tab === 'signup' ? ' active' : '')}
              onClick={() => { setTab('signup'); hideMsg(); setLoginStep(1); setSignupStep(1); }}>Sign Up</button>
          </div>

          {/* Step indicator */}
          <div className="step-indicator">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} style={{ display: 'contents' }}>
                <div className={`step${curStep > i + 1 ? ' done' : curStep === i + 1 ? ' active' : ''}`}>
                  {curStep > i + 1 ? '✓' : i + 1}
                </div>
                {i < totalSteps - 1 && <div className={'step-line' + (curStep > i + 1 ? ' done' : '')} />}
              </div>
            ))}
          </div>

          {/* Alert message */}
          {msg && (
            <div style={{
              display: 'block', padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, marginBottom: 12, textAlign: 'center',
              background: msg.t === 'error' ? '#ffebee' : '#e8f5e9',
              color: msg.t === 'error' ? '#c62828' : '#1b5e20'
            }}>
              {msg.m}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════
              LOGIN SECTION
          ═══════════════════════════════════════════════════ */}
          {tab === 'login' && (
            <>
              {/* Step 1: Enter phone/email */}
              {loginStep === 1 && (
                <div className="auth-form">
                  <div style={{ display: 'flex', background: '#f5f5f5', borderRadius: 10, padding: 4, marginBottom: 16 }}>
                    {['phone', 'email'].map(m => (
                      <button key={m} onClick={() => setLoginMode(m)}
                        style={{
                          flex: 1, padding: 8, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                          background: loginMode === m ? '#2e7d32' : 'transparent',
                          color: loginMode === m ? 'white' : '#666'
                        }}>
                        {m === 'phone' ? '📱 Mobile OTP' : '📧 Email OTP'}
                      </button>
                    ))}
                  </div>

                  {loginMode === 'phone' ? (
                    <div className="form-group">
                      <label>📱 Mobile Number</label>
                      {/* Applies red border if invalid */}
                      <div className="phone-input" style={{ borderColor: loginPhoneInvalid ? '#dc2626' : '#e0e0e0' }}>
                        <span className="country-code">🇮🇳 +91</span>
                        <input type="tel" placeholder="Enter 10-digit mobile number" maxLength={10}
                          value={loginPhone} onChange={e => setLoginPhone(e.target.value)} />
                      </div>
                    </div>
                  ) : (
                    <div className="form-group">
                      <label>📧 Email Address</label>
                      {/* Applies red border if invalid */}
                      <input type="email" placeholder="Enter your email address"
                        value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                        style={{ width: '100%', padding: '11px 14px', border: '2px solid', borderColor: loginEmailInvalid ? '#dc2626' : '#e0e0e0', borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
                    </div>
                  )}
                  <button className="submit-btn" disabled={loading} onClick={sendLoginOtp}>{loading ? '⏳ Please wait...' : 'Send OTP →'}</button>
                  <p style={{ textAlign: 'center', fontSize: 12, color: '#999', marginTop: 8 }}>
                    By continuing, you agree to our <a href="#" style={{ color: '#2e7d32' }}>Terms</a> & <a href="#" style={{ color: '#2e7d32' }}>Privacy Policy</a>
                  </p>
                </div>
              )}

              {/* Step 2: Enter OTP */}
              {loginStep === 2 && (
                <div className="auth-form">
                  <div className="form-group">
                    <label style={{ textAlign: 'center', display: 'block' }}>
                      Enter 6-digit OTP sent to <b>{loginMode === 'phone' ? '+91 ' + loginPhone : loginEmail}</b>
                    </label>
                    <div id="loginOtpGroup" className="otp-group" style={{ gap: 8 }}>
                      {Array.from({ length: 6 }, (_, i) => (
                        <input key={i} className="otp-input" maxLength={1}
                          onInput={e => {
                            e.target.value = e.target.value.replace(/\D/g, '');
                            const all = document.querySelectorAll('#loginOtpGroup .otp-input');
                            if (e.target.value && i < 5) all[i + 1]?.focus();
                            setLoginOtp(Array.from(all).map(el => el.value).join(''));
                          }}
                          onKeyDown={e => {
                            if (e.key === 'Backspace' && !e.target.value && i > 0) {
                              const all = document.querySelectorAll('#loginOtpGroup .otp-input');
                              all[i - 1]?.focus();
                            }
                          }} />
                      ))}
                    </div>
                  </div>

                  {!canResend
                    ? <div className="otp-timer">Resend OTP in <b>{timer}s</b></div>
                    : <span style={{ color: '#2e7d32', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}
                      onClick={() => { setCanResend(false); sendLoginOtp(); }}>🔄 Resend OTP</span>
                  }

                  <button className="submit-btn" disabled={loading} onClick={verifyLoginOtp}>{loading ? '⏳ Please wait...' : '✅ Verify & Login'}</button>
                  <button onClick={() => { setLoginStep(1); hideMsg(); }}
                    style={{ background: 'none', border: 'none', color: '#2e7d32', fontSize: 13, cursor: 'pointer', textAlign: 'center', width: '100%', marginTop: 8 }}>
                    ← Change
                  </button>
                </div>
              )}
            </>
          )}

          {/* ═══════════════════════════════════════════════════
              SIGNUP SECTION (Customer only)
          ═══════════════════════════════════════════════════ */}
          {tab === 'signup' && (
            <>
              {/* Step 1: Enter details */}
              {signupStep === 1 && (
                <div className="auth-form">
                  <div className="form-group">
                    <label>👤 Full Name</label>
                    <input type="text" placeholder="Enter your full name" value={signupName} onChange={e => setSignupName(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>📧 Email Address (Optional)</label>
                    {/* Applies red border if invalid format */}
                    <input type="email" placeholder="Enter your email address" value={signupEmail} onChange={e => setSignupEmail(e.target.value)}
                      style={{ borderColor: signupEmailInvalid ? '#dc2626' : '#e0e0e0' }} />
                  </div>
                  <div className="form-group">
                    <label>📱 Mobile Number</label>
                    {/* Applies red border if invalid format */}
                    <div className="phone-input" style={{ borderColor: signupPhoneInvalid ? '#dc2626' : '#e0e0e0' }}>
                      <span className="country-code">🇮🇳 +91</span>
                      <input type="tel" placeholder="10-digit mobile number" maxLength={10}
                        value={signupPhone} onChange={e => setSignupPhone(e.target.value)} />
                    </div>
                  </div>
                  <button className="submit-btn" disabled={loading} onClick={sendSignupOtp}>{loading ? '⏳ Please wait...' : 'Send OTP →'}</button>
                </div>
              )}

              {/* Step 2: Enter OTP */}
              {signupStep === 2 && (
                <div className="auth-form">
                  <div className="form-group">
                    <label style={{ textAlign: 'center', display: 'block' }}>
                      Enter 6-digit OTP sent to <b>+91 {signupPhone}</b>
                    </label>
                    <div id="signupOtpGroup" className="otp-group" style={{ gap: 8 }}>
                      {Array.from({ length: 6 }, (_, i) => (
                        <input key={i} className="otp-input" maxLength={1}
                          onInput={e => {
                            e.target.value = e.target.value.replace(/\D/g, '');
                            const all = document.querySelectorAll('#signupOtpGroup .otp-input');
                            if (e.target.value && i < 5) all[i + 1]?.focus();
                            setSignupOtp(Array.from(all).map(el => el.value).join(''));
                          }}
                          onKeyDown={e => {
                            if (e.key === 'Backspace' && !e.target.value && i > 0) {
                              const all = document.querySelectorAll('#signupOtpGroup .otp-input');
                              all[i - 1]?.focus();
                            }
                          }} />
                      ))}
                    </div>
                  </div>

                  {!canResend
                    ? <div className="otp-timer">Resend OTP in <b>{timer}s</b></div>
                    : <span style={{ color: '#2e7d32', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}
                      onClick={() => { setCanResend(false); sendSignupOtp(); }}>🔄 Resend OTP</span>
                  }

                  <button className="submit-btn" disabled={loading} onClick={verifySignupOtp}>{loading ? '⏳ Please wait...' : '✅ Create Account'}</button>
                  <button onClick={() => { setSignupStep(1); hideMsg(); }}
                    style={{ background: 'none', border: 'none', color: '#2e7d32', fontSize: 13, cursor: 'pointer', textAlign: 'center', width: '100%', marginTop: 8 }}>
                    ← Go Back
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
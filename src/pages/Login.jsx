import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../auth.css';

const API_BASE = import.meta.env.VITE_API_BASE || '/api/index.php?route=';

function OtpInput({ groupId, onChange }) {
  const inputs = useRef([]);

  function handleInput(e, i) {
    const val = e.target.value.replace(/\D/g, '').slice(-1);
    e.target.value = val;
    if (val && i < 5) inputs.current[i + 1]?.focus();
    collect();
  }

  function handleKeyDown(e, i) {
    if (e.key === 'Backspace' && !e.target.value && i > 0) {
      inputs.current[i - 1].focus();
      inputs.current[i - 1].value = '';
      collect();
    }
  }

  // Handle paste — fill all 6 boxes at once
  function handlePaste(e) {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    digits.split('').forEach((d, i) => {
      if (inputs.current[i]) inputs.current[i].value = d;
    });
    inputs.current[Math.min(digits.length, 5)]?.focus();
    collect();
  }

  function collect() {
    const val = inputs.current.map(el => el?.value || '').join('');
    onChange(val);
  }

  function clear() {
    inputs.current.forEach(el => { if (el) el.value = ''; });
    inputs.current[0]?.focus();
    onChange('');
  }

  // expose clear via ref trick — just reset on groupId change
  useEffect(() => { clear(); }, [groupId]);

  return (
    <div className="otp-group" style={{ gap: 8 }}>
      {Array.from({ length: 6 }, (_, i) => (
        <input key={i} className="otp-input" maxLength={1} inputMode="numeric"
          ref={el => inputs.current[i] = el}
          onInput={e => handleInput(e, i)}
          onKeyDown={e => handleKeyDown(e, i)}
          onPaste={handlePaste}
        />
      ))}
    </div>
  );
}

function Timer({ onResend }) {
  const [secs, setSecs] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    setSecs(30); setCanResend(false);
    const t = setInterval(() => {
      setSecs(s => {
        if (s <= 1) { clearInterval(t); setCanResend(true); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  if (canResend) return (
    <span style={{ color: '#2e7d32', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}
      onClick={onResend}>🔄 Resend OTP</span>
  );
  return <div className="otp-timer">Resend OTP in <b>{secs}s</b></div>;
}

export default function Login() {
  const navigate = useNavigate();
  const { saveAuth } = useAuth();

  const [tab, setTab]           = useState('login');
  const [loginMode, setLoginMode] = useState('phone');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginOtp, setLoginOtp]   = useState('');
  const [loginStep, setLoginStep] = useState(1);

  const [signupName, setSignupName]   = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupOtp, setSignupOtp]     = useState('');
  const [signupStep, setSignupStep]   = useState(1);

  const [msg, setMsg]         = useState(null);
  const [loading, setLoading] = useState(false);

  // Only show validation border after user has touched the field
  const [loginPhoneTouched, setLoginPhoneTouched] = useState(false);
  const [loginEmailTouched, setLoginEmailTouched] = useState(false);
  const [signupPhoneTouched, setSignupPhoneTouched] = useState(false);
  const [signupEmailTouched, setSignupEmailTouched] = useState(false);

  const showErr = m => setMsg({ t: 'error', m });
  const showOk  = m => setMsg({ t: 'success', m });
  const hideMsg = () => setMsg(null);

  const vPhone = v => /^[6-9]\d{9}$/.test(v);
  const vEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const phoneInvalid = loginPhoneTouched && !vPhone(loginPhone);
  const emailInvalid = loginEmailTouched && !vEmail(loginEmail);
  const sPhoneInvalid = signupPhoneTouched && !vPhone(signupPhone);
  const sEmailInvalid = signupEmailTouched && signupEmail.trim() !== '' && !vEmail(signupEmail);

  async function post(payload) {
    const res = await fetch(API_BASE + 'auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(r => r.json());
    return res;
  }

  // ── LOGIN ──
  async function sendLoginOtp() {
    hideMsg();
    if (loginMode === 'phone') {
      setLoginPhoneTouched(true);
      if (!vPhone(loginPhone)) { showErr('Enter a valid 10-digit mobile number.'); return; }
    } else {
      setLoginEmailTouched(true);
      if (!vEmail(loginEmail)) { showErr('Enter a valid email address.'); return; }
    }
    setLoading(true);
    try {
      const payload = loginMode === 'phone'
        ? { action: 'send_otp', mobile: loginPhone, purpose: 'LOGIN' }
        : { action: 'send_otp', email: loginEmail,  purpose: 'LOGIN' };
      const res = await post(payload);
      if (res.success) {
        if (res.data?.otp) showOk('Dev Mode — OTP: ' + res.data.otp);
        else showOk('OTP sent to ' + (loginMode === 'phone' ? '+91 ' + loginPhone : loginEmail) + ' via ' + (loginMode === 'phone' ? 'SMS' : 'Email'));
        setLoginStep(2);
      } else {
        if (res.message?.toLowerCase().includes('not found') || res.message?.toLowerCase().includes('register')) {
          showErr(res.message);
          setTimeout(() => { setTab('signup'); setLoginStep(1); setSignupStep(1); hideMsg(); }, 2000);
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
    try {
      const payload = { action: 'verify_otp', otp: loginOtp };
      if (loginMode === 'phone') payload.mobile = loginPhone;
      else payload.email = loginEmail;
      const res = await post(payload);
      if (res.success) {
        saveAuth(res.data.token, res.data.user);
        const role = res.data.user.role;
        if (role === 'vendor') navigate('/vendor/dashboard');
        else navigate('/');
      } else showErr(res.message || 'Invalid OTP. Try again.');
    } catch { showErr('Network error.'); }
    setLoading(false);
  }

  // ── SIGNUP ──
  async function sendSignupOtp() {
    hideMsg();
    if (!signupName.trim()) { showErr('Enter your full name.'); return; }
    setSignupEmailTouched(true);
    if (signupEmail.trim() !== '' && !vEmail(signupEmail)) { showErr('Enter a valid email address.'); return; }
    setSignupPhoneTouched(true);
    if (!vPhone(signupPhone)) { showErr('Enter a valid 10-digit mobile number.'); return; }
    setLoading(true);
    try {
      const [first_name, ...rest] = signupName.trim().split(' ');
      const res = await post({
        action: 'send_otp', purpose: 'REGISTER',
        first_name, last_name: rest.join(' '),
        email: signupEmail, mobile: signupPhone,
      });
      if (res.success) {
        if (res.data?.otp) showOk('Dev Mode — OTP: ' + res.data.otp);
        else showOk('OTP sent to +91 ' + signupPhone + ' via SMS');
        setSignupStep(2);
      } else {
        if (res.message?.toLowerCase().includes('already') || res.message?.toLowerCase().includes('login')) {
          showErr(res.message);
          setTimeout(() => { setTab('login'); setLoginStep(1); setSignupStep(1); hideMsg(); }, 2000);
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
      const res = await post({ action: 'register', mobile: signupPhone, otp: signupOtp });
      if (res.success) {
        saveAuth(res.data.token, res.data.user);
        navigate('/');
      } else showErr(res.message || 'Registration failed. Try again.');
    } catch { showErr('Network error.'); }
    setLoading(false);
  }

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
            {[
              ['🚚', 'Free Delivery',   'On selective products across India'],
              ['✅', '100% Genuine',    'Verified products from top brands'],
              ['🧑🌾','Expert Support', 'Free agri-expert consultation 24/7'],
              ['💰', 'Best Prices',     'Exclusive deals for registered farmers'],
            ].map(([icon, h, p]) => (
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
            <button className={'auth-tab' + (tab === 'login'  ? ' active' : '')}
              onClick={() => { setTab('login');  hideMsg(); setLoginStep(1); setSignupStep(1); }}>Login</button>
            <button className={'auth-tab' + (tab === 'signup' ? ' active' : '')}
              onClick={() => { setTab('signup'); hideMsg(); setLoginStep(1); setSignupStep(1); }}>Sign Up</button>
          </div>

          {/* Step indicator */}
          <div className="step-indicator">
            {[1, 2].map((s, i) => (
              <div key={s} style={{ display: 'contents' }}>
                <div className={`step${curStep > s ? ' done' : curStep === s ? ' active' : ''}`}>
                  {curStep > s ? '✓' : s}
                </div>
                {i < 1 && <div className={'step-line' + (curStep > 1 ? ' done' : '')} />}
              </div>
            ))}
          </div>

          {/* Alert */}
          {msg && (
            <div style={{
              padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600,
              marginBottom: 12, textAlign: 'center',
              background: msg.t === 'error' ? '#ffebee' : '#e8f5e9',
              color:      msg.t === 'error' ? '#c62828' : '#1b5e20',
            }}>{msg.m}</div>
          )}

          {/* ── LOGIN ── */}
          {tab === 'login' && (
            <>
              {loginStep === 1 && (
                <div className="auth-form">
                  {/* Phone / Email toggle */}
                  <div style={{ display: 'flex', background: '#f5f5f5', borderRadius: 10, padding: 4, marginBottom: 16 }}>
                    {[['phone', '📱 Mobile OTP'], ['email', '📧 Email OTP']].map(([m, label]) => (
                      <button key={m} onClick={() => { setLoginMode(m); hideMsg(); }}
                        style={{ flex: 1, padding: 8, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                          background: loginMode === m ? '#2e7d32' : 'transparent',
                          color:      loginMode === m ? 'white'   : '#666' }}>
                        {label}
                      </button>
                    ))}
                  </div>

                  {loginMode === 'phone' ? (
                    <div className="form-group">
                      <label>📱 Mobile Number</label>
                      <div className="phone-input" style={{ borderColor: phoneInvalid ? '#dc2626' : '#e0e0e0' }}>
                        <span className="country-code">🇮🇳 +91</span>
                        <input type="tel" placeholder="Enter 10-digit mobile number" maxLength={10}
                          value={loginPhone}
                          onChange={e => setLoginPhone(e.target.value.replace(/\D/g, ''))}
                          onBlur={() => setLoginPhoneTouched(true)} />
                      </div>
                      {phoneInvalid && <span style={{ fontSize: 11, color: '#dc2626' }}>Enter a valid 10-digit number</span>}
                    </div>
                  ) : (
                    <div className="form-group">
                      <label>📧 Email Address</label>
                      <input type="email" placeholder="Enter your email address"
                        value={loginEmail}
                        onChange={e => setLoginEmail(e.target.value)}
                        onBlur={() => setLoginEmailTouched(true)}
                        style={{ width: '100%', padding: '11px 14px', border: '2px solid',
                          borderColor: emailInvalid ? '#dc2626' : '#e0e0e0',
                          borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                      {emailInvalid && <span style={{ fontSize: 11, color: '#dc2626' }}>Enter a valid email address</span>}
                    </div>
                  )}

                  <button className="submit-btn" disabled={loading} onClick={sendLoginOtp}>
                    {loading ? '⏳ Sending OTP...' : 'Send OTP →'}
                  </button>
                  <p style={{ textAlign: 'center', fontSize: 12, color: '#999', marginTop: 8 }}>
                    By continuing, you agree to our <a href="/terms" style={{ color: '#2e7d32' }}>Terms</a> &amp; <a href="/terms" style={{ color: '#2e7d32' }}>Privacy Policy</a>
                  </p>
                </div>
              )}

              {loginStep === 2 && (
                <div className="auth-form">
                  <div className="form-group">
                    <label style={{ textAlign: 'center', display: 'block', marginBottom: 12 }}>
                      Enter 6-digit OTP sent to{' '}
                      <b>{loginMode === 'phone' ? '+91 ' + loginPhone : loginEmail}</b>
                      {loginMode === 'email' && <span style={{ display: 'block', fontSize: 11, color: '#888', marginTop: 4 }}>Check your inbox and spam folder</span>}
                    </label>
                    <OtpInput groupId={'login-' + loginStep} onChange={setLoginOtp} />
                  </div>

                  <Timer onResend={() => { hideMsg(); sendLoginOtp(); }} />

                  <button className="submit-btn" disabled={loading || loginOtp.length < 6} onClick={verifyLoginOtp}>
                    {loading ? '⏳ Verifying...' : '✅ Verify & Login'}
                  </button>
                  <button onClick={() => { setLoginStep(1); hideMsg(); setLoginOtp(''); }}
                    style={{ background: 'none', border: 'none', color: '#2e7d32', fontSize: 13, cursor: 'pointer', textAlign: 'center', width: '100%', marginTop: 8 }}>
                    ← Change {loginMode === 'phone' ? 'number' : 'email'}
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── SIGNUP ── */}
          {tab === 'signup' && (
            <>
              {signupStep === 1 && (
                <div className="auth-form">
                  <div className="form-group">
                    <label>👤 Full Name</label>
                    <input type="text" placeholder="Enter your full name"
                      value={signupName} onChange={e => setSignupName(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>📧 Email Address <span style={{ color: '#aaa', fontWeight: 400 }}>(Optional — for email OTP login)</span></label>
                    <input type="email" placeholder="Enter your email address"
                      value={signupEmail}
                      onChange={e => setSignupEmail(e.target.value)}
                      onBlur={() => setSignupEmailTouched(true)}
                      style={{ borderColor: sEmailInvalid ? '#dc2626' : '#e0e0e0' }} />
                    {sEmailInvalid && <span style={{ fontSize: 11, color: '#dc2626' }}>Enter a valid email address</span>}
                  </div>
                  <div className="form-group">
                    <label>📱 Mobile Number</label>
                    <div className="phone-input" style={{ borderColor: sPhoneInvalid ? '#dc2626' : '#e0e0e0' }}>
                      <span className="country-code">🇮🇳 +91</span>
                      <input type="tel" placeholder="10-digit mobile number" maxLength={10}
                        value={signupPhone}
                        onChange={e => setSignupPhone(e.target.value.replace(/\D/g, ''))}
                        onBlur={() => setSignupPhoneTouched(true)} />
                    </div>
                    {sPhoneInvalid && <span style={{ fontSize: 11, color: '#dc2626' }}>Enter a valid 10-digit number</span>}
                  </div>
                  <button className="submit-btn" disabled={loading} onClick={sendSignupOtp}>
                    {loading ? '⏳ Sending OTP...' : 'Send OTP →'}
                  </button>
                </div>
              )}

              {signupStep === 2 && (
                <div className="auth-form">
                  <div className="form-group">
                    <label style={{ textAlign: 'center', display: 'block', marginBottom: 12 }}>
                      Enter 6-digit OTP sent to <b>+91 {signupPhone}</b> via SMS
                    </label>
                    <OtpInput groupId={'signup-' + signupStep} onChange={setSignupOtp} />
                  </div>

                  <Timer onResend={() => { hideMsg(); sendSignupOtp(); }} />

                  <button className="submit-btn" disabled={loading || signupOtp.length < 6} onClick={verifySignupOtp}>
                    {loading ? '⏳ Creating Account...' : '✅ Create Account'}
                  </button>
                  <button onClick={() => { setSignupStep(1); hideMsg(); setSignupOtp(''); }}
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

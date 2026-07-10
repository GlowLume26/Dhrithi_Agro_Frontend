const API_BASE = '/drithi-agro-backend/index.php?route=';

const token = () => localStorage.getItem('da_token');

const headers = () => {
  const h = { 'Content-Type': 'application/json' };
  if (token()) h['Authorization'] = 'Bearer ' + token();
  return h;
};

const qs = (p) => { const s = new URLSearchParams(p).toString(); return s ? '&' + s : ''; };

export const api = {
  get:    (route, params = {}) => fetch(API_BASE + route + qs(params), { headers: headers() }).then(r => r.json()),
  post:   (route, body = {}, params = {}) => fetch(API_BASE + route + qs(params), { method: 'POST',   headers: headers(), body: JSON.stringify(body) }).then(r => r.json()),
  put:    (route, body = {}, params = {}) => fetch(API_BASE + route + qs(params), { method: 'PUT',    headers: headers(), body: JSON.stringify(body) }).then(r => r.json()),
  delete: (route, params = {})            => fetch(API_BASE + route + qs(params), { method: 'DELETE', headers: headers() }).then(r => r.json()),
};

export default api;

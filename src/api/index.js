const API_BASE = import.meta.env.VITE_API_BASE || '/api/index.php?route=';

const token = () => localStorage.getItem('da_token');

const headers = () => {
  const h = { 'Content-Type': 'application/json' };
  if (token()) h['Authorization'] = 'Bearer ' + token();
  return h;
};

const qs = (p) => {
  const filtered = Object.fromEntries(Object.entries(p).filter(([, v]) => v !== '' && v !== null && v !== undefined));
  const s = new URLSearchParams(filtered).toString();
  return s ? '&' + s : '';
};

const handle = async (res) => {
  let json;
  try {
    json = await res.json();
  } catch {
    return { success: false, message: 'Invalid server response', status: res.status };
  }
  if (res.status === 401) return { ...json, status: 401 };
  return json;
};

export const api = {
  get:    (route, params = {}) => fetch(API_BASE + route + qs(params), { headers: headers() }).then(handle),
  post:   (route, body = {}, params = {}) => fetch(API_BASE + route + qs(params), { method: 'POST',   headers: headers(), body: JSON.stringify(body) }).then(handle),
  put:    (route, body = {}, params = {}) => fetch(API_BASE + route + qs(params), { method: 'PUT',    headers: headers(), body: JSON.stringify(body) }).then(handle),
  delete: (route, params = {})            => fetch(API_BASE + route + qs(params), { method: 'DELETE', headers: headers() }).then(handle),
};

export default api;

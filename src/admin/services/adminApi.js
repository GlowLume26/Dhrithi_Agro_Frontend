import axios from 'axios';

const BASE = import.meta.env.VITE_API_BASE || '/drithi-agro-backend/index.php?route=';

const url = (route) => BASE + route;

const authHeader = () => {
  const token = localStorage.getItem('da_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const cfg = () => ({ headers: authHeader() });

const qs = p => new URLSearchParams(p).toString();

export const adminApi = {
  login: (email, password) => fetch(url('auth'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'admin_login', email, password }) }).then(r => r.json()),

  getDashboard: () => axios.get(url('admin&section=dashboard'), cfg()).then(r => r.data),

  getVendors:    (params={}) => axios.get(url(`admin&section=vendors&${qs(params)}`), cfg()).then(r => r.data),
  approveVendor: (id)        => axios.put(url(`admin&action=approve&id=${id}`), {}, cfg()).then(r => r.data),
  rejectVendor:  (id, reason)=> axios.put(url(`admin&action=reject&id=${id}`), { reason }, cfg()).then(r => r.data),

  getProducts:   (params={}) => axios.get(url(`products&${qs(params)}`), cfg()).then(r => r.data),
  getProduct:    (id)        => axios.get(url(`products&id=${id}`), cfg()).then(r => r.data),
  createProduct: (data)      => axios.post(url('products'), data, cfg()).then(r => r.data),
  updateProduct: (id, data)  => axios.put(url(`products&id=${id}`), data, cfg()).then(r => r.data),
  deleteProduct: (id)        => axios.delete(url(`products&id=${id}`), cfg()).then(r => r.data),

  getOrders:         (params={}) => axios.get(url(`admin&section=orders&${qs(params)}`), cfg()).then(r => r.data),
  updateOrderStatus: (id, status)=> axios.put(url(`admin&section=orders&id=${id}`), { status }, cfg()).then(r => r.data),

  getCustomers:    (params={}) => axios.get(url(`admin&section=customers&${qs(params)}`), cfg()).then(r => r.data),
  updateCustomer:  (id, data) => axios.put(url(`admin&section=customers&id=${id}`), data, cfg()).then(r => r.data),
  deleteCustomer:  (id)       => axios.delete(url(`admin&section=customers&id=${id}`), cfg()).then(r => r.data),

  getCategories:   ()         => axios.get(url('categories'), cfg()).then(r => r.data),
  createCategory:  (data)     => axios.post(url('categories'), data, cfg()).then(r => r.data),
  updateCategory:  (id, data) => axios.put(url(`categories&id=${id}`), data, cfg()).then(r => r.data),
  deleteCategory:  (id)       => axios.delete(url(`categories&id=${id}`), cfg()).then(r => r.data),

  getInventory:    (params={}) => axios.get(url(`admin&section=inventory&${qs(params)}`), cfg()).then(r => r.data),
  restockProduct:  (id, qty)   => axios.put(url(`admin&section=inventory&id=${id}`), { qty }, cfg()).then(r => r.data),

  getOffers:    ()         => axios.get(url('admin&section=offers'), cfg()).then(r => r.data),
  createOffer:  (data)     => axios.post(url('admin&section=offers'), data, cfg()).then(r => r.data),
  updateOffer:  (id, data) => axios.put(url(`admin&section=offers&id=${id}`), data, cfg()).then(r => r.data),
  deleteOffer:  (id)       => axios.delete(url(`admin&section=offers&id=${id}`), cfg()).then(r => r.data),

  getBrands: () => axios.get(url('brands'), cfg()).then(r => r.data),

  getAdmins:    ()         => axios.get(url('admin&section=admins'), cfg()).then(r => r.data),
  createAdmin:  (data)     => axios.post(url('admin&section=admins'), data, cfg()).then(r => r.data),
  updateAdmin:  (id, data) => axios.put(url(`admin&section=admins&id=${id}`), data, cfg()).then(r => r.data),
  deleteAdmin:  (id)       => axios.delete(url(`admin&section=admins&id=${id}`), cfg()).then(r => r.data),
};

export default adminApi;
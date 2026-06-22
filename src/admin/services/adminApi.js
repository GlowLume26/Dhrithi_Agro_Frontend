import axios from 'axios';

const BASE = 'http://localhost/drithi-agro/backend/index.php?route=';

const http = axios.create({ baseURL: BASE });

http.interceptors.request.use(cfg => {
  const token = localStorage.getItem('da_admin_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

http.interceptors.response.use(
  r => r.data,
  err => Promise.reject(err?.response?.data || err)
);

const qs = p => new URLSearchParams(p).toString();

export const adminApi = {
  // Auth — demo bypass in AdminLogin, no real endpoint needed
  login: (email, password) => http.post(`auth`, { action: 'verify_otp', email, otp: password }),

  // Dashboard
  getDashboard: () => http.get(`admin&section=dashboard`),

  // Vendors
  getVendors:    (params={}) => http.get(`admin&section=vendors&${qs(params)}`),
  approveVendor: (id)        => http.put(`admin&action=approve&id=${id}`, {}),
  rejectVendor:  (id, reason)=> http.put(`admin&action=reject&id=${id}`, { reason }),

  // Products
  getProducts:   (params={}) => http.get(`products&${qs(params)}`),
  getProduct:    (id)        => http.get(`products&id=${id}`),
  createProduct: (data)      => http.post(`products`, data),
  updateProduct: (id, data)  => http.put(`products&id=${id}`, data),
  deleteProduct: (id)        => http.delete(`products&id=${id}`),

  // Orders (admin)
  getOrders:         (params={}) => http.get(`admin&section=orders&${qs(params)}`),
  updateOrderStatus: (id, status)=> http.put(`admin&section=orders&id=${id}`, { status }),

  // Customers
  getCustomers: (params={}) => http.get(`admin&section=customers&${qs(params)}`),

  // Categories & Brands
  getCategories: () => http.get(`categories`),
  getBrands:     () => http.get(`brands`),
};

export default adminApi;

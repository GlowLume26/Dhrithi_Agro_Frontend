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
  // Auth
  login: (email, password) => http.post(`auth&admin=1`, { email, password }),

  // Dashboard
  stats:       () => http.get(`admin&section=stats`),
  recentOrders:() => http.get(`admin&section=recent_orders`),
  lowStock:    () => http.get(`admin&section=low_stock`),

  // Products
  getProducts: (params={}) => http.get(`products&${qs(params)}`),
  getProduct:  (id)        => http.get(`products&id=${id}`),
  createProduct:(data)     => http.post(`products`, data),
  updateProduct:(id, data) => http.put(`products&id=${id}`, data),
  deleteProduct:(id)       => http.delete(`products&id=${id}`),

  // Orders
  getOrders:   (params={}) => http.get(`orders&${qs(params)}`),
  getOrder:    (id)        => http.get(`orders&id=${id}`),
  updateOrderStatus:(id,status) => http.put(`orders&id=${id}`, { status }),

  // Customers
  getCustomers:(params={}) => http.get(`admin&section=customers&${qs(params)}`),
  getCustomer: (id)        => http.get(`admin&section=customer&id=${id}`),
  updateCustomer:(id, data) => http.put(`admin&section=customer&id=${id}`, data),

  // Inventory
  getInventory:(params={}) => http.get(`admin&section=inventory&${qs(params)}`),
  updateStock: (id, qty)   => http.put(`admin&section=inventory&id=${id}`, { qty }),

  // Offers
  getOffers:   ()          => http.get(`admin&section=offers`),
  createOffer: (data)      => http.post(`admin&section=offers`, data),
  updateOffer: (id, data)  => http.put(`admin&section=offers&id=${id}`, data),
  deleteOffer: (id)        => http.delete(`admin&section=offers&id=${id}`),

  // Reports
  getReport:   (type, params={}) => http.get(`admin&section=reports&type=${type}&${qs(params)}`),

  // Admin users
  getAdmins:   ()          => http.get(`admin&section=admins`),
  createAdmin: (data)      => http.post(`admin&section=admins`, data),
  updateAdmin: (id, data)  => http.put(`admin&section=admins&id=${id}`, data),
  deleteAdmin: (id)        => http.delete(`admin&section=admins&id=${id}`),

  // Categories & Brands
  getCategories:() => http.get(`categories`),
  getBrands:    () => http.get(`brands`),
};

export default adminApi;

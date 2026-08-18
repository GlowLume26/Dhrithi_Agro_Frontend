import axios from 'axios';

const BASE = import.meta.env.VITE_API_BASE || '/api/index.php?route=';

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

  getVendors:          (params={}) => axios.get(url(`admin&section=vendors&${qs(params)}`), cfg()).then(r => r.data),
  approveVendor:       (id)        => axios.put(url(`admin&action=approve&id=${id}`), {}, cfg()).then(r => r.data),
  rejectVendor:        (id, reason)=> axios.put(url(`admin&action=reject&id=${id}`), { reason }, cfg()).then(r => r.data),

  getCommissionRates:  ()          => axios.get(url('admin&section=commission'), cfg()).then(r => r.data),
  updateCommissionRate:(id, rate)   => axios.put(url(`admin&section=commission&id=${id}`), { rate }, cfg()).then(r => r.data),

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

  // Permissions
  getPermissionUsers:  ()           => axios.get(url('permissions&section=users'), cfg()).then(r => r.data),
  getUserPermissions:  (id)         => axios.get(url(`permissions&section=user&id=${id}`), cfg()).then(r => r.data),
  setUserPermissions:  (userId, perms) => axios.post(url('permissions&section=set'), { user_id: userId, permissions: perms }, cfg()).then(r => r.data),
  getPermissionAudit:  ()           => axios.get(url('permissions&section=audit'), cfg()).then(r => r.data),

  // Manufacturer
  getManufacturers:      ()           => axios.get(url('manufacturer&section=manufacturers'), cfg()).then(r => r.data),
  getManufacturerOrders: (params={})  => axios.get(url(`manufacturer&${qs(params)}`), cfg()).then(r => r.data),
  createManufacturerOrder:(data)      => axios.post(url('manufacturer'), data, cfg()).then(r => r.data),
  updateManufacturerOrder:(id, data)  => axios.put(url(`manufacturer&id=${id}`), data, cfg()).then(r => r.data),

  // CNF
  getCnfCompanies:  (params={}) => axios.get(url(`cnf&section=companies&${qs(params)}`), cfg()).then(r => r.data),
  createCnfCompany: (data)      => axios.post(url('cnf&section=companies'), data, cfg()).then(r => r.data),
  updateCnfCompany: (id, data)  => axios.put(url(`cnf&section=companies&id=${id}`), data, cfg()).then(r => r.data),
  deleteCnfCompany: (id)        => axios.delete(url(`cnf&section=companies&id=${id}`), cfg()).then(r => r.data),

  getWarehouses:   (params={}) => axios.get(url(`cnf&section=warehouses&${qs(params)}`), cfg()).then(r => r.data),
  createWarehouse: (data)      => axios.post(url('cnf&section=warehouses'), data, cfg()).then(r => r.data),
  updateWarehouse: (id, data)  => axios.put(url(`cnf&section=warehouses&id=${id}`), data, cfg()).then(r => r.data),

  getCnfStock:     (params={}) => axios.get(url(`cnf&section=stock&${qs(params)}`), cfg()).then(r => r.data),
  updateCnfStock:  (data)      => axios.post(url('cnf&section=stock'), data, cfg()).then(r => r.data),

  getCnfOrders:    (params={}) => axios.get(url(`cnf&section=orders&${qs(params)}`), cfg()).then(r => r.data),
  createCnfOrder:  (data)      => axios.post(url('cnf&section=orders'), data, cfg()).then(r => r.data),
  updateCnfOrder:  (id, data)  => axios.put(url(`cnf&section=orders&id=${id}`), data, cfg()).then(r => r.data),

  getFastMoving:   (params={}) => axios.get(url(`cnf&section=fast_moving&${qs(params)}`), cfg()).then(r => r.data),
  getExpiryReport: (params={}) => axios.get(url(`cnf&section=expiry&${qs(params)}`), cfg()).then(r => r.data),

  // Salesman
  getSalesmen:         (params={}) => axios.get(url(`salesman&section=salesmen&${qs(params)}`), cfg()).then(r => r.data),
  createSalesman:      (data)      => axios.post(url('salesman&section=salesmen'), data, cfg()).then(r => r.data),
  updateSalesman:      (id, data)  => axios.put(url(`salesman&section=salesmen&id=${id}`), data, cfg()).then(r => r.data),
  deleteSalesman:      (id)        => axios.delete(url(`salesman&section=salesmen&id=${id}`), cfg()).then(r => r.data),
  getSalesmanReport:   (params={}) => axios.get(url(`salesman&section=report&${qs(params)}`), cfg()).then(r => r.data),
  getSalesmanOrders:   (params={}) => axios.get(url(`salesman&section=orders&${qs(params)}`), cfg()).then(r => r.data),
};

export default adminApi;
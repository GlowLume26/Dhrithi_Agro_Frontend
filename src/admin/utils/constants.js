// Role definitions
export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
};

// All available modules
export const ALL_MODULES = [
  'dashboard','products','orders','customers','vendors','categories','inventory','offers','reports','settings','admins',
  'manufacturer_orders','cnf','cnf_stock','cnf_invoices','salesman_reports','salesman_orders','access_control',
];

// Default modules per role
export const ROLE_MODULES = {
  owner: ALL_MODULES,
  admin: ['dashboard','products','orders','customers','vendors'],
};

// Human-readable module labels
export const MODULE_LABELS = {
  dashboard:          'Dashboard',
  products:           'Products',
  orders:             'Orders',
  customers:          'Customers',
  vendors:            'Vendors',
  categories:         'Categories',
  inventory:          'Inventory',
  offers:             'Offers',
  reports:            'Reports',
  settings:           'Settings',
  admins:             'Admin Users',
  manufacturer_orders:'Manufacturer Orders',
  cnf:                'C&F Management',
  cnf_stock:          'C&F Stock',
  cnf_invoices:       'C&F Invoices',
  salesman_reports:   'Salesman Reports',
  salesman_orders:    'Salesman Orders',
  access_control:     'Access Control',
};

// Sidebar nav items (grouped)
export const NAV_ITEMS = [
  { id:'dashboard',   label:'Dashboard',    path:'/admin/dashboard'  },
  { id:'products',    label:'Products',     path:'/admin/products'   },
  { id:'orders',      label:'Orders',       path:'/admin/orders'     },
  { id:'customers',   label:'Customers',    path:'/admin/customers'  },
  { id:'vendors',     label:'Vendors',      path:'/admin/vendors'    },
  { id:'categories',  label:'Categories',   path:'/admin/categories' },
  { id:'inventory',   label:'Inventory',    path:'/admin/inventory'  },
  { id:'offers',      label:'Offers',       path:'/admin/offers'     },
  { id:'reports',     label:'Reports',      path:'/admin/reports'    },
  { id:'settings',    label:'Settings',     path:'/admin/settings'   },
  { id:'admins',      label:'Admin Users',  path:'/admin/admins'     },
  // New modules
  { id:'manufacturer_orders', label:'Manufacturer Orders', path:'/admin/manufacturer-orders', group:'Manufacturers' },
  { id:'cnf',                 label:'C&F Companies',       path:'/admin/cnf/companies',        group:'C&F Management' },
  { id:'cnf_stock',           label:'C&F Stock',           path:'/admin/cnf/stock',            group:'C&F Management' },
  { id:'cnf_invoices',        label:'C&F Invoices',        path:'/admin/cnf/orders',           group:'C&F Management' },
  { id:'salesman_reports',    label:'Salesman Reports',    path:'/admin/salesman/reports',     group:'Sales' },
  { id:'salesman_orders',     label:'Salesman Orders',     path:'/admin/salesman/orders',      group:'Sales' },
  { id:'access_control',      label:'Access Control',      path:'/admin/access-control',       group:'Owner', ownerOnly: true },
];

export const ORDER_STATUSES = ['placed','confirmed','packed','shipped','out_for_delivery','delivered','cancelled'];
export const STATUS_COLORS  = {
  placed:           { bg:'#eff6ff', color:'#1d4ed8', dot:'#3b82f6' },
  confirmed:        { bg:'#f0fdf4', color:'#15803d', dot:'#22c55e' },
  packed:           { bg:'#fefce8', color:'#92400e', dot:'#f59e0b' },
  shipped:          { bg:'#f0fdf4', color:'#15803d', dot:'#22c55e' },
  out_for_delivery: { bg:'#fdf4ff', color:'#7e22ce', dot:'#a855f7' },
  delivered:        { bg:'#f0fdf4', color:'#166534', dot:'#16a34a' },
  cancelled:        { bg:'#fef2f2', color:'#dc2626', dot:'#ef4444' },
  // Manufacturer/CNF statuses
  pending:          { bg:'#fefce8', color:'#92400e', dot:'#f59e0b' },
  dispatched:       { bg:'#eff6ff', color:'#1d4ed8', dot:'#3b82f6' },
  delivered:        { bg:'#f0fdf4', color:'#166534', dot:'#16a34a' },
};

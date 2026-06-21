// Role definitions
export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
};

// Modules accessible per role
export const ROLE_MODULES = {
  owner: ['dashboard','products','orders','customers','inventory','offers','reports','settings','admins'],
  admin: ['dashboard','products','orders','customers'],
};

// Sidebar nav items
export const NAV_ITEMS = [
  { id:'dashboard',  label:'Dashboard',    icon:'RxDashboard',   path:'/admin/dashboard' },
  { id:'products',   label:'Products',     icon:'RxCube',        path:'/admin/products'  },
  { id:'orders',     label:'Orders',       icon:'RxListBullet',  path:'/admin/orders'    },
  { id:'customers',  label:'Customers',    icon:'RxPerson',      path:'/admin/customers' },
  { id:'inventory',  label:'Inventory',    icon:'RxArchive',     path:'/admin/inventory' },
  { id:'offers',     label:'Offers',       icon:'RxTag',         path:'/admin/offers'    },
  { id:'reports',    label:'Reports',      icon:'RxBarChart',    path:'/admin/reports'   },
  { id:'settings',   label:'Settings',     icon:'RxGear',        path:'/admin/settings'  },
  { id:'admins',     label:'Admin Users',  icon:'RxPeople',      path:'/admin/admins'    },
];

export const ORDER_STATUSES = ['Pending','Processing','Shipped','Delivered','Cancelled'];
export const STATUS_COLORS  = {
  Pending:    { bg:'#fff7ed', color:'#c2410c', dot:'#f97316' },
  Processing: { bg:'#eff6ff', color:'#1d4ed8', dot:'#3b82f6' },
  Shipped:    { bg:'#f0fdf4', color:'#15803d', dot:'#22c55e' },
  Delivered:  { bg:'#f0fdf4', color:'#166534', dot:'#16a34a' },
  Cancelled:  { bg:'#fef2f2', color:'#dc2626', dot:'#ef4444' },
};

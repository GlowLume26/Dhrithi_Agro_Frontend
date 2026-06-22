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

export const ORDER_STATUSES = ['placed','confirmed','packed','shipped','out_for_delivery','delivered','cancelled'];
export const STATUS_COLORS  = {
  placed:           { bg:'#eff6ff', color:'#1d4ed8', dot:'#3b82f6' },
  confirmed:        { bg:'#f0fdf4', color:'#15803d', dot:'#22c55e' },
  packed:           { bg:'#fefce8', color:'#92400e', dot:'#f59e0b' },
  shipped:          { bg:'#f0fdf4', color:'#15803d', dot:'#22c55e' },
  out_for_delivery: { bg:'#fdf4ff', color:'#7e22ce', dot:'#a855f7' },
  delivered:        { bg:'#f0fdf4', color:'#166534', dot:'#16a34a' },
  cancelled:        { bg:'#fef2f2', color:'#dc2626', dot:'#ef4444' },
};

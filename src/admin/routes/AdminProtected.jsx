import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

export function AdminProtected({ children, module }) {
  const { isLoggedIn, can, admin } = useAdminAuth();
  if (!isLoggedIn) return <Navigate to="/admin/login" replace />;
  if (module === 'access_control' && admin?.role !== 'owner') return <Navigate to="/admin/dashboard" replace />;
  if (module && !can(module)) return <Navigate to="/admin/dashboard" replace />;
  return children;
}

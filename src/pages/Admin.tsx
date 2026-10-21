import { Outlet } from 'react-router-dom';
import { AdminGuard } from '@/components/admin/AdminGuard';

export default function Admin() {
  return (
    <AdminGuard>
      <Outlet />
    </AdminGuard>
  );
}
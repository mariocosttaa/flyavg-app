import { lazy } from 'react';
import { Route, Routes } from 'react-router';
import { AdminRoute, PrivateRoute } from '@/shared/auth';
import AdminLayout from './layouts/AdminLayout';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Guests go to the portal login; signed-in users without admin access see Forbidden.
export function AdminRoutes() {
  return (
    <Routes>
      <Route element={<PrivateRoute />}>
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

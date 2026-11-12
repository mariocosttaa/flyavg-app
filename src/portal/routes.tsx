import { lazy } from 'react';
import { Route, Routes } from 'react-router';
import { GuestRoute, PrivateRoute } from '@/shared/auth';
import { loadAuthNamespace, loadLandingNamespace, loadPilotNamespace } from './i18n';
import PilotLayout from './layouts/PilotLayout';
import PublicLayout from './layouts/PublicLayout';

// Area namespaces load inside lazy(), so a page renders only when its strings exist.
const Home = lazy(() =>
  Promise.all([import('./pages/Home'), loadLandingNamespace()]).then(([page]) => page),
);
const Login = lazy(() =>
  Promise.all([import('./pages/Auth/Login'), loadAuthNamespace()]).then(([page]) => page),
);
const PilotHome = lazy(() =>
  Promise.all([import('./pages/Pilot/Home'), loadPilotNamespace()]).then(([page]) => page),
);
const NotFound = lazy(() => import('./pages/NotFound'));

export function PortalRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route element={<GuestRoute />}>
          <Route path="login" element={<Login />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route element={<PrivateRoute />}>
        <Route element={<PilotLayout />}>
          <Route path="pilot" element={<PilotHome />} />
        </Route>
      </Route>
    </Routes>
  );
}

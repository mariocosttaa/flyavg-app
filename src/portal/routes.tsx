import { lazy } from 'react';
import { Route, Routes } from 'react-router';
import { loadLandingNamespace } from './i18n';
import PublicLayout from './layouts/PublicLayout';

// The namespace loads inside lazy(), so the page renders only when its strings exist.
const Home = lazy(() =>
  Promise.all([import('./pages/Home'), loadLandingNamespace()]).then(([page]) => page),
);
const NotFound = lazy(() => import('./pages/NotFound'));

export function PortalRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

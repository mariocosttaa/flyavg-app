import { useLocation } from 'react-router';

/** Prints the router location, so tests can assert redirects. */
export function LocationProbe() {
  const location = useLocation();

  return <output data-testid="current-location">{location.pathname + location.search}</output>;
}

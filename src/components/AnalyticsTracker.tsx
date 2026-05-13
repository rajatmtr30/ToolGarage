import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/lib/analytics';

export function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    // Ensure we track every route change in our HashRouter
    trackPageView(location.pathname + location.search);
  }, [location]);

  return null;
}

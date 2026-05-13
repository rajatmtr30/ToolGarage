import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView, trackEvent } from '@/lib/analytics';
import { TOOLS } from '@/routes';

export function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    // Ensure we track every route change in our HashRouter
    trackPageView(location.pathname + location.search);

    // Identify if the route is a tool and track a visit
    const tool = TOOLS.find((t) => t.path === location.pathname);
    if (tool) {
      trackEvent('Tool', 'Visit', tool.name);
    }
  }, [location]);

  return null;
}

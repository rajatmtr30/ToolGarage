import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from '@/lib/analytics';
import { TOOLS } from '@/routes';

export function AnalyticsTracker() {
  const location = useLocation();
  const currentToolRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    // 1. Calculate time spent on previous tool
    if (currentToolRef.current && startTimeRef.current) {
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
      
      analytics.engagement('time_spent', {
        tool_name: currentToolRef.current,
        duration_seconds: duration
      });

      analytics.toolUsage('tool_close', {
        tool_name: currentToolRef.current
      });
    }

    // 2. Track new page view
    analytics.trackPageView(location.pathname + location.search);

    // 3. Identify new tool and set up for duration tracking
    const tool = TOOLS.find((t) => t.path === location.pathname);
    if (tool) {
      currentToolRef.current = tool.name;
      startTimeRef.current = Date.now();

      analytics.toolUsage('tool_open', {
        tool_name: tool.name,
        category: tool.category
      });
    } else {
      currentToolRef.current = null;
      startTimeRef.current = 0;
    }

    // Cleanup when component unmounts (e.g. app closes or unmounts)
    return () => {
      if (currentToolRef.current && startTimeRef.current) {
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
        
        analytics.engagement('time_spent', {
          tool_name: currentToolRef.current,
          duration_seconds: duration
        });

        analytics.toolUsage('tool_close', {
          tool_name: currentToolRef.current
        });
        
        // Reset so we don't track twice if the effect re-runs immediately
        currentToolRef.current = null;
        startTimeRef.current = 0;
      }
    };
  }, [location.pathname, location.search]);

  return null;
}

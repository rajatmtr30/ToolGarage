import ReactGA from 'react-ga4';

// TODO: Replace with your actual Google Analytics Measurement ID (e.g., G-XXXXXXXXXX)
export const GA_MEASUREMENT_ID = 'G-6GKNRM6JB8';

export const initGA = () => {
  // We initialize GA only in production by default, 
  // or you can remove the condition to test it in development
  if (import.meta.env.PROD) {
    ReactGA.initialize(GA_MEASUREMENT_ID);

    // Automatically track unhandled errors
    window.addEventListener('error', (event) => {
      trackError(`Unhandled Error: ${event.message} at ${event.filename}:${event.lineno}`, true);
    });

    // Automatically track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      trackError(`Unhandled Promise Rejection: ${event.reason}`, true);
    });
  }
};

/**
 * Track page views
 */
export const trackPageView = (path: string) => {
  ReactGA.send({ hitType: 'pageview', page: path });
};

/**
 * Track specific user interactions
 */
export const trackEvent = (category: string, action: string, label?: string, value?: number) => {
  ReactGA.event({
    category,
    action,
    label,
    value,
  });
};

/**
 * Track errors or exceptions
 */
export const trackError = (description: string, fatal: boolean = false) => {
  ReactGA.event({
    category: 'Error',
    action: 'Exception',
    label: description,
    nonInteraction: true,
    value: fatal ? 1 : 0,
  });
};

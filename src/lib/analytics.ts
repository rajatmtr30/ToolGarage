import ReactGA from 'react-ga4';

export const GA_MEASUREMENT_ID = 'G-6GKNRM6JB8';

export const initGA = () => {
  if (import.meta.env.PROD) {
    ReactGA.initialize(GA_MEASUREMENT_ID);

    // Automatically track unhandled errors
    window.addEventListener('error', (event) => {
      trackError('tool_exception', {
        error_message: event.message,
        stack_trace: event.error?.stack || '',
        action: 'window.error'
      });
    });

    // Automatically track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      trackError('tool_exception', {
        error_message: String(event.reason),
        action: 'window.unhandledrejection'
      });
    });
  }
};

/**
 * Generic event tracker wrapper
 */
export const track = (eventName: string, params?: Record<string, any>) => {
  if (import.meta.env.DEV) {
    console.log(`[Analytics Track] ${eventName}`, params);
  }
  ReactGA.event(eventName, params);
};

export const trackPageView = (path: string) => {
  if (import.meta.env.DEV) {
    console.log(`[Analytics PageView] ${path}`);
  }
  ReactGA.send({ hitType: 'pageview', page: path });
};

// -----------------------------------------------------------------
// Specific Tracking Categories
// -----------------------------------------------------------------

/**
 * Track Tool Usage
 */
export const trackToolUsage = (
  eventName: 'tool_open' | 'tool_close' | 'tool_search' | 'favorite_tool' | 'recent_tool_click',
  params: { tool_name?: string; category?: string; source?: string }
) => {
  track(eventName, params);
};

/**
 * Track Formatter Events
 */
export const trackFormatter = (
  eventName: 'format_json' | 'repair_json' | 'format_xml' | 'format_yaml' | 'format_sql' | 'minify_json',
  params: { tool_name: string; input_size: number; success: boolean; execution_time_ms?: number }
) => {
  track(eventName, params);
};

/**
 * Track Crypto Events
 */
export const trackCrypto = (
  eventName: 'encrypt_action' | 'decrypt_action' | 'hash_generate' | 'rsa_key_generate' | 'jasypt_encrypt' | 'jasypt_decrypt',
  params: { algorithm?: string; mode?: string; key_size?: number; success: boolean; execution_time_ms?: number }
) => {
  track(eventName, params);
};

/**
 * Track Converter Events
 */
export const trackConverter = (
  eventName: 'json_to_yaml' | 'yaml_to_json' | 'json_to_xml' | 'timestamp_convert' | 'base64_encode' | 'base64_decode' | 'url_encode' | 'url_decode',
  params?: Record<string, any>
) => {
  track(eventName, params);
};

/**
 * Track Utility Events
 */
export const trackUtility = (
  eventName: 'qr_generate' | 'cron_generate' | 'regex_test' | 'http_request_send' | 'uuid_generate' | 'fake_data_generate',
  params?: Record<string, any>
) => {
  track(eventName, params);
};

/**
 * Track UX Interactions
 */
export const trackUX = (
  eventName: 'sidebar_tool_click' | 'copy_output' | 'download_output' | 'clear_input' | 'paste_input' | 'theme_change',
  params?: Record<string, any>
) => {
  track(eventName, params);
};

/**
 * Track Error Events
 */
export const trackError = (
  eventName: 'tool_exception' | 'validation_failed' | 'api_error',
  params: { tool_name?: string; error_message: string; stack_trace?: string; action?: string }
) => {
  track(eventName, params);
};

/**
 * Track Engagement Metrics
 */
export const trackEngagement = (
  eventName: 'time_spent' | 'session_duration' | 'tool_completed',
  params: { tool_name?: string; duration_seconds?: number; [key: string]: any }
) => {
  track(eventName, params);
};

export const analytics = {
  track,
  trackPageView,
  toolUsage: trackToolUsage,
  formatter: trackFormatter,
  crypto: trackCrypto,
  converter: trackConverter,
  utility: trackUtility,
  ux: trackUX,
  error: trackError,
  engagement: trackEngagement,
};

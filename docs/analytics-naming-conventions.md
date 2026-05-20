# Analytics Naming Conventions for ToolGarage

This document outlines the standard naming conventions used for custom events in ToolGarage. By strictly following this guide, we ensure our Google Analytics data remains clean, predictable, and highly actionable.

## 1. General Principles
*   **Case format:** `snake_case` for all event names and parameter keys.
*   **Consistency:** Always use the defined parameter keys to prevent fragmentation in GA4 Custom Definitions.
*   **No PII:** Never send Personally Identifiable Information (PII) like raw user input, passwords, or exact URLs containing tokens.
*   **Reusability:** Use the central `analytics.ts` helper methods instead of calling `ReactGA.event()` directly.

## 2. Event Categories & Names

### Tool Usage
Events related to opening, closing, and finding tools.
*   `tool_open`
*   `tool_close`
*   `tool_search`
*   `favorite_tool`
*   `recent_tool_click`
*   *Required Params:* `tool_name`
*   *Optional Params:* `category`, `source`

### Formatter Events
Events triggered when users format, validate, or repair data.
*   `format_json`, `repair_json`, `format_xml`, `format_yaml`, `format_sql`, `minify_json`
*   *Required Params:* `tool_name`, `input_size` (Number), `success` (Boolean)
*   *Optional Params:* `execution_time_ms` (Number)

### Crypto Events
Events related to encryption, decryption, and hashing.
*   `encrypt_action`, `decrypt_action`, `hash_generate`, `rsa_key_generate`, `jasypt_encrypt`, `jasypt_decrypt`
*   *Required Params:* `algorithm`, `success` (Boolean)
*   *Optional Params:* `mode`, `key_size` (Number), `execution_time_ms` (Number)

### Converter Events
Events for converting between data formats.
*   `json_to_yaml`, `yaml_to_json`, `json_to_xml`, `timestamp_convert`, `base64_encode`, `base64_decode`, `url_encode`, `url_decode`
*   *Required Params:* `tool_name`
*   *Optional Params:* `input_size`, `success`

### Utility Events
Events for miscellaneous tools.
*   `qr_generate`, `cron_generate`, `regex_test`, `http_request_send`, `uuid_generate`, `fake_data_generate`
*   *Required Params:* `tool_name`

### UX Tracking
Events for user interface interactions inside the tools.
*   `sidebar_tool_click`, `copy_output`, `download_output`, `clear_input`, `paste_input`, `theme_change`
*   *Optional Params:* `tool_name`, `length` (for copy/paste size)

### Error Tracking
Events for handled and unhandled errors.
*   `tool_exception` (For fatal or caught code errors)
*   `validation_failed` (For user input failing to parse)
*   `api_error` (For network request failures)
*   *Required Params:* `error_message`
*   *Optional Params:* `tool_name`, `stack_trace`, `action`

### Engagement Metrics
Events for measuring user time and session details.
*   `time_spent`, `session_duration`, `tool_completed`
*   *Required Params:* `tool_name`, `duration_seconds` (Number)

## 3. Implementation Example
Always import and use the helper:

```typescript
import { analytics } from '@/lib/analytics';

// Correct implementation
analytics.crypto('encrypt_action', {
  algorithm: 'AES_GCM',
  mode: 'GCM',
  key_size: 256,
  success: true,
  execution_time_ms: 15
});

// Incorrect implementation (DO NOT USE)
import ReactGA from 'react-ga4';
ReactGA.event({ category: 'Crypto', action: 'Encrypt', label: 'AES' });
```

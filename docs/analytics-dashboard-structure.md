# GA4 Dashboard & Report Structure for ToolGarage

To get the most out of the custom events implemented in ToolGarage, here is a recommended structure for your Google Analytics 4 (GA4) Explorations and Standard Reports.

## 1. Tool Usage Overview (Standard Report / Exploration)
**Goal:** Understand which tools are most popular and how users discover them.
*   **Dimensions:** `tool_name`, `category`, `source`
*   **Metrics:** `Event count` (for `tool_open` / `tool_close`), `Active users`, `Sessions`
*   **Filters:** Event name exactly matches `tool_open`

## 2. Engagement & Retention (Exploration)
**Goal:** Understand how long users spend on individual tools to gauge value.
*   **Dimensions:** `tool_name`
*   **Metrics:** `duration_seconds` (custom metric based on event parameter), `Event count`
*   **Filters:** Event name exactly matches `time_spent`
*   *Note: In GA4 Custom Definitions, register `duration_seconds` as a Custom Metric (Unit: Seconds) and `tool_name` as a Custom Dimension.*

## 3. Formatter Performance (Exploration)
**Goal:** Analyze the usage and performance of formatting tools (JSON, XML, SQL, etc.).
*   **Dimensions:** `tool_name`, `success`
*   **Metrics:** `Event count`, `Average execution_time_ms`, `Average input_size`
*   **Filters:** Event name matches regex `format_.*|repair_.*|minify_.*`

## 4. Crypto & Security Features (Exploration)
**Goal:** See which algorithms and key sizes are predominantly used by developers.
*   **Dimensions:** `algorithm`, `mode`, `key_size`, `success`
*   **Metrics:** `Event count`, `Average execution_time_ms`
*   **Filters:** Event name exactly matches `encrypt_action` OR `decrypt_action` OR `hash_generate`

## 5. Error & Stability Monitoring (Exploration)
**Goal:** Track app stability and identify which tools are causing exceptions or validation failures.
*   **Dimensions:** `tool_name`, `error_message`, `action`
*   **Metrics:** `Event count`
*   **Filters:** Event name matches regex `tool_exception|validation_failed|api_error`
*   *Tip: Sort by highest event count to prioritize bug fixes.*

## 6. UX Interaction Funnel (Exploration: Funnel)
**Goal:** Understand user flow within a tool.
*   **Step 1:** `tool_open`
*   **Step 2:** Formatter/Converter specific event (e.g., `format_json`)
*   **Step 3:** `copy_output` or `download_output`
*   **Breakdown:** `tool_name`

## GA4 Custom Definitions Required
For these reports to work optimally, you must register the following in GA4 (Admin > Custom Definitions):

**Custom Dimensions (Event-scoped):**
*   `tool_name`
*   `category`
*   `algorithm`
*   `mode`
*   `key_size`
*   `error_message`
*   `action`
*   `success` (Boolean/String)

**Custom Metrics (Event-scoped):**
*   `execution_time_ms` (Unit: Standard)
*   `input_size` (Unit: Standard)
*   `duration_seconds` (Unit: Seconds)

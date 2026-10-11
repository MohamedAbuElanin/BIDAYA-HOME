import posthog from 'posthog-js';

const rawKey = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const POSTHOG_KEY = rawKey?.trim();
const rawHost = import.meta.env.VITE_POSTHOG_HOST as string | undefined;
const POSTHOG_HOST = rawHost?.trim() || 'https://us.i.posthog.com';

let isInitialized = false;

export const initPostHog = () => {
  if (isInitialized) return;

  if (!POSTHOG_KEY || POSTHOG_KEY === '' || POSTHOG_KEY === 'your_posthog_project_api_key_here') {
    if (import.meta.env.DEV) {
      console.info(
        '[PostHog] VITE_POSTHOG_KEY is not set. Tracking is inactive.'
      );
    }
    return;
  }

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,

    // ── Identity ──────────────────────────────────────────────────
    person_profiles: 'identified_only',

    // ── Page view: managed manually in analytics.ts ───────────────
    capture_pageview: false,
    capture_pageleave: true,

    // ── IMPORTANT: autocapture DISABLED ──────────────────────────
    // Prevents automatic capture of checkout form inputs (name, phone,
    // address, payment method) and any other DOM interactions.
    autocapture: false,

    // ── Session Replay: DISABLED ──────────────────────────────────────────
    // Session Replay is intentionally OFF for privacy compliance.
    //
    // Reason: The checkout success view renders customer PII as readable DOM
    // text (name, phone, governorate, address) inside <div>/<span> elements.
    // `maskAllInputs` only masks <input>, <textarea>, and <select> values —
    // it does NOT suppress visible text nodes in layout elements.
    //
    // Re-enabling requires either:
    //   (a) Moving the success view to a separate route with no PII in DOM, or
    //   (b) Adding `data-ph-no-capture` to all PII-containing elements and
    //       auditing every component that may display customer data.
    //
    // ALSO verify in your PostHog dashboard (Project → Recordings → Settings)
    // that "Enable session recordings" is OFF — the SDK flag alone is not
    // sufficient if the dashboard toggle overrides it.
    disable_session_recording: true,
    session_recording: {
      maskAllInputs: true,
      maskInputOptions: {
        password: true,
        text: true,
        tel: true,
        email: true,
        search: true,
        number: true,
        color: true,
        date: true,
        textarea: true,
        select: true,
      },
    },

    loaded: (ph) => {
      if (import.meta.env.DEV) {
        ph.debug();
      }
    },
  });

  isInitialized = true;
};

/**
 * Safe posthog proxy — returns a no-op object when PostHog is not
 * initialized (key absent), so callers never need to null-check.
 */
const noop = () => {};
const noopPosthog = {
  capture: noop,
  identify: noop,
  reset: noop,
  alias: noop,
  group: noop,
  setPersonProperties: noop,
} as unknown as typeof posthog;

export const getPostHog = (): typeof posthog =>
  isInitialized ? posthog : noopPosthog;

// Keep named export for backward-compat with direct imports
export { posthog };

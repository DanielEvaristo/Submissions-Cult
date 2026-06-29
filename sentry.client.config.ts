import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://e9ddd28cf0757769e89154cb71437712@o4511631714156544.ingest.us.sentry.io/4511631714353152",

  tracesSampleRate: 1,

  // Replay may be added optionally
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  debug: false,
});
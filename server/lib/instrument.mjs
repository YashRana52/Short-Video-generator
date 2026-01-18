import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "https://043be8965295fdc692d105fd125323b2@o4510717975986176.ingest.us.sentry.io/4510717978476544",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
});

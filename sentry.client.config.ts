/**
 * Sentry no client (browser) — captura erros de React, fetches, navegação.
 * Init é automático no Next.js 16 via instrumentation-client.
 */
import * as Sentry from "@sentry/nextjs";

const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (DSN) {
  Sentry.init({
    dsn: DSN,
    environment: process.env.NODE_ENV || "development",
    // Replay de sessões — taxa baixa pra não estourar quota free.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Tracing — só em prod e taxa baixa.
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,
    // Ignorar ruído conhecido.
    ignoreErrors: [
      "ResizeObserver loop limit exceeded",
      "Non-Error promise rejection captured",
    ],
  });
}

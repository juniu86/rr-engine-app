/**
 * Next.js 16 instrumentation hook — chamado uma vez no boot do servidor.
 * Carrega o Sentry no runtime apropriado (Node ou Edge).
 *
 * Doc: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Captura erros de Server Components, route handlers e server actions.
export const onRequestError = Sentry.captureRequestError;

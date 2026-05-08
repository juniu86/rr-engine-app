/**
 * Next.js 16 instrumentation hook — chamado uma vez no boot do servidor.
 * Carrega o Sentry no runtime apropriado (Node ou Edge).
 *
 * Doc: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export { onRequestError } from "@sentry/nextjs";

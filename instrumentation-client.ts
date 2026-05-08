/**
 * Next.js 16 — instrumentation-client.ts substitui o sentry.client.config.ts
 * pro carregamento no browser. Importa a config principal.
 */
import "./sentry.client.config";

// API do Sentry 10.x: captureRouterTransitionStart é o nome novo
// (antes era onRouterTransitionStart no Next.js).
export { captureRouterTransitionStart as onRouterTransitionStart } from "@sentry/nextjs";

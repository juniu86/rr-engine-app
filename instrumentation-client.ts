/**
 * Next.js 16 — instrumentation-client.ts substitui o sentry.client.config.ts
 * pro carregamento no browser. Importa a config principal.
 */
import "./sentry.client.config";

export { onRouterTransitionStart } from "@sentry/nextjs";

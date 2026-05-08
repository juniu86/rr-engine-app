import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

// Wrap apenas se Sentry DSN está configurado. Em dev local sem DSN
// o build segue normal sem o wrapper.
const finalConfig = process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, {
      // Auth token só é necessário pra source maps em produção (upload)
      // — não obrigatório, build funciona sem.
      silent: !process.env.CI,
      tunnelRoute: "/monitoring",
      disableLogger: true,
    })
  : nextConfig;

export default finalConfig;

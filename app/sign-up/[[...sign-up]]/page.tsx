import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SITE_URL } from "@/lib/site-config";
import { clerkAppearance } from "@/lib/clerk-appearance";

export const metadata: Metadata = {
  title: "Criar conta",
  description: "Crie sua conta no RR Engine.",
  alternates: { canonical: `${SITE_URL}/sign-up` },
  robots: { index: false, follow: true },
};

export default function SignUpPage() {
  return (
    <>
      <Header showFullNav={false} />
      <main
        style={{
          minHeight: "calc(100vh - 200px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem 1.5rem",
        }}
      >
        <SignUp
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/dashboard"
          appearance={clerkAppearance}
        />
      </main>
      <Footer />
    </>
  );
}

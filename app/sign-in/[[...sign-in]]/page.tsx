import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SITE_URL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Acesse sua conta no RR Engine.",
  alternates: { canonical: `${SITE_URL}/sign-in` },
  robots: { index: false, follow: true },
};

export default function SignInPage() {
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
        <SignIn
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/dashboard"
        />
      </main>
      <Footer />
    </>
  );
}

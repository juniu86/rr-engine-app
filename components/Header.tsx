import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";

interface HeaderProps {
  showFullNav?: boolean;
}

export async function Header({ showFullNav = true }: HeaderProps) {
  const { userId } = await auth();
  const isSignedIn = Boolean(userId);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="logo">
          <Image src="/logo.png" alt="RR Engenharia" width={36} height={36} className="logo-img" priority />
          <span>RR Engine</span>
        </Link>
        <nav>
          {showFullNav && (
            <>
              <Link href="/#funciona">Como funciona</Link>
              <Link href="/#agentes">Agentes</Link>
              <Link href="/#planos">Planos</Link>
              <Link href="/#faq">FAQ</Link>
            </>
          )}
          {isSignedIn ? (
            <>
              <Link href="/dashboard" className="nav-login">Dashboard</Link>
              <UserButton />
            </>
          ) : (
            <>
              <Link href="/sign-in" className="nav-login">Entrar</Link>
              <Link href="/sign-up" className="nav-cta">Criar conta</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

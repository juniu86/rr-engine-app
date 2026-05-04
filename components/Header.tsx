import Image from "next/image";
import Link from "next/link";

interface HeaderProps {
  showFullNav?: boolean;
}

export function Header({ showFullNav = true }: HeaderProps) {
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
          <Link href="/login" className="nav-login">Entrar</Link>
          <Link href="/#contato" className="nav-cta">Fazer demo</Link>
        </nav>
      </div>
    </header>
  );
}

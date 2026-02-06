import Link from 'next/link';

export default function Header() {
  return (
    <header className="flex items-center justify-between mb-12 print:hidden">
      <Link href="/" className="text-2xl font-heading header-logo">
        Matthew Mitrik
      </Link>
      <nav className="space-x-6 text-muted">
        <Link href="/" className="hover:text-accent">
          Home
        </Link>
        <Link href="/projects" className="hover:text-accent">
          Projects
        </Link>
        <Link href="/contact" className="hover:text-accent">
          Contact
        </Link>
      </nav>
    </header>
  );
}
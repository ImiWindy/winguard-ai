import Link from "next/link";
import NavUser from "./NavUser";

export default function Header() {
  return (
    <header className="border-b border-black/10 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="text-lg font-bold">Win Guard</Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/">Landing</Link>
          <Link href="/dashboard">Dashboard</Link>
          <NavUser />
        </nav>
      </div>
    </header>
  );
}


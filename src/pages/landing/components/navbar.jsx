import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { NAV_LINKS, PORTAL_PATH, REGISTER_PATH } from "../landingdata";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open ? "bg-temple-900/95 backdrop-blur shadow-lg shadow-black/20" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        <button onClick={() => go("home")} className="flex items-center gap-3 text-left" aria-label="Go to top">
          <img src="/ambajilogo.png" alt="Ambaji Mata Temple" className="h-10 w-10 sm:h-12 sm:w-12 object-contain" />
          <span className="leading-tight">
            <span className="block text-base sm:text-lg font-bold text-white">અંબાજી મંદિર</span>
            <span className="block text-[10px] sm:text-[11px] tracking-[0.18em] text-white/60">SHAKTI PEETH · GUJARAT</span>
          </span>
        </button>

        <nav className="hidden lg:flex items-center gap-8" aria-label="Main">
          {NAV_LINKS.map((l) => (
            <button key={l.id} onClick={() => go(l.id)} className="text-sm text-white/80 transition-colors hover:text-gold">
              {l.label}
            </button>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Link
            to={PORTAL_PATH}
            className="rounded-lg border border-white/30 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            Login
          </Link>
          <Link
            to={REGISTER_PATH}
            className="rounded-lg border border-white/30 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            Register
          </Link>
          <Link
            to={REGISTER_PATH}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Book Darshan
          </Link>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden rounded-md p-2 text-white hover:bg-white/10"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-white/10 px-5 pb-5 pt-2">
          <nav className="flex flex-col" aria-label="Mobile">
            {NAV_LINKS.map((l) => (
              <button
                key={l.id}
                onClick={() => go(l.id)}
                className="border-b border-white/10 py-3 text-left text-sm text-white/85 hover:text-gold"
              >
                {l.label}
              </button>
            ))}
          </nav>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <Link to={PORTAL_PATH} className="rounded-lg border border-white/30 py-2.5 text-center text-sm font-medium text-white">
              Login
            </Link>
            <Link to={REGISTER_PATH} className="rounded-lg border border-white/30 py-2.5 text-center text-sm font-medium text-white">
              Register
            </Link>
            <Link to={REGISTER_PATH} className="rounded-lg bg-brand py-2.5 text-center text-sm font-semibold text-white">
              Book Darshan
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

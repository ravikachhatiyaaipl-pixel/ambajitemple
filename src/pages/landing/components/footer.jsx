import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import { CONTACT, FOOTER_COLUMNS, PORTAL_PATH, TEMPLE_NAME } from "../landingdata";

const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

export default function Footer() {
  return (
    <footer className="bg-temple-900 text-white/70">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <div className="flex items-center gap-3">
            <img src="/ambajilogo.png" alt="Ambaji Mata Temple" className="h-12 w-12 object-contain" />
            <span className="text-lg font-bold text-white">અંબાજી મંદિર</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            {TEMPLE_NAME} — an Adi Shakti Peeth in the Aravalli foothills of Banaskantha, Gujarat.
          </p>
        </div>

        {FOOTER_COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold text-white">{col.title}</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {col.links.map(([label, id]) => (
                <li key={label}>
                  <button onClick={() => go(id)} className="transition-colors hover:text-gold">
                    {label}
                  </button>
                </li>
              ))}
              {col.title === "Support" && (
                <li>
                  <Link to={PORTAL_PATH} className="transition-colors hover:text-gold">
                    Staff / Admin Login
                  </Link>
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-5 text-xs sm:px-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-gold" /> {CONTACT.address}
            </span>
            {CONTACT.phone && (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-gold" /> {CONTACT.phone}
              </span>
            )}
            {CONTACT.email && (
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-gold" /> {CONTACT.email}
              </span>
            )}
          </div>
          <p>
            © {new Date().getFullYear()} {TEMPLE_NAME} Trust. All rights reserved. · Powered by Aark InfoSoft Pvt Ltd.
          </p>
        </div>
      </div>
    </footer>
  );
}

import { ArrowRight, HeartHandshake, Receipt, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { DONATE_POINTS, PORTAL_PATH } from "../landingdata";
import Mandala from "./mandala";
import Reveal from "./reveal";

const ICONS = { shield: ShieldCheck, receipt: Receipt, heart: HeartHandshake };

export default function DonationCTA() {
  return (
    <section id="donate" className="relative isolate scroll-mt-20 overflow-hidden bg-temple-900 py-20 text-white sm:py-24">
      <Mandala className="absolute -left-24 -top-24 -z-10 h-[420px] w-[420px] text-white/[0.06]" />
      <Mandala className="absolute -bottom-32 -right-24 -z-10 h-[460px] w-[460px] text-white/[0.05]" />
      <Reveal>
        <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
          <h2 className="font-display text-3xl font-semibold uppercase leading-tight tracking-wide sm:text-4xl">
            Offer your devotion, <span className="text-gold">wherever you are</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
            Your donation supports daily seva, prasad distribution, temple upkeep and outreach — carried out in Maa
            Amba&apos;s name.
          </p>
          <Link
            to={PORTAL_PATH}
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-brand px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-colors hover:bg-brand-dark"
          >
            Donate Online Now <ArrowRight className="h-4 w-4" />
          </Link>
          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-white/70">
            {DONATE_POINTS.map((p) => {
              const Icon = ICONS[p.icon] || ShieldCheck;
              return (
                <li key={p.text} className="inline-flex items-center gap-2">
                  <Icon className="h-4 w-4 text-gold" /> {p.text}
                </li>
              );
            })}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}

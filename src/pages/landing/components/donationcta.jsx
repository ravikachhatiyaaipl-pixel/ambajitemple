import { ArrowRight, HeartHandshake, Receipt, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { DONATE_POINTS, PORTAL_PATH } from "../landingdata";
import Mandala from "./mandala";
import Reveal from "./reveal";

const ICONS = { shield: ShieldCheck, receipt: Receipt, heart: HeartHandshake };

// Gold coin drawn in CSS so no extra image is needed.
function Coin() {
  return (
    <div className="relative mx-auto h-56 w-56 sm:h-72 sm:w-72" aria-hidden="true">
      <div className="absolute inset-0 rounded-full bg-gold/30 blur-3xl"></div>
      <div className="relative flex h-full w-full items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_25%,#fff3b0,#f5b800_45%,#a86f00)] shadow-2xl shadow-black/40 ring-8 ring-gold-soft/40">
        <div className="flex h-[82%] w-[82%] items-center justify-center rounded-full border-2 border-dashed border-temple-900/40">
          <span className="font-display text-7xl font-bold text-temple-900/80 drop-shadow sm:text-8xl">₹</span>
        </div>
      </div>
    </div>
  );
}

export default function DonationCTA() {
  return (
    <section id="donate" className="relative isolate scroll-mt-20 overflow-hidden bg-gradient-to-br from-brand-dark via-brand-dark to-temple-800 py-20 text-white sm:py-24">
      <Mandala className="absolute -left-24 -top-24 -z-10 h-[420px] w-[420px] text-white/[0.07]" />
      <Mandala className="absolute -bottom-32 -right-24 -z-10 h-[460px] w-[460px] text-white/[0.06]" />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.2fr_1fr]">
        <Reveal>
          <p className="text-sm font-semibold text-gold-soft">Donation</p>
          <h2 className="font-display mt-3 text-3xl font-semibold leading-tight tracking-wide sm:text-4xl">
            Offer your devotion, wherever you are
          </h2>
<<<<<<< HEAD
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
            Your donation supports daily seva, prasad distribution, temple upkeep and outreach - carried out in Maa
=======
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-white/75 sm:text-base">
            Your donation supports daily seva, prasad distribution, temple upkeep and outreach — carried out in Maa
>>>>>>> b4ae7505f0ddd090375ea03a53f7455424394ef7
            Amba&apos;s name.
          </p>
          <Link
            to={PORTAL_PATH}
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3 text-sm font-semibold text-brand-dark shadow-lg shadow-black/20 transition-colors hover:bg-cream"
          >
            Donate Online Now <ArrowRight className="h-4 w-4" />
          </Link>
          <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-xs text-white/75">
            {DONATE_POINTS.map((p) => {
              const Icon = ICONS[p.icon] || ShieldCheck;
              return (
                <li key={p.text} className="inline-flex items-center gap-2">
                  <Icon className="h-4 w-4 text-gold" /> {p.text}
                </li>
              );
            })}
          </ul>
        </Reveal>
        <Reveal delay={120}>
          <Coin />
        </Reveal>
      </div>
    </section>
  );
}

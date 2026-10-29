import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { PORTAL_PATH } from "../landingdata";
import Mandala from "./mandala";
import Reveal from "./reveal";

export default function FinalCTA() {
  return (
    <section className="bg-cream py-16 sm:py-24">
      <Reveal>
        <div className="relative isolate mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-brand to-brand-dark px-6 py-14 text-center text-white shadow-2xl shadow-brand/20 sm:mx-8 sm:px-12 lg:mx-auto">
          <Mandala className="absolute -right-20 -top-24 -z-10 h-80 w-80 text-white/10" />
          <Mandala className="absolute -bottom-28 -left-16 -z-10 h-72 w-72 text-white/10" />
          <h2 className="font-display text-2xl font-semibold uppercase leading-tight tracking-wide sm:text-4xl">
            May Maa Amba&apos;s blessings reach every home
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm text-white/85 sm:text-base">
            Begin your journey of devotion today — book your darshan or offer your seva online.
          </p>
          <Link
            to={PORTAL_PATH}
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand-dark transition-colors hover:bg-cream"
          >
            Enter Portal <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

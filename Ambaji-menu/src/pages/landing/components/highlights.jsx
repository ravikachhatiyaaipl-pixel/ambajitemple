import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { HIGHLIGHTS, PORTAL_PATH } from "../landingdata";
import Mandala from "./mandala";
import Reveal from "./reveal";

const TONES = {
  marigold: { band: "bg-cream", mark: "text-temple-900/[0.07]", btn: "bg-brand-dark text-white hover:bg-temple-800" },
  cream: { band: "bg-cream-light", mark: "text-brand/[0.07]", btn: "bg-brand text-white hover:bg-brand-dark" },
};

// Asymmetric corners (one sharp pair, one soft pair) give the photos a temple-arch feel.
const SHAPES = ["rounded-tl-[4.5rem] rounded-br-[4.5rem] rounded-tr-2xl rounded-bl-2xl", "rounded-tr-[4.5rem] rounded-bl-[4.5rem] rounded-tl-2xl rounded-br-2xl"];

export default function Highlights() {
  return (
    <>
      {HIGHLIGHTS.map((h, i) => {
        const tone = TONES[h.tone] || TONES.cream;
        const flip = i % 2 === 1;
        return (
          <section key={h.id} className={`relative isolate overflow-hidden ${tone.band} py-16 sm:py-24`}>
            <Mandala className={`absolute ${flip ? "-right-40" : "-left-40"} top-1/2 -z-10 h-[560px] w-[560px] -translate-y-1/2 ${tone.mark}`} />
            <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
              <Reveal className={flip ? "lg:order-2" : ""}>
                <div className={`overflow-hidden shadow-2xl shadow-temple-900/20 ${SHAPES[i % 2]} ${h.portrait ? "mx-auto max-w-sm" : ""}`}>
                  <img
                    src={h.img}
                    alt={h.title}
                    loading="lazy"
                    style={{ objectPosition: h.pos }}
                    className={`w-full object-cover ${h.portrait ? "aspect-[4/5]" : "aspect-[4/3]"}`}
                  />
                </div>
              </Reveal>

              <Reveal delay={100}>
                <p className="text-sm font-semibold text-brand-dark">{h.tag}</p>
                <h2 className="font-display mt-3 text-2xl font-semibold leading-snug tracking-wide text-temple-900 sm:text-3xl lg:text-4xl">
                  {h.title}
                </h2>
                <p className="mt-5 max-w-md text-sm leading-relaxed text-temple-800/80 sm:text-base">{h.text}</p>
                {h.anchor ? (
                  <button
                    onClick={() => document.getElementById(h.anchor)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                    className={`mt-7 inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-colors ${tone.btn}`}
                  >
                    {h.cta} <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <Link to={PORTAL_PATH} className={`mt-7 inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-colors ${tone.btn}`}>
                    {h.cta} <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </Reveal>
            </div>
          </section>
        );
      })}
    </>
  );
}

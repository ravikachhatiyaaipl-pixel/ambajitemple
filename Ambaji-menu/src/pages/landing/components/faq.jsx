import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FAQS } from "../landingdata";
import Reveal from "./reveal";
import SectionHeading from "./sectionheading";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="scroll-mt-20 bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <Reveal>
          <SectionHeading tag="Good to Know" title="Frequently asked questions" />
        </Reveal>

        <div className="mt-12 space-y-3">
          {FAQS.map((f, i) => {
            const open = openIndex === i;
            return (
              <Reveal key={f.q} delay={i * 50}>
                <div className={`rounded-xl border bg-white transition-colors ${open ? "border-brand/40 shadow-sm" : "border-gray-200"}`}>
                  <button
                    onClick={() => setOpenIndex(open ? -1 : i)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="text-sm font-semibold text-temple-900 sm:text-base">{f.q}</span>
                    <ChevronDown className={`h-5 w-5 flex-shrink-0 text-gray-400 transition-transform ${open ? "rotate-180 text-brand" : ""}`} />
                  </button>
                  <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 text-sm leading-relaxed text-gray-600">{f.a}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

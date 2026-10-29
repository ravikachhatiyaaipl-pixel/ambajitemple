import { useEffect, useState } from "react";

const fmt = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Kolkata",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hour12: false,
});

const read = () => {
  const p = Object.fromEntries(fmt.formatToParts(new Date()).map((x) => [x.type, x.value]));
  const h = parseInt(p.hour, 10) % 24;
  const m = parseInt(p.minute, 10);
  const s = parseInt(p.second, 10);
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return {
    minutes: h * 60 + m,
    display: `${h12}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")} ${h >= 12 ? "pm" : "am"}`,
  };
};

/** Live temple time (IST), updates every second. */
export default function useTempleClock() {
  const [clock, setClock] = useState(read);
  useEffect(() => {
    const id = setInterval(() => setClock(read()), 1000);
    return () => clearInterval(id);
  }, []);
  return clock;
}

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

/**
 * Smart "go back" helper.
 * - Browser history me pichla page ho to wahi (navigate(-1)).
 * - Direct URL / new tab se khola ho to `fallback` route par jata hai.
 */
export const useSmartBack = (fallback = "/dashboard") => {
  const navigate = useNavigate();
  return useCallback(() => {
    const idx = window.history.state?.idx;
    if (typeof idx === "number" ? idx > 0 : window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  }, [navigate, fallback]);
};

/**
 * Standard back button - same look as the header arrow used across the project
 * (plain grey arrow, sits to the left of the page title).
 *
 * <BackButton />                      -> icon only
 * <BackButton label="Back" />         -> icon + text
 * <BackButton to="/dashboard" />      -> always go to a fixed route
 * <BackButton onClick={fn} />         -> custom handler (e.g. close a detail view)
 */
const BackButton = ({
  to,
  fallback = "/dashboard",
  onClick,
  label,
  className = "",
  title = "Back",
}) => {
  const navigate = useNavigate();
  const smartBack = useSmartBack(fallback);

  const handle = () => {
    if (onClick) return onClick();
    if (to) return navigate(to);
    return smartBack();
  };

  return (
    <button
      type="button"
      onClick={handle}
      title={title}
      aria-label={title}
      data-back-button="true"
      className={`inline-flex items-center gap-1.5 text-gray-500 transition-colors hover:text-gray-700 ${
        label ? "text-sm font-medium" : ""
      } ${className}`}
    >
      <ArrowLeft  className="h-5 w-5" />
      {label}
    </button>
  );
};

export default BackButton;

/* ------------------------------------------------------------------ *
 * AutoBackGuard
 *
 * Project me 250+ pages hain. Jin pages me apna back arrow already hai
 * unko touch nahi kiya jata; jin me nahi hai unke upar ek chhota
 * "Back" bar apne aap aa jata hai. Isse har page me back button
 * guaranteed rehta hai (new pages me bhi).
 * ------------------------------------------------------------------ */

const hasOwnBackControl = (root) => {
  if (!root) return false;
  const rootTop = root.getBoundingClientRect().top;
  const candidates = root.querySelectorAll("button, a, [role='button']");

  for (let i = 0; i < candidates.length && i < 60; i++) {
    const el = candidates[i];
    const rect = el.getBoundingClientRect();
    // sirf page ke header area (top ~260px) me dekho
    if (rect.top - rootTop > 260) break;

    if (el.closest("[data-auto-back-host]")) continue;
    if (el.hasAttribute("data-back-button")) return true;

    const label = `${el.getAttribute("aria-label") || ""} ${
      el.getAttribute("title") || ""
    } ${(el.textContent || "").trim().slice(0, 30)}`;
    if (/^\s*(back|go back)\b/i.test(label) || /\bback to\b/i.test(label))
      return true;

    const svg = el.querySelector("svg");
    if (!svg) continue;
    const cls = svg.getAttribute("class") || "";
    if (/lucide-(arrow-left|chevron-left|move-left|circle-arrow-left)/.test(cls))
      return true;
    if (/lucide-arrow-right/.test(cls) && /rotate-180/.test(cls)) return true;
    // react-icons Fi/Hi arrows (polyline / path signature)
    const poly = svg.querySelector("polyline");
    const pts = poly?.getAttribute("points") || "";
    if (pts === "15 18 9 12 15 6" || pts === "12 19 5 12 12 5") return true;
    if (/rotate-180/.test(cls)) return true;
  }
  return false;
};

const HOST_ATTR = "data-auto-back-host";

// Title (h1) ke left me arrow lagane ke liye host span banata hai
const mountHost = (root) => {
  const h1 = root.querySelector("h1");
  if (!h1) return null;
  const host = document.createElement("span");
  host.setAttribute(HOST_ATTR, "true");
  host.style.cssText =
    "display:inline-flex;align-items:center;margin-right:16px;flex-shrink:0;vertical-align:middle;";

  const block = h1.parentElement;
  const parent = block?.parentElement;
  const pStyle = parent ? window.getComputedStyle(parent) : null;
  const titleBlockIsRowItem =
    block &&
    block !== root &&
    pStyle &&
    pStyle.display.includes("flex") &&
    !pStyle.flexDirection.startsWith("column");

  if (titleBlockIsRowItem) {
    // [ <- ] [ Title + subtitle ]  (screenshot jaisa)
    // Parent agar justify-between hai to 3 items (arrow, title, controls)
    // spread ho jate the aur title beech me chala jata tha. Title ko
    // margin-right:auto dene se wo arrow ke sath chipka rehta hai aur
    // controls right me rehte hain.
    const prevMarginRight = block.style.marginRight;
    const spreads = /space-(between|around|evenly)/.test(pStyle.justifyContent);
    if (spreads) block.style.marginRight = "auto";
    // total arrow->title gap 16px rakho (parent ka gap minus karke)
    const gap = parseFloat(pStyle.columnGap) || 0;
    host.style.marginRight = `${Math.max(0, 16 - gap)}px`;
    host.__restore = () => {
      block.style.marginRight = prevMarginRight;
    };
    parent.insertBefore(host, block);
  } else {
    // fallback: arrow title ki line ke andar, title se pehle
    h1.style.display = "flex";
    h1.style.alignItems = "center";
    h1.insertBefore(host, h1.firstChild);
  }
  return host;
};

export const AutoBackGuard = ({ children, hideOn = ["/dashboard", "/"] }) => {
  const { pathname } = useLocation();
  const contentRef = useRef(null);
  const hostRef = useRef(null);
  const [host, setHost] = useState(null);
  const [needsBar, setNeedsBar] = useState(false);
  const smartBack = useSmartBack("/dashboard");

  const hidden = hideOn.includes(pathname);

  useEffect(() => {
    const removeHost = () => {
      if (hostRef.current) {
        hostRef.current.__restore?.();
        hostRef.current.remove();
        hostRef.current = null;
      }
      setHost(null);
    };

    removeHost();
    setNeedsBar(false);
    if (hidden) return undefined;
    const el = contentRef.current;
    if (!el) return undefined;

    let timer = null;
    const check = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        // apna (page ka) back already hai?
        if (hasOwnBackControl(el)) {
          // humara host hi mila ho to rehne do
          if (hostRef.current && el.contains(hostRef.current)) return;
          removeHost();
          setNeedsBar(false);
          return;
        }
        // host abhi DOM me hai to kuch nahi karna
        if (hostRef.current && el.contains(hostRef.current)) return;
        const h = mountHost(el);
        if (h) {
          hostRef.current = h;
          setHost(h);
          setNeedsBar(false);
        } else {
          setNeedsBar(true); // page me h1 hi nahi -> chhota bar
        }
      }, 250);
    };

    check();
    const observer = new MutationObserver(check);
    observer.observe(el, { childList: true, subtree: true });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      removeHost();
    };
  }, [pathname, hidden]);

  return (
    <>
      {needsBar && (
        <div className="px-6 pt-4 print:hidden">
          <BackButton fallback="/dashboard" title="Back" />
        </div>
      )}
      <div ref={contentRef} className="w-full">
        {children}
      </div>
      {host && createPortal(<BackButton fallback="/dashboard" />, host)}
    </>
  );
};

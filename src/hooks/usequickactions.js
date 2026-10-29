import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { filterRemovedMenus } from "./useaccountingnavigation";

const TONE_CYCLE = ["red", "teal", "green", "gold", "violet", "slate"];

const hasLink = (m) => !!m?.Menu_Links && m.Menu_Links != "#";
const menuName = (m) => m?.Fnc_Desc || m?.title || "";
const isQuick = (m) =>
  m?.Is_Quick_Action == true || m?.Is_Quick_Action == "true" || m?.Is_Quick_Action == 1;
const isHidden = (m) => m?.isvisible == 0 || m?.isvisible == false || m?.isvisible == "0";

/**
 * Quick actions are fully dynamic: they come from the menu data (flag set in Menu Master).
 * Saved menu_details (permission-filtered at login) show first, then the live Menu Master
 * list replaces them. Removed modules (Pet / Tax) are never returned.
 */
export const useQuickActions = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const apply = (list) => {
      const clean = filterRemovedMenus(Array.isArray(list) ? list : []).filter((m) => !isHidden(m));
      if (!cancelled) setMenus(clean);
    };

    (async () => {
      try {
        apply(JSON.parse(localStorage.getItem("menu_details") || "[]"));
      } catch {
        apply([]);
      }
      if (!cancelled) setLoading(false);

      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/menu-master/lst-menu-master`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
        });
        if (res.data?.status == "success" && Array.isArray(res.data.data)) {
          apply(res.data.data.filter((m) => m.isvisible == 1));
        }
      } catch {
        /* keep saved menus */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const quickActions = useMemo(() => {
    const byCode = new Map(menus.map((m) => [m.GrCod, m]));
    const seen = new Set();
    return menus
      .filter((m) => isQuick(m) && hasLink(m) && menuName(m))
      .filter((m) => {
        const key = `${m.Menu_Links}|${menuName(m)}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((m, i) => ({
        label: menuName(m),
        hint: menuName(byCode.get(m.UpGrp)) || "",
        to: m.Menu_Links.startsWith("/") ? m.Menu_Links : `/${m.Menu_Links}`,
        tone: TONE_CYCLE[i % TONE_CYCLE.length],
      }));
  }, [menus]);

  return { menus, quickActions, loading };
};

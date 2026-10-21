/**
 *  SearchableSelect — AMT I3EMS. A dependency-free typeahead dropdown for large lookups
 *  (Department, Ledger, Financial Year, …). Fetches {value,label} options once from an endpoint
 *  (or accepts a static `options` array) and filters as the user types.
 *
 *  Props:
 *    value        selected value
 *    onChange(v)  callback
 *    endpoint     API path after VITE_API_URL returning [{value,label}] (or {data:[...]})
 *    options      static array [{v,l}] | [{value,label}] (used if no endpoint)
 *    placeholder  string
 */
import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { FiChevronDown, FiSearch, FiX } from "react-icons/fi";

const API = import.meta.env.VITE_API_URL;
const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` } });
const norm = (o) => ({ value: o.value ?? o.v ?? o.id ?? o.Id, label: String(o.label ?? o.l ?? o.name ?? o.Name ?? o.value ?? o.v) });

export default function SearchableSelect({ value, onChange, endpoint, options, placeholder = "Search…" }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [opts, setOpts] = useState(() => (options ? options.map(norm) : []));
  const [loading, setLoading] = useState(false);
  const box = useRef(null);

  useEffect(() => {
    if (!endpoint) return;
    let alive = true;
    setLoading(true);
    axios.get(`${API}/${endpoint}`, auth())
      .then((r) => { if (alive) setOpts((r.data?.data || r.data || []).map(norm)); })
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [endpoint]);

  useEffect(() => {
    const onDoc = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const selected = useMemo(() => opts.find((o) => String(o.value) ==  String(value)), [opts, value]);
  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return opts.slice(0, 200);
    return opts.filter((o) => o.label.toLowerCase().includes(k) || String(o.value).includes(k)).slice(0, 200);
  }, [opts, q]);

  return (
    <div className="relative" ref={box}>
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-left flex items-center justify-between focus:ring-2 focus:ring-blue-500 bg-white">
        <span className={selected ? "text-gray-800" : "text-gray-400"}>{selected ? selected.label : (loading ? "Loading…" : placeholder)}</span>
        <span className="flex items-center gap-1">
          {value ? <FiX className="text-gray-400 hover:text-rose-500" onClick={(e) => { e.stopPropagation(); onChange(""); }} /> : null}
          <FiChevronDown className="text-gray-400" />
        </span>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-hidden">
          <div className="p-2 border-b border-gray-100 flex items-center gap-2">
            <FiSearch className="text-gray-400" />
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type to search…"
              className="w-full text-sm outline-none" />
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.length ==  0 ? (
              <div className="px-3 py-3 text-sm text-gray-400">No matches</div>
            ) : filtered.map((o) => (
              <div key={o.value} onClick={() => { onChange(o.value); setOpen(false); setQ(""); }}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 ${String(o.value) ==  String(value) ? "bg-blue-50 text-blue-700" : "text-gray-700"}`}>
                {o.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Convenience presets wired to the LookupController endpoints. */
export const LOOKUP_ENDPOINT = {
  department: "lookup/departments",
  ledger: "lookup/ledgers",
  financialYear: "lookup/financial-years",
};

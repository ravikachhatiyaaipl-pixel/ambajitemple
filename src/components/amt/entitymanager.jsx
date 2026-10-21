/***
 *  I3EMS - AMT ERP  |  EntityManager  (additive superset of ResourceManager)
 *
 *  A single reusable list + add/edit + workflow CRUD screen used by the new
 *  Family / NOC and Statutory Deduction masters. It is a *new* component and does
 *  NOT modify the shared ResourceManager, so existing screens are unaffected.
 *
 *  Layout matches hall-shop-management/shop-categories (list header, search bar,
 *  table, in-place add/edit form, view page) while keeping EntityManager features:
 *    - field type "lookup"  : options fetched from an API endpoint + searchable combobox
 *    - field type "file"    : reads the chosen file as a base64 data URL into data[key]
 *    - toolbar[]            : extra header buttons (e.g. "Run Age Check", "Generate")
 *    - lockField/lockValues : rows in a locked status are read-only (no edit/delete)
 *
 *  Props:
 *    title       string
 *    subtitle    string
 *    endpoint    string   API path after VITE_API_URL, e.g. "family-noc/noc"
 *    idKey       string   primary key field, e.g. "FNOC_Id"
 *    columns     [{ key, label, type }]      table columns (text|date|amount|bool|status)
 *    fields      [{ key, label, type, options?, required?, full?, endpoint?, optionValue?, optionLabel?, accept?, readOnlyOnEdit? }]
 *    actions     [{ label, action, tone?, path?, body?, done? }]   workflow buttons
 *    toolbar     [{ label, tone?, onClick(reload) }]               extra header buttons
 *    lockField   string   (optional) status field name
 *    lockValues  [string] (optional) statuses that make a row read-only
 */
import React, {
  useState, useEffect, useCallback, useMemo, useRef,
  forwardRef, useImperativeHandle,
} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search, Plus, Edit, Trash2, Eye, RefreshCw,
  ChevronLeft, ChevronRight, XCircle, FileText, ArrowRight, ArrowLeft,
  Save, AlertCircle, Paperclip, ExternalLink, Lock, ChevronDown, ChevronUp, Check,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";

const auth = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
});
const API = import.meta.env.VITE_API_URL;
const PER_PAGE = 10;

const fmt = (v, type) => {
  if (v == null || v == undefined || v == "") return "—";
  if (type == "date") {
    try {
      return new Date(v).toLocaleDateString("en-GB");
    } catch {
      return v;
    }
  }
  if (type == "bool") return v == 1 || v == true ? "Yes" : "No";
  if (type == "amount") return "₹ " + Number(v).toLocaleString("en-IN");
  return String(v);
};

const STATUS_TONE = {
  DRAFT: "bg-gray-100 text-gray-700",
  PENDING: "bg-amber-100 text-amber-700",
  OPEN: "bg-sky-100 text-sky-700",
  SUBMITTED: "bg-sky-100 text-sky-700",
  NOTIFIED: "bg-amber-100 text-amber-700",
  NOC_SUBMITTED: "bg-sky-100 text-sky-700",
  VERIFIED: "bg-violet-100 text-violet-700",
  RECORDED: "bg-emerald-100 text-emerald-700",
  CLOSED: "bg-emerald-100 text-emerald-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  COMPUTED: "bg-sky-100 text-sky-700",
  POSTED: "bg-violet-100 text-violet-700",
  DEPOSITED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-700",
  CANCELLED: "bg-rose-100 text-rose-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  JOINED: "bg-emerald-100 text-emerald-700",
  FIT: "bg-emerald-100 text-emerald-700",
  UNFIT: "bg-rose-100 text-rose-700",
  CONDITIONAL: "bg-amber-100 text-amber-700",
};

const extractArray = (d) => {
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.rows)) return d.rows;
  if (d && typeof d == "object") {
    const a = Object.values(d).find((v) => Array.isArray(v));
    if (a) return a;
  }
  return [];
};

const inputCls =
  "w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm";

/* Searchable dropdown with ArrowUp/ArrowDown/Enter matching other masters. */
const SearchSelect = forwardRef(function SearchSelect(
  { value, options, placeholder, onChange, onAdvance },
  ref,
) {
  const [open, setOpen] = useState(false);
  const [kw, setKw] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapRef = useRef(null);
  const buttonRef = useRef(null);
  const searchRef = useRef(null);
  const listRef = useRef(null);
  const itemRefs = useRef([]);

  useImperativeHandle(ref, () => ({
    focus: () => buttonRef.current?.focus(),
  }));

  const sel = options.find((o) => String(o.value) == String(value));
  const filtered = (
    kw
      ? options.filter((o) =>
          String(o.label).toLowerCase().includes(kw.toLowerCase()),
        )
      : options
  ).slice(0, 300);

  const items = [{ value: "", label: "— None —" }, ...filtered];

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (!wrapRef.current?.contains(e.target)) {
        setOpen(false);
        setKw("");
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (open && highlightedIndex >= 0) {
      itemRefs.current[highlightedIndex]?.scrollIntoView({
        block: "nearest",
      });
    }
  }, [highlightedIndex, open]);

  const close = () => {
    setOpen(false);
    setKw("");
    setHighlightedIndex(-1);
  };

  const handleSelect = (val) => {
    onChange(val);
    close();
    if (onAdvance) setTimeout(() => onAdvance(), 80);
    else setTimeout(() => buttonRef.current?.focus(), 0);
  };

  const openList = () => {
    if (options.length == 0) return;
    setOpen(true);
    setKw("");
    setHighlightedIndex(-1);
    setTimeout(() => searchRef.current?.focus(), 0);
  };

  const handleButtonKeyDown = (e) => {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      openList();
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (items.length > 0) {
        setHighlightedIndex(0);
        setTimeout(() => itemRefs.current[0]?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (items.length > 0) {
        const last = items.length - 1;
        setHighlightedIndex(last);
        setTimeout(() => itemRefs.current[last]?.focus(), 0);
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      close();
      buttonRef.current?.focus();
    } else if (e.key == "Enter" && filtered.length == 1) {
      e.preventDefault();
      handleSelect(filtered[0].value);
    } else if (e.key == "Tab") {
      close();
    }
  };

  const handleItemKeyDown = (e, item, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const next = idx + 1;
      if (next < items.length) {
        setHighlightedIndex(next);
        setTimeout(() => itemRefs.current[next]?.focus(), 0);
      } else {
        setHighlightedIndex(-1);
        setTimeout(() => searchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setHighlightedIndex(-1);
        setTimeout(() => searchRef.current?.focus(), 0);
      } else {
        const prev = idx - 1;
        setHighlightedIndex(prev);
        setTimeout(() => itemRefs.current[prev]?.focus(), 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleSelect(item.value);
    } else if (e.key == "Escape") {
      e.preventDefault();
      close();
      buttonRef.current?.focus();
    } else if (e.key == "Tab") {
      close();
    }
  };

  return (
    <div className="relative" ref={wrapRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (open ? close() : openList())}
        onKeyDown={handleButtonKeyDown}
        className={`${inputCls} text-left flex items-center justify-between pr-10`}
      >
        <span className={sel ? "text-gray-900" : "text-gray-400"}>
          {sel ? sel.label : placeholder || "Select…"}
        </span>
      </button>
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </span>
      {open && (
        <div className="absolute z-30 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-xl overflow-hidden">
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                value={kw}
                onChange={(e) => {
                  setKw(e.target.value);
                  setHighlightedIndex(-1);
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search..."
                className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
              {kw && (
                <button
                  type="button"
                  onClick={() => setKw("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <div ref={listRef} className="overflow-y-auto max-h-52">
            {items.length > 0 ? (
              items.map((o, idx) => {
                const isSel = String(o.value) == String(value) && o.value !=  "";
                const isNone = o.value == "";
                return (
                  <button
                    key={`${o.value}-${idx}`}
                    ref={(el) => {
                      itemRefs.current[idx] = el;
                    }}
                    type="button"
                    tabIndex={0}
                    onClick={() => handleSelect(o.value)}
                    onKeyDown={(e) => handleItemKeyDown(e, o, idx)}
                    className={`w-full px-4 py-2.5 text-left text-sm border-b border-gray-100 transition-colors focus:outline-none focus:bg-blue-50 ${
                      highlightedIndex == idx
                        ? "bg-blue-100"
                        : isSel
                          ? "bg-blue-50"
                          : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={
                          isNone
                            ? "text-gray-400"
                            : isSel
                              ? "text-blue-600 font-medium"
                              : "text-gray-900"
                        }
                      >
                        {o.label}
                      </span>
                      {isSel && <Check className="h-4 w-4 text-blue-600 shrink-0" />}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-6 text-center text-sm text-gray-500">
                No results found
              </div>
            )}
          </div>
          <div className="border-t border-gray-200 px-3 py-1.5 bg-gray-50">
            <span className="text-xs text-gray-400">{filtered.length} items</span>
          </div>
        </div>
      )}
    </div>
  );
});

const EntityManager = ({
  title,
  subtitle,
  endpoint,
  idKey,
  columns = [],
  fields = [],
  actions = [],
  toolbar = [],
  lockField = null,
  lockValues = [],
}) => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [panel, setPanel] = useState(null);
  const [saving, setSaving] = useState(false);
  const [lookups, setLookups] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const fieldRefs = useRef({});
  const saveRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API}/${endpoint}`, auth());
      setRows(extractArray(res.data));
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load records");
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const lk = fields.filter((f) => f.type == "lookup" && f.endpoint);
    lk.forEach(async (f) => {
      try {
        const res = await axios.get(`${API}/${f.endpoint}`, auth());
        const arr = extractArray(res.data)
          .map((o) => ({
            value: o[f.optionValue || "value"] ?? o.value ?? o.id,
            label: o[f.optionLabel || "label"] ?? o.label ?? o.name,
          }))
          .filter((o) => o.value != undefined && o.value != null);
        setLookups((p) => ({ ...p, [f.key]: arr }));
      } catch {
        setLookups((p) => ({ ...p, [f.key]: [] }));
      }
    });
  }, [endpoint]); // eslint-disable-line

  const isLocked = (row) =>
    lockField && lockValues.includes(String(row[lockField]));

  const displayValue = (key, row, type) => {
    const f = fields.find((x) => x.key == key);
    if (type == "status") {
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_TONE[row[key]] || "bg-gray-100 text-gray-700"}`}
        >
          {row[key] || "—"}
        </span>
      );
    }
    if (type == "file" || f?.type == "file") {
      return row[key] ? (
        <a
          href={row[key]}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 text-sm"
        >
          View <ExternalLink className="h-3.5 w-3.5" />
        </a>
      ) : (
        <span className="text-gray-400 italic text-xs">—</span>
      );
    }
    if (f?.type == "lookup") {
      const opt = (lookups[f.key] || []).find(
        (o) => String(o.value) == String(row[key]),
      );
      return opt?.label || fmt(row[key], type);
    }
    if (f?.type == "select") {
      const opt = (f.options || []).find(
        (o) => String(o.v ?? o) == String(row[key]),
      );
      return opt ? (opt.l ?? opt) : fmt(row[key], type);
    }
    if (type == "bool" || f?.type == "bool") {
      const yes = row[key] == 1 || row[key] == true;
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${yes ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"}`}
        >
          {yes ? "Yes" : "No"}
        </span>
      );
    }
    const raw = fmt(row[key], type);
    if (/code|_no$/i.test(key) && raw != "—") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 font-mono">
          {raw}
        </span>
      );
    }
    return raw;
  };

  const plainText = (key, row, type) => {
    const f = fields.find((x) => x.key == key);
    if (f?.type == "lookup") {
      const opt = (lookups[f.key] || []).find(
        (o) => String(o.value) == String(row[key]),
      );
      return opt?.label || fmt(row[key], type);
    }
    if (f?.type == "select") {
      const opt = (f.options || []).find(
        (o) => String(o.v ?? o) == String(row[key]),
      );
      return opt ? String(opt.l ?? opt) : fmt(row[key], type);
    }
    return String(fmt(row[key], type));
  };

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return rows;
    const q = searchTerm.toLowerCase();
    return rows.filter((r) =>
      columns.some((c) =>
        plainText(c.key, r, c.type).toLowerCase().includes(q),
      ),
    );
  }, [rows, searchTerm, columns, lookups, fields]); // eslint-disable-line

  const lastPage = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const page = Math.min(currentPage, lastPage);
  const pageRows = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const from = filtered.length == 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const to = Math.min(page * PER_PAGE, filtered.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const openCreate = () => {
    const d = {};
    fields.forEach(
      (f) =>
        (d[f.key] =
          f.default != undefined ? f.default : f.type == "bool" ? false : ""),
    );
    setPanel({ mode: "create", data: d });
  };
  const openEdit = (row) => setPanel({ mode: "edit", data: { ...row } });
  const openView = (row) => setPanel({ mode: "view", data: { ...row } });
  const closePanel = () => setPanel(null);

  const save = async () => {
    for (const f of fields)
      if (f.required && !panel.data[f.key] && panel.data[f.key] != 0) {
        toast.error(`${f.label} is required`);
        return;
      }
    setSaving(true);
    try {
      if (panel.mode == "create")
        await axios.post(`${API}/${endpoint}`, panel.data, auth());
      else
        await axios.put(
          `${API}/${endpoint}/${panel.data[idKey]}`,
          panel.data,
          auth(),
        );
      toast.success("Saved successfully");
      setPanel(null);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    const name =
      plainText(columns[0]?.key, row, columns[0]?.type) || "this record";
    const result = await Swal.fire({
      title: `Delete ${title}?`,
      text: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;
    try {
      await axios.delete(`${API}/${endpoint}/${row[idKey]}`, auth());
      toast.success(`"${name}" deleted successfully!`);
      setPanel(null);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to delete");
    }
  };

  const doAction = async (row, a) => {
    try {
      if (a.path) {
        await axios.post(
          `${API}/${endpoint}/${row[idKey]}/${a.path}`,
          a.body || {},
          auth(),
        );
        toast.success(a.done || "Done");
      } else {
        const remarks =
          window.prompt(`Remarks for "${a.label}" (optional):`, "") ?? "";
        await axios.post(
          `${API}/${endpoint}/${row[idKey]}/action`,
          { action: a.action, remarks, Officer_Remarks: remarks },
          auth(),
        );
        toast.success("Status updated");
      }
      const res = await axios.get(`${API}/${endpoint}`, auth());
      const next = extractArray(res.data);
      setRows(next);
      if (panel?.mode == "view") {
        const updated = next.find((r) => r[idKey] == row[idKey]);
        if (updated) setPanel({ mode: "view", data: { ...updated } });
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Action failed");
    }
  };

  const runToolbar = async (t) => {
    try {
      await t.onClick(load);
    } catch (e) {
      toast.error(e.response?.data?.message || "Action failed");
    }
  };

  const setVal = (key, val) =>
    setPanel((m) => ({ ...m, data: { ...m.data, [key]: val } }));

  const focusableFields = () =>
    fields.filter((f) => !(f.readOnlyOnEdit && panel?.mode == "edit"));

  const focusNext = (currentKey) => {
    const list = focusableFields();
    const idx = list.findIndex((f) => f.key == currentKey);
    const next = idx >= 0 ? list[idx + 1] : null;
    setTimeout(() => {
      if (next) fieldRefs.current[next.key]?.focus?.();
      else saveRef.current?.focus?.();
    }, 50);
  };

  const handleEnterNext = (e, key) => {
    if (e.key != "Enter") return;
    if (e.shiftKey) return;
    e.preventDefault();
    focusNext(key);
  };

  useEffect(() => {
    if (panel?.mode != "create" && panel?.mode != "edit") return;
    const first = focusableFields()[0];
    const t = setTimeout(() => fieldRefs.current[first?.key]?.focus?.(), 100);
    return () => clearTimeout(t);
  }, [panel?.mode]); // eslint-disable-line

  const setFieldRef = (key) => (el) => {
    fieldRefs.current[key] = el;
  };

  const field = (f) => {
    const v = panel.data[f.key] ?? "";
    if (f.type == "select" || f.type == "lookup") {
      const options =
        f.type == "lookup"
          ? lookups[f.key] || []
          : (f.options || []).map((o) => ({
              value: o.v ?? o,
              label: o.l ?? o,
            }));
      return (
        <SearchSelect
          ref={setFieldRef(f.key)}
          value={v}
          options={options}
          placeholder={
            f.type == "lookup" && !lookups[f.key] ? "Loading…" : "Select…"
          }
          onChange={(val) => setVal(f.key, val)}
          onAdvance={() => focusNext(f.key)}
        />
      );
    }
    if (f.type == "textarea")
      return (
        <textarea
          ref={setFieldRef(f.key)}
          className={inputCls}
          rows={3}
          value={v}
          onChange={(e) => setVal(f.key, e.target.value)}
          onKeyDown={(e) => handleEnterNext(e, f.key)}
        />
      );
    if (f.type == "bool")
      return (
        <label className="inline-flex items-center gap-2 text-sm mt-2">
          <input
            ref={setFieldRef(f.key)}
            type="checkbox"
            checked={!!v}
            onChange={(e) => setVal(f.key, e.target.checked)}
            onKeyDown={(e) => handleEnterNext(e, f.key)}
            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />{" "}
          Yes
        </label>
      );
    if (f.type == "file")
      return (
        <div>
          <input
            ref={setFieldRef(f.key)}
            type="file"
            accept={f.accept}
            className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const rd = new FileReader();
              rd.onload = () => setVal(f.key, rd.result);
              rd.readAsDataURL(file);
            }}
            onKeyDown={(e) => {
              if (e.key == "Enter") {
                e.preventDefault();
                focusNext(f.key);
              }
            }}
          />
          {v && (
            <p className="mt-1 text-xs text-blue-600 flex items-center gap-1">
              <Paperclip className="h-3.5 w-3.5" /> Document attached
            </p>
          )}
        </div>
      );
    if (f.readOnlyOnEdit && panel.mode == "edit")
      return (
        <input
          disabled
          className={`${inputCls} bg-gray-50 text-gray-500`}
          value={v}
        />
      );
    return (
      <input
        ref={setFieldRef(f.key)}
        type={
          f.type == "number" ? "number" : f.type == "date" ? "date" : "text"
        }
        className={inputCls}
        value={v}
        onChange={(e) => setVal(f.key, e.target.value)}
        onKeyDown={(e) => handleEnterNext(e, f.key)}
      />
    );
  };

  const renderPaginationPages = () => {
    const pages = [];
    const max = 5;
    let start = Math.max(1, page - Math.floor(max / 2));
    let end = Math.min(lastPage, start + max - 1);
    if (end - start + 1 < max) start = Math.max(1, end - max + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const listColumns = columns.filter(
    (c) =>
      c.key != idKey &&
      String(c.label).trim().toLowerCase() != "id",
  );
  const primaryCol = listColumns[0] || columns[0];
  const primaryKey = primaryCol?.key;
  const primaryLabel = (row) =>
    plainText(primaryKey, row, primaryCol?.type);

  const actionTone = (tone) =>
    tone == "danger"
      ? "bg-rose-50 text-rose-700 hover:bg-rose-100"
      : tone == "primary"
        ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
        : "bg-sky-50 text-sky-700 hover:bg-sky-100";

  /* ── View ── */
  if (panel?.mode == "view") {
    const row = panel.data;
    const locked = isLocked(row);
    const initial = String(primaryLabel(row) || title).charAt(0).toUpperCase();
    return (
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center">
            <button
              onClick={closePanel}
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">{initial}</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {primaryLabel(row) || title}
                </h1>
                <p className="text-gray-500 text-sm mt-0.5">{title}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3 flex-wrap gap-2">
            {!locked &&
              actions.map((a) => (
                <button
                  key={a.label}
                  onClick={() => doAction(row, a)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${actionTone(a.tone)}`}
                >
                  {a.label}
                </button>
              ))}
            {!locked && (
              <button
                onClick={() => openEdit(row)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center shadow-sm"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </button>
            )}
            {!locked && (
              <button
                onClick={() => remove(row)}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 flex items-center shadow-sm"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              {title} Details
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {fields.map((f) => (
                <div key={f.key} className={f.full ? "md:col-span-2" : ""}>
                  <label className="text-sm font-medium text-gray-500">
                    {f.label}
                  </label>
                  <div className="mt-1 text-gray-900 font-medium">
                    {displayValue(f.key, row, f.type)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Add / Edit ── */
  if (panel?.mode == "create" || panel?.mode == "edit") {
    const isEdit = panel.mode == "edit";
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={closePanel}
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEdit ? `Edit ${title}` : `Add ${title}`}
              </h1>
              <p className="text-gray-600 mt-1">
                {isEdit
                  ? "Update the record details"
                  : "Fill in the details to create a new record"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              {title} Details
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {fields.map((f) => (
                <div key={f.key} className={f.full ? "md:col-span-2" : ""}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {f.label}
                    {f.required && <span className="text-red-500"> *</span>}
                  </label>
                  {field(f)}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={closePanel}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            ref={saveRef}
            type="button"
            onClick={save}
            onKeyDown={(e) => {
              if (e.key == "Enter") {
                e.preventDefault();
                save();
              }
            }}
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center disabled:opacity-50 transition-all shadow-sm"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEdit ? `Update ${title}` : `Save ${title}`}
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  /* ── List ── */
  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowRight className="h-5 w-5 rotate-180" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-gray-500 text-sm mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {toolbar.map((t) => (
            <button
              key={t.label}
              onClick={() => runToolbar(t)}
              className={
                t.tone == "neutral"
                  ? "px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700"
                  : "px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium text-sm shadow-sm"
              }
            >
              {t.label}
            </button>
          ))}
          <button
            onClick={openCreate}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add {title}
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            )}
          </div>
          <button
            onClick={load}
            className="group px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center transition-all duration-200"
          >
            <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                {listColumns.map((c) => (
                  <th
                    key={c.key}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap"
                  >
                    {c.label}
                  </th>
                ))}
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={listColumns.length + 1}
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                      <p className="mt-4 text-gray-600">Loading...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={listColumns.length + 1}
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <AlertCircle className="h-8 w-8 mb-2 text-gray-400" />
                      {error}
                    </div>
                  </td>
                </tr>
              ) : pageRows.length > 0 ? (
                pageRows.map((r, i) => {
                  const locked = isLocked(r);
                  const initial = String(primaryLabel(r) || "?").charAt(0).toUpperCase();
                  return (
                    <tr
                      key={r[idKey] || i}
                      className="hover:bg-gray-50 transition-colors duration-150 group cursor-pointer"
                      onClick={() => openView(r)}
                    >
                      {listColumns.map((c, ci) => (
                        <td key={c.key} className="px-6 py-4 whitespace-nowrap">
                          {ci == 0 ? (
                            <div className="flex items-center">
                              <div className="h-9 w-9 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm mr-3 shrink-0">
                                <span className="text-white font-semibold text-sm">
                                  {initial}
                                </span>
                              </div>
                              <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                                {displayValue(c.key, r, c.type)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-800">
                              {displayValue(c.key, r, c.type)}
                            </span>
                          )}
                        </td>
                      ))}
                      <td
                        className="px-6 py-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center space-x-1">
                          {!locked &&
                            actions.map((a) => (
                              <button
                                key={a.label}
                                onClick={() => doAction(r, a)}
                                title={a.label}
                                className={`px-2 py-1 rounded text-xs font-medium ${actionTone(a.tone)}`}
                              >
                                {a.label}
                              </button>
                            ))}
                          <button
                            onClick={() => openView(r)}
                            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {!locked && (
                            <button
                              onClick={() => openEdit(r)}
                              className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}
                          {!locked && (
                            <button
                              onClick={() => remove(r)}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                          {locked && (
                            <span className="p-2 text-gray-400" title="Locked">
                              <Lock className="h-4 w-4" />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={listColumns.length + 1}
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <FileText className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchTerm
                          ? "No matching records found"
                          : "No records found"}
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {searchTerm
                          ? "Try adjusting your search"
                          : "Get started by adding the first entry"}
                      </p>
                      {!searchTerm && (
                        <button
                          onClick={openCreate}
                          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add {title}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {lastPage > 1 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-4">
          <div className="text-sm text-gray-700">
            Showing {from} to {to} of {filtered.length} entries
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={page == 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </button>
            {renderPaginationPages().map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`px-4 py-2 rounded-lg transition-colors ${page == p ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm" : "bg-white border border-gray-300 hover:bg-gray-50"}`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(lastPage, p + 1))}
              disabled={page == lastPage}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntityManager;

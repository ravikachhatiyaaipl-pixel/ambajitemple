/***
 *
 *  Application Name: I3EMS - AMT ERP
 *
 *  Component: ReportShell  (Standardized Temple Report Wrapper)
 *
 *  Purpose:
 *    A single, reusable, government/audit-grade report shell so EVERY report in the
 *    system renders with the same standard header, filter bar, data table
 *    (with sub-totals + grand total), signature block, and Print / Excel / PDF export.
 *
 *    New reports become DECLARATIVE: a page supplies a `columns` spec + `rows` + `totals`
 *    and this shell renders the standardized output. This keeps the whole system
 *    consistent and makes adding reports fast.
 *
 *  Conventions matched from existing pages:
 *    - Dynamic page title from localStorage "menu_details" (matched on Menu_Links)
 *    - Print via existing <PrintLayout/> component and useOrganization()
 *    - Excel export via xlsx (SheetJS)
 *    - Indian currency formatting (en-IN, ₹, 2 decimals)
 *    - Tailwind styling identical to existing reports (emerald header, zebra rows)
 *
 *  Developed for: Ambaji Temple (AMT)
 *
 */

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  FiChevronLeft,
  FiAlertCircle,
  FiPrinter,
  FiCheck,
  FiX,
} from "react-icons/fi";
import { RiFileExcel2Line, RiFilePdf2Line } from "react-icons/ri";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import PrintLayout from "../printlayout";

/* ------------------------------------------------------------------ *
 * Formatting helpers (shared, so every report formats identically)
 * ------------------------------------------------------------------ */
export const formatAmount = (amount) => {
  if (amount ==  undefined || amount ==  null || isNaN(amount)) return "₹ 0.00";
  const num = parseFloat(amount);
  if (isNaN(num)) return "₹ 0.00";
  return `₹ ${num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatNumber = (n) => {
  if (n ==  undefined || n ==  null || isNaN(n)) return "0";
  return parseFloat(n).toLocaleString("en-IN");
};

export const formatPercentage = (p) => {
  if (p ==  undefined || p ==  null || isNaN(p)) return "0.00%";
  return `${parseFloat(p).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
};

export const formatDate = (d) => {
  if (!d) return "";
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    return dt.toLocaleDateString("en-GB"); // dd/mm/yyyy
  } catch {
    return d;
  }
};

const renderCell = (row, col) => {
  const raw = col.accessor ? col.accessor(row) : row[col.key];
  switch (col.type) {
    case "amount":
      return formatAmount(raw);
    case "number":
      return formatNumber(raw);
    case "percent":
      return formatPercentage(raw);
    case "date":
      return formatDate(raw);
    default:
      return raw ?? "";
  }
};

const alignClass = (col) =>
  col.align ==  "right" || ["amount", "number", "percent"].includes(col.type)
    ? "text-right"
    : col.align ==  "center"
      ? "text-center"
      : "text-left";

const isNumericCol = (col) =>
  ["amount", "number", "percent"].includes(col.type);

/* ------------------------------------------------------------------ *
 * ReportShell
 *
 * Props:
 *   menuLink        string   route path used to look up dynamic title
 *   defaultTitle    string   fallback title
 *   organization    object   from useOrganization() (passed by page)
 *   financialYear   object   { name } (optional, shown in header)
 *   generatedBy     string   user name (optional)
 *   columns         [{ key, label, type, align, accessor, subtotal }]
 *   rows            array
 *   totals          object   grand-total row values keyed by column key (optional)
 *   groupBy         { key, label }  optional grouping with sub-totals
 *   loading         bool
 *   error           string
 *   hasGenerated    bool
 *   onGenerate      fn
 *   onClear         fn
 *   filters         ReactNode   the filter inputs (rendered inside the filter bar)
 *   reportCode      string   optional code shown in header
 *   signatures      [string] optional signature labels (default 3)
 *   excelFileName   string
 *   printOrientation 'landscape' | 'portrait'
 * ------------------------------------------------------------------ */
const ReportShell = ({
  menuLink,
  defaultTitle = "Report",
  organization,
  financialYear,
  generatedBy,
  columns = [],
  rows = [],
  totals = null,
  groupBy = null,
  loading = false,
  error = "",
  hasGenerated = false,
  onGenerate,
  onClear,
  filters = null,
  reportCode = "",
  signatures = ["Prepared By", "Checked By", "Approved By"],
  excelFileName = "Report",
  printOrientation = "landscape",
  backTo = "/dashboard",
}) => {
  const [pageTitle, setPageTitle] = useState(defaultTitle);
  const [showPrint, setShowPrint] = useState(false);
  const [orientation, setOrientation] = useState(printOrientation);

  // Dynamic title from menu_details (same lookup as existing reports)
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const item = menuDetails.find((m) => m.Menu_Links ==  menuLink);
      if (item && item.Fnc_Title) setPageTitle(item.Fnc_Title);
    } catch (e) {
      console.error("menu_details parse error", e);
    }
  }, [menuLink]);

  const hasData = rows && rows.length > 0;

  // Build grouped structure for sub-totals if groupBy provided
  const groups = useMemo(() => {
    if (!groupBy || !hasData) return null;
    const map = new Map();
    rows.forEach((r) => {
      const g = r[groupBy.key] ?? "—";
      if (!map.has(g)) map.set(g, []);
      map.get(g).push(r);
    });
    return Array.from(map.entries()).map(([g, items]) => {
      const sub = {};
      columns.forEach((c) => {
        if (isNumericCol(c) && c.subtotal !=  false) {
          sub[c.key] = items.reduce(
            (a, x) => a + (parseFloat(x[c.key]) || 0),
            0,
          );
        }
      });
      return { group: g, items, subtotal: sub };
    });
  }, [groupBy, rows, columns, hasData]);

  /* ----------------------------- Excel ---------------------------- */
  const handleExcel = () => {
    const out = rows.map((r) => {
      const o = {};
      columns.forEach((c) => {
        o[c.label] = c.accessor ? c.accessor(r) : r[c.key];
      });
      return o;
    });
    if (totals) {
      const t = {};
      columns.forEach((c, i) => {
        t[c.label] = i ==  0 ? "GRAND TOTAL" : (totals[c.key] ?? "");
      });
      out.push(t);
    }
    const ws = XLSX.utils.json_to_sheet(out);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `${excelFileName}.xlsx`);
  };

  /* ------------------------------ PDF ----------------------------- *
   * Uses browser print-to-PDF of the standardized print layout — no
   * extra dependency. The PrintLayout already provides print controls;
   * "PDF" simply opens the print dialog where the user chooses "Save as PDF".
   * ---------------------------------------------------------------- */
  const handlePdf = () => {
    setOrientation("portrait");
    setShowPrint(true);
    setTimeout(() => window.print(), 400);
  };

  /* --------------------------- Print body ------------------------- */
  const PrintBody = () => {
    const styles = {
      page: { fontFamily: "Arial, sans-serif", padding: "16px", fontSize: "12px" },
      metaRow: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: "11px",
        color: "#444",
        margin: "6px 0 10px",
      },
      table: { width: "100%", borderCollapse: "collapse", fontSize: "11px" },
      th: {
        backgroundColor: "#ecfdf5",
        color: "#047857",
        border: "1px solid #d1fae5",
        padding: "6px 8px",
        fontWeight: 600,
      },
      td: { border: "1px solid #e5e7eb", padding: "5px 8px" },
      totalRow: { backgroundColor: "#fdf2f8", fontWeight: 700, color: "#be123c" },
      sign: {
        display: "flex",
        justifyContent: "space-between",
        marginTop: "48px",
        fontSize: "12px",
      },
    };
    return (
      <div style={styles.page}>
        <div style={styles.metaRow}>
          <div>
            {financialYear?.name ? `Financial Year: ${financialYear.name}` : ""}
          </div>
          <div>
            {reportCode ? `Report Code: ${reportCode} | ` : ""}
            Generated: {formatDate(new Date())}{" "}
            {generatedBy ? `| By: ${generatedBy}` : ""}
          </div>
        </div>
        <table style={styles.table}>
          <thead>
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  style={{
                    ...styles.th,
                    textAlign: isNumericCol(c) ? "right" : c.align || "left",
                  }}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                {columns.map((c) => (
                  <td
                    key={c.key}
                    style={{
                      ...styles.td,
                      textAlign: isNumericCol(c) ? "right" : c.align || "left",
                    }}
                  >
                    {renderCell(r, c)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {totals && (
            <tfoot>
              <tr style={styles.totalRow}>
                {columns.map((c, i) => (
                  <td
                    key={c.key}
                    style={{
                      ...styles.td,
                      textAlign: isNumericCol(c) ? "right" : "left",
                      fontWeight: 700,
                    }}
                  >
                    {i ==  0
                      ? "GRAND TOTAL"
                      : isNumericCol(c)
                        ? renderCell(totals, c)
                        : ""}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
        <div style={styles.sign}>
          {signatures.map((s) => (
            <div key={s} style={{ textAlign: "center" }}>
              <div style={{ borderTop: "1px solid #333", paddingTop: "4px", minWidth: "150px" }}>
                {s}
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "16px", fontSize: "10px", color: "#888", textAlign: "center" }}>
          This is a computer-generated report.
        </div>
      </div>
    );
  };

  /* ---------------------------- Screen table ---------------------- */
  const HeaderRow = () => (
    <thead className="bg-emerald-50 sticky top-0 z-10">
      <tr>
        {columns.map((c) => (
          <th
            key={c.key}
            className={`px-4 py-3 ${alignClass(c)} text-xs font-medium text-emerald-700 uppercase tracking-wider whitespace-nowrap`}
          >
            {c.label}
          </th>
        ))}
      </tr>
    </thead>
  );

  const DataRow = ({ r, idx }) => (
    <tr className={`${idx % 2 ==  0 ? "bg-white" : "bg-gray-50"} hover:bg-sky-50 transition-colors`}>
      {columns.map((c) => (
        <td
          key={c.key}
          className={`px-4 py-3 text-sm ${alignClass(c)} ${isNumericCol(c) ? "font-mono" : ""} text-gray-900 whitespace-nowrap`}
        >
          {renderCell(r, c)}
        </td>
      ))}
    </tr>
  );

  const SubtotalRow = ({ label, sub }) => (
    <tr className="bg-emerald-50/60 font-semibold">
      {columns.map((c, i) => (
        <td
          key={c.key}
          className={`px-4 py-2 text-sm ${alignClass(c)} ${isNumericCol(c) ? "font-mono" : ""} text-emerald-800`}
        >
          {i ==  0
            ? `Sub-total: ${label}`
            : isNumericCol(c) && sub[c.key] !=  undefined
              ? renderCell(sub, c)
              : ""}
        </td>
      ))}
    </tr>
  );

  const TableView = () => (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <HeaderRow />
        <tbody className="bg-white divide-y divide-gray-200">
          {groups
            ? groups.map((grp, gi) => (
                <React.Fragment key={gi}>
                  {grp.items.map((r, idx) => (
                    <DataRow key={idx} r={r} idx={idx} />
                  ))}
                  <SubtotalRow label={grp.group} sub={grp.subtotal} />
                </React.Fragment>
              ))
            : rows.map((r, idx) => <DataRow key={idx} r={r} idx={idx} />)}
        </tbody>
        {totals && (
          <tfoot className="bg-pink-50">
            <tr>
              {columns.map((c, i) => (
                <td
                  key={c.key}
                  className={`px-4 py-3 text-sm font-semibold ${alignClass(c)} ${isNumericCol(c) ? "font-mono" : ""} text-rose-700`}
                >
                  {i ==  0
                    ? "GRAND TOTAL"
                    : isNumericCol(c)
                      ? renderCell(totals, c)
                      : ""}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 overflow-hidden">
      {showPrint && (
        <PrintLayout
          title={pageTitle}
          showControls={true}
          onClose={() => setShowPrint(false)}
          organizationData={organization}
          orientation={orientation}
          onOrientationChange={setOrientation}
        >
          <PrintBody />
        </PrintLayout>
      )}

      <div className="px-2 py-6 max-w-full">
        {/* Toolbar */}
        <div className="flex justify-between items-center mb-6">
          <Link to={backTo}>
            <button className="flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
              <FiChevronLeft className="mr-1" /> Back to Dashboard
            </button>
          </Link>
          <div className="flex space-x-2">
            <button
              onClick={handleExcel}
              disabled={!hasData || loading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center transition-colors disabled:opacity-60"
              title="Export to Excel"
            >
              <RiFileExcel2Line className="h-4 w-4 mr-2" /> Excel
            </button>
            <button
              onClick={handlePdf}
              disabled={!hasData || loading}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg flex items-center transition-colors disabled:opacity-60"
              title="Save as PDF"
            >
              <RiFilePdf2Line className="h-4 w-4 mr-2" /> PDF
            </button>
            <button
              onClick={() => {
                setOrientation(printOrientation);
                setShowPrint(true);
              }}
              disabled={!hasData || loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center transition-colors disabled:opacity-60"
              title="Print Report"
            >
              <FiPrinter className="h-4 w-4 mr-2" /> Print
            </button>
          </div>
        </div>

        {/* Main card */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          {/* Standardized header band */}
          <div className="mb-4 border-b border-gray-200 pb-3 text-center">
            {organization?.Org_Name_Guj && (
              <div className="text-base font-semibold text-gray-800">
                {organization.Org_Name_Guj}
              </div>
            )}
            <div className="text-lg font-bold text-gray-900">
              {organization?.Org_Name || organization?.name || "Ambaji Mata Temple"}
            </div>
            <h2 className="text-xl font-semibold text-emerald-700 mt-1">
              {pageTitle}
            </h2>
            <div className="flex justify-center gap-6 text-xs text-gray-500 mt-1">
              {financialYear?.name && <span>Financial Year: {financialYear.name}</span>}
              {reportCode && <span>Report Code: {reportCode}</span>}
              <span>Generated: {formatDate(new Date())}</span>
            </div>
          </div>

          {/* Filter bar */}
          {filters && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {filters}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={onGenerate}
                    disabled={loading}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center disabled:opacity-60 transition-colors"
                  >
                    <FiCheck className="h-4 w-4 mr-2" /> Generate Report
                  </button>
                  {(hasGenerated || hasData) && onClear && (
                    <button
                      onClick={onClear}
                      className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center transition-colors"
                    >
                      <FiX className="h-4 w-4 mr-2" /> Clear Filter
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* States */}
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading report data...</p>
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <FiAlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">{error}</p>
            </div>
          )}

          {!loading && !error && !hasData && (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <FiAlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {hasGenerated ? "No data found" : "Generate report to view results"}
              </h3>
              <p className="text-gray-600">
                {hasGenerated
                  ? "No records match the selected filters."
                  : "Select filters, then click Generate Report."}
              </p>
            </div>
          )}

          {!loading && !error && hasData && <TableView />}

          {/* On-screen signature block */}
          {!loading && hasData && (
            <div className="flex justify-between mt-12 px-6">
              {signatures.map((s) => (
                <div key={s} className="text-center text-sm text-gray-600">
                  <div className="border-t border-gray-400 pt-1 min-w-[140px]">{s}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportShell;

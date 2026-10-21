import React, { useState, useEffect, useRef } from "react";
import {
  FiChevronLeft,
  FiAlertCircle,
  FiPrinter,
  FiCheck,
  FiX,
  FiSearch,
  FiChevronDown,
} from "react-icons/fi";
import { RiFileExcel2Line } from "react-icons/ri";
import axios from "axios";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";
import PrintLayout from "../../../components/printlayout";
import { useOrganization } from "../../../hooks/useorganization";

const DED_COLS = [
  {
    key: "HRR_PTAREC",
    label: "HBR\nPTAREC",
    code: "(9550)\n(9560)",
    firstLineKey: "HRR",
    secondLineKey: "PTAREC",
  },
  {
    key: "LIC_PLI",
    label: "L.I.C\nP.L.I",
    code: "",
    firstLineKey: "LIC",
    secondLineKey: "PLI",
  },
  {
    key: "PTAX_JEEPRENT",
    label: "PTAX\nJEEPRENT",
    code: "(9570)\n(9780)",
    firstLineKey: "PTAX",
    secondLineKey: "JEEPENT",
  },
  {
    key: "GISF_JEEPRENT",
    label: "GISF\nJEEPRENT",
    code: "(9581)\n(9583)",
    firstLineKey: "GISF",
    secondLineKey: "JEEPENT",
  },
  {
    key: "GISV_IASSAVE",
    label: "GISV\nIAS.SAVE",
    code: "(9582)\n(9584)",
    firstLineKey: "GISV",
    secondLineKey: "IAS_SAVE",
  },
  {
    key: "GPF_IASINJ",
    label: "GPF\nIAS.INJ",
    code: "(9531/32/33)\n(9620/70)",
    firstLineKey: "GPF",
    secondLineKey: "IAS_INU",
  },
  {
    key: "GPFDA_NPSCPF",
    label: "GPF-DA\nN.P.S/C.P.F",
    code: "(9680)\n(9534/9690)",
    firstLineKey: "GPF_DA",
    secondLineKey: "NPS_CPF",
  },
  {
    key: "MCA_ADV_MCAINT",
    label: "MCA.ADV\nMCA.INT",
    code: "(9680)\n(9592)",
    firstLineKey: "MCA_ADV",
    secondLineKey: "MEDI_INT",
  },
  {
    key: "HBA_ADV_HBAINT",
    label: "H.B.A.ADV\nH.B.A.INT",
    code: "(9591)\n(9591)",
    firstLineKey: "HBA_ADV",
    secondLineKey: "HBA_INT",
  },
  {
    key: "MEDI_ADV_MEDIINT",
    label: "MEDI.ADV\nMEDI.INT",
    code: "(9720)\n(9760)",
    firstLineKey: "MEDI_ADV",
    secondLineKey: "MEDI_INT",
  },
  {
    key: "LIC_ECB",
    label: "Lic\nEcb",
    code: "",
    firstLineKey: "Lic",
    secondLineKey: "Misrec",
  },
  {
    key: "SBI_KARMACHARI",
    label: "Sbib\nKarmachari",
    code: "",
    firstLineKey: "Syndib",
    secondLineKey: "Karmachari",
  },
  {
    key: "DEDUCT_NET",
    label: "DEDUCT\nNET",
    code: "",
    firstLineKey: "DEDUCT",
    secondLineKey: "NET",
  },
];

const NUM_KEYS = [
  "HRR",
  "PTAX",
  "PLI",
  "JEEPENT",
  "IAS_SAVE",
  "GPF",
  "NPS_CPF",
  "MCA_ADV",
  "HBA_ADV",
  "MEDI_ADV",
  "MEDI_INT",
  "Lic",
  "Karmachari",
  "DEDUCT",
  "NET",
  "GPF_DA",
  "PTAREC",
  "GISF",
  "GISV",
  "Misrec",
  "Syndib",
  "IAS_INU",
  "LIC",
  "HBA_INT",
];
const fmt = (v) =>
  !v || Number(v) == 0 ? "0" : Number(v).toLocaleString("en-IN");
const PAGE_SIZE = 10;

const toWords = (n) => {
  const a = [
    "",
    "ONE",
    "TWO",
    "THREE",
    "FOUR",
    "FIVE",
    "SIX",
    "SEVEN",
    "EIGHT",
    "NINE",
    "TEN",
    "ELEVEN",
    "TWELVE",
    "THIRTEEN",
    "FOURTEEN",
    "FIFTEEN",
    "SIXTEEN",
    "SEVENTEEN",
    "EIGHTEEN",
    "NINETEEN",
  ];
  const b = [
    "",
    "",
    "TWENTY",
    "THIRTY",
    "FORTY",
    "FIFTY",
    "SIXTY",
    "SEVENTY",
    "EIGHTY",
    "NINETY",
  ];
  const conv = (num) => {
    if (!num) return "";
    if (num < 20) return a[num] + " ";
    if (num < 100)
      return (
        b[Math.floor(num / 10)] + (num % 10 ? " " + a[num % 10] : "") + " "
      );
    if (num < 1000)
      return a[Math.floor(num / 100)] + " HUNDRED " + conv(num % 100);
    if (num < 100000)
      return conv(Math.floor(num / 1000)) + "THOUSAND " + conv(num % 1000);
    if (num < 10000000)
      return conv(Math.floor(num / 100000)) + "LAC " + conv(num % 100000);
    return conv(Math.floor(num / 10000000)) + "CRORE " + conv(num % 10000000);
  };
  return (conv(Math.abs(Math.round(n))).trim() || "ZERO") + " ONLY";
};

const todayStr = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const SearchableDropdown = ({
  label,
  value,
  onChange,
  options,
  placeholder,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);
  const searchRef = useRef(null);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase()),
  );
  const selected = options.find((o) => o.value == value);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open && searchRef.current)
      setTimeout(() => searchRef.current.focus(), 0);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-left flex justify-between items-center"
      >
        <span className={selected ? "text-gray-900" : "text-gray-500"}>
          {selected ? selected.label : placeholder}
        </span>
        <FiChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
      </button>
      {open && (
        <div
          className="absolute z-50 top-full mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg"
          style={{ minWidth: "220px" }}
        >
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-56">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
                setSearch("");
              }}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${!value ? "bg-blue-50 text-blue-600" : "text-gray-500"}`}
            >
              {placeholder}
            </button>
            {filtered.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                  setSearch("");
                }}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 border-t border-gray-100 ${value == o.value ? "bg-blue-50 text-blue-600" : "text-gray-700"}`}
              >
                {o.label}
              </button>
            ))}
            {filtered.length == 0 && (
              <div className="px-4 py-4 text-center text-sm text-gray-400">
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const SalaryDeduction = () => {
  const { organization } = useOrganization();

  const [allRows, setAllRows] = useState([]);
  const [billNameList, setBillNameList] = useState([]);
  const [deptList, setDeptList] = useState([]);
  const [empList, setEmpList] = useState([]);

  const [selMonth, setSelMonth] = useState(String(new Date().getMonth() + 1));
  const [selYear, setSelYear] = useState(String(new Date().getFullYear()));
  const [selBillNo, setSelBillNo] = useState("");
  const [selDept, setSelDept] = useState("");
  const [selEmp, setSelEmp] = useState("");

  const [data, setData] = useState([]);
  const [allDataForPrint, setAllDataForPrint] = useState([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalApiPages, setTotalApiPages] = useState(1);
  const [apiTotals, setApiTotals] = useState({});
  const [grandTotals, setGrandTotals] = useState({});
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("landscape");

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/all/payroll/deductions?report_month=${selMonth}&report_year=${selYear}`,
        { 
        headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}` 
        }
        }
      )
      .then((res) => {
        if (!res.data?.success) return;
        const rows = res.data.data || [];
        setAllRows(rows);
        const seenBills = new Map();
        rows.forEach((r) => {
          if (r.PBillNo && !seenBills.has(r.PBillNo))
            seenBills.set(r.PBillNo, r.PayBill_Name || r.PBillNo);
        });
        const sortedBills = [...seenBills.entries()]
          .sort((a, b) => Number(a[0]) - Number(b[0]))
          .map(([no, name]) => ({
            value: String(no),
            label: `${no} – ${name}`,
          }));
        setBillNameList(sortedBills);
        const depts = [
          ...new Map(rows.map((r) => [r.Dpt_Name, r.Dpt_Name])).values(),
        ].filter((d) => d);
        setDeptList(depts);
        const empMap = new Map();
        rows.forEach((r) => {
          const name = r.First_Name || "";
          const code = r.Emp_Code || "";
          if (name && !empMap.has(name)) {
            empMap.set(name, { id: name, name, code });
          }
        });
        setEmpList([...empMap.values()]);
      })
      .catch(() => {});
  }, [selMonth, selYear]);

  const allFilteredRef = React.useRef([]);

  const normalizeRow = (r, srno) => ({
    ...r,
    srno,
    HRR: Number(r.HRR) || 0,
    LIC: Number(r.LIC) || 0,
    PTAX: Number(r.PTAX) || 0,
    PLI: Number(r.PLI) || 0,
    JEEPENT: Number(r.JEEPENT) || 0,
    IAS_INU: Number(r.IAS_INU) || 0,
    IAS_SAVE: Number(r.IAS_SAVE) || 0,
    GPF: Number(r.GPF) || 0,
    GPF_DA: Number(r.GPF_DA) || 0,
    NPS_CPF: Number(r.NPS_CPF) || 0,
    MCA_ADV: Number(r.MCA_ADV) || 0,
    HBA_ADV: Number(r.HBA_ADV) || 0,
    MEDI_ADV: Number(r.MEDI_ADV) || 0,
    MEDI_INT: Number(r.MEDI_INT) || 0,
    Lic: Number(r.Lic) || 0,
    Misrec: Number(r.Misrec) || 0,
    Syndib: Number(r.Syndib) || 0,
    Karmachari: Number(r.Karmachari) || 0,
    DEDUCT: Number(r.DEDUCT) || 0,
    NET: Number(r.NET) || 0,
    PTAREC: 0,
    GISF: 0,
    GISV: 0,
    HBA_INT: 0,
  });

  const fetchReport = async (page = 1) => {
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const params = new URLSearchParams();
      params.append("report_month", selMonth);
      params.append("report_year", selYear);
      if (selBillNo) params.append("p_bill_no", selBillNo);
      params.append("per_page", 10000);

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/payroll/deductions?${params.toString()}`,
        { 
        headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}` 
        }
        }
      );
      if (res.data?.success) {
        let allFiltered = res.data.data || [];
        if (selDept)
          allFiltered = allFiltered.filter((r) => r.Dpt_Name == selDept);
        if (selEmp)
          allFiltered = allFiltered.filter(
            (r) => (r.First_Name || "") == selEmp,
          );

        allFilteredRef.current = allFiltered;

        setTotalRecords(allFiltered.length);
        const totalPages = Math.ceil(allFiltered.length / PAGE_SIZE) || 1;
        setTotalApiPages(totalPages);

        // Grand totals from all filtered records
        const gt = NUM_KEYS.reduce(
          (acc, k) => ({
            ...acc,
            [k]: allFiltered.reduce((s, r) => s + (Number(r[k]) || 0), 0),
          }),
          {},
        );
        setGrandTotals(gt);

        const offset = (page - 1) * PAGE_SIZE;
        const rows = allFiltered
          .slice(offset, offset + PAGE_SIZE)
          .map((r, i) => normalizeRow(r, offset + i + 1));
        setData(rows);
        if (!allFiltered.length)
          setMessage({
            text: "No records found for selected filters.",
            type: "info",
          });
      } else {
        setData([]);
        setMessage({
          text: res.data?.message || "No data available.",
          type: "info",
        });
      }
    } catch (err) {
      setData([]);
      setMessage({
        text: err.response?.data?.message || "Error loading data.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllDataForPrint = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("report_month", selMonth);
      params.append("report_year", selYear);
      if (selBillNo) params.append("p_bill_no", selBillNo);
      params.append("per_page", 10000);

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/payroll/deductions?${params.toString()}`,
        { 
        headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}` 
        }
        }
      );
      if (res.data?.success) {
        let rows = res.data.data || [];
        if (selDept) rows = rows.filter((r) => r.Dpt_Name == selDept);
        if (selEmp)
          rows = rows.filter((r) => (r.First_Name || "") == selEmp);
        return rows.map((r, i) => normalizeRow(r, i + 1));
      }
      return [];
    } catch (err) {
      console.error("Error fetching all data for print:", err);
      setMessage({ text: "Error fetching data for printing.", type: "error" });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setHasGenerated(true);
    setCurrentPage(1);
    await fetchReport(1);
  };

  const handlePrint = () => {
    const printData = allFilteredRef.current.map((r, i) =>
      normalizeRow(r, i + 1),
    );
    if (printData.length > 0) {
      setAllDataForPrint(printData);
      setShowPrint(true);
    } else {
      setMessage({ text: "No data available for printing.", type: "info" });
    }
  };

  const handleClear = () => {
    setSelMonth(String(new Date().getMonth() + 1));
    setSelYear(String(new Date().getFullYear()));
    setSelBillNo("");
    setSelDept("");
    setSelEmp("");
    setData([]);
    setHasGenerated(false);
    setMessage({ text: "", type: "" });
    setCurrentPage(1);
    setTotalRecords(0);
    setTotalApiPages(1);
    setApiTotals({});
    setGrandTotals({});
    setAllDataForPrint([]);
    allFilteredRef.current = [];
  };

  const totals = NUM_KEYS.reduce((acc, k) => {
    let value = 0;
    if (apiTotals.cumulative && apiTotals.cumulative[k] != undefined) {
      value = Number(apiTotals.cumulative[k]);
    } else if (
      apiTotals.current_page &&
      apiTotals.current_page[k] != undefined
    ) {
      value = Number(apiTotals.current_page[k]);
    } else {
      value = data.reduce((s, r) => s + (Number(r[k]) || 0), 0);
    }
    return { ...acc, [k]: value };
  }, {});

  const handleExcel = () => {
    const rows = data.map((r) => ({
      "SR No": r.srno,
      "Emp Code": r.Emp_Code,
      "Employee Name": r.First_Name,
      Department: r.Dpt_Name,
      ...DED_COLS.reduce(
        (a, c) => ({
          ...a,
          [c.label.replace(/\n/g, " ")]: c.key2
            ? `${fmt(r[c.firstLineKey])} / ${fmt(r[c.secondLineKey])}`
            : fmt(r[c.firstLineKey] || 0),
        }),
        {},
      ),
    }));
    rows.push({
      "SR No": "TOTAL",
      "Emp Code": "",
      "Employee Name": "",
      Department: "",
      ...DED_COLS.reduce(
        (a, c) => ({
          ...a,
          [c.label.replace(/\n/g, " ")]: c.key2
            ? `${fmt(totals[c.firstLineKey] || 0)} / ${fmt(totals[c.secondLineKey] || 0)}`
            : fmt(totals[c.firstLineKey] || 0),
        }),
        {},
      ),
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DeductionSide");
    XLSX.writeFile(wb, `PayBillDeduction_BillNo${selBillNo || "all"}.xlsx`);
  };

  const pagedData = data;
  const totalPages = totalApiPages;
  const totalCols = DED_COLS.length + 2;
  const hasData = data.length > 0;

  const pageTotals = NUM_KEYS.reduce(
    (acc, k) => ({
      ...acc,
      [k]: pagedData.reduce((s, r) => s + (Number(r[k]) || 0), 0),
    }),
    {},
  );

  const orgName =
    organization?.Org_Name ||
    organization?.name ||
    "Ambaji Mata Temple, AMBAJI";

  const thS = {
    borderBottom: "2px solid #1e3a5f",
    padding: "2px 3px",
    textAlign: "right",
    fontWeight: "700",
    fontSize: "7px",
    lineHeight: "1.2",
    backgroundColor: "#1e3a5f",
    color: "#ffffff",
  };
  const tdS = { border: "none", padding: "2px 3px", fontSize: "7px" };

  const PrintContent = () => {
    const printData = allDataForPrint.length > 0 ? allDataForPrint : data;

    const printTotals = NUM_KEYS.reduce(
      (acc, k) => ({
        ...acc,
        [k]: printData.reduce((s, r) => s + (Number(r[k]) || 0), 0),
      }),
      {},
    );

    return (
      <div style={{ fontFamily: "Arial, sans-serif", fontSize: "10px" }}>
        <style>{`
                    @media print {
                        .no-print-line { display: none !important; }
                        .print-table td, .print-table tr { border: none !important; }
                        .print-container {
                            width: 100%;
                            margin: 0;
                            padding: 0;
                        }
                    }
                `}</style>
        <div className="print-container">
          <div style={{ marginBottom: "4px" }}>
            <div
              style={{
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "13px",
                marginBottom: "3px",
              }}
            >
              {orgName}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "10px",
                marginBottom: "2px",
              }}
            >
              <b>PAY BILL INNER SHEET</b>
              <b>DEDUCTION SIDE</b>
              <span>
                FOR THE MONTH OF :{" "}
                <b>___________ / COUNT = {selBillNo || "__"}</b>
              </span>
            </div>
            <div
              style={{
                fontSize: "10px",
                fontWeight: "bold",
                marginBottom: "2px",
              }}
            >
              TO BE FILLED IN BY DRAWING OFFICER.
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                fontSize: "10px",
                justifyContent: "space-between",
              }}
            >
              <span>
                1. DISTRICT :- <b>BANASKANTHA</b>
              </span>
              <span>
                2. DRAWING OFFICER :- <b>___</b>
              </span>
              <span>
                BILL NAME :-{" "}
                <b>
                  {selBillNo
                    ? billNameList.find((b) => b.value == selBillNo)?.label ||
                      selBillNo
                    : "ALL"}
                </b>
              </span>
              <span>
                TOTAL RECORDS :- <b>{printData.length}</b>
              </span>
            </div>
          </div>
          <table
            className="print-table"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "7px",
              marginTop: "3px",
            }}
          >
            <thead>
              <tr>
                <th style={{ ...thS, textAlign: "center" }}>
                  SRNo
                  <br />
                  SLONO
                  <br />
                  PSRNO
                </th>
                <th style={{ ...thS, textAlign: "left", minWidth: "110px" }}>
                  EMPLOYEE'S NAME
                </th>
                {DED_COLS.map((c) => (
                  <th key={c.key} style={thS}>
                    <div style={{ whiteSpace: "pre-line" }}>{c.label}</div>
                    {c.code && (
                      <div style={{ whiteSpace: "pre-line" }}>{c.code}</div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {printData.map((row, i) => (
                <React.Fragment key={i}>
                  <tr style={{ backgroundColor: "#e8edf2" }}>
                    <td
                      style={{
                        ...tdS,
                        textAlign: "center",
                        fontWeight: "bold",
                        color: "#1e3a5f",
                      }}
                    >
                      {row.srno}
                    </td>
                    <td
                      colSpan={DED_COLS.length + 1}
                      style={{ ...tdS, fontWeight: "bold", color: "#1e3a5f" }}
                    >
                      {row.Dpt_Name}
                    </td>
                  </tr>
                  <tr style={{ backgroundColor: "#ffffff" }}>
                    <td
                      style={{ ...tdS, textAlign: "center", color: "#374151" }}
                    >
                      1
                    </td>
                    <td style={tdS}>
                      <div style={{ color: "#111827" }}>{row.First_Name}</div>
                      <div style={{ fontSize: "6px", color: "#6b7280" }}>
                        {row.Last_Name} &nbsp;|&nbsp; {fmt(row.Actual_Basic_Pay)}
                      </div>
                    </td>
                    {DED_COLS.map((c) => (
                      <td
                        key={c.key}
                        style={{ ...tdS, textAlign: "right", color: "#1e3a5f" }}
                      >
                        {fmt(row[c.firstLineKey] || 0)}
                      </td>
                    ))}
                  </tr>
                  <tr style={{ backgroundColor: "#ffffff" }}>
                    <td
                      style={{ ...tdS, textAlign: "center", color: "#374151" }}
                    >
                      {row.Emp_Code}
                    </td>
                    <td style={{ ...tdS, color: "#6b7280" }}>
                      {row.Last_Name}
                    </td>
                    {DED_COLS.map((c) => (
                      <td
                        key={c.key}
                        style={{ ...tdS, textAlign: "right", color: "#6b7280" }}
                      >
                        {fmt(row[c.secondLineKey] || 0)}
                      </td>
                    ))}
                  </tr>
                  <tr className="no-print-line">
                    <td
                      colSpan={DED_COLS.length + 2}
                      style={{
                        padding: 0,
                        height: "1px",
                        backgroundColor: "#cbd5e1",
                        border: "none",
                      }}
                    />
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ fontWeight: "bold", backgroundColor: "#1e3a5f" }}>
                <td
                  colSpan={2}
                  style={{
                    ...tdS,
                    textAlign: "right",
                    color: "#ffffff",
                    fontWeight: "bold",
                  }}
                >
                  TOTAL
                </td>
                {DED_COLS.map((c) => (
                  <td
                    key={c.key}
                    style={{
                      ...tdS,
                      textAlign: "right",
                      color: "#ffffff",
                      fontWeight: "bold",
                    }}
                  >
                    {fmt(
                      (printTotals[c.firstLineKey] || 0) +
                        (printTotals[c.secondLineKey] || 0),
                    )}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
          <div
            style={{
              borderTop: "2px dashed #9ca3af",
              marginTop: "12px",
              paddingTop: "10px",
              fontFamily: "Arial, sans-serif",
              fontSize: "11px",
            }}
          >
            <table style={{ borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td style={{ paddingRight: "10px", fontWeight: "500" }}>
                    Rupees
                  </td>
                  <td style={{ paddingRight: "6px" }}>:</td>
                  <td style={{ paddingRight: "4px" }}>₹</td>
                  <td style={{ fontWeight: "600" }}>
                    {toWords(printTotals["DEDUCT"] || 0)}
                  </td>
                </tr>
                <tr>
                  <td style={{ paddingRight: "10px", fontWeight: "500" }}>
                    Total
                  </td>
                  <td style={{ paddingRight: "6px" }}>:</td>
                  <td style={{ paddingRight: "4px" }}>₹</td>
                  <td style={{ fontWeight: "700" }}>
                    {(printTotals["DEDUCT"] || 0).toLocaleString("en-IN")}/-
                  </td>
                </tr>
                <tr>
                  <td style={{ paddingRight: "10px", fontWeight: "500" }}>
                    Date
                  </td>
                  <td style={{ paddingRight: "6px" }}>:</td>
                  <td colSpan={2} style={{ fontWeight: "600" }}>
                    {todayStr()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {showPrint && (
        <PrintLayout
          title="Pay Bill Inner Sheet – Deduction Side"
          showControls
          onClose={() => setShowPrint(false)}
          organizationData={organization}
          orientation={printOrientation}
          onOrientationChange={setPrintOrientation}
        >
          <PrintContent />
        </PrintLayout>
      )}
      <div className="px-2 py-6 max-w-full">
        <div className="flex justify-between items-center mb-6">
          <Link to="/dashboard">
            <button className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors">
              <FiChevronLeft className="mr-1" /> Back to Dashboard
            </button>
          </Link>
          <div className="flex gap-2">
            <button
              onClick={handleExcel}
              disabled={!hasData || loading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <RiFileExcel2Line className="h-4 w-4" /> Excel
            </button>
            <button
              onClick={handlePrint}
              disabled={!hasData || loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <FiPrinter className="h-4 w-4" /> Print
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 text-center mb-5">
            Pay Bill Inner Sheet – Deduction Side
          </h2>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <select
                  value={selMonth}
                  onChange={(e) => setSelMonth(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {["January","February","March","April","May","June","July","August","September","October","November","December"].map((m, i) => (
                    <option key={i+1} value={String(i+1)}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <select
                  value={selYear}
                  onChange={(e) => setSelYear(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {Array.from({ length: 10 }, (_, i) => String(new Date().getFullYear() - 4 + i)).map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <SearchableDropdown
                  label="Bill Name"
                  value={selBillNo}
                  onChange={setSelBillNo}
                  options={billNameList}
                  placeholder="All"
                />
              </div>
              <div className="flex-1">
                <SearchableDropdown
                  label="Department"
                  value={selDept}
                  onChange={setSelDept}
                  options={deptList.map((d) => ({ value: d, label: d }))}
                  placeholder="All Departments"
                />
              </div>
              <div className="flex-1">
                <SearchableDropdown
                  label="Employee"
                  value={selEmp}
                  onChange={setSelEmp}
                  options={empList.map((e) => ({
                    value: e.id,
                    label: `${e.code} – ${e.name}`,
                  }))}
                  placeholder="All Employees"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center disabled:opacity-60 transition-colors"
                >
                  <FiCheck className="h-4 w-4 mr-2" /> Generate Report
                </button>
                {hasGenerated && (
                  <button
                    onClick={handleClear}
                    className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center transition-colors"
                  >
                    <FiX className="h-4 w-4 mr-2" /> Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading data...</p>
            </div>
          )}

          {!loading && message.text && (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <FiAlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">{message.text}</p>
            </div>
          )}

          {!loading && !hasGenerated && !message.text && (
            <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
              <FiAlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Generate report to view results
              </h3>
              <p className="text-gray-600">
                Select filters then click{" "}
                <span className="font-medium">Generate Report</span>.
              </p>
            </div>
          )}

          {!loading && hasData && (
            <>
              <div
                className="border rounded-lg p-3 mb-4 text-xs text-gray-700"
                style={{ backgroundColor: "#f0f4f8", borderColor: "#cbd5e1" }}
              >
                <div
                  className="text-center font-bold text-sm mb-1"
                  style={{ color: "#1e3a5f" }}
                >
                  {orgName}
                </div>
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="font-semibold" style={{ color: "#1e3a5f" }}>
                    PAY BILL INNER SHEET &nbsp;|&nbsp; DEDUCTION SIDE
                  </span>
                  <span style={{ color: "#374151" }}>
                    BILL NAME :{" "}
                    <span className="font-bold" style={{ color: "#1e3a5f" }}>
                      {selBillNo
                        ? billNameList.find((b) => b.value == selBillNo)
                            ?.label || selBillNo
                        : "ALL"}
                    </span>
                  </span>
                </div>
                <div
                  className="mt-1 font-semibold"
                  style={{ color: "#374151" }}
                >
                  TO BE FILLED IN BY DRAWING OFFICER.
                </div>
                <div
                  className="flex flex-wrap gap-x-6 gap-y-1 mt-1"
                  style={{ color: "#374151" }}
                >
                  <span>
                    DEPARTMENT :{" "}
                    <b style={{ color: "#1e3a5f" }}>{selDept || "ALL"}</b>
                  </span>
                  <span>
                    TOTAL RECORDS :{" "}
                    <b style={{ color: "#1e3a5f" }}>{totalRecords}</b>
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table
                  className="min-w-full text-xs"
                  style={{ borderCollapse: "collapse" }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: "#1e3a5f",
                        borderBottom: "2px solid #1e3a5f",
                      }}
                    >
                      <th
                        className="px-2 py-2 text-center font-semibold text-white whitespace-pre-line leading-tight"
                        style={{ minWidth: "50px" }}
                      >
                        {"SRNo\nSLONO\nPSRNO"}
                      </th>
                      <th
                        className="px-2 py-2 text-left font-semibold text-white"
                        style={{ minWidth: "150px" }}
                      >
                        EMPLOYEE'S NAME
                      </th>
                      {DED_COLS.map((c) => (
                        <th
                          key={c.key}
                          className="px-2 py-2 text-right font-semibold text-white whitespace-pre-line leading-tight"
                          style={{ minWidth: "70px" }}
                        >
                          <div>{c.label}</div>
                          {c.code && (
                            <div
                              className="whitespace-pre-line"
                              style={{ color: "#ffffff" }}
                            >
                              {c.code}
                            </div>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pagedData.map((row, i) => (
                      <React.Fragment key={i}>
                        <tr>
                          <td
                            className="px-2 py-1 text-center font-bold"
                            style={{ color: "#1e3a5f" }}
                          >
                            {row.srno}
                          </td>
                        </tr>
                        <tr style={{ backgroundColor: "#ffffff" }}>
                          <td
                            className="px-2 py-1 text-center text-xs"
                            style={{ color: "#374151" }}
                          >
                            1
                          </td>
                          <td
                            className="px-2 py-1 text-xs font-medium"
                            style={{ color: "#111827" }}
                          >
                            <div>{row.First_Name}</div>
                            <div style={{ fontSize: "10px", color: "#6b7280" }}>{fmt(row.Actual_Basic_Pay)}</div>
                          </td>
                          {DED_COLS.map((c) => (
                            <td
                              key={c.key}
                              className="px-2 py-1 text-right font-mono"
                              style={{ color: "#1e3a5f" }}
                            >
                              {fmt(row[c.firstLineKey] || 0)}
                            </td>
                          ))}
                        </tr>
                        <tr style={{ backgroundColor: "#ffffff" }}>
                          <td
                            className="px-2 py-1 text-center text-xs"
                            style={{ color: "#374151" }}
                          >
                            {row.Emp_Code}
                          </td>
                          <td
                            className="px-2 py-1 text-xs"
                            style={{ color: "#6b7280" }}
                          ></td>
                          {DED_COLS.map((c) => (
                            <td
                              key={c.key}
                              className="px-2 py-1 text-right font-mono"
                              style={{ color: "#6b7280" }}
                            >
                              {fmt(row[c.secondLineKey] || 0)}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td
                            colSpan={totalCols}
                            style={{
                              padding: 0,
                              height: "1px",
                              backgroundColor: "#cbd5e1",
                            }}
                          />
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr
                      style={{
                        backgroundColor: "#1e3a5f",
                        borderTop: "2px solid #1e3a5f",
                      }}
                    >
                      <td
                        className="px-2 py-1.5 text-center font-bold text-white"
                        colSpan={2}
                      >
                        PAGE TOTAL
                      </td>
                      {DED_COLS.map((c) => (
                        <td
                          key={c.key}
                          className="px-2 py-1.5 text-right font-mono font-bold text-white"
                        >
                          {fmt(
                            (pageTotals[c.firstLineKey] || 0) +
                              (pageTotals[c.secondLineKey] || 0),
                          )}
                        </td>
                      ))}
                    </tr>
                    {currentPage == totalPages && (
                      <tr
                        style={{
                          backgroundColor: "#0f2b4a",
                          borderTop: "1px solid #1e3a5f",
                        }}
                      >
                        <td
                          className="px-2 py-1.5 text-center font-bold text-white"
                          colSpan={2}
                        >
                          GRAND TOTAL
                        </td>
                        {DED_COLS.map((c) => (
                          <td
                            key={c.key}
                            className="px-2 py-1.5 text-right font-mono font-bold text-white"
                          >
                            {fmt(
                              (grandTotals[c.firstLineKey] || 0) +
                                (grandTotals[c.secondLineKey] || 0),
                            )}
                          </td>
                        ))}
                      </tr>
                    )}
                  </tfoot>
                </table>
              </div>

              {currentPage == totalPages && (
                <div
                  style={{
                    borderTop: "2px dashed #9ca3af",
                    marginTop: "16px",
                    paddingTop: "14px",
                    fontFamily: "Arial, sans-serif",
                  }}
                >
                  <table
                    style={{
                      fontSize: "13px",
                      borderCollapse: "collapse",
                      width: "auto",
                    }}
                  >
                    <tbody>
                      <tr style={{ verticalAlign: "top" }}>
                        <td
                          style={{
                            paddingRight: "12px",
                            paddingBottom: "8px",
                            color: "#374151",
                            fontWeight: "500",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Rupees
                        </td>
                        <td
                          style={{
                            paddingRight: "8px",
                            paddingBottom: "8px",
                            color: "#374151",
                          }}
                        >
                          :
                        </td>
                        <td
                          style={{
                            paddingRight: "6px",
                            paddingBottom: "8px",
                            color: "#374151",
                          }}
                        >
                          ₹
                        </td>
                        <td
                          style={{
                            paddingBottom: "8px",
                            color: "#111827",
                            fontWeight: "600",
                            letterSpacing: "0.02em",
                          }}
                        >
                          {toWords(totals["DEDUCT"] || 0)}
                        </td>
                      </tr>
                      <tr style={{ verticalAlign: "top" }}>
                        <td
                          style={{
                            paddingRight: "12px",
                            paddingBottom: "8px",
                            color: "#374151",
                            fontWeight: "500",
                          }}
                        >
                          Total
                        </td>
                        <td
                          style={{
                            paddingRight: "8px",
                            paddingBottom: "8px",
                            color: "#374151",
                          }}
                        >
                          :
                        </td>
                        <td
                          style={{
                            paddingRight: "6px",
                            paddingBottom: "8px",
                            color: "#374151",
                          }}
                        >
                          ₹
                        </td>
                        <td
                          style={{
                            paddingBottom: "8px",
                            color: "#111827",
                            fontWeight: "700",
                            fontSize: "14px",
                          }}
                        >
                          {(totals["DEDUCT"] || 0).toLocaleString("en-IN")}/-
                        </td>
                      </tr>
                      <tr style={{ verticalAlign: "top" }}>
                        <td
                          style={{
                            paddingRight: "12px",
                            color: "#374151",
                            fontWeight: "500",
                          }}
                        >
                          Date
                        </td>
                        <td style={{ paddingRight: "8px", color: "#374151" }}>
                          :
                        </td>
                        <td
                          colSpan={2}
                          style={{ color: "#111827", fontWeight: "600" }}
                        >
                          {todayStr()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-end mt-6 gap-2">
                  <button
                    onClick={() => {
                      const p = currentPage - 1;
                      setCurrentPage(p);
                      fetchReport(p);
                    }}
                    disabled={currentPage == 1}
                    className="flex items-center gap-1 px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p == 1 ||
                        p == totalPages ||
                        Math.abs(p - currentPage) <= 1,
                    )
                    .reduce((acc, p, idx, arr) => {
                      if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, idx) =>
                      p == "..." ? (
                        <span
                          key={`e-${idx}`}
                          className="px-2 py-2 text-sm text-gray-400"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => {
                            setCurrentPage(p);
                            fetchReport(p);
                          }}
                          className={`w-9 h-9 text-sm rounded-lg font-medium transition-colors ${
                            currentPage == p
                              ? "bg-blue-600 text-white shadow-sm"
                              : "border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {p}
                        </button>
                      ),
                    )}
                  <button
                    onClick={() => {
                      const p = currentPage + 1;
                      setCurrentPage(p);
                      fetchReport(p);
                    }}
                    disabled={currentPage == totalPages}
                    className="flex items-center gap-1 px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalaryDeduction;

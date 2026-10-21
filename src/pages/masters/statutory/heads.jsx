/***
 *  I3EMS - AMT ERP  |  Statutory Head Config
 *  Configure each statutory salary deduction (EPF/GPF/ESI/PT/TDS/LWF/GIS/NPS/LIC):
 *  rates, wage base, deposit account, authority and due day. "Generate for Period"
 *  computes per-employee deductions into emp_payroll_deduction so the registers populate.
 */
import React from "react";
import axios from "axios";
import EntityManager from "../../../components/amt/entitymanager";

const TYPES = [
  "EPF",
  "GPF",
  "ESI",
  "PT",
  "TDS",
  "LWF",
  "GIS",
  "NPS",
  "LIC",
  "CPF",
].map((t) => ({ v: t, l: t }));
const BASES = [
  { v: "BASIC_DA", l: "Basic + DA" },
  { v: "GROSS", l: "Gross" },
  { v: "FIXED", l: "Fixed amount" },
];

const StatutoryHeads = () => {
  const generate = async (reload) => {
    const month = window.prompt(
      "Generate deductions for MONTH (1–12):",
      String(new Date().getMonth() + 1),
    );
    if (!month) return;
    const year = window.prompt("Year:", String(new Date().getFullYear()));
    if (!year) return;
    const base = window.prompt(
      "Default monthly wage base (Basic + DA) for percentage heads.\nFor exact per-employee bases, integrate with payroll; this posts a uniform base:",
      "0",
    );
    if (base == null) return;
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/statutory/generate`,
      { Month: Number(month), Year: Number(year), default_base: Number(base) },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      },
    );
    const posted = res.data?.data?.posted ?? 0;
    window.alert(
      `Generated ${posted} deduction line(s) for ${month}/${year}. Open the registers to view/print.`,
    );
    reload();
  };

  return (
    <EntityManager
      title="Statutory Head Config"
      subtitle="Statutory salary-deduction heads, rates and deposit details · AMT"
      endpoint="statutory/heads"
      idKey="SDH_Id"
      toolbar={[
        { label: "Generate for Period", tone: "primary", onClick: generate },
      ]}
      columns={[
        { key: "SDH_Type", label: "Type" },
        { key: "SDH_Name", label: "Name" },
        { key: "Employee_Rate", label: "EE %" },
        { key: "Employer_Rate", label: "ER %" },
        { key: "Wage_Base", label: "Wage Base" },
        { key: "Deposit_Account", label: "Deposit A/c" },
        { key: "Due_Day", label: "Due Day" },
        { key: "Is_Active", label: "Active", type: "bool" },
      ]}
      fields={[
        {
          key: "SDH_Type",
          label: "Deduction Type",
          type: "select",
          options: TYPES,
          required: true,
        },
        { key: "SDH_Name", label: "Head Name", type: "text", required: true },
        { key: "Employee_Rate", label: "Employee Rate (%)", type: "number" },
        { key: "Employer_Rate", label: "Employer Rate (%)", type: "number" },
        {
          key: "Wage_Base",
          label: "Wage Base",
          type: "select",
          options: BASES,
          required: true,
        },
        {
          key: "Fixed_Amount",
          label: "Fixed Amount (for FIXED base)",
          type: "number",
        },
        {
          key: "Employer_Contributes",
          label: "Employer Contributes",
          type: "bool",
        },
        { key: "Deposit_Account", label: "Deposit Account", type: "text" },
        { key: "Authority", label: "Authority / Department", type: "text" },
        { key: "Challan_Prefix", label: "Challan Prefix", type: "text" },
        { key: "Due_Day", label: "Due Day (of month)", type: "number" },
        { key: "Is_Active", label: "Active", type: "bool", default: true },
      ]}
    />
  );
};

export default StatutoryHeads;

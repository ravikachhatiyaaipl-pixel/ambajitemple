/***
 *  I3EMS - AMT ERP  |  PF / GPF Register
 *  Per-employee PF/GPF deduction with the PF account to be credited, plus totals
 *  and the amount to be deposited. Toggle EPF / GPF.
 */
import React from "react";
import StatutoryRegister from "../../../components/amt/statutoryregister";

const cols = [
  { key: "Emp_Code", label: "Emp Code" },
  { key: "Employee", label: "Employee" },
  { key: "Account_No", label: "PF / UAN A/c (to credit)" },
  { key: "Aadhaar", label: "Aadhaar" },
  { key: "Wage_Base_Amt", label: "Wage Base", type: "amount" },
  { key: "Employee_Share", label: "Employee Share", type: "amount" },
  { key: "Employer_Share", label: "Employer Share", type: "amount" },
  { key: "Total_Amount", label: "Total", type: "amount" },
  { key: "Bank_AcNo", label: "Bank A/c" },
  { key: "Bank_Name", label: "Bank" },
];

const PfRegister = () => (
  <StatutoryRegister
    endpoint="statutory-reports/pf"
    title="PF / GPF Register"
    menuLink="/reports/statutory/pf"
    reportCode="STAT-PF"
    columns={cols}
    typeOptions={[{ v: "EPF", l: "EPF (Provident Fund)" }, { v: "GPF", l: "GPF (Govt. Provident Fund)" }]}
  />
);

export default PfRegister;

/***
 *  I3EMS - AMT ERP  |  National Pension System (NPS) Register
 *  Per-employee NPS with the PRAN to be credited, plus employer contribution.
 */
import React from "react";
import StatutoryRegister from "../../../components/amt/statutoryregister";

const cols = [
  { key: "Emp_Code", label: "Emp Code" },
  { key: "Employee", label: "Employee" },
  { key: "Account_No", label: "PRAN (to credit)" },
  { key: "Wage_Base_Amt", label: "Basic + DA", type: "amount" },
  { key: "Employee_Share", label: "Employee Share", type: "amount" },
  { key: "Employer_Share", label: "Employer Share", type: "amount" },
  { key: "Total_Amount", label: "Total", type: "amount" },
  { key: "Bank_AcNo", label: "Bank A/c" },
  { key: "Bank_Name", label: "Bank" },
];

const NpsRegister = () => (
  <StatutoryRegister endpoint="statutory-reports/nps" title="NPS Register" menuLink="/reports/statutory/nps" reportCode="STAT-NPS" columns={cols} />
);

export default NpsRegister;

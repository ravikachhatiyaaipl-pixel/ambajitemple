/***
 *  I3EMS - AMT ERP  |  TDS / Income Tax Register (Section 192)
 */
import React from "react";
import StatutoryRegister from "../../../components/amt/statutoryregister";

const cols = [
  { key: "Emp_Code", label: "Emp Code" },
  { key: "Employee", label: "Employee" },
  { key: "Account_No", label: "PAN" },
  { key: "Wage_Base_Amt", label: "Taxable Pay", type: "amount" },
  { key: "Employee_Share", label: "TDS Deducted", type: "amount" },
  { key: "Total_Amount", label: "Total", type: "amount" },
  { key: "Bank_AcNo", label: "Bank A/c" },
  { key: "Bank_Name", label: "Bank" },
];

const TdsRegister = () => (
  <StatutoryRegister endpoint="statutory-reports/tds" title="TDS / Income Tax Register" menuLink="/reports/statutory/tds" reportCode="STAT-TDS" columns={cols} />
);

export default TdsRegister;

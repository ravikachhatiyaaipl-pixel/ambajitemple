/***
 *  I3EMS - AMT ERP  |  ESI Register
 */
import React from "react";
import StatutoryRegister from "../../../components/amt/statutoryregister";

const cols = [
  { key: "Emp_Code", label: "Emp Code" },
  { key: "Employee", label: "Employee" },
  { key: "Account_No", label: "ESI / IP No" },
  { key: "Aadhaar", label: "Aadhaar" },
  { key: "Wage_Base_Amt", label: "Wages", type: "amount" },
  { key: "Employee_Share", label: "Employee Share", type: "amount" },
  { key: "Employer_Share", label: "Employer Share", type: "amount" },
  { key: "Total_Amount", label: "Total", type: "amount" },
  { key: "Bank_AcNo", label: "Bank A/c" },
  { key: "Bank_Name", label: "Bank" },
];

const EsiRegister = () => (
  <StatutoryRegister endpoint="statutory-reports/esi" title="ESI Register" menuLink="/reports/statutory/esi" reportCode="STAT-ESI" columns={cols} />
);

export default EsiRegister;

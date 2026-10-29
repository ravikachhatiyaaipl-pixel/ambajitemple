/***
 *  I3EMS - AMT ERP  |  LIC Premium Recovery Register
 */
import React from "react";
import StatutoryRegister from "../../../components/amt/statutoryregister";

const cols = [
  { key: "Emp_Code", label: "Emp Code" },
  { key: "Employee", label: "Employee" },
  { key: "Account_No", label: "Policy / Ref No" },
  { key: "Employee_Share", label: "Premium Recovered", type: "amount" },
  { key: "Total_Amount", label: "Total", type: "amount" },
  { key: "Bank_AcNo", label: "Bank A/c" },
  { key: "Bank_Name", label: "Bank" },
];

const LicRegister = () => (
  <StatutoryRegister endpoint="statutory-reports/lic" title="LIC Recovery Register" menuLink="/reports/statutory/lic" reportCode="STAT-LIC" columns={cols} />
);

export default LicRegister;

/***
 *  I3EMS - AMT ERP  |  Professional Tax Register
 */
import React from "react";
import StatutoryRegister from "../../../components/amt/statutoryregister";

const cols = [
  { key: "Emp_Code", label: "Emp Code" },
  { key: "Employee", label: "Employee" },
  { key: "Wage_Base_Amt", label: "Wages", type: "amount" },
  { key: "Employee_Share", label: "PT Deducted", type: "amount" },
  { key: "Total_Amount", label: "Total", type: "amount" },
  { key: "Bank_AcNo", label: "Bank A/c" },
  { key: "Bank_Name", label: "Bank" },
];

const PtRegister = () => (
  <StatutoryRegister endpoint="statutory-reports/pt" title="Professional Tax Register" menuLink="/reports/statutory/pt" reportCode="STAT-PT" columns={cols} />
);

export default PtRegister;

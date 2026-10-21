/***
 *  I3EMS - AMT ERP  |  Labour Welfare Fund (LWF) Register
 */
import React from "react";
import StatutoryRegister from "../../../components/amt/statutoryregister";

const cols = [
  { key: "Emp_Code", label: "Emp Code" },
  { key: "Employee", label: "Employee" },
  { key: "Employee_Share", label: "Employee Contribution", type: "amount" },
  { key: "Employer_Share", label: "Employer Contribution", type: "amount" },
  { key: "Total_Amount", label: "Total", type: "amount" },
];

const LwfRegister = () => (
  <StatutoryRegister endpoint="statutory-reports/lwf" title="LWF Register" menuLink="/reports/statutory/lwf" reportCode="STAT-LWF" columns={cols} />
);

export default LwfRegister;

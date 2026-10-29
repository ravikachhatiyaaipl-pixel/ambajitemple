/***
 *  I3EMS - AMT ERP  |  Statutory Summary
 *  One line per deduction type with employee/employer totals, amount to be
 *  deposited, deposit account, authority and due day — the cover sheet for
 *  the month's statutory remittances.
 */
import React from "react";
import StatutoryRegister from "../../../components/amt/statutoryregister";

const cols = [
  { key: "Ded_Type", label: "Deduction" },
  { key: "Employees", label: "Employees", type: "number" },
  { key: "Employee_Share", label: "Employee Share", type: "amount" },
  { key: "Employer_Share", label: "Employer Share", type: "amount" },
  { key: "Total_To_Deposit", label: "Total to Deposit", type: "amount" },
  { key: "Deposit_Account", label: "Deposit Account" },
  { key: "Authority", label: "Authority" },
  { key: "Due_Day", label: "Due Day" },
];

const StatutorySummary = () => (
  <StatutoryRegister endpoint="statutory-reports/summary" title="Statutory Summary" menuLink="/reports/statutory/summary" reportCode="STAT-SUM" columns={cols} />
);

export default StatutorySummary;

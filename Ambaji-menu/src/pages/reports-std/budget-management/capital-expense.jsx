/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Capital Expense
 *  Parallel to the original (original left intact). Endpoint: /budget-reports/capital-expense-hierarchy
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const CapitalExpenseStd = () => (
  <AutoReport
    endpoint="budget-reports/capital-expense-hierarchy"
    method="get"
    title="Capital Expense"
    menuLink="/reports-std/budget-management/capital-expense"
    reportCode="STD-BUD-19"
    filters={["dept"]}
  />
);

export default CapitalExpenseStd;

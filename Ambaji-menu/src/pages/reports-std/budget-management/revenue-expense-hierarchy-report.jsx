/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Revenue-Expense Hierarchy
 *  Parallel to the original (original left intact). Endpoint: /budget-reports/revenue-expense-hierarchy
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const RevenueExpenseHierarchyReportStd = () => (
  <AutoReport
    endpoint="budget-reports/revenue-expense-hierarchy"
    method="get"
    title="Revenue-Expense Hierarchy"
    menuLink="/reports-std/budget-management/revenue-expense-hierarchy-report"
    reportCode="STD-BUD-25"
    filters={["dept"]}
  />
);

export default RevenueExpenseHierarchyReportStd;

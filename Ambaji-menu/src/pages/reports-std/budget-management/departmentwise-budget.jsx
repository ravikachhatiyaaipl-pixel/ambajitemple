/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Department-wise Budget
 *  Parallel to the original (original left intact). Endpoint: /revenue-expense/department-wise-breakdown
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const DepartmentwiseBudgetStd = () => (
  <AutoReport
    endpoint="revenue-expense/department-wise-breakdown"
    method="get"
    title="Department-wise Budget"
    menuLink="/reports-std/budget-management/departmentwise-budget"
    reportCode="STD-BUD-24"
    filters={["dept"]}
  />
);

export default DepartmentwiseBudgetStd;

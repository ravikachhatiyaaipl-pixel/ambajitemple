/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Budget Approval Status
 *  Parallel to the original (original left intact). Endpoint: /budget-reports/approved
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const BudgetApprovalStatusReportStd = () => (
  <AutoReport
    endpoint="budget-reports/approved"
    method="get"
    title="Budget Approval Status"
    menuLink="/reports-std/budget-management/budget-approval-status-report"
    reportCode="STD-BUD-18"
    filters={["dept"]}
  />
);

export default BudgetApprovalStatusReportStd;

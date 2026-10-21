/***  I3EMS - AMT ERP | report: Treasury Reconciliation (Sprint 8B) */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const ReconciliationReport = () => (
  <AutoReport endpoint="fin-compliance-reports/reconciliation" method="get" title="Treasury Reconciliation" menuLink="/reports/fin-compliance/reconciliation" reportCode="TRE-RC-01" filters={[]} />
);
export default ReconciliationReport;

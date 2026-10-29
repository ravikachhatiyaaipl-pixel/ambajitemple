/***  I3EMS - AMT ERP | report: Accounting Policies (Sprint 8B) */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const PoliciesReport = () => (
  <AutoReport endpoint="fin-compliance-reports/policies" method="get" title="Accounting Policies" menuLink="/reports/fin-compliance/policies" reportCode="FIN-PL-01" filters={[]} />
);
export default PoliciesReport;

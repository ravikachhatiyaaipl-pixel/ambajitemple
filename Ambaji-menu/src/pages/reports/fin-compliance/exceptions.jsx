/***  I3EMS - AMT ERP | report: Control / Exception Report (Sprint 8B) */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const ExceptionsReport = () => (
  <AutoReport endpoint="fin-compliance-reports/exceptions" method="get" title="Control / Exception Report" menuLink="/reports/fin-compliance/exceptions" reportCode="CTL-EX-01" filters={[]} />
);
export default ExceptionsReport;

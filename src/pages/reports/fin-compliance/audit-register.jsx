/***  I3EMS - AMT ERP | report: Audit Paragraph Register (Sprint 8B) */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const AuditRegister = () => (
  <AutoReport endpoint="fin-compliance-reports/audit-register" method="get" title="Audit Paragraph Register" menuLink="/reports/fin-compliance/audit-register" reportCode="AUD-RG-01" filters={[]} />
);
export default AuditRegister;

/***  I3EMS - AMT ERP | report: Notes to Accounts (Sprint 8B) */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const NotesReport = () => (
  <AutoReport endpoint="fin-compliance-reports/notes" method="get" title="Notes to Accounts" menuLink="/reports/fin-compliance/notes" reportCode="FIN-NT-01" filters={[]} />
);
export default NotesReport;

/***  I3EMS - AMT ERP | report: Multi-Bank Statement (Sprint FINAL) */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const MultiBank = () => (
  <AutoReport endpoint="statfin-reports/multi-bank" method="get" title="Multi-Bank Statement" menuLink="/reports/statfin/multi-bank" reportCode="FIN-MB-01" filters={[]} />
);
export default MultiBank;

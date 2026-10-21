/***  I3EMS - AMT ERP | report: Liabilities Register (Sprint FINAL) */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const Liabilities = () => (
  <AutoReport endpoint="statfin-reports/liabilities" method="get" title="Liabilities Register" menuLink="/reports/statfin/liabilities" reportCode="FIN-LB-01" filters={[]} />
);
export default Liabilities;

/***  I3EMS - AMT ERP | report: Fees & Charges (Sprint FINAL) */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const FeesCharges = () => (
  <AutoReport endpoint="statfin-reports/fees-charges" method="get" title="Fees & Charges" menuLink="/reports/statfin/fees-charges" reportCode="FIN-FC-01" filters={["from","to"]} />
);
export default FeesCharges;

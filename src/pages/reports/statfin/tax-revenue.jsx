/***  I3EMS - AMT ERP | report: Tax Revenue (Sprint FINAL) */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const TaxRevenue = () => (
  <AutoReport endpoint="statfin-reports/tax-revenue" method="get" title="Tax Revenue" menuLink="/reports/statfin/tax-revenue" reportCode="FIN-TX-01" filters={["from","to"]} />
);
export default TaxRevenue;

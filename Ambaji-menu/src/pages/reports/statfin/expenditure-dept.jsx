/***  I3EMS - AMT ERP | report: Expenditure — Dept-wise (Sprint FINAL) */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const ExpenditureDept = () => (
  <AutoReport endpoint="statfin-reports/expenditure-dept" method="get" title="Expenditure — Dept-wise" menuLink="/reports/statfin/expenditure-dept" reportCode="FIN-EXD-01" filters={["from","to"]} />
);
export default ExpenditureDept;

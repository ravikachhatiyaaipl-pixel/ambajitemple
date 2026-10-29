/***  I3EMS - AMT ERP | report: Marriage Register (Sprint FINAL) */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const MarriageRegister = () => (
  <AutoReport endpoint="health-reports/marriage-register" method="get" title="Marriage Register" menuLink="/reports/health/marriage-register" reportCode="HL-MR-01" filters={["from","to"]} />
);
export default MarriageRegister;

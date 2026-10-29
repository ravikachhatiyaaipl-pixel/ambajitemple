/***  I3EMS - AMT ERP | report: Death Register (Sprint FINAL) */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const DeathRegister = () => (
  <AutoReport endpoint="health-reports/death-register" method="get" title="Death Register" menuLink="/reports/health/death-register" reportCode="HL-DR-01" filters={["from","to"]} />
);
export default DeathRegister;

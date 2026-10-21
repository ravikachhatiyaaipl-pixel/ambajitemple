/***  I3EMS - AMT ERP | report: Deputation Register (Sprint FINAL) */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const DeputationRegister = () => (
  <AutoReport endpoint="tp-extra-reports/deputation" method="get" title="Deputation Register" menuLink="/reports/tp-extra/deputation" reportCode="HR-DEP-01" filters={["status"]} />
);
export default DeputationRegister;

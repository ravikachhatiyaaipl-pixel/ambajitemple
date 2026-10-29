/***  I3EMS - AMT ERP | report: Birth Register (Sprint FINAL) */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const BirthRegister = () => (
  <AutoReport endpoint="health-reports/birth-register" method="get" title="Birth Register" menuLink="/reports/health/birth-register" reportCode="HL-BR-01" filters={["from","to"]} />
);
export default BirthRegister;

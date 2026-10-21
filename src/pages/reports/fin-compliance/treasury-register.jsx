/***  I3EMS - AMT ERP | report: Treasury Register (Sprint 8B) */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const TreasuryRegister = () => (
  <AutoReport endpoint="fin-compliance-reports/treasury-register" method="get" title="Treasury Register" menuLink="/reports/fin-compliance/treasury-register" reportCode="TRE-RG-01" filters={["status"]} />
);
export default TreasuryRegister;

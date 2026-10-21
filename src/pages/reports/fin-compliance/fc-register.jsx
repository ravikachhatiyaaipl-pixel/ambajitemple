/***  I3EMS - AMT ERP | report: FC Grant Register (Sprint 8B) */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const FcRegister = () => (
  <AutoReport endpoint="fin-compliance-reports/fc-register" method="get" title="FC Grant Register" menuLink="/reports/fin-compliance/fc-register" reportCode="FC-RG-01" filters={["status"]} />
);
export default FcRegister;

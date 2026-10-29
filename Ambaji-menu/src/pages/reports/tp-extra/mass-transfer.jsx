/***  I3EMS - AMT ERP | report: Mass Transfer Register (Sprint FINAL) */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const MassTransferRegister = () => (
  <AutoReport endpoint="tp-extra-reports/mass-transfer" method="get" title="Mass Transfer Register" menuLink="/reports/tp-extra/mass-transfer" reportCode="HR-MT-01" filters={["status"]} />
);
export default MassTransferRegister;

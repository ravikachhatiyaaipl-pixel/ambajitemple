/***  I3EMS - AMT ERP | report: Disposal Register (Sprint 8B) */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const DisposalRegister = () => (
  <AutoReport endpoint="asset-reports/disposal-register" method="get" title="Disposal Register" menuLink="/reports/asset/disposal-register" reportCode="AST-DS-01" filters={[]} />
);
export default DisposalRegister;

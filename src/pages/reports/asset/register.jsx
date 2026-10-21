/***  I3EMS - AMT ERP | report: Asset Register (Sprint 8B) */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const AssetRegister = () => (
  <AutoReport endpoint="asset-reports/register" method="get" title="Asset Register" menuLink="/reports/asset/register" reportCode="AST-RG-01" filters={["status"]} />
);
export default AssetRegister;

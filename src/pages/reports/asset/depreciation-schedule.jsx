/***  I3EMS - AMT ERP | report: Depreciation Schedule (Sprint 8B) */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const DepreciationSchedule = () => (
  <AutoReport endpoint="asset-reports/depreciation-schedule" method="get" title="Depreciation Schedule" menuLink="/reports/asset/depreciation-schedule" reportCode="AST-DP-01" filters={["from","to"]} />
);
export default DepreciationSchedule;

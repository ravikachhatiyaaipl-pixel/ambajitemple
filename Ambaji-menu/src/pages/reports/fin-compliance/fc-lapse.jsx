/***  I3EMS - AMT ERP | report: FC Lapse Report (Sprint 8B) */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const FcLapse = () => (
  <AutoReport endpoint="fin-compliance-reports/fc-lapse" method="get" title="FC Lapse Report" menuLink="/reports/fin-compliance/fc-lapse" reportCode="FC-LP-01" filters={[]} />
);
export default FcLapse;

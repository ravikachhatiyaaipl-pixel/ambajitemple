/***
 *  I3EMS - AMT ERP  |  Financial report: Trial Balance
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const TrialBalance = () => (
  <AutoReport endpoint="fin-reports/trial-balance" method="get" title="Trial Balance" menuLink="/reports/fin/trial-balance" reportCode="FIN-TB-01" filters={["from","to"]} />
);
export default TrialBalance;

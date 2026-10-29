/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Trial Balance
 *  Parallel to the original (original left intact). Endpoint: /ledger-report
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const TrialbalanceStd = () => (
  <AutoReport
    endpoint="ledger-report"
    method="get"
    title="Trial Balance"
    menuLink="/reports-std/core-ledger/trialbalance"
    reportCode="STD-COR-60"
    filters={["from", "to"]}
  />
);

export default TrialbalanceStd;

/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Trial Balance Match
 *  Parallel to the original (original left intact). Endpoint: /trial-balance-mismatch-report
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const TrialbalancematchStd = () => (
  <AutoReport
    endpoint="trial-balance-mismatch-report"
    method="get"
    title="Trial Balance Match"
    menuLink="/reports-std/core-ledger/trialbalancematch"
    reportCode="STD-COR-61"
    filters={["from", "to"]}
  />
);

export default TrialbalancematchStd;

/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Trial Detail
 *  Parallel to the original (original left intact). Endpoint: /finan-trns/all
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const TrialdetailStd = () => (
  <AutoReport
    endpoint="finan-trns/all"
    method="get"
    title="Trial Detail"
    menuLink="/reports-std/core-ledger/trialdetail"
    reportCode="STD-COR-62"
    filters={["from", "to"]}
  />
);

export default TrialdetailStd;

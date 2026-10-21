/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Contingent Liabilities
 *  Parallel to the original (original left intact). Endpoint: /contingent-liabilities/register
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const ContingentLiabilitiesStd = () => (
  <AutoReport
    endpoint="contingent-liabilities/register"
    method="get"
    title="Contingent Liabilities"
    menuLink="/reports-std/annual-financial/contingent-liabilities"
    reportCode="STD-ANN-11"
    filters={["from", "to", "status"]}
  />
);

export default ContingentLiabilitiesStd;

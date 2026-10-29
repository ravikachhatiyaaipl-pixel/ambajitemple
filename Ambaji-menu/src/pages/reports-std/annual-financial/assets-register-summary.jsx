/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Assets Register Summary
 *  Parallel to the original (original left intact). Endpoint: /asset-register
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const AssetsRegisterSummaryStd = () => (
  <AutoReport
    endpoint="asset-register"
    method="get"
    title="Assets Register Summary"
    menuLink="/reports-std/annual-financial/assets-register-summary"
    reportCode="STD-ANN-08"
    filters={[]}
  />
);

export default AssetsRegisterSummaryStd;

/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Balance Sheet
 *  Parallel to the original (original left intact). Endpoint: /balance-sheet
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const BalancesheetStd = () => (
  <AutoReport
    endpoint="balance-sheet"
    method="get"
    title="Balance Sheet"
    menuLink="/reports-std/annual-financial/balancesheet"
    reportCode="STD-ANN-09"
    filters={["from", "to"]}
  />
);

export default BalancesheetStd;

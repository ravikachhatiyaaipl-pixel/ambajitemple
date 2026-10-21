/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Income & Expenditure
 *  Parallel to the original (original left intact). Endpoint: /profit-loss
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const IncomeExpenditureStd = () => (
  <AutoReport
    endpoint="profit-loss"
    method="get"
    title="Income & Expenditure"
    menuLink="/reports-std/annual-financial/income-expenditure"
    reportCode="STD-ANN-12"
    filters={["from", "to"]}
  />
);

export default IncomeExpenditureStd;

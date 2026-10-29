/***
 *  I3EMS - AMT ERP  |  Financial report: Income & Expenditure Account
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const IncomeExpenditure = () => (
  <AutoReport endpoint="fin-reports/income-expenditure" method="get" title="Income & Expenditure Account" menuLink="/reports/fin/income-expenditure" reportCode="FIN-IE-01" filters={["from","to"]} />
);
export default IncomeExpenditure;

/***
 *  I3EMS - AMT ERP  |  Financial report: Budget vs Actual
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const BudgetVsActual = () => (
  <AutoReport endpoint="fin-reports/budget-vs-actual" method="get" title="Budget vs Actual" menuLink="/reports/fin/budget-vs-actual" reportCode="FIN-BA-01" filters={["from","to"]} />
);
export default BudgetVsActual;

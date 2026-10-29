/***  I3EMS - AMT ERP | report: Salary Abstract (Sprint FINAL) */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const SalaryAbstract = () => (
  <AutoReport endpoint="statfin-reports/salary-abstract" method="get" title="Salary Abstract" menuLink="/reports/statfin/salary-abstract" reportCode="FIN-SA-01" filters={[]} />
);
export default SalaryAbstract;

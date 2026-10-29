/***
 *  I3EMS - AMT ERP  |  Appraisal report: Grading Summary
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const GradingSummary = () => (
  <AutoReport endpoint="appraisal-reports/grading-summary" method="get" title="Grading Summary" menuLink="/reports/appraisal/grading-summary" reportCode="HR-AP-02" filters={[]} />
);
export default GradingSummary;

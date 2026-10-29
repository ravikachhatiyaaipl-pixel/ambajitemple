/***
 *  I3EMS - AMT ERP  |  Appraisal report: Pending APAR
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const PendingApar = () => (
  <AutoReport endpoint="appraisal-reports/pending-apar" method="get" title="Pending APAR" menuLink="/reports/appraisal/pending-apar" reportCode="HR-AP-03" filters={[]} />
);
export default PendingApar;

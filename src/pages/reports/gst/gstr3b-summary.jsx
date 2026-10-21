/***
 *  I3EMS - AMT ERP  |  GST report: GSTR-3B Summary
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const Gstr3bSummary = () => (
  <AutoReport endpoint="gst-reports/gstr3b-summary" method="get" title="GSTR-3B Summary" menuLink="/reports/gst/gstr3b-summary" reportCode="GST-3B-01" filters={[]} />
);
export default Gstr3bSummary;

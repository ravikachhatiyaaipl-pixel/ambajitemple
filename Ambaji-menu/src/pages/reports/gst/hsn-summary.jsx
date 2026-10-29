/***
 *  I3EMS - AMT ERP  |  GST report: HSN Summary
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const HsnSummary = () => (
  <AutoReport endpoint="gst-reports/hsn-summary" method="get" title="GST HSN Summary" menuLink="/reports/gst/hsn-summary" reportCode="GST-HSN-01" filters={[]} />
);
export default HsnSummary;

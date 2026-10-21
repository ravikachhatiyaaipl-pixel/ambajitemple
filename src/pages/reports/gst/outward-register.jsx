/***
 *  I3EMS - AMT ERP  |  GST report: Outward Register (GSTR-1 source)
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const OutwardRegister = () => (
  <AutoReport endpoint="gst-reports/outward-register" method="get" title="GST Outward Register" menuLink="/reports/gst/outward-register" reportCode="GST-OUT-01" filters={["status"]} />
);
export default OutwardRegister;

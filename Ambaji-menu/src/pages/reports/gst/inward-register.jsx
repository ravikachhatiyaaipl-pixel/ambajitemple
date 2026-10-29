/***
 *  I3EMS - AMT ERP  |  GST report: Inward / ITC Register (GSTR-2 source)
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const InwardRegister = () => (
  <AutoReport endpoint="gst-reports/inward-register" method="get" title="GST Inward / ITC Register" menuLink="/reports/gst/inward-register" reportCode="GST-IN-01" filters={["status"]} />
);
export default InwardRegister;

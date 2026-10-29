/***
 *  I3EMS - AMT ERP  |  Disciplinary report: Pending Inquiries
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const PendingInquiries = () => (
  <AutoReport endpoint="disciplinary-reports/pending-inquiries" method="get" title="Pending Inquiries" menuLink="/reports/disciplinary/pending-inquiries" reportCode="HR-DP-02" filters={[]} />
);
export default PendingInquiries;

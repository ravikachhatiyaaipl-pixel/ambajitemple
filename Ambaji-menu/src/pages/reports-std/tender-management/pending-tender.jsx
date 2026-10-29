/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Pending Tender
 *  Parallel to the original (original left intact). Endpoint: /tender-reports/non-allotted
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const PendingTenderStd = () => (
  <AutoReport
    endpoint="tender-reports/non-allotted"
    method="get"
    title="Pending Tender"
    menuLink="/reports-std/tender-management/pending-tender"
    reportCode="STD-TEN-37"
    filters={["dept", "from", "to", "status"]}
  />
);

export default PendingTenderStd;

/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Active Work Orders
 *  Parallel to the original (original left intact). Endpoint: /tender-reports/active-work-orders
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const ActiveWoStd = () => (
  <AutoReport
    endpoint="tender-reports/active-work-orders"
    method="get"
    title="Active Work Orders"
    menuLink="/reports-std/tender-management/active-wo"
    reportCode="STD-TEN-30"
    filters={["dept", "from", "to", "status"]}
  />
);

export default ActiveWoStd;

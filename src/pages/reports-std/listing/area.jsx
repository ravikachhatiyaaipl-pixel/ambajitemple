/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Area List
 *  Parallel to the original (original left intact). Endpoint: /reports/area-list
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const AreaStd = () => (
  <AutoReport
    endpoint="reports/area-list"
    method="get"
    title="Area List"
    menuLink="/reports-std/listing/area"
    reportCode="STD-LIS-01"
    filters={[]}
  />
);

export default AreaStd;

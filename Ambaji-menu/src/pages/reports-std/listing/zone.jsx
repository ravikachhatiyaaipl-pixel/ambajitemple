/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Zone List
 *  Parallel to the original (original left intact). Endpoint: /reports/zone-list
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const ZoneStd = () => (
  <AutoReport
    endpoint="reports/zone-list"
    method="get"
    title="Zone List"
    menuLink="/reports-std/listing/zone"
    reportCode="STD-LIS-06"
    filters={[]}
  />
);

export default ZoneStd;

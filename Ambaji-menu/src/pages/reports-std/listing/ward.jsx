/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Ward List
 *  Parallel to the original (original left intact). Endpoint: /reports/ward-list
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const WardStd = () => (
  <AutoReport
    endpoint="reports/ward-list"
    method="get"
    title="Ward List"
    menuLink="/reports-std/listing/ward"
    reportCode="STD-LIS-05"
    filters={[]}
  />
);

export default WardStd;

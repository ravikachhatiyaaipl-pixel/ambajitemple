/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: CCC List
 *  Parallel to the original (original left intact). Endpoint: /reports/ccc-list
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const CccStd = () => (
  <AutoReport
    endpoint="reports/ccc-list"
    method="get"
    title="CCC List"
    menuLink="/reports-std/listing/ccc"
    reportCode="STD-LIS-02"
    filters={[]}
  />
);

export default CccStd;

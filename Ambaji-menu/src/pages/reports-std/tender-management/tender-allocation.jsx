/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Tender Allocation
 *  Parallel to the original (original left intact). Endpoint: /tender-type/all
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const TenderAllocationStd = () => (
  <AutoReport
    endpoint="tender-type/all"
    method="get"
    title="Tender Allocation"
    menuLink="/reports-std/tender-management/tender-allocation"
    reportCode="STD-TEN-38"
    filters={["dept", "from", "to"]}
  />
);

export default TenderAllocationStd;

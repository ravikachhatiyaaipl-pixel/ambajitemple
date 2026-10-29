/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Vendor-wise Register
 *  Parallel to the original (original left intact). Endpoint: /tender-reports/vendorwise
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const VendorwiseRegStd = () => (
  <AutoReport
    endpoint="tender-reports/vendorwise"
    method="get"
    title="Vendor-wise Register"
    menuLink="/reports-std/tender-management/vendorwise-reg"
    reportCode="STD-TEN-40"
    filters={["from", "to"]}
  />
);

export default VendorwiseRegStd;

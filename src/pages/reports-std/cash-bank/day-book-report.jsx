/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Day Book
 *  Parallel to the original (original left intact). Endpoint: /ch-voucher/report
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const DayBookReportStd = () => (
  <AutoReport
    endpoint="ch-voucher/report"
    method="get"
    title="Day Book"
    menuLink="/reports-std/cash-bank/day-book-report"
    reportCode="STD-CAS-45"
    filters={["from", "to"]}
  />
);

export default DayBookReportStd;

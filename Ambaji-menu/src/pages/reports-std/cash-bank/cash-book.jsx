/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Cash Book
 *  Parallel to the original (original left intact). Endpoint: /finan-trns/all
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const CashBookStd = () => (
  <AutoReport
    endpoint="finan-trns/all"
    method="get"
    title="Cash Book"
    menuLink="/reports-std/cash-bank/cash-book"
    reportCode="STD-CAS-42"
    filters={["from", "to"]}
  />
);

export default CashBookStd;

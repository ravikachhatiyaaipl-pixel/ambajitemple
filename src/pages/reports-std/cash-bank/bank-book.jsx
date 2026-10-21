/***
 *  I3EMS - AMT ERP  |  Standardized rebuild of: Bank Book
 *  Parallel to the original (original left intact). Endpoint: /finan-trns/all
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";

const BankBookStd = () => (
  <AutoReport
    endpoint="finan-trns/all"
    method="get"
    title="Bank Book"
    menuLink="/reports-std/cash-bank/bank-book"
    reportCode="STD-CAS-41"
    filters={["from", "to"]}
  />
);

export default BankBookStd;

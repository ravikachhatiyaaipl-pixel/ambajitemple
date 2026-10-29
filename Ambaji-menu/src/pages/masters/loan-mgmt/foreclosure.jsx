/***
 *  I3EMS - AMT ERP  |  Loan Management · Foreclosure   (Sprint 6, SOW)
 *  Endpoint: /loan-mgmt/foreclosure
 *  "Settle" recomputes outstanding + accrued interest, cancels scheduled recoveries,
 *  closes the loan and posts the ledger (server-side).
 */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS = [
  { key: "LF_No", label: "No" },
  { key: "LAS_Id", label: "Loan" },
  { key: "Foreclosure_Date", label: "Date", type: "date" },
  { key: "Outstanding_Principal", label: "Outstanding", type: "amount" },
  { key: "Accrued_Interest", label: "Interest", type: "amount" },
  { key: "Settlement_Amount", label: "Settlement", type: "amount" },
  { key: "Status", label: "Status", type: "status" },
];
const FIELDS = [
  { key: "LAS_Id", label: "Loan Sanction (LAS ID)", type: "number", required: true },
  { key: "Foreclosure_Date", label: "Foreclosure Date", type: "date" },
  { key: "Foreclosure_Type", label: "Type", type: "select", options: ["FORECLOSURE", "PRECLOSURE"] },
  { key: "Waiver_Amount", label: "Waiver Amount", type: "number" },
  { key: "Payment_Ref", label: "Payment Reference" },
  { key: "Remarks", label: "Remarks", type: "textarea", full: true },
];
const ACTIONS = [
  { label: "Approve", action: "approve" },
  { label: "Settle", action: "settle", tone: "primary" },
];
const Foreclosure = () => (
  <ResourceManager title="Loan Foreclosure" endpoint="loan-mgmt/foreclosure" idKey="LF_Id" columns={COLUMNS} fields={FIELDS} actions={ACTIONS} />
);
export default Foreclosure;

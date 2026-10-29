/***
 *  I3EMS - AMT ERP  |  GST · Return   (Sprint 7, SOW)
 *  Endpoint: /gst/return
 *  Use "GST Return" list to prepare/file periods; generate totals via POST /gst/generate-return.
 *  NOTE: actual portal filing is external — record the ARN when marking a return FILED.
 */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS = [
  { key: "GRT_No", label: "No" },
  { key: "Return_Type", label: "Type" },
  { key: "Return_Period", label: "Period" },
  { key: "Outward_Taxable", label: "Outward", type: "amount" },
  { key: "Net_Payable", label: "Net Payable", type: "amount" },
  { key: "Filing_Ref", label: "ARN" },
  { key: "Status", label: "Status", type: "status" },
];
const FIELDS = [
  { key: "Return_Type", label: "Return Type", type: "select", options: ["GSTR1", "GSTR3B"], required: true },
  { key: "Return_Period", label: "Return Period (YYYY-MM)", type: "text", required: true },
  { key: "Remarks", label: "Remarks", type: "textarea", full: true },
];
const ACTIONS = [
  { label: "Prepare", action: "prepare", tone: "primary" },
  { label: "Reopen", action: "reopen" },
];
const GstReturn = () => (
  <ResourceManager title="GST Return" endpoint="gst/return" idKey="GRT_Id" columns={COLUMNS} fields={FIELDS} actions={ACTIONS} />
);
export default GstReturn;

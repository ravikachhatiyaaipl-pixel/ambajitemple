/***  I3EMS - AMT ERP | HR · Mass Transfer Batch (Sprint FINAL) | endpoint /tp-extra/mass-batch
 *   Add employees via POST /tp-extra/mass-batch/{id}/lines; Validate checks eligibility;
 *   Generate Orders creates a transfer_order (Sprint 3) per eligible line. */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS = [
  { key: "MTB_No", label: "No" }, { key: "Title", label: "Title" },
  { key: "Effective_Date", label: "Effective", type: "date" }, { key: "Transfer_Type", label: "Type" },
  { key: "Status", label: "Status", type: "status" },
];
const FIELDS = [
  { key: "Title", label: "Batch Title", type: "text", required: true },
  { key: "Order_Date", label: "Order Date", type: "date" },
  { key: "Effective_Date", label: "Effective Date", type: "date" },
  { key: "Transfer_Type", label: "Transfer Type", type: "select", options: ["ADMINISTRATIVE", "REQUEST", "MUTUAL"] },
  { key: "Remarks", label: "Remarks", type: "textarea", full: true },
];
const ACTIONS = [
  { label: "Validate", path: "validate", done: "Batch validated", tone: "primary" },
  { label: "Generate Orders", path: "generate", done: "Transfer orders generated", tone: "primary" },
];
const MassTransferBatch = () => (<ResourceManager title="Mass Transfer Batch" endpoint="tp-extra/mass-batch" idKey="MTB_Id" columns={COLUMNS} fields={FIELDS} actions={ACTIONS} />);
export default MassTransferBatch;

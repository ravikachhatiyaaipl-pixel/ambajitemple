/***
 *  I3EMS - AMT ERP  |  GST · Transaction   (Sprint 7, SOW)
 *  Endpoint: /gst/transaction
 *  CGST/SGST/IGST/Cess are computed server-side from the GST rate master by HSN + supply type.
 */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS = [
  { key: "GTX_No", label: "No" },
  { key: "Direction", label: "Dir" },
  { key: "Doc_No", label: "Doc No" },
  { key: "Party_Name", label: "Party" },
  { key: "Taxable_Value", label: "Taxable", type: "amount" },
  { key: "Total_Tax", label: "Tax", type: "amount" },
  { key: "Invoice_Total", label: "Total", type: "amount" },
  { key: "Status", label: "Status", type: "status" },
];
const FIELDS = [
  { key: "Direction", label: "Direction", type: "select", options: ["OUTWARD", "INWARD"], required: true },
  { key: "Doc_Type", label: "Document Type", type: "select", options: ["INVOICE", "BILL", "CREDIT_NOTE", "DEBIT_NOTE"] },
  { key: "Doc_No", label: "Document No", type: "text" },
  { key: "Doc_Date", label: "Document Date", type: "date" },
  { key: "Party_Name", label: "Party Name", type: "text" },
  { key: "Party_GSTIN", label: "Party GSTIN", type: "text" },
  { key: "Place_Of_Supply", label: "Place of Supply", type: "text" },
  { key: "Supply_Type", label: "Supply Type", type: "select", options: ["INTRA", "INTER"] },
  { key: "HSN_Id", label: "HSN / SAC (ID)", type: "number" },
  { key: "Taxable_Value", label: "Taxable Value", type: "number", required: true },
  { key: "CGST_Rate", label: "CGST % (blank = from master)", type: "number" },
  { key: "SGST_Rate", label: "SGST % (blank = from master)", type: "number" },
  { key: "IGST_Rate", label: "IGST % (blank = from master)", type: "number" },
  { key: "Cess_Rate", label: "Cess %", type: "number" },
  { key: "ITC_Eligible", label: "ITC Eligible (inward)", type: "bool" },
  { key: "Remarks", label: "Remarks", type: "textarea", full: true },
];
const ACTIONS = [
  { label: "Post", action: "post", tone: "primary" },
  { label: "Unpost", action: "unpost" },
];
const GstTransaction = () => (
  <ResourceManager title="GST Transaction" endpoint="gst/transaction" idKey="GTX_Id" columns={COLUMNS} fields={FIELDS} actions={ACTIONS} />
);
export default GstTransaction;

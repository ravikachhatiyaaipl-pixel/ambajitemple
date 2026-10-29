/***
 *  I3EMS - AMT ERP  |  GST · GST Rate Master   (Sprint 7, SOW)
 *  Endpoint: /gst/gst-rate
 */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS = [
  { key: "HSN_Id", label: "HSN" },
  { key: "CGST_Rate", label: "CGST %" },
  { key: "SGST_Rate", label: "SGST %" },
  { key: "IGST_Rate", label: "IGST %" },
  { key: "Cess_Rate", label: "Cess %" },
  { key: "Effective_From", label: "From", type: "date" },
  { key: "Is_Active", label: "Active", type: "bool" },
];
const FIELDS = [
  { key: "HSN_Id", label: "HSN / SAC (ID)", type: "number" },
  { key: "FY_Id", label: "Financial Year (ID)", type: "number" },
  { key: "CGST_Rate", label: "CGST Rate %", type: "number" },
  { key: "SGST_Rate", label: "SGST Rate %", type: "number" },
  { key: "IGST_Rate", label: "IGST Rate %", type: "number" },
  { key: "Cess_Rate", label: "Cess Rate %", type: "number" },
  { key: "Effective_From", label: "Effective From", type: "date" },
  { key: "Effective_To", label: "Effective To", type: "date" },
  { key: "Is_Active", label: "Active", type: "bool" },
  { key: "Remarks", label: "Remarks", type: "textarea", full: true },
];
const GstRate = () => (
  <ResourceManager title="GST Rate Master" endpoint="gst/gst-rate" idKey="GSTR_Id" columns={COLUMNS} fields={FIELDS} actions={[]} />
);
export default GstRate;

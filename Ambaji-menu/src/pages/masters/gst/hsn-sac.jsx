/***
 *  I3EMS - AMT ERP  |  GST · HSN / SAC Master   (Sprint 7, SOW)
 *  Endpoint: /gst/hsn-sac
 */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS = [
  { key: "Code", label: "Code" },
  { key: "Description", label: "Description" },
  { key: "Code_Type", label: "Type" },
  { key: "Default_GST_Rate", label: "GST %" },
  { key: "Is_Active", label: "Active", type: "bool" },
];
const FIELDS = [
  { key: "Code", label: "HSN / SAC Code", type: "text", required: true },
  { key: "Description", label: "Description", type: "text", full: true },
  { key: "Code_Type", label: "Type", type: "select", options: ["HSN", "SAC"] },
  { key: "Default_GST_Rate", label: "Default GST Rate %", type: "number" },
  { key: "Is_Active", label: "Active", type: "bool" },
];
const HsnSac = () => (
  <ResourceManager title="HSN / SAC Master" endpoint="gst/hsn-sac" idKey="HSN_Id" columns={COLUMNS} fields={FIELDS} actions={[]} />
);
export default HsnSac;

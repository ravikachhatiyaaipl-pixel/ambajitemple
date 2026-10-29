/***
 *  I3EMS - AMT ERP  |  Appraisal · APAR Attribute Master   (Sprint 4, SOW)
 *  Endpoint: /appraisal/attribute-master
 *  Defines the scored competency attributes seeded into each APAR record.
 */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS = [
  { key: "AAT_Code", label: "Code" },
  { key: "AAT_Name", label: "Attribute" },
  { key: "Category", label: "Category" },
  { key: "Max_Marks", label: "Max" },
  { key: "Applies_To", label: "Applies To" },
  { key: "Is_Active", label: "Active", type: "bool" },
];
const FIELDS = [
  { key: "AAT_Name", label: "Attribute Name", type: "text", required: true },
  { key: "Category", label: "Category", type: "select", options: ["WORK_OUTPUT", "PERSONAL_ATTRIBUTES", "FUNCTIONAL_COMPETENCY"] },
  { key: "Max_Marks", label: "Maximum Marks", type: "number", required: true },
  { key: "Weightage", label: "Weightage", type: "number" },
  { key: "Applies_To", label: "Applies To (cadre / ALL)", type: "text" },
  { key: "Display_Order", label: "Display Order", type: "number" },
  { key: "Is_Active", label: "Active", type: "bool" },
];
const AttributeMaster = () => (
  <ResourceManager title="APAR Attribute Master" endpoint="appraisal/attribute-master" idKey="AAT_Id" columns={COLUMNS} fields={FIELDS} actions={[]} />
);
export default AttributeMaster;

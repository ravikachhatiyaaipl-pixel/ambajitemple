/***  I3EMS - AMT ERP | Assets · Category Master (Sprint 8B) | endpoint /asset/category */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS = [
  { key: "ACT_Code", label: "Code" }, { key: "ACT_Name", label: "Category" },
  { key: "Depreciation_Method", label: "Method" }, { key: "Depreciation_Rate", label: "Rate %" },
  { key: "Useful_Life_Years", label: "Life (yrs)" }, { key: "Is_Active", label: "Active", type: "bool" },
];
const FIELDS = [
  { key: "ACT_Name", label: "Category Name", type: "text", required: true },
  { key: "Depreciation_Method", label: "Depreciation Method", type: "select", options: ["SLM", "WDV", "NONE"] },
  { key: "Depreciation_Rate", label: "Rate % p.a.", type: "number" },
  { key: "Useful_Life_Years", label: "Useful Life (years)", type: "number" },
  { key: "Schedule_Ref", label: "Balance-Sheet Schedule" },
  { key: "Is_Active", label: "Active", type: "bool" },
];
const AssetCategory = () => (<ResourceManager title="Asset Category" endpoint="asset/category" idKey="ACT_Id" columns={COLUMNS} fields={FIELDS} actions={[]} />);
export default AssetCategory;

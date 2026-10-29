/***  I3EMS - AMT ERP | Assets · Fixed Asset (Sprint 8B) | endpoint /asset/asset
 *   Depreciation is run for a period via POST /asset/run-depreciation (Accounts function). */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS = [
  { key: "FA_No", label: "No" }, { key: "FA_Name", label: "Asset" },
  { key: "Cost", label: "Cost", type: "amount" }, { key: "Accumulated_Depreciation", label: "Acc. Dep.", type: "amount" },
  { key: "WDV", label: "WDV", type: "amount" }, { key: "Status", label: "Status", type: "status" },
];
const FIELDS = [
  { key: "FA_Name", label: "Asset Name", type: "text", required: true },
  { key: "ACT_Id", label: "Category (ACT ID)", type: "number", required: true },
  { key: "Dpt_Id", label: "Department (ID)", type: "number" },
  { key: "Location", label: "Location", full: true },
  { key: "Acquisition_Date", label: "Acquisition Date", type: "date" },
  { key: "Quantity", label: "Quantity", type: "number" },
  { key: "Cost", label: "Cost", type: "number", required: true },
  { key: "Salvage_Value", label: "Salvage Value", type: "number" },
  { key: "Depreciation_Method", label: "Method (blank = from category)", type: "select", options: ["", "SLM", "WDV", "NONE"] },
  { key: "Depreciation_Rate", label: "Rate % (blank = from category)", type: "number" },
  { key: "Voucher_Ref", label: "Acquisition Voucher Ref" },
];
const AssetMaster = () => (<ResourceManager title="Fixed Asset" endpoint="asset/asset" idKey="FA_Id" columns={COLUMNS} fields={FIELDS} actions={[]} />);
export default AssetMaster;

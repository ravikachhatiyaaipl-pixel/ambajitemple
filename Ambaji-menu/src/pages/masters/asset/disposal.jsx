/***  I3EMS - AMT ERP | Assets · Disposal (Sprint 8B) | endpoint /asset/disposal
 *   Profit/Loss = Sale Value − book value (WDV); marks the asset DISPOSED (server-side). */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS = [
  { key: "ADP_No", label: "No" }, { key: "FA_Id", label: "Asset" }, { key: "Disposal_Date", label: "Date", type: "date" },
  { key: "Mode", label: "Mode" }, { key: "Sale_Value", label: "Sale", type: "amount" },
  { key: "WDV_At_Disposal", label: "WDV", type: "amount" }, { key: "Profit_Loss", label: "P/L", type: "amount" },
  { key: "Status", label: "Status", type: "status" },
];
const FIELDS = [
  { key: "FA_Id", label: "Fixed Asset (FA ID)", type: "number", required: true },
  { key: "Disposal_Date", label: "Disposal Date", type: "date" },
  { key: "Mode", label: "Mode", type: "select", options: ["SALE", "SCRAP", "TRANSFER", "WRITE_OFF"] },
  { key: "Sale_Value", label: "Sale Value", type: "number" },
  { key: "Buyer", label: "Buyer / Transferee" },
  { key: "Remarks", label: "Remarks", type: "textarea", full: true },
];
const AssetDisposal = () => (<ResourceManager title="Asset Disposal" endpoint="asset/disposal" idKey="ADP_Id" columns={COLUMNS} fields={FIELDS} actions={[]} />);
export default AssetDisposal;

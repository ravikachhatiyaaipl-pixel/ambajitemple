/***  I3EMS - AMT ERP | Finance · FC Utilisation (Sprint 8B) | endpoint /fin-compliance/fc-utilization */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS = [
  { key: "FCG_Id", label: "Grant" }, { key: "Util_Date", label: "Date", type: "date" },
  { key: "Work_Ref", label: "Work" }, { key: "Amount", label: "Amount", type: "amount" }, { key: "Voucher_Ref", label: "Voucher" },
];
const FIELDS = [
  { key: "FCG_Id", label: "FC Grant (FCG ID)", type: "number", required: true },
  { key: "Util_Date", label: "Utilisation Date", type: "date" },
  { key: "Sch_id", label: "Scheme (ID, optional)", type: "number" },
  { key: "Bh_Id", label: "Budget Head (ID, optional)", type: "number" },
  { key: "Work_Ref", label: "Work / Purpose" },
  { key: "Amount", label: "Amount", type: "number", required: true },
  { key: "Voucher_Ref", label: "Voucher Ref" },
  { key: "Remarks", label: "Remarks", type: "textarea", full: true },
];
const FcUtilization = () => (<ResourceManager title="FC Utilisation" endpoint="fin-compliance/fc-utilization" idKey="FCU_Id" columns={COLUMNS} fields={FIELDS} actions={[]} />);
export default FcUtilization;

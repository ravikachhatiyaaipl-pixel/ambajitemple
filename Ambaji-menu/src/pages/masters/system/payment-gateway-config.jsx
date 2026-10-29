/***  I3EMS - AMT ERP | System · Payment Gateway Config (Sprint 12B) | endpoint /payment-gateway-config
 *   Holds NON-SECRET params only. API keys/salts live in server env (Env_Key_Ref names the env var). */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS = [
  { key: "Gateway", label: "Gateway" }, { key: "Mode", label: "Mode" },
  { key: "Merchant_Alias", label: "Merchant" }, { key: "Env_Key_Ref", label: "Env Key Ref" },
  { key: "Is_Active", label: "Active", type: "bool" },
];
const FIELDS = [
  { key: "Gateway", label: "Gateway", type: "select", options: ["RAZORPAY", "BILLDESK", "PAYTM", "SBIEPAY", "CCAVENUE"], required: true },
  { key: "Mode", label: "Mode", type: "select", options: ["TEST", "LIVE"] },
  { key: "Merchant_Alias", label: "Merchant ID / Alias (non-secret)" },
  { key: "Callback_Url", label: "Callback URL", full: true },
  { key: "Webhook_Url", label: "Webhook URL", full: true },
  { key: "Env_Key_Ref", label: "Env Var Name holding the secret (NOT the secret)" },
  { key: "Is_Active", label: "Active", type: "bool" },
  { key: "Remarks", label: "Remarks", type: "textarea", full: true },
];
const PaymentGatewayConfig = () => (
  <ResourceManager title="Payment Gateway Config" endpoint="payment-gateway-config" idKey="PGC_Id" columns={COLUMNS} fields={FIELDS} actions={[]} />
);
export default PaymentGatewayConfig;

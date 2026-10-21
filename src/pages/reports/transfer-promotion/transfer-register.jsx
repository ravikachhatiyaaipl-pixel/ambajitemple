/***
 *  I3EMS - AMT ERP  |  Transfer & Promotion report: Transfer Register
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const TransferRegister = () => (
  <AutoReport endpoint="transfer-reports/transfer-register" method="get" title="Transfer Register" menuLink="/reports/transfer-promotion/transfer-register" reportCode="HR-TR-01" filters={["status"]} />
);
export default TransferRegister;

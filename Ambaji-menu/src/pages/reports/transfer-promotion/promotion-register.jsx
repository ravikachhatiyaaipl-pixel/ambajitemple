/***
 *  I3EMS - AMT ERP  |  Transfer & Promotion report: Promotion Register
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const PromotionRegister = () => (
  <AutoReport endpoint="transfer-reports/promotion-register" method="get" title="Promotion Register" menuLink="/reports/transfer-promotion/promotion-register" reportCode="HR-PR-01" filters={["status"]} />
);
export default PromotionRegister;

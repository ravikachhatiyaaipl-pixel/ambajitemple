/***
 *  I3EMS - AMT ERP  |  Estate report: Shop Transfer Register
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const ShopTransferRegister = () => (
  <AutoReport endpoint="shop-transfer-reports/register" method="get" title="Shop Transfer Register" menuLink="/reports/shop-transfer/register" reportCode="EST-ST-01" filters={["status"]} />
);
export default ShopTransferRegister;

/***
 *  I3EMS - AMT ERP  |  Estate report: Shop Outstanding by Tenant
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const ShopOutstandingByTenant = () => (
  <AutoReport endpoint="shop-transfer-reports/outstanding-tenant" method="get" title="Shop Outstanding by Tenant" menuLink="/reports/shop-transfer/outstanding-tenant" reportCode="EST-ST-02" filters={[]} />
);
export default ShopOutstandingByTenant;

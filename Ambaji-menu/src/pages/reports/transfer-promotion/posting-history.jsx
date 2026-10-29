/***
 *  I3EMS - AMT ERP  |  Transfer & Promotion report: Posting History
 */
import React from "react";
import AutoReport from "../../../components/reports/autoreport";
const PostingHistory = () => (
  <AutoReport endpoint="transfer-reports/posting-history" method="get" title="Posting History" menuLink="/reports/transfer-promotion/posting-history" reportCode="HR-PH-01" filters={[]} />
);
export default PostingHistory;

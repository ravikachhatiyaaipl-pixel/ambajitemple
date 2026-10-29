/***
 *  I3EMS - AMT ERP  |  Recruitment · Recruitment Advertisement
 *  Sprint 1 (SOW). Endpoint: /recruitment/advertisement
 */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";

const COLUMNS = [{"key": "ADV_No", "label": "Adv No"}, {"key": "JO_Id", "label": "Opening"}, {"key": "ADV_Date", "label": "Date", "type": "date"}, {"key": "Publication", "label": "Publication"}, {"key": "Medium", "label": "Medium"}];
const FIELDS = [{"key": "JO_Id", "label": "Job Opening (ID)", "type": "number", "required": true}, {"key": "ADV_Date", "label": "Advertisement Date", "type": "date"}, {"key": "Publication", "label": "Publication"}, {"key": "Medium", "label": "Medium", "type": "select", "options": [{"v": "Newspaper", "l": "Newspaper"}, {"v": "Website", "l": "Website"}, {"v": "Portal", "l": "Employment Portal"}, {"v": "Notice Board", "l": "Notice Board"}]}, {"key": "ADV_Ref", "label": "Reference No"}, {"key": "Documents", "label": "Documents"}, {"key": "Remarks", "label": "Remarks", "type": "textarea", "full": true}];
const ACTIONS = [];

const RecruitmentAdvertisement = () => (
  <ResourceManager
    title="Recruitment Advertisement"
    endpoint="recruitment/advertisement"
    idKey="ADV_Id"
    columns={COLUMNS}
    fields={FIELDS}
    actions={ACTIONS}
  />
);

export default RecruitmentAdvertisement;

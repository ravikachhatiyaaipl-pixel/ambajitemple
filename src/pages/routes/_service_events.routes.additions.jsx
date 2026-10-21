/* =====================================================================
 *  ROUTE ADDITIONS — HR Configuration + Employee Service Events (menu-gap completion)
 *  Follows the existing "_*.routes.additions.jsx" convention. MasterRoutes handles
 *  "/masters/*", TransactionsRoutes "/transactions/*", ReportRoutes "/reports/*",
 *  so paths below are RELATIVE.
 * ===================================================================== */

/* -------- A) masterroutes.jsx — IMPORTS -------- */
import InquiryTypeMaster from "../masters/hr-config/inquiry-type";
import TransferCriteria from "../masters/hr-config/transfer-criteria";
import PromotionCriteria from "../masters/hr-config/promotion-criteria";

/* -------- A) masterroutes.jsx — ROUTES (inside <Routes>) --------
      <Route path="hr-config/inquiry-type"       element={<InquiryTypeMaster user={user} />} />
      <Route path="hr-config/transfer-criteria"  element={<TransferCriteria user={user} />} />
      <Route path="hr-config/promotion-criteria" element={<PromotionCriteria user={user} />} />
 * -------------------------------------------------------------- */

/* -------- B) transactionroutes.jsx — IMPORTS -------- */
import SpecialDuty from "../transactions/service-events/special-duty";
import Award from "../transactions/service-events/award";
import SignificantWork from "../transactions/service-events/significant-work";
import Deputation from "../transactions/service-events/deputation";
import Posting from "../transactions/service-events/posting";
import HealthCertificate from "../transactions/service-events/health-certificate";
import MassAllotment from "../transactions/service-events/mass-allotment";

/* -------- B) transactionroutes.jsx — ROUTES (inside <Routes>) --------
      <Route path="service-events/special-duty"       element={<SpecialDuty user={user} />} />
      <Route path="service-events/award"              element={<Award user={user} />} />
      <Route path="service-events/significant-work"   element={<SignificantWork user={user} />} />
      <Route path="service-events/deputation"         element={<Deputation user={user} />} />
      <Route path="service-events/posting"            element={<Posting user={user} />} />
      <Route path="service-events/health-certificate" element={<HealthCertificate user={user} />} />
      <Route path="service-events/mass-allotment"     element={<MassAllotment user={user} />} />
 * -------------------------------------------------------------------- */

/* -------- C) reportroutes.jsx — IMPORT + ROUTE -------- */
import ServiceEventsReport from "../reports/service-events/details";
/*    <Route path="service-events/details" element={<ServiceEventsReport user={user} />} /> */

export {
  InquiryTypeMaster, TransferCriteria, PromotionCriteria,
  SpecialDuty, Award, SignificantWork, Deputation, Posting, HealthCertificate, MassAllotment,
  ServiceEventsReport,
};

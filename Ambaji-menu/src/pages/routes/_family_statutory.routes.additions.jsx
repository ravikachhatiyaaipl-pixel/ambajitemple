/* =====================================================================
 *  ROUTE ADDITIONS — Family / NOC  +  Statutory Salary Deductions
 *  Follows the existing "_*.routes.additions.jsx" convention.
 *  MasterRoutes handles "/masters/*" and ReportRoutes handles "/reports/*",
 *  so paths below are RELATIVE (no leading /masters or /reports), exactly
 *  like the other section routes.
 * ===================================================================== */

/* --------------------------------------------------------------------
 * A) masterroutes.jsx  —  IMPORTS (add near the other master imports)
 * ------------------------------------------------------------------ */
import RelationMaster from "../masters/family-noc/relation";
import FamilyMembers from "../masters/family-noc/member";
import NocAgeRule from "../masters/family-noc/age-rule";
import FamilyNoc from "../masters/family-noc/noc";
import StatutoryHeads from "../masters/statutory/heads";

/* --------------------------------------------------------------------
 * A) masterroutes.jsx  —  ROUTES (paste inside <Routes>)
 * --------------------------------------------------------------------
      <Route path="family-noc/relation" element={<RelationMaster user={user} />} />
      <Route path="family-noc/member"   element={<FamilyMembers user={user} />} />
      <Route path="family-noc/age-rule" element={<NocAgeRule user={user} />} />
      <Route path="family-noc/noc"      element={<FamilyNoc user={user} />} />
      <Route path="statutory/heads"     element={<StatutoryHeads user={user} />} />
 * ------------------------------------------------------------------ */

/* --------------------------------------------------------------------
 * B) reportroutes.jsx  —  IMPORTS (add near the other report imports)
 * ------------------------------------------------------------------ */
import NocAlerts from "../reports/family-noc/alerts";
import FamilyMembersReport from "../reports/family-noc/members";
import PfRegister from "../reports/statutory/pf";
import EsiRegister from "../reports/statutory/esi";
import PtRegister from "../reports/statutory/pt";
import TdsRegister from "../reports/statutory/tds";
import LwfRegister from "../reports/statutory/lwf";
import GisRegister from "../reports/statutory/gis";
import NpsRegister from "../reports/statutory/nps";
import LicRegister from "../reports/statutory/lic";
import StatutorySummary from "../reports/statutory/summary";

/* --------------------------------------------------------------------
 * B) reportroutes.jsx  —  ROUTES (paste inside <Routes>)
 * --------------------------------------------------------------------
      <Route path="family-noc/alerts"  element={<NocAlerts user={user} />} />
      <Route path="family-noc/members" element={<FamilyMembersReport user={user} />} />
      <Route path="statutory/pf"       element={<PfRegister user={user} />} />
      <Route path="statutory/esi"      element={<EsiRegister user={user} />} />
      <Route path="statutory/pt"       element={<PtRegister user={user} />} />
      <Route path="statutory/tds"      element={<TdsRegister user={user} />} />
      <Route path="statutory/lwf"      element={<LwfRegister user={user} />} />
      <Route path="statutory/gis"      element={<GisRegister user={user} />} />
      <Route path="statutory/nps"      element={<NpsRegister user={user} />} />
      <Route path="statutory/lic"      element={<LicRegister user={user} />} />
      <Route path="statutory/summary"  element={<StatutorySummary user={user} />} />
 * ------------------------------------------------------------------ */

export {
  RelationMaster, FamilyMembers, NocAgeRule, FamilyNoc, StatutoryHeads,
  NocAlerts, FamilyMembersReport,
  PfRegister, EsiRegister, PtRegister, TdsRegister, LwfRegister, GisRegister, NpsRegister, LicRegister, StatutorySummary,
};

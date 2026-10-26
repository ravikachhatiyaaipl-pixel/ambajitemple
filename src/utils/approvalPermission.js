/**
 * Current logged-in user ka designation ID nikalta hai.
 *
 * Login response me designation kayi jagah aa sakta hai, isliye
 * har possible path check karte hain. Pehle galat path hone ki
 * wajah se approval buttons hide ho jate the.
 */
export function getDesignationId(user) {
  if (!user) return null;

  // Admin ka koi designation nahi hota - roleId ko designation mat banao
  if (isAdminUser(user)) return null;

  const candidates = [
    user.designation?.Dsg_id,
    user.apiUserData?.designation?.Dsg_id,
    // Login response: employee.personalProfile.designation (camelCase)
    user.apiUserData?.employee?.personalProfile?.designation?.Dsg_id,
    // Purana snake_case path (backward compatibility)
    user.apiUserData?.employee?.personal_profile?.designation?.Dsg_id,
    user.employee?.personalProfile?.designation?.Dsg_id,
    user.employee?.personal_profile?.designation?.Dsg_id,
    // Fallback: Devotee/Applicant jaise public users ki designation ID
    // user_master.Usr_Role_Id me store hoti hai.
    user.roleId,
    user.apiUserData?.Usr_Role_Id,
  ];

  for (const c of candidates) {
    if (c !== undefined && c !== null && !Number.isNaN(parseInt(c))) {
      return parseInt(c);
    }
  }

  return null;
}

/**
 * User admin hai? (Role_Id = 1)
 *
 * NOTE: Admin ka koi designation NAHI hota. Isliye admin ko kabhi
 * designation mat do - warna roleId (=1) ko designation id samajh ke
 * "Driver" jaisi designation mil jayegi.
 */
export function isAdminUser(user) {
  if (!user) return false;

  const roleIds = [
    user.roleId,
    user.apiUserData?.Usr_Role_Id,
    user.role_id,
    user.apiUserData?.role_id,
  ];

  return roleIds.some((r) => parseInt(r) === 1);
}

/**
 * Approval button tab dikhega jab:
 *  - user admin ho, ya
 *  - user ki designation us forward action ke authorities me ho
 */
export function canApproveAction(user, forwardAction) {
  if (!forwardAction) return false;

  // Admin kuch bhi approve kar sakta hai
  if (isAdminUser(user)) return true;

  const desigId = getDesignationId(user);
  if (!desigId) return false;

  const authorities = forwardAction.authorities_details;

  // Authorities khali hai -> sirf ADMIN kar sakta hai.
  // (jaise "Admin Approved" step - HOD/Clerk nahi kar sakta)
  if (!Array.isArray(authorities) || authorities.length === 0) {
    return false;
  }

  return authorities.some(
    (auth) => parseInt(auth.Dsg_id ?? auth.Dsg_Id ?? auth) === desigId,
  );
}

/**
 * Kya user ye CURRENT step perform kar sakta hai?
 *
 * Seva booking flow jaisa: jo user abhi step perform kar raha hai, us
 * CURRENT action ki authority check hoti hai (target ki nahi).
 *
 *   current = "HOD Approved"  (authorities: 17) -> HOD (17) allowed
 *   current = "Admin Approved"(authorities: []) -> sirf Admin
 */
export function canPerformAction(user, currentAction) {
  if (!currentAction) return false;

  // Admin kuch bhi kar sakta hai
  if (isAdminUser(user)) return true;

  const desigId = getDesignationId(user);
  if (!desigId) return false;

  const authorities = currentAction.authorities_details;

  // Authorities khali hai -> sirf ADMIN
  if (!Array.isArray(authorities) || authorities.length === 0) {
    return false;
  }

  return authorities.some(
    (auth) => parseInt(auth.Dsg_id ?? auth.Dsg_Id ?? auth) === desigId,
  );
}
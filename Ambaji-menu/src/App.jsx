import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./pages/auth/login";
import { Toaster } from "react-hot-toast";
import { toast } from "react-hot-toast";
import ScrollToTop from "./components/scrolltotop";
import Registration from "./pages/auth/registration";
import LandingPage from "./pages/landing/landingpage";
import { FinancialYearProvider } from "./context/financialyearcontext";
import { SettingsProvider } from "./context/settingscontext";
import MainRoutes from "./pages/routes/mainroutes";
// import EmployeeProfile from "./pages/profile/employeeprofile";

// Wrapper component to handle location state
function AppContent({ user, setUser, loading, handleLogin, handleLogout, getRedirectPath }) {
  const location = useLocation();
  const [loginError, setLoginError] = useState(location.state?.error);

  useEffect(() => {
    if (location.state?.error) {
      toast.error(location.state.error);
      // Clear the state after showing
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Helper function to check if user has a role (any role or designation)
  const hasRole = () => {
    if (!user) return false;

    // Check if user has a role ID (direct role ya designation - designation hi role hai)
    const userRoleId = user.roleId
      || user.designation?.Dsg_id
      || user.apiUserData?.Usr_Role_Id
      || user.apiUserData?.employee?.personal_profile?.designation?.Dsg_id;
    
    console.log("Checking if user has role - User Role ID:", userRoleId);
    
    // If user has a role ID, they have a role
    return !!userRoleId;
  };

  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!user) {
      console.log("No user, redirecting to login");
      return <Navigate to="/login" />;
    }

    if (!hasRole()) {
      console.log("User has no role, access denied");
      toast.error("You don't have a valid role to access the system");
      return <Navigate to="/login" />;
    }

    console.log("Access granted for user with role:", user.roleId);
    return children;
  };

  const PublicRoute = ({ children }) => {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      );
    }
    if (user && hasRole()) {
      return <Navigate to={getRedirectPath()} />;
    }
    return children;
  };

  return (
    <>
      <ScrollToTop />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#fff",
            color: "#374151",
            borderRadius: "12px",
            padding: "16px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
          },
          success: {
            iconTheme: {
              primary: "#10B981",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#EF4444",
              secondary: "#fff",
            },
          },
        }}
      />

      <FinancialYearProvider>
        <SettingsProvider>
          <Routes>
            <Route
              path="/"
              element={
                <PublicRoute>
                  <LandingPage />
                </PublicRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login onLogin={handleLogin} initialError={loginError} />
                </PublicRoute>
              }
            />
            <Route
              path="/registration"
              element={
                <PublicRoute>
                  <Registration />
                </PublicRoute>
              }
            />
            {/* <Route
              path="/employee-profile"
              element={
                <ProtectedRoute>
                  <EmployeeProfile user={user} />
                </ProtectedRoute>
              }
            /> */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <MainRoutes user={user} onLogout={handleLogout} />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </SettingsProvider>
      </FinancialYearProvider>
    </>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("amt_user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      console.log("Loaded user from localStorage:", parsedUser);
      setUser(parsedUser);
    }
    setLoading(false);
  }, []);

  const handleLogin = (username, password, apiData = null) => {
    if (apiData) {
      const {
        user: apiUserData,
        session: apiSessionData,
        token,
        allowed_menus,
        department, // This will be the selected single department
        all_departments, // This is the full list (optional)
      } = apiData;
  
      // Admin ka koi designation NAHI hota - wo pure role based hai.
      // Isliye roleId ko designation id ki tarah use nahi karte,
      // warna admin ko "Driver" jaisi designation mil jayegi.
      const isAdminRole = parseInt(apiUserData.Usr_Role_Id) === 1;
      const designation = isAdminRole
        ? null
        : apiUserData?.designation || apiUserData?.employee?.personal_profile?.designation || null;
      const designationId = designation?.Dsg_id || apiUserData.Usr_Role_Id;
      const resolvedRoleId = apiUserData.Usr_Role_Id || designationId;

      // Devotee / Applicant - dono public users hain, inhe koi menu/permission nahi chahiye
      const designationLabel =
        designation?.Dsg_Desc || designation?.Dsg_Title || "";
      const normalizedLabel = designationLabel.trim().toLowerCase();
      const isDevot = ["devotee", "ભક્ત", "devot"].includes(normalizedLabel);
      const isApplicant = ["applicant", "અરજીદાર", "આવેદક"].includes(normalizedLabel);
      const isPublicUser = isDevot || isApplicant;

      // Check if user has a role ID (direct role ya designation)
      if (!resolvedRoleId) {
        return {
          success: false,
          message: "User account has no role/designation assigned. Please contact administrator."
        };
      }

      console.log("apiUserData", apiUserData);

      // Public users (devotee/applicant) ko koi permission/menu check nahi
      if (!isPublicUser && resolvedRoleId != 1 && (!allowed_menus || allowed_menus.length == 0)) {
        return {
          success: false,
          message: "You don't have permission to access the system. Please contact administrator."
        };
      }

      // Get role name from role data, else designation
      const roleName = isAdminRole
        ? (apiUserData.role?.Role_Name || "Admin")
        : isPublicUser
          ? (designation?.Dsg_Desc || designation?.Dsg_Title || (isApplicant ? "Applicant" : "Devotee"))
          : (apiUserData.role?.Role_Name ||
            apiUserData.Usr_Role_Name ||
            designation?.Dsg_Desc ||
            designation?.Dsg_Title ||
            (apiUserData.Usr_Role_Id
              ? `Role-${apiUserData.Usr_Role_Id}`
              : `Designation-${designationId}`));
  
      const userData = {
        username: apiUserData.Usr_Name,
        name: apiUserData.Usr_Name,
        email: apiUserData.Usr_Email || `${apiUserData.Usr_Name}@amt.gov.in`,
        role: roleName,
        roleId: parseInt(resolvedRoleId),
        designation: designation,
        isDevotee: isDevot,
        isApplicant: isApplicant,
        isPublicUser: isPublicUser,
        department: department?.Dpt_Name || department?.Dpt_Desc || "", // Use selected department
        departmentData: department, // Store the selected department object
        allDepartments: all_departments || [], // Store all departments for future reference
        allowedMenus: allowed_menus || [], 
        token: token,
        lastLogin: new Date().toISOString(),
        apiUserData: apiUserData,
        apiSessionData: apiSessionData,
      };
  
      console.log("Setting user data:", userData);
      console.log("Selected Department:", department);
      console.log("All Departments:", all_departments);
      
      localStorage.setItem("amt_user", JSON.stringify(userData));
      localStorage.setItem(
        "menu_details",
        JSON.stringify(allowed_menus || [])
      );
      localStorage.setItem("amt_department", JSON.stringify(department || {})); // Store single selected department
      localStorage.setItem("amt_all_departments", JSON.stringify(all_departments || [])); // Store all departments (optional)
  
      localStorage.setItem("auth_token", userData.token);
  
      // if (apiSessionData?.token) {
      //   localStorage.setItem("auth_token", apiSessionData.token);
      // }
      localStorage.setItem("user_data", JSON.stringify(apiUserData));
      localStorage.setItem("session_data", JSON.stringify(apiSessionData));
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("username", apiUserData.Usr_Name);
      localStorage.setItem("user_role_id", resolvedRoleId);
  
      setUser(userData);
      toast.success(`Welcome back, ${apiUserData.Usr_Name}!`);
      return { success: true, role: roleName, roleId: parseInt(resolvedRoleId) };
    }
  
    return { success: false, message: "Invalid credentials" };
  };

  const handleLogout = () => {
    localStorage.removeItem("amt_user");
    localStorage.removeItem("amt_applications");
    localStorage.removeItem("amt_notifications");
    localStorage.removeItem("amt_active_tab");
    localStorage.removeItem("amt_profile");
    localStorage.removeItem("menu_details");
    localStorage.removeItem("amt_department");
    localStorage.removeItem("amt_all_departments"); 
    localStorage.removeItem("selectedOrganisation");
    localStorage.removeItem("amt_system_settings");
    localStorage.removeItem("selectedLedger");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    localStorage.removeItem("session_data");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("username");
    localStorage.removeItem("user_role_id");
    localStorage.removeItem("all_departments");
    localStorage.removeItem("login_date");
  
    setUser(null);
    toast.success("Logged out successfully!");
  };

  const getRedirectPath = () => {
    // Devotee / Applicant users ke liye unke apne dashboard
    try {
      const stored = JSON.parse(localStorage.getItem("amt_user") || "null");
      if (stored?.isApplicant) return "/applicant-dashboard";
      if (stored?.isDevotee) return "/devotee-dashboard";
      const dsg =
        stored?.designation ||
        stored?.apiUserData?.designation ||
        stored?.apiUserData?.employee?.personal_profile?.designation;
      const label = String(dsg?.Dsg_Desc || dsg?.Dsg_Title || "")
        .trim()
        .toLowerCase();
      if (["devotee", "ભક્ત", "devot"].includes(label)) return "/devotee-dashboard";
      if (["applicant", "અરજીદાર", "આવેદક"].includes(label)) return "/applicant-dashboard";
    } catch { /* ignore */ }
    return "/dashboard";
  };

  return (
    <Router>
      <AppContent 
        user={user}
        setUser={setUser}
        loading={loading}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
        getRedirectPath={getRedirectPath}
      />
    </Router>
  );
}

export default App;